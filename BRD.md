# Dentovision POC to Pilot Requirements

## 1. Goal and Scope

| Item | Requirement |
|---|---|
| Goal | Let a rural junior doctor share a dental patient's mouth, head, and room view with a remote senior doctor and discuss care live. |
| Initial deployment target | Four simultaneous consultations: Junior 01 to Senior 01, Junior 02 to Senior 02, Junior 03 to Senior 03, and Junior 04 to Senior 04 plus Senior 05. |
| Camera target | Up to three cameras at each junior station. That is up to 12 incoming camera streams for four active consultations. |
| Main users | Junior doctors, senior doctors, clinic/platform administrators, and support staff. |
| Current POC | React, FastAPI/Python, basic login, WebRTC signaling, and browser camera testing. The POC is not ready for real patient data or clinical production. |
| Technical approach | React web app first; Python API; WebRTC through a Selective Forwarding Unit (SFU) for multiple participants and cameras. Keep mobile apps as a later phase. |

## 2. Functionality to Add

| Priority | Functionality | Simple requirement |
|---|---|---|
| Must | Secure sign-in | Individual accounts, strong authentication, role and clinic permissions, account recovery, session expiry, and audit logs. Replace demo credentials. |
| Must | Doctor enrollment and availability | Allow doctors to request enrollment with their profile, role, clinic, and required credentials. An authorized administrator approves and activates accounts. Doctors maintain working hours, planned availability, and time off; they can also set their current status to available, busy, or unavailable. |
| Must | Doctor availability view | Show juniors which approved senior doctors are available, busy, or offline, with their next available time where known. Update status promptly and prevent booking conflicts. Do not expose private calendar details. |
| Must | Book or start a consultation | A junior can book a future consultation with an available senior or request an immediate consultation with a currently available senior. Send an invitation for the senior to accept or decline; confirm the booking only when accepted. Support rescheduling, cancellation, reminders, and handling a senior who becomes unavailable. |
| Must | Private consultation and patient details | Before starting, the junior creates or selects a private consultation and enters the minimum patient details required by clinic policy, such as a clinic patient/case ID and relevant visit information. Capture required consent. Keep patient details and invitations visible only to authorized participants; do not put patient details in notification text. Support one junior with one or more invited seniors. |
| Should | Doctor dashboard | Each doctor can review their own completed consultations, including date, patient/case reference they are authorized to see, other participating doctors, role, and session duration. Seniors have the same personal dashboard for consultations they attended. Provide date filters and totals for completed sessions and consultation hours; restrict access and audit viewing. |
| Must | Camera selection | Detect browser-accessible cameras, let the junior name/select each camera, preview it, and show a clear error if unavailable. Validate all three target camera models and supported computers. |
| Must | Live audio/video | Send up to three camera feeds and microphone audio from the junior to assigned seniors. Support senior audio/video return, mute, camera toggle, reconnect, and network-quality indicators. |
| Must | Media service | Use an SFU (for example LiveKit or mediasoup), plus STUN/TURN for difficult networks. Do not rely on a mesh connection for multi-camera group calls. |
| Must | Session safety | Show who is in the room, connection state, recording state, elapsed time, and a clear leave/end control. For the initial pilot, limit total recorded video to 30 minutes per consultation and warn at 25 minutes. Do not abruptly disconnect a clinical call at the recording limit. |
| Must | Low-bandwidth mode | Reduce resolution/frame rate, pause secondary cameras, and preserve audio when bandwidth is poor. Offer telephone/local-clinic fallback. |
| Must | Recording and playback | With consent, record synchronized audio and all selected camera feeds for up to 30 minutes total per consultation in the initial pilot. Securely store, find, replay, restrict, retain, and delete recordings. Log access. |
| Should | Video compression | Compress/transcode recordings after capture to a tested storage-efficient format and bitrate. Preserve camera synchronization and clinically useful image detail; keep the source until the compressed recording passes integrity and playback checks. |
| Should | Session notes | Draft notes linked to the consultation, editable and signed by the clinician. Keep author, timestamps, and amendments. |
| Should | Mobile access | Build and test a responsive web app first. Confirm whether the target mobile OS/browser can access the required external cameras; add a native Android/iOS capture app if not. |
| Later | AI assistance | Create optional draft transcript/notes and validated visual flags. Clinician reviews and approves every AI output. |
| Should | Clinic administration | Manage doctor enrollment and approval, clinic membership, schedules/availability, device inventory, retention policies, support contacts, and authorized clinic-level usage reports. |

