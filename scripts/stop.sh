#!/bin/bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "===================================================="
echo " Stopping Linux Multi-Camera Teleconsultation Portal"
echo "===================================================="

if [ -f "backend.pid" ]; then
    PID=$(cat backend.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "[*] Stopping FastAPI backend (PID: $PID)..."
        kill -15 $PID
    fi
    rm -f backend.pid
fi

if [ -f "frontend.pid" ]; then
    PID=$(cat frontend.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "[*] Stopping Vite frontend (PID: $PID)..."
        kill -15 $PID
    fi
    rm -f frontend.pid
fi

# Fallback port cleanup if needed
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true

echo "===================================================="
echo " All services stopped safely."
echo "===================================================="
