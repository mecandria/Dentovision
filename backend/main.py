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
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str, sender: WebSocket):
        for connection in self.active_connections:
            if connection != sender:
                try:
                    await connection.send_text(message)
                except:
                    pass

manager = ConnectionManager()

@app.websocket("/ws/signaling")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
