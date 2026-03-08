#!/bin/bash
echo "Starting FHHL Energy Monitor..."

# Start backend
cd "$(dirname "$0")/backend"
python main.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

cd ..
sleep 2

# Start frontend
cd frontend && npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

sleep 3
open http://localhost:5173 2>/dev/null || xdg-open http://localhost:5173 2>/dev/null

echo ""
echo "FHHL Energy Monitor running."
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
