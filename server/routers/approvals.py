from fastapi import APIRouter
from server.db.database_store import db, save_db
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/approvals", tags=["Approvals"])

class ApprovalAction(BaseModel):
    approval_id: str
    action: str  # 'Approve' | 'Reject'
    comments: Optional[str] = ""

@router.get("/requests")
def get_approval_requests():
    return {"success": True, "data": db["approval_requests"]}

@router.post("/action")
def take_approval_action(req: ApprovalAction):
    app_req = next((a for a in db["approval_requests"] if a["id"] == req.approval_id), None)
    if app_req:
        app_req["status"] = "Approved" if req.action == "Approve" else "Rejected"
        app_req["comments"] = req.comments or ""

        # Update Indent status if applicable
        if app_req.get("transaction_type") == "INDENT":
            ind = next((i for i in db["indents"] if i["id"] == app_req.get("transaction_id")), None)
            if ind:
                ind["status"] = "Approved" if req.action == "Approve" else "Rejected"

        save_db()
        return {"success": True, "message": f"Transaction {req.action}d successfully"}
    return {"success": False, "message": "Approval request not found"}
