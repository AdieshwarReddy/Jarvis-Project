import sys
import httpx
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"
HEADERS = {"Authorization": "Bearer demo-token"}

def run_e2e_verification():
    print("--- 1. Testing Health Endpoint ---")
    with httpx.Client(base_url=BASE_URL, headers=HEADERS, timeout=10.0) as client:
        r = client.get("/api/health")
        assert r.status_code == 200, f"Health check failed: {r.status_code}"
        print("Health Status:", r.json())

        print("\n--- 2. Testing Profile & Auth Me ---")
        r = client.get("/api/auth/me")
        assert r.status_code == 200, f"Auth me failed: {r.status_code}"
        print("Authenticated Profile:", r.json()["profile"]["preferred_name"])

        print("\n--- 3. Testing Conversation Creation ---")
        r = client.post("/api/conversations", json={"title": "Placement Demo Flow"})
        assert r.status_code == 201
        conv_id = r.json()["id"]
        print(f"Created Conversation ID: {conv_id}")

        print("\n--- 4. Testing Calculator Query ('What is 18% of 42,000?') ---")
        r = client.post(f"/api/conversations/{conv_id}/messages", json={
            "role": "user",
            "content": "What is 18% of 42,000?"
        })
        assert r.status_code == 200
        msg_data = r.json()
        print("Assistant Response:", msg_data["message"]["content"])
        assert "7,560" in msg_data["message"]["content"] or "7560" in msg_data["message"]["content"]
        print("-> Calculator response verified!")

        print("\n--- 5. Testing State-Changing Tool Confirmation Flow ---")
        r = client.post(f"/api/conversations/{conv_id}/messages", json={
            "role": "user",
            "content": "Create a task to practice Python tomorrow"
        })
        assert r.status_code == 200
        tool_data = r.json()
        assert tool_data["tool_confirmation_required"] is True
        act = tool_data["tool_activity"]
        print(f"Tool Action Proposed: '{act['request_summary']}', Confirmation Required: {act['requires_confirmation']}")
        
        print("Confirming tool execution...")
        confirm_resp = client.post("/api/tools/confirm", json={
            "tool_activity_id": act["id"],
            "confirmed": True
        })
        assert confirm_resp.status_code == 200
        print("Tool Confirmation Executed:", confirm_resp.json()["result"])

        print("\n--- 6. Verifying Task in Tasks Registry ---")
        t_resp = client.get("/api/tasks")
        assert t_resp.status_code == 200
        tasks = t_resp.json()
        found = any("practice Python" in t["title"] for t in tasks)
        assert found, "Created task not found in /api/tasks"
        print("-> Task successfully persisted and verified in Tasks list!")

        print("\n--- 7. Testing Notes Creation & Search ---")
        n_resp = client.post("/api/notes", json={
            "title": "System Design Cheatsheet",
            "content": "Load balancing, CAP theorem, database partitioning, and caching strategies."
        })
        assert n_resp.status_code == 201
        print("Created Note ID:", n_resp.json()["id"])
        
        search_notes = client.get("/api/notes?query=CAP")
        assert len(search_notes.json()) >= 1
        print("-> Notes search verified!")

        print("\n--- 8. Testing Reminders Scheduling ---")
        rem_resp = client.post("/api/reminders", json={
            "title": "Placement Technical Round",
            "reminder_at": "2026-10-04T10:00:00Z"
        })
        assert rem_resp.status_code == 201
        print("Scheduled Reminder:", rem_resp.json()["title"])

        print("\n--- 9. Testing Document Upload & Grounded RAG ---")
        doc_text = "Adhii Jarvis Architecture: Built with FastAPI backend, React Vite frontend, and isolated PostgreSQL Supabase policies."
        files = {"file": ("architecture_brief.txt", doc_text.encode("utf-8"), "text/plain")}
        up_resp = client.post("/api/documents/upload", files=files)
        assert up_resp.status_code == 201
        doc_id = up_resp.json()["id"]
        print(f"Uploaded Document ID: {doc_id}, Chunks: {up_resp.json()['chunk_count']}")

        ask_resp = client.post(f"/api/documents/{doc_id}/ask", json={
            "question": "What technologies are used in Adhii Jarvis?"
        })
        assert ask_resp.status_code == 200
        print("Grounded RAG Answer:", ask_resp.json()["answer"])
        print("Cited Sources:", len(ask_resp.json()["sources"]))

        print("\n--- 10. Testing Tool Activity Transparency Log ---")
        act_resp = client.get("/api/tool-activity")
        assert act_resp.status_code == 200
        print("Total Tool Activity Events Logged:", len(act_resp.json()))

    print("\n==============================================")
    print("ALL 10 END-TO-END FLOWS VERIFIED SUCCESSFULLY!")
    print("==============================================")

if __name__ == "__main__":
    run_e2e_verification()
