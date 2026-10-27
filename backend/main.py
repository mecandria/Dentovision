import json

import cv2
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="Linux Multi-Camera Teleconsultation Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock user database with role-based access
USERS = {
    "junior": {"password": "password123", "role": "junior_doctor", "name": "Dr. Junior (Local Station)"},
    "senior": {"password": "password123", "role": "senior_doctor", "name": "Dr. Senior (Remote Reviewer)"}
}

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login")
def login(creds: LoginRequest):
    user = USERS.get(creds.username)
    if not user or user["password"] != creds.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"message": "Login successful", "role": user["role"], "name": user["name"]}

# OpenCV Camera Stream Generator (optimized for Linux V4L2)
def generate_frames(camera_index: int):
    cap = cv2.VideoCapture(camera_index, cv2.CAP_V4L2)
    if not cap.isOpened():
        cap = cv2.VideoCapture(camera_index)
        
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    try:
        while True:
            success, frame = cap.read()
            if not success:
                break
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    finally:
        cap.release()

@app.get("/video_feed/{camera_index}")
def video_feed(camera_index: int):
    return StreamingResponse(
        generate_frames(camera_index),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

# --- WebRTC Signaling Manager for Voice/Video Call ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: set[WebSocket] = set()
        self.rooms: dict[str, set[WebSocket]] = {}
        self.socket_rooms: dict[WebSocket, str] = {}
        self.socket_roles: dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    async def join(self, websocket: WebSocket, room_id: str, role: str):
        if role not in {"junior", "senior"}:
            await websocket.close(code=1008, reason="Unsupported doctor role")
            return

        existing_room = self.socket_rooms.get(websocket)
        if existing_room and existing_room != room_id:
            await self.leave(websocket)

        peers = self.rooms.setdefault(room_id, set())
        if any(self.socket_roles.get(peer) == role for peer in peers if peer != websocket):
            await websocket.send_json({
                "type": "error",
                "roomId": room_id,
                "message": f"A {role} doctor is already connected to this room.",
            })
            await websocket.close(code=1008, reason="Doctor role already connected")
            return

        self.socket_rooms[websocket] = room_id
        self.socket_roles[websocket] = role
        peers.add(websocket)
        for peer in tuple(peers):
            if peer == websocket:
                continue
            await peer.send_json({"type": "join", "roomId": room_id, "role": role})
            await websocket.send_json({
                "type": "join",
                "roomId": room_id,
                "role": self.socket_roles[peer],
            })

    async def broadcast(self, message: str, sender: WebSocket, room_id: str):
        for peer in tuple(self.rooms.get(room_id, set())):
            if peer != sender:
                await peer.send_text(message)

    async def leave(self, websocket: WebSocket):
        room_id = self.socket_rooms.pop(websocket, None)
        role = self.socket_roles.pop(websocket, None)
        if room_id is None:
            return

        peers = self.rooms.get(room_id)
        if peers is None:
            return
        peers.discard(websocket)
        if not peers:
            self.rooms.pop(room_id, None)
            return

        message = json.dumps({"type": "leave", "roomId": room_id, "role": role})
        await self.broadcast(message, websocket, room_id)

    async def disconnect(self, websocket: WebSocket):
        await self.leave(websocket)
        self.active_connections.discard(websocket)

manager = ConnectionManager()

@app.websocket("/ws/signaling")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                await websocket.close(code=1003, reason="Invalid signaling message")
                break

            if not isinstance(message, dict):
                await websocket.close(code=1003, reason="Invalid signaling message")
                break

            room_id = message.get("roomId")
            role = message.get("role")
            if not isinstance(room_id, str) or not room_id or role not in {"junior", "senior"}:
                await websocket.close(code=1008, reason="A room and doctor role are required")
                break

            if message.get("type") == "join":
                await manager.join(websocket, room_id, role)
            elif message.get("type") == "leave":
                if manager.socket_rooms.get(websocket) != room_id or manager.socket_roles.get(websocket) != role:
                    await websocket.close(code=1008, reason="Room membership does not match")
                    break
                await manager.leave(websocket)
            elif manager.socket_rooms.get(websocket) != room_id or manager.socket_roles.get(websocket) != role:
                await websocket.close(code=1008, reason="Join the room before sending signaling data")
                break
            else:
                await manager.broadcast(data, websocket, room_id)
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
