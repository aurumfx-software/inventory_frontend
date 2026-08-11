import uvicorn

if __name__ == "__main__":
    print("===================================================")
    print(" Starting Inventory & Procurement FastAPI Server...")
    print("===================================================")
    uvicorn.run("server.main:app", host="127.0.0.1", port=5000, reload=True)
