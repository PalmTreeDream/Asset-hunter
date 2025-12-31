import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import scan, analyze

app = FastAPI(title="Revenue Hunter API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router, prefix="/api/scan", tags=["Scan"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["Analyze"])

@app.get("/")
async def root():
    return {"status": "Revenue Hunter API Live", "version": "2.0"}

@app.get("/health")
async def health():
    return {"status": "ok"}
