# Business Requirements Document (BRD)
## Linux-Hosted Multi-Camera Teleconsultation & Two-Way Communication Portal

---

### 1. Project Overview & Objectives
* **Project Name:** Linux Multi-Camera Teleconsultation Portal (`multicam_teleconsult_linux`)
* **Objective:** Deliver a secure, lightweight, self-contained multi-camera and two-way audio/video teleconsultation platform tailored for clinical environments on Linux servers/workstations.
* **Key Capabilities:**
  * Simultaneous capture and streaming of up to 3 video feeds (Local Workstation Camera + 2x YSD-960 USB medical/inspection cameras).
  * Role-Based Access Control (RBAC) supporting **Junior Doctor** (local station management & camera toggles) and **Senior Doctor** (remote review & supervision).
  * Real-time peer-to-peer WebRTC two-way voice and video consultation between junior and senior doctors.
  * Isolated Python virtual environment (`venv`) and local Node module handling to ensure zero interference with existing system-wide applications.

---

### 2. User Personas & Permissions
| Role | Identifier | Core Capabilities & Permissions |
| :--- | :--- | :--- |
| **Junior Doctor** | `junior` | • Manages physical hardware (laptop + 2x USB cameras).<br>• Toggles camera feeds on/off individually.<br>• Initiates/answers two-way audio/video consultations with senior doctors. |
| **Senior Doctor** | `senior` | • Logs in remotely from any workstation.<br>• Views all 3 active examination video streams simultaneously.<br>• Conducts real-time voice/video discussions with the junior doctor. |

---

### 3. Functional Requirements
* **FR-01: Authentication & RBAC:** Secure login validating user roles and permissions.
* **FR-02: Multi-Camera Frame Capture:** High-performance OpenCV backend capturing V4L2 USB camera devices (`/dev/video0`, `/dev/video1`, etc.) or custom indexes without blocking.
* **FR-03: MJPEG Streaming:** Low-latency video transmission endpoint (`/video_feed/{id}`).
* **FR-04: WebRTC Signaling & Voice/Video:** WebSocket-based signaling server (`/ws/signaling`) coordinating STUN-backed peer connections for secure voice and video chats.
* **FR-05: Hardware Toggles:** UI-level enable/disable controls for individual video devices.

---

### 4. Non-Functional Requirements & Isolation
* **NFR-01: Zero Disruption:** Utilizes Python virtual environments (`venv`) and local Node module scopes (`node_modules`), ensuring existing system-wide Python packages and Node installations remain completely untouched.
* **NFR-02: Lifecycle Management:** Automated start and stop shell scripts (`start.sh`, `stop.sh`) for clean process handling and port binding control (Port 8000 for FastAPI, Port 5173 for Vite).
