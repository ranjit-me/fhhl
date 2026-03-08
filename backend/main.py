"""
FHHL Energy Monitor — FastAPI Backend
Modbus RTU/TCP → WebSocket → Vite Frontend
"""

import asyncio
import csv
import json
import struct
import time
from contextlib import asynccontextmanager
from collections import deque
from datetime import datetime
from pathlib import Path
from typing import Optional

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from modbus_reader import ModbusReader
from models import EnergyReading, ConnectionStatus

# ─── Lifespan ────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app):
    asyncio.create_task(polling_loop())
    print("[APP] FHHL Energy Monitor backend started")
    yield
    modbus.close()
    print("[APP] Modbus closed")


# ─── App Setup ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="FHHL Energy Monitor API",
    description="Real-time Modbus energy monitoring backend",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global State ─────────────────────────────────────────────────────────────
modbus = ModbusReader(settings)
connected_clients: list[WebSocket] = []
history: deque = deque(maxlen=settings.HISTORY_SIZE)
latest_reading: Optional[dict] = None
connection_status = ConnectionStatus()
CSV_PATH = Path(settings.CSV_FILE)


# ─── CSV Logging ─────────────────────────────────────────────────────────────
def log_to_csv(reading: dict):
    file_exists = CSV_PATH.exists()
    with open(CSV_PATH, "a", newline="") as f:
        fieldnames = ["timestamp"] + list(reading.keys())
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        row = {"timestamp": datetime.now().isoformat(), **reading}
        writer.writerow(row)


# ─── WebSocket Broadcast ──────────────────────────────────────────────────────
async def broadcast(payload: dict):
    dead = []
    for ws in connected_clients:
        try:
            await ws.send_json(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        connected_clients.remove(ws)


# ─── Modbus Polling Loop ──────────────────────────────────────────────────────
async def polling_loop():
    global latest_reading
    print(f"[POLL] Starting polling on {settings.PORT} @ {settings.BAUDRATE} baud")

    while True:
        t0 = asyncio.get_event_loop().time()
        connected = await asyncio.to_thread(modbus.ensure_connected)
        connection_status.connected = connected
        connection_status.last_attempt = datetime.now().isoformat()

        if connected:
            reading = await asyncio.to_thread(modbus.read_all)
            if reading:
                connection_status.last_success = datetime.now().isoformat()
                connection_status.error_count = 0
                latest_reading = reading
                history.append({"timestamp": datetime.now().isoformat(), **reading})
                await asyncio.to_thread(log_to_csv, reading)
                await broadcast({
                    "type": "reading",
                    "data": reading,
                    "timestamp": datetime.now().isoformat(),
                    "status": connection_status.dict(),
                })
            else:
                connection_status.error_count += 1
                await broadcast({
                    "type": "error",
                    "message": "Failed to read registers",
                    "status": connection_status.dict(),
                })
        else:
            connection_status.error_count += 1
            await broadcast({
                "type": "disconnected",
                "message": f"Cannot connect to {settings.PORT}",
                "status": connection_status.dict(),
            })

        elapsed = asyncio.get_event_loop().time() - t0
        await asyncio.sleep(max(0.0, settings.POLL_TIME - elapsed))


# ─── REST Endpoints ──────────────────────────────────────────────────────────
@app.get("/api/status")
async def get_status():
    return {
        "connected": connection_status.connected,
        "last_success": connection_status.last_success,
        "error_count": connection_status.error_count,
        "port": settings.PORT,
        "baudrate": settings.BAUDRATE,
        "slave_id": settings.SLAVE_ID,
        "poll_time": settings.POLL_TIME,
    }


@app.get("/api/latest")
async def get_latest():
    if not latest_reading:
        return {"data": None, "message": "No data yet"}
    return {"data": latest_reading, "timestamp": datetime.now().isoformat()}


@app.get("/api/history")
async def get_history(limit: int = 60):
    items = list(history)[-limit:]
    return {"data": items, "count": len(items)}


@app.get("/api/config")
async def get_config():
    return {
        "PORT": settings.PORT,
        "BAUDRATE": settings.BAUDRATE,
        "SLAVE_ID": settings.SLAVE_ID,
        "POLL_TIME": settings.POLL_TIME,
        "CSV_FILE": settings.CSV_FILE,
        "HISTORY_SIZE": settings.HISTORY_SIZE,
    }


@app.post("/api/config")
async def update_config(body: dict):
    """Hot-reload config (reconnects Modbus if port/baud changed)"""
    reconnect = False
    if "PORT" in body and body["PORT"] != settings.PORT:
        settings.PORT = body["PORT"]
        reconnect = True
    if "BAUDRATE" in body and int(body["BAUDRATE"]) != settings.BAUDRATE:
        settings.BAUDRATE = int(body["BAUDRATE"])
        reconnect = True
    if "SLAVE_ID" in body:
        settings.SLAVE_ID = int(body["SLAVE_ID"])
    if "POLL_TIME" in body:
        settings.POLL_TIME = float(body["POLL_TIME"])
    if reconnect:
        modbus.close()
        modbus.update_settings(settings)
    return {"ok": True, "reconnect": reconnect}


@app.get("/api/export/csv")
async def export_csv():
    from fastapi.responses import FileResponse
    if not CSV_PATH.exists():
        return {"error": "No CSV file yet"}
    return FileResponse(CSV_PATH, media_type="text/csv", filename=CSV_PATH.name)


# ─── WebSocket ────────────────────────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    print(f"[WS] Client connected ({len(connected_clients)} total)")

    await websocket.send_json({
        "type": "init",
        "history": list(history)[-60:],
        "status": connection_status.dict(),
    })

    try:
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        print(f"[WS] Client disconnected ({len(connected_clients)} total)")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
