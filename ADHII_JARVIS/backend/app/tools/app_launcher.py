import os
import subprocess
import shutil
from typing import Dict, Any
from app.core.logging import logger

KNOWN_APPS = {
    "vs code": ["code", "vscode://", r"%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe"],
    "vscode": ["code", "vscode://", r"%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe"],
    "visual studio code": ["code", "vscode://"],
    "whatsapp": ["whatsapp:", "start whatsapp:", r"%LOCALAPPDATA%\WhatsApp\WhatsApp.exe"],
    "chrome": ["chrome", "google-chrome", r"C:\Program Files\Google\Chrome\Application\chrome.exe", r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"],
    "google chrome": ["chrome", "google-chrome"],
    "edge": ["msedge", "microsoft-edge:"],
    "microsoft edge": ["msedge", "microsoft-edge:"],
    "notepad": ["notepad.exe"],
    "calculator": ["calc.exe"],
    "calc": ["calc.exe"],
    "spotify": ["spotify:", "spotify.exe", r"%APPDATA%\Spotify\Spotify.exe"],
    "terminal": ["wt.exe", "powershell.exe"],
    "powershell": ["powershell.exe"],
    "cmd": ["cmd.exe"],
    "explorer": ["explorer.exe"],
    "files": ["explorer.exe"],
    "file explorer": ["explorer.exe"],
    "task manager": ["taskmgr.exe"],
    "settings": ["ms-settings:"],
}

def execute_open_app(app_name: str) -> Dict[str, Any]:
    """
    Launch a local application on Windows.
    Supports known aliases, protocol URIs, and executables.
    """
    name_clean = app_name.strip().lower()
    for prefix in ["open ", "launch ", "start ", "run "]:
        if name_clean.startswith(prefix):
            name_clean = name_clean[len(prefix):].strip()

    targets = KNOWN_APPS.get(name_clean, [name_clean])
    launched = False
    last_err = ""

    for target in targets:
        expanded = os.path.expandvars(target)
        try:
            if expanded.endswith(":") or "://" in expanded:
                # Windows protocol scheme (e.g. whatsapp:, vscode://, spotify:)
                subprocess.Popen(f'start {expanded}', shell=True)
                launched = True
                break
            elif os.path.exists(expanded):
                subprocess.Popen([expanded], shell=True)
                launched = True
                break
            elif shutil.which(expanded):
                subprocess.Popen([expanded], shell=True)
                launched = True
                break
            else:
                ret = subprocess.run(f'start "" "{expanded}"', shell=True, capture_output=True)
                if ret.returncode == 0:
                    launched = True
                    break
        except Exception as e:
            last_err = str(e)
            logger.warning(f"Error launching {target}: {e}")
            continue

    if not launched:
        try:
            subprocess.Popen(f'start {name_clean}', shell=True)
            launched = True
        except Exception as e:
            last_err = str(e)

    if launched:
        return {
            "status": "success",
            "app_name": app_name,
            "message": f"Opening {app_name} now, boss."
        }
    else:
        return {
            "status": "error",
            "app_name": app_name,
            "message": f"I couldn't open {app_name}. {last_err}"
        }
