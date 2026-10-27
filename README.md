# Dentovision

POC and pilot planning documents for the multi-camera dental teleconsultation platform.

- [Business Requirements Document](./BRD.md) — pilot functionality, sizing, risks, recording, and AI requirements.
- [High-Level Design and Workflow](./HLD.md) — proposed pilot architecture, data boundaries, access rules, and consultation workflow diagram.

The current application is a proof of concept and is not ready for real patient data.

## Try a live demo call

1. Start the app with `scripts/start.sh` and open the frontend on port `5173`.
2. Sign in as `junior` or `senior`; both demo accounts use `password123`.
3. Open the app in two browsers or devices, sign in with one role in each, then open **Private rooms** and join the same room from both accounts.
4. Allow camera and microphone access when prompted. The call uses browser media capture, WebSocket signaling, and a peer-to-peer WebRTC connection.

Camera access requires a secure browser context (HTTPS or localhost). If both doctors join but media does not connect across their networks, configure a TURN relay in `frontend/.env.local` with `VITE_TURN_URLS`, `VITE_TURN_USERNAME`, and `VITE_TURN_CREDENTIAL`, then restart Vite. `VITE_TURN_URLS` accepts comma-separated TURN URLs. Use short-lived TURN credentials; do not commit them. Use demo data only.
