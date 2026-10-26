#!/bin/bash
set -e

# Get absolute path of project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "===================================================="
echo " Starting Linux Multi-Camera Teleconsultation Portal"
echo "===================================================="

# 1. Setup isolated Python Virtual Environment (won't disturb system packages)
if [ ! -d "backend/venv" ]; then
    echo "[*] Creating isolated Python virtual environment..."
    python3 -m venv backend/venv
fi

echo "[*] Activating Python virtual environment & installing dependencies..."
source backend/venv/bin/activate
pip install --upgrade pip --quiet
pip install -r backend/requirements.txt --quiet
deactivate

# 2. Setup isolated Node modules (won't disturb other projects)
if [ ! -d "frontend/node_modules" ]; then
    echo "[*] Installing frontend dependencies locally..."
    cd frontend
    npm install
    cd "$PROJECT_ROOT"
fi

# 3. Start Backend FastAPI server in background
echo "[*] Starting FastAPI Backend on port 8000..."
cd backend
source venv/bin/activate
nohup python main.py > ../backend.log 2>&1 &
echo $! > ../backend.pid
deactivate
cd "$PROJECT_ROOT"

# 4. Start Frontend Vite server in background
echo "[*] Starting Vite Frontend on port 5173..."
cd frontend
nohup npm run dev > ../frontend.log 2>&1 &
echo $! > ../frontend.pid
cd "$PROJECT_ROOT"

echo "===================================================="
echo " Application started successfully!"
echo " Backend API: http://localhost:8000"
echo " Frontend UI: http://localhost:5173"
echo " Logs: backend.log, frontend.log"
echo "===================================================="