## 3. Server and Network Requirements

The initial deployment is a **six-month pilot**, targeting four simultaneous consultations and up to three cameras per junior station. Prefer managed services over building a large, self-managed cluster. This setup reduces single points of failure but does not guarantee zero downtime. Validate actual camera quality, rural networks, service limits, and failover through load and recovery tests.

| Service | Initial pilot setup | Availability / notes |
|---|---|---|
| React web app | Static hosting or a managed app platform | Deploy independently from the API so a frontend release does not interrupt active media sessions. |
| Python API | Two small app instances (starting point: 2 vCPU and 4 GB RAM each) behind a load balancer | Allows one app instance to be updated or fail while the other serves API requests. Store sessions/state outside the instance so either can serve a request. |
| Live audio/video | Prefer a managed WebRTC SFU service sized and contracted for at least 4 simultaneous rooms, 12 junior camera feeds, and the required senior viewers | Keep media separate from the API. Confirm provider availability, region, recording support, TURN coverage, limits, and support response. If self-hosted, use a dedicated media server and load-test it; a single SFU remains a call-service failure point. |
| TURN relay | SFU provider's TURN service if supported and tested; otherwise a separate coturn service | Test UDP and fallback connectivity from each clinic network. Relayed traffic can significantly increase bandwidth requirements and cost. |
| Database | DigitalOcean Managed PostgreSQL with a primary and at least one standby node, private networking, SSL, backups, and point-in-time recovery | Store accounts, patient/case references, appointments, doctor availability, consent, session metadata, notes, audit events, and recording indexes. A standby is needed for high availability; a single-node managed database is not highly available. Configure the API to reconnect after provider failover and test recovery. |
| Recordings | Private DigitalOcean Spaces bucket (or equivalent S3-compatible object storage), separate from database and app disks | Use private access, short-lived authorized playback links, encryption, lifecycle/retention rules, and access logging. Start with an allocation appropriate to the six-month retention estimate below and review monthly. |
| Monitoring and recovery | Uptime and media-quality alerts, database/storage alerts, centralized application logs, backup restore test, and named on-call contacts | Logs must not contain patient video/audio or unnecessary patient identifiers. Document clinical phone fallback and incident steps. |

### Six-month pilot recording capacity

The example day has four consultations beginning at 9:00 AM. For the initial pilot, each recording is capped at 30 minutes, so this estimate assumes all four consultations record 30 minutes from each of three cameras (12 camera-recording segments total). The second senior in Consultation 04 views the same feeds and does **not** double recording storage.

Compression can reduce stored size, but it is lossy and must not obscure clinically important detail. The estimate below assumes post-call H.264 compression averaging 0.8-1.2 Mbps per camera, excluding small audio/container overhead. Measure actual output from the target cameras before setting a budget.

| Consultation | Scheduled call | Maximum recorded time in initial pilot | Three-camera compressed recording estimate |
|---|---:|---:|---:|
| Junior Doctor 01 + Senior Doctor 01 | 9:00-10:00 (1 hour) | 30 minutes | 0.54-0.81 GB |
| Junior Doctor 02 + Senior Doctor 02 | 9:00-10:30 (1.5 hours) | 30 minutes | 0.54-0.81 GB |
| Junior Doctor 03 + Senior Doctor 03 | 9:00-9:30 (30 minutes) | 30 minutes | 0.54-0.81 GB |
| Junior Doctor 04 + Senior Doctors 04 and 05 | 9:00-10:00 (1 hour) | 30 minutes | 0.54-0.81 GB |
| **Total per example day** |  | **2 recording hours** | **2.16-3.24 GB** |

| Retention assumption | Approximate compressed recording storage |
|---|---:|
| One example day | 2.16-3.24 GB |
| 22 similar working days | 47.5-71.3 GB |
| Six months (132 similar working days) | 285-428 GB |

These figures are for primary compressed recordings only. Allow additional space for temporary source files during transcoding, failed/retried jobs, metadata, and any separate backup copy. If recordings are retained for only 30 days, plan for about 48-72 GB at this usage; if retained for the full six-month pilot, plan for at least 500 GB of usable recording capacity, then check actual growth monthly. Storage estimate scales with actual number of recording days and selected bitrate.

