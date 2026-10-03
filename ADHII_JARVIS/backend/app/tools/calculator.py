import ast
import operator
import re
from typing import Union, Dict, Any
from app.core.exceptions import ToolExecutionError

# Supported safe operators
SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

class SafeEvaluator(ast.NodeVisitor):
    def visit(self, node):
        method = 'visit_' + node.__class__.__name__
        visitor = getattr(self, method, self.generic_visit)
        return visitor(node)

    def visit_Constant(self, node):
        if isinstance(node.value, (int, float)):
            return node.value
        raise ToolExecutionError(f"Unsupported constant type: {type(node.value)}")

    def visit_Num(self, node):  # Backward compatibility for older Python AST
        return node.n

    def visit_BinOp(self, node):
        left = self.visit(node.left)
        right = self.visit(node.right)
        op_type = type(node.op)
        if op_type in SAFE_OPERATORS:
            if op_type in (ast.Div, ast.FloorDiv, ast.Mod) and right == 0:
                raise ToolExecutionError("Division by zero is not permitted")
            # Guard against massive powers
            if op_type == ast.Pow and (left > 10000 or right > 100):
                raise ToolExecutionError("Exponent too large to evaluate safely")
            return SAFE_OPERATORS[op_type](left, right)
        raise ToolExecutionError(f"Unsupported binary operator: {op_type.__name__}")

    def visit_UnaryOp(self, node):
        operand = self.visit(node.operand)
        op_type = type(node.op)
        if op_type in SAFE_OPERATORS:
            return SAFE_OPERATORS[op_type](operand)
        raise ToolExecutionError(f"Unsupported unary operator: {op_type.__name__}")

    def generic_visit(self, node):
        raise ToolExecutionError(f"Unsupported expression construct: {node.__class__.__name__}")

def evaluate_expression(expr: str) -> Dict[str, Any]:
    """
    Safely evaluate mathematical expressions including percentages.
    Example inputs:
      '18% of 42000' -> 7560.0
      ' (100 + 50) * 1.18 ' -> 177.0
      '15 * 4 + 20' -> 80.0
    """
    cleaned = expr.strip()
    
    # Handle percentage phrase: "X% of Y" or "X percent of Y"
    pct_match = re.search(r'([0-9\.]+)\s*(?:%|percent)\s*of\s*([0-9\.]+)', cleaned, re.IGNORECASE)
    if pct_match:
        pct = float(pct_match.group(1))
        val = float(pct_match.group(2))
        res = (pct / 100.0) * val
        return {
            "expression": expr,
            "result": res,
            "formatted": f"{res:,.2f}".rstrip('0').rstrip('.')
        }

    # Replace inline percentage like "50% * 20" with "(50/100) * 20"
    cleaned = re.sub(r'([0-9\.]+)%', r'(\1/100.0)', cleaned)

    # Disallow letters or dangerous symbols
    if re.search(r'[a-zA-Z_]', cleaned):
        raise ToolExecutionError("Expression contains invalid identifiers or variables")

    try:
        parsed = ast.parse(cleaned, mode='eval')
        evaluator = SafeEvaluator()
        result = float(evaluator.visit(parsed.body))
        return {
            "expression": expr,
            "result": result,
            "formatted": f"{result:,.2f}".rstrip('0').rstrip('.')
        }
    except SyntaxError as e:
        raise ToolExecutionError(f"Invalid mathematical expression syntax: {e}")
    except Exception as e:
        if isinstance(e, ToolExecutionError):
            raise e
        raise ToolExecutionError(f"Mathematical evaluation failed: {e}")
