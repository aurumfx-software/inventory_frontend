from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.db.database_store import load_db

from server.routers.auth import router as auth_router
from server.routers.masters import router as masters_router
from server.routers.indents import router as indents_router
from server.routers.approvals import router as approvals_router
from server.routers.procurement import router as procurement_router
from server.routers.inventory_ops import router as inventory_ops_router
from server.routers.reports import router as reports_router
from server.routers.settings_audit import router as settings_audit_router

# Initialize FastAPI Application
app = FastAPI(
    title="Inventory & Procurement System API",
    description="Enterprise Python & FastAPI Backend for Inventory & Procurement Desktop Application",
    version="1.0.0"
)

# Enable CORS for Desktop & Browser Clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All System Routers
app.include_router(auth_router)
app.include_router(masters_router)
app.include_router(indents_router)
app.include_router(approvals_router)
app.include_router(procurement_router)
app.include_router(inventory_ops_router)
app.include_router(reports_router)
app.include_router(settings_audit_router)

# Healthcheck Endpoint
@app.get("/api/health")
def healthcheck():
    return {
        "success": True,
        "status": "UP",
        "message": "Inventory & Procurement Python FastAPI Server Running",
        "engine": "FastAPI (Python 3)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="127.0.0.1", port=5000, reload=True)