For comparison, uncompressed-from-the-stream source recordings at 1.5-2 Mbps per camera would use about 4.05-5.4 GB per example day, or about 535-713 GB for 132 working days. Compression results vary; do not discard the source until the compressed recording has been validated and the retention policy permits its removal.

## 4. Required Services and Technology

| Need | Suggested service/technology |
|---|---|
| Frontend | React web app; responsive layouts; browser camera/microphone permissions. |
| Application API | Python FastAPI for users, sessions, notes, permissions, and audit events. |
| Live media | WebRTC SFU such as LiveKit or mediasoup; use an established SDK rather than custom media routing. |
| Connectivity | STUN and TURN (for example coturn); TLS for web/API and secure WebSocket signaling. |
| Database | PostgreSQL with encryption, backups, and migrations. |
| Recordings | SFU/server-side recording to private encrypted S3-compatible object storage; compress/transcode after capture, verify the result, and authorize playback separately. |
| Speech/AI | Approved speech-to-text and AI services only after privacy, data residency, and clinical review. Prefer asynchronous processing after the call for the first AI release. |
| Operations | Containerized Linux deployment, secrets manager, CI/CD, health checks, backups, monitoring, and incident alerts. |

## 5. Urgent Issue and Troubleshooting Plan

| Issue | Immediate action | Follow-up |
|---|---|---|
| Patient needs urgent care or platform is unavailable | Do not delay care for the application. Use the clinic's approved phone/emergency referral process. | Record the incident through the clinic's process after patient safety is addressed. |
| Video fails but audio works | Continue by audio if clinically suitable; disable extra feeds to restore bandwidth. | Check connection quality, camera permission, and TURN/SFU health. |
| Audio/video call drops | Rejoin the same consultation; use the agreed phone fallback if reconnection fails. | Preserve recording chunks and mark any gap in the session record. |
| Camera missing/black | Check physical connection, OS camera access, browser permission, another app holding the camera, and supported camera count. | Switch to a working camera; log device model, OS, browser, and error for support. |
| Service outage/security incident | Notify the on-call owner; disable affected access or recording if needed; use the clinical fallback. | Preserve security logs, assess patient-data exposure, restore from backups, and follow applicable notification rules. |
| Owners | Assign a clinical safety owner, technical on-call, security/privacy contact, and backup contacts before pilot. | Run a documented incident drill before real patient use. |

## 6. Recording and Playback

| Requirement | Details |
|---|---|
| Consent | Obtain and record explicit consent before recording; show a visible recording indicator to all participants. Support refusing recording without blocking the consultation unless clinic policy requires it. |
| Capture | Record synchronized audio plus each selected camera as separate tracks where practical, with timestamps and participant/camera labels. This supports reviewing one view without losing the others. |
| Duration | Initial pilot: cap total recorded video at 30 minutes per consultation and warn at 25 minutes. Stop recording at the limit, but do not abruptly disconnect the live consultation. Any exception that permits additional recording must be authorized, consented, and audit-logged. |
| Compression | After capture, transcode to a tested H.264 profile/bitrate to reduce storage. Preserve synchronization and enough image detail for dental review. Keep the source until the output is verified for integrity and clinical playback quality; report transcoding failures rather than silently deleting or marking a recording complete. |
| Reliability | Prefer server-side SFU recording to encrypted storage. Use recoverable chunks so a network interruption does not lose the entire session. Show recording health to the clinician. |
| Playback | Authorized clinicians can search by permitted case/session ID, play/pause/seek, select camera tracks, and review notes. Prevent public links and unauthorized downloads. |
| Retention | Define retention and deletion with the clinic/legal owner before pilot. Support legal holds and auditable deletion. Do not keep recordings indefinitely by default. |
| Storage | Apply encryption in transit/at rest, access logging, backups, lifecycle policies, and tested restore procedures. Separate media files from ordinary application logs. |

## 7. AI Requirements

| AI feature | Requirement and boundary |
|---|---|
| AI notes | Transcribe the consultation and produce a draft summary, actions, and follow-up items. A clinician must review, edit, and sign it. Label it as AI-generated until approved. |
| Dental image assistance | Later phase: flag areas for clinician review, such as visible changes in teeth/mouth images. Do not make an autonomous diagnosis or treatment decision. |
| Face/scene changes | Define the exact clinical purpose first. Avoid broad facial/emotion inference; it can be inaccurate, biased, and privacy-invasive. |
| Training/validation | Use representative, legally obtained, consented data; validate across devices, lighting, age, skin tone, and rural connectivity. Measure false positives/negatives with dental clinicians. |
| Safety/privacy | Minimize data sent to AI providers, review retention and training terms, encrypt data, control access, and meet applicable health-data and medical-device rules before clinical use. |
| Deployment | Start with asynchronous note assistance after a session. Keep AI failures from interrupting live care. Log model/version and clinician edits for audit. |

## 8. Main Risks and Controls

| Risk | Impact | Control |
|---|---|---|
| Weak/unstable rural internet | Frozen video or dropped calls | Adaptive quality, audio-only fallback, TURN relay, reconnect, and local phone fallback. Test on real target networks. |
| Unsupported camera/browser/USB setup | One or more views unavailable | Maintain a tested device/OS/browser matrix; test all three cameras concurrently; provide preview and fallback capture workflow. |
| Server or SFU outage/overload | Multiple consultations fail together | Keep API, database, media, and recordings separate; use two API instances and a managed highly available database; monitor service health; test reconnect and phone fallback. Validate SFU availability and capacity contractually and in a four-room load test. |
| Compression reduces clinical detail | Important dental detail may be obscured during playback | Validate compressed output with dental clinicians at target resolutions/bitrates; retain the source until verification and policy-approved deletion. |
| Patient details or schedule exposed to the wrong doctor | Privacy harm and loss of trust | Private rooms, minimum necessary patient data, role/clinic checks on every request, safe notification content, audit trails, and access reviews. |
| Double-booking or stale availability | Missed or delayed consultation | Confirm bookings transactionally, expire stale presence, require senior acceptance, notify participants of changes, and provide an immediate phone fallback. |
| Patient recording/data exposure | Privacy, legal, and clinical harm | Consent, encryption, least privilege, audit trails, retention/deletion policy, backups, and incident response. |
| AI error or bias | Unsafe clinical decision | AI is advisory only; clinician approval; clinical validation; continuous error review; disable feature if unsafe. |
| Power/browser/device failure | Lost stream or recording | UPS where needed, reconnect, camera fallback, chunked recording, and tested recovery. |
| POC shortcuts reach production | Unauthorized access or data loss | Replace demo credentials/mock roles; security review; penetration test; production deployment checklist before real data. |
| Single server/location outage | Entire service unavailable | Backups, health alerts, recovery runbook, secondary deployment plan, and tested restore/failover. |

## 9. Feasibility and Delivery Phases

| Phase | Deliverable | Exit criteria |
|---|---|---|
| POC (current) | Demonstrate login flow, one-to-one call, and browser camera access. | Functional demo only; no real patient data. |
| Pilot (first six months) | Secure doctor enrollment and approval, doctor availability, scheduled and immediate booking, private patient-linked consultations, per-doctor dashboards, 4 concurrent sessions, up to 3 feeds per junior, SFU/TURN, recordings capped at 30 minutes total per consultation, compression/playback, notes, monitoring, and urgent fallback. Use the pilot server setup in Section 3 and review actual usage monthly. | Booking/availability conflict tests pass; patient details are correctly restricted and audited; device/network matrix passes; 4-room load test and 30-minute recording/compression/playback test pass; recovery, consent, retention, storage capacity, and security review approved. |
| Production | High availability, formal privacy/security controls, operational support, clinic onboarding, mobile strategy, and validated AI features. | Clinical/legal approval, risk assessment, incident drills, backups/failover tests, and ongoing monitoring in place. |

| Question | Answer |
|---|---|
| Is this possible with Linux, React, and Python? | Yes. Use React and Python for the application, and a proven WebRTC SFU/TURN service for multi-party media. |
| Is the current POC production-ready? | No. It is a demonstration. Authentication, media infrastructure, recording security, patient-data governance, reliability, and clinical validation remain. |
| How many sessions/hours? | Target four concurrent sessions in the six-month pilot. Limit total recording to 30 minutes per consultation initially; do not abruptly disconnect a live consultation at the recording limit. Validate capacity and call recovery on the selected servers and clinic networks. |
| What must be decided before pilot? | Camera models and host devices, supported browsers/mobile devices, minimum patient details to collect, doctor credential/approval process, booking and availability rules, expected resolution/bitrate, session volume, recording consent/retention, data residency, budget, clinical escalation, and who owns on-call support. |