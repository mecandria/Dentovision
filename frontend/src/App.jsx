import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const doctors = [
  { name: 'Dr. Meera Nair', specialty: 'Restorative dentistry', initials: 'MN', color: 'mint', status: 'Available', next: 'Available now' },
  { name: 'Dr. Arjun Patel', specialty: 'Oral surgery', initials: 'AP', color: 'lilac', status: 'Available', next: 'Available now' },
  { name: 'Dr. Kavya Rao', specialty: 'Endodontics', initials: 'KR', color: 'peach', status: 'In a call', next: 'Available at 10:30' },
  { name: 'Dr. Samuel Thomas', specialty: 'Pediatric dentistry', initials: 'ST', color: 'blue', status: 'Available', next: 'Available now' },
];

const initialSessions = [
  { id: 'DV-2048', patient: 'Case #D-2048', doctor: 'Dr. Meera Nair', role: 'Senior reviewer', date: 'Today, 9:00 AM', duration: '30 min', status: 'Completed', type: 'Endodontic review' },
  { id: 'DV-2045', patient: 'Case #D-2045', doctor: 'Dr. Arjun Patel', role: 'Senior reviewer', date: 'Today, 8:15 AM', duration: '24 min', status: 'Completed', type: 'Oral examination' },
  { id: 'DV-2011', patient: 'Case #D-2011', doctor: 'Dr. Kavya Rao', role: 'Junior doctor', date: 'Yesterday, 3:30 PM', duration: '30 min', status: 'Completed', type: 'Treatment planning' },
];

const initialRooms = [
  {
    id: 'RM-8F42',
    caseRef: 'Case #D-2058',
    reason: 'Endodontic review',
    junior: 'Dr. Asha Menon',
    seniorDoctors: ['Dr. Meera Nair', 'Dr. Arjun Patel'],
    updated: 'Today, 9:12 AM',
    status: 'Ready to join',
    scheduled: 'Today · 9:15 AM',
    consent: true,
    recording: true,
  },
  {
    id: 'RM-7C19',
    caseRef: 'Case #D-2054',
    reason: 'Dental pain assessment',
    junior: 'Dr. Asha Menon',
    seniorDoctors: ['Dr. Samuel Thomas'],
    updated: 'Today, 8:48 AM',
    status: 'Invitation pending',
    scheduled: 'Today · Immediate request',
    consent: true,
    recording: false,
  },
  {
    id: 'RM-6B03',
    caseRef: 'Case #D-2039',
    reason: 'Post-op follow-up',
    junior: 'Dr. Asha Menon',
    seniorDoctors: ['Dr. Meera Nair'],
    updated: 'Yesterday, 2:30 PM',
    status: 'Completed',
    scheduled: 'Yesterday · 2:30 PM',
    consent: true,
    recording: true,
  },
];

const navItems = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'rooms', label: 'Private rooms', icon: 'shield' },
  { id: 'book', label: 'Consultations', icon: 'calendar' },
  { id: 'availability', label: 'Availability', icon: 'clock' },
  { id: 'history', label: 'Session history', icon: 'history' },
  { id: 'recordings', label: 'Recordings', icon: 'video' },
  { id: 'enrollment', label: 'Doctor enrollment', icon: 'user', adminOnly: true },
];

function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="m9 16 2 2 4-4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
    video: <><rect x="3" y="5" width="14" height="14" rx="2" /><path d="m17 10 4-3v10l-4-3z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    down: <path d="m7 10 5 5 5-5" />,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8" /></>,
    micOff: <><path d="M9 9v3a3 3 0 0 0 5.1 2.1M15 9V5a3 3 0 0 0-5.8-1M5 10v2a7 7 0 0 0 11.8 5.1M19 10v2M12 19v3m-4 0h8M3 3l18 18" /></>,
    camera: <><path d="M14 5 12.5 3h-5L6 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></>,
    phone: <><path d="M7 3H4a1 1 0 0 0-1 1 17 17 0 0 0 17 17 1 1 0 0 0 1-1v-3l-5-2-2 2a13 13 0 0 1-6-6l2-2z" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    play: <path d="m8 5 12 7-12 7z" />,
    filter: <><path d="M4 6h16M7 12h10m-7 6h4" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11" /><path d="m9 12 2 2 4-4" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.grid}</svg>;
}

function Avatar({ initials, color = 'mint', small = false }) {
  return <span className={`avatar avatar-${color}${small ? ' avatar-small' : ''}`}>{initials}</span>;
}

function StatusPill({ children, tone = 'green' }) {
  return <span className={`status-pill status-${tone}`}><i />{children}</span>;
}

function App() {
  const [userRole, setUserRole] = useState('junior');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [availability, setAvailability] = useState('Available');
  const [sessions, setSessions] = useState(initialSessions);
  const [rooms, setRooms] = useState(initialRooms);
  const [selectedRoomId, setSelectedRoomId] = useState(initialRooms[0].id);
  const [enrollments, setEnrollments] = useState([
    { id: 'EN-104', name: 'Dr. Nisha Kumar', initials: 'NK', clinic: 'Sunrise Dental Clinic', specialty: 'General dentistry', submitted: 'Today, 8:42 AM', status: 'Pending review' },
    { id: 'EN-103', name: 'Dr. Joseph Mathew', initials: 'JM', clinic: 'Northside Community Clinic', specialty: 'Oral surgery', submitted: 'Yesterday, 4:16 PM', status: 'Pending review' },
  ]);
  const [bookingMode, setBookingMode] = useState('now');
  const [scheduledDate, setScheduledDate] = useState('2026-10-26');
  const [scheduledTime, setScheduledTime] = useState('11:00');
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0].name);
  const [patientRef, setPatientRef] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [consent, setConsent] = useState(false);
  const [toast, setToast] = useState('');
  const [activeCall, setActiveCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [localCameras, setLocalCameras] = useState([]);
  const [remoteCameras, setRemoteCameras] = useState([]);
  const [detectedCameraCount, setDetectedCameraCount] = useState(0);
  const [cameraInventory, setCameraInventory] = useState([]);
  const [cameraDevicesChanged, setCameraDevicesChanged] = useState(false);
  const [cameraErrors, setCameraErrors] = useState([]);
  const [remoteAudioStream, setRemoteAudioStream] = useState(null);
  const [speakerNeedsGesture, setSpeakerNeedsGesture] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [callError, setCallError] = useState('');
  const [showDemoLogin, setShowDemoLogin] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const localCamerasRef = useRef([]);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const signalingSocketRef = useRef(null);
  const remoteCameraMetadataRef = useRef(new Map());
  const pendingIceCandidatesRef = useRef([]);
  const isStartingCallRef = useRef(false);
  const isEndingCallRef = useRef(false);
  const offerCreatedRef = useRef(false);
  const callGenerationRef = useRef(0);

  const displayName = userRole === 'junior' ? 'Dr. Asha Menon' : userRole === 'senior' ? 'Dr. Meera Nair' : 'Clinic Admin';
  const initials = userRole === 'junior' ? 'AM' : userRole === 'senior' ? 'MN' : 'CA';
  const visibleSessions = useMemo(() => sessions, [sessions]);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  };

  useEffect(() => {
    const audio = remoteAudioRef.current;
    if (!audio) return undefined;
    if (!remoteAudioStream) {
      audio.srcObject = null;
      setSpeakerNeedsGesture(false);
      return undefined;
    }

    audio.srcObject = remoteAudioStream;
    let active = true;
    audio.play()
      .then(() => { if (active) setSpeakerNeedsGesture(false); })
      .catch(() => { if (active) setSpeakerNeedsGesture(true); });

    return () => {
      active = false;
      audio.pause();
      audio.srcObject = null;
    };
  }, [remoteAudioStream]);

  useEffect(() => {
    if (!activeCall || !navigator.mediaDevices?.addEventListener) return undefined;

    const handleDeviceChange = () => {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          const activeDeviceIds = new Set(localCamerasRef.current.map(camera => camera.deviceId).filter(Boolean));
          setDetectedCameraCount(videoDevices.length);
          setCameraDevicesChanged(videoDevices.some(device => !activeDeviceIds.has(device.deviceId)));
        })
        .catch(error => {
          setCallError(`Could not refresh the camera list: ${error.message}`);
        });
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
  }, [activeCall]);

  const hangUpCall = () => {
    callGenerationRef.current += 1;
    isEndingCallRef.current = true;
    if (signalingSocketRef.current?.readyState === WebSocket.OPEN) {
      signalingSocketRef.current.send(JSON.stringify({
        type: 'leave',
        roomId: selectedRoomId,
        role: userRole,
      }));
    }
    localCamerasRef.current.forEach(camera => camera.stream.getTracks().forEach(track => track.stop()));
    localCamerasRef.current = [];
    setLocalCameras([]);
    setRemoteCameras([]);
    setDetectedCameraCount(0);
    setCameraInventory([]);
    setCameraDevicesChanged(false);
    setCameraErrors([]);
    setRemoteAudioStream(null);
    remoteCameraMetadataRef.current.clear();
    pendingIceCandidatesRef.current = [];
    offerCreatedRef.current = false;

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (signalingSocketRef.current) {
      signalingSocketRef.current.close();
      signalingSocketRef.current = null;
    }

    setActiveCall(false);
    setCallStatus('idle');
    setCallError('');
    setMuted(false);
    setCameraOn(true);
    isStartingCallRef.current = false;
  };

  const createPeerConnection = (generation) => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        ...(import.meta.env.VITE_TURN_URLS
          ? [{
            urls: import.meta.env.VITE_TURN_URLS.split(',').map(url => url.trim()).filter(Boolean),
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL,
          }]
          : []),
      ],
    });
    peerConnectionRef.current = peerConnection;

    localCamerasRef.current.forEach(camera => {
      camera.stream.getTracks().forEach(track => peerConnection.addTrack(track, camera.stream));
    });

    peerConnection.ontrack = event => {
      if (generation !== callGenerationRef.current || isEndingCallRef.current) return;
      const stream = event.streams[0] || new MediaStream([event.track]);
      if (event.track.kind === 'audio') {
        setRemoteAudioStream(stream);
        return;
      }
      if (event.track.kind !== 'video') return;
      const metadata = remoteCameraMetadataRef.current.get(stream.id);
      setRemoteCameras(current => {
        const existingCamera = current.find(camera => camera.id === stream.id);
        const camera = {
          id: stream.id,
          name: metadata?.name || existingCamera?.name || 'Remote camera',
          stream,
          primary: metadata?.primary ?? existingCamera?.primary ?? false,
          active: true,
        };
        return [...current.filter(item => item.id !== camera.id), camera];
      });
    };

    peerConnection.onconnectionstatechange = () => {
      if (generation !== callGenerationRef.current || isEndingCallRef.current) return;
      if (peerConnection.connectionState === 'connected') {
        setCallStatus('connected');
        setCallError('');
      } else if (peerConnection.connectionState === 'connecting') {
        setCallStatus('connecting');
      } else if (peerConnection.connectionState === 'failed') {
        setCallStatus('failed');
        setCallError('The peer connection failed. Check both devices’ networks, configure a TURN relay if needed, then rejoin.');
      } else if (peerConnection.connectionState === 'disconnected') {
        setCallStatus('disconnected');
      }
    };

    peerConnection.onicecandidate = event => {
      if (generation === callGenerationRef.current && event.candidate && signalingSocketRef.current?.readyState === WebSocket.OPEN) {
        signalingSocketRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          roomId: selectedRoomId,
          role: userRole,
          candidate: event.candidate,
        }));
      }
    };

    return peerConnection;
  };

  const startCall = async () => {
    if (isStartingCallRef.current || signalingSocketRef.current) return;
    const generation = ++callGenerationRef.current;
    isStartingCallRef.current = true;
    isEndingCallRef.current = false;
    setCallStatus('requesting');
    setCallError('');
    setCameraErrors([]);
    setCameraInventory([]);
    setCameraDevicesChanged(false);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera and microphone access is not available in this browser. Open the secure preview URL and allow device access.');
      }

      const primaryStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (generation !== callGenerationRef.current || isEndingCallRef.current) {
        primaryStream.getTracks().forEach(track => track.stop());
        return;
      }
      localCamerasRef.current = [{
        id: primaryStream.id,
        name: 'Default camera',
        stream: primaryStream,
        primary: true,
        active: true,
      }];
      const videoDevices = (await navigator.mediaDevices.enumerateDevices())
        .filter(device => device.kind === 'videoinput');
      if (generation !== callGenerationRef.current || isEndingCallRef.current) return;
      setDetectedCameraCount(videoDevices.length);
      const primaryTrack = primaryStream.getVideoTracks()[0];
      const primaryDeviceId = primaryTrack?.getSettings().deviceId;
      const primaryDevice = videoDevices.find(device => device.deviceId === primaryDeviceId);
      const additionalDevices = videoDevices.filter(device => device.deviceId !== primaryDeviceId);
      const inventory = videoDevices.map(device => ({
        id: device.deviceId,
        name: device.deviceId === primaryDeviceId
          ? primaryDevice?.label || primaryTrack?.label || 'Built-in camera'
          : `USB ${additionalDevices.findIndex(item => item.deviceId === device.deviceId) + 1}${device.label ? ` · ${device.label}` : ''}`,
        status: device.deviceId === primaryDeviceId ? 'Live' : 'Opening…',
      }));
      setCameraInventory(inventory);
      const cameras = [{
        id: primaryStream.id,
        name: primaryDevice?.label || 'Default camera',
        deviceId: primaryDeviceId,
        stream: primaryStream,
        primary: true,
        active: true,
      }];

      const cameraIssues = [];

      for (const [index, device] of additionalDevices.entries()) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: device.deviceId } },
            audio: false,
          });
          if (generation !== callGenerationRef.current || isEndingCallRef.current) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          cameras.push({
            id: stream.id,
            name: `USB ${index + 1}${device.label ? ` · ${device.label}` : ''}`,
            deviceId: device.deviceId,
            stream,
            primary: false,
            active: true,
          });
          localCamerasRef.current = cameras;
          setLocalCameras([...cameras]);
          setCameraInventory(current => current.map(item => item.id === device.deviceId ? { ...item, status: 'Live' } : item));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Camera access was denied.';
          const issue = `USB ${index + 1}${device.label ? ` · ${device.label}` : ''}: ${message}`;
          cameraIssues.push(issue);
          setCameraInventory(current => current.map(item => item.id === device.deviceId ? { ...item, status: 'Unavailable' } : item));
          console.warn(`Could not open additional camera "${device.label || device.deviceId}".`, error);
        }
      }

      if (generation !== callGenerationRef.current || isEndingCallRef.current) {
        cameras.forEach(camera => camera.stream.getTracks().forEach(track => track.stop()));
        return;
      }

      localCamerasRef.current = cameras;
      setLocalCameras(cameras);
      setCameraErrors(cameraIssues);
      setCallStatus('waiting');

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}/ws/signaling`);
      signalingSocketRef.current = socket;

      const sendSignal = message => {
        if (socket.readyState !== WebSocket.OPEN) return false;
        socket.send(JSON.stringify({ ...message, roomId: selectedRoomId, role: userRole }));
        return true;
      };

      const createOffer = async () => {
        if (generation !== callGenerationRef.current || userRole !== 'junior' || offerCreatedRef.current) return;
        offerCreatedRef.current = true;
        try {
          const peerConnection = createPeerConnection(generation);
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          if (!sendSignal({
            type: 'offer',
            offer,
            cameras: cameras.map(({ id, name, primary }) => ({ id, name, primary })),
          })) {
            throw new Error('The signaling connection closed before the call offer could be sent.');
          }
          setCallStatus('connecting');
        } catch (error) {
          if (generation !== callGenerationRef.current) return;
          offerCreatedRef.current = false;
          setCallStatus('failed');
          setCallError(error.message || 'Could not start the video connection.');
        }
      };

      socket.onopen = () => {
        if (generation !== callGenerationRef.current) return;
        isStartingCallRef.current = false;
        setCallStatus('waiting');
        sendSignal({
          type: 'join',
          cameras: cameras.map(({ id, name, primary }) => ({ id, name, primary })),
        });
      };

      socket.onmessage = async event => {
        if (generation !== callGenerationRef.current) return;
        try {
          const message = JSON.parse(event.data);
          if (message.roomId !== selectedRoomId || message.role === userRole) return;
          if (message.type === 'error') {
            setCallStatus('failed');
            setCallError(message.message || 'The signaling service rejected this room connection.');
            return;
          }
          if (message.cameras) {
            remoteCameraMetadataRef.current = new Map(message.cameras.map(camera => [camera.id, camera]));
          }
          if (message.type === 'leave') {
            peerConnectionRef.current?.close();
            peerConnectionRef.current = null;
            remoteCameraMetadataRef.current.clear();
            pendingIceCandidatesRef.current = [];
            offerCreatedRef.current = false;
            setRemoteCameras([]);
            setRemoteAudioStream(null);
            setCallStatus('disconnected');
            setCallError('The other doctor left the call.');
            return;
          }

          if (message.type === 'join') {
            if (userRole === 'senior') {
              sendSignal({
                type: 'ready',
                cameras: cameras.map(({ id, name, primary }) => ({ id, name, primary })),
              });
            } else {
              await createOffer();
            }
            return;
          }
          if (message.type === 'ready') {
            await createOffer();
            return;
          }

          const peerConnection = createPeerConnection(generation);
          if (message.type === 'offer') {
            await peerConnection.setRemoteDescription(message.offer);
            for (const candidate of pendingIceCandidatesRef.current) {
              await peerConnection.addIceCandidate(candidate);
            }
            pendingIceCandidatesRef.current = [];
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            sendSignal({
              type: 'answer',
              answer,
              cameras: cameras.map(({ id, name, primary }) => ({ id, name, primary })),
            });
            setCallStatus('connecting');
          } else if (message.type === 'answer') {
            await peerConnection.setRemoteDescription(message.answer);
            for (const candidate of pendingIceCandidatesRef.current) {
              await peerConnection.addIceCandidate(candidate);
            }
            pendingIceCandidatesRef.current = [];
          } else if (message.type === 'ice-candidate' && message.candidate) {
            const candidate = new RTCIceCandidate(message.candidate);
            if (peerConnection.remoteDescription) {
              await peerConnection.addIceCandidate(candidate);
            } else {
              pendingIceCandidatesRef.current.push(candidate);
            }
          }
        } catch (error) {
          if (generation !== callGenerationRef.current) return;
          setCallStatus('failed');
          setCallError(error.message || 'A signaling error interrupted the call.');
        }
      };

      socket.onerror = () => {
        if (generation !== callGenerationRef.current) return;
        isStartingCallRef.current = false;
        setCallStatus('failed');
        setCallError('Could not connect to the call signaling service. Check that the backend is running.');
      };

      socket.onclose = event => {
        if (generation !== callGenerationRef.current) return;
        isStartingCallRef.current = false;
        if (!isEndingCallRef.current) {
          setCallStatus(current => current === 'failed' ? current : 'disconnected');
          setCallError(current => current || event.reason || 'The call signaling connection closed.');
        }
      };
    } catch (error) {
      if (generation !== callGenerationRef.current) return;
      localCamerasRef.current.forEach(camera => camera.stream.getTracks().forEach(track => track.stop()));
      localCamerasRef.current = [];
      setLocalCameras([]);
      setCallStatus('failed');
      setCallError(error.message || 'Could not access the camera and microphone.');
      isStartingCallRef.current = false;
    }
  };

  const openLiveCall = () => {
    setPage('rooms');
    setCallError('');
    setActiveCall(true);
    void startCall();
  };

  const retryLiveCall = () => {
    hangUpCall();
    setActiveCall(true);
    void startCall();
  };

  const toggleCamera = (cameraId) => {
    const localCamera = localCameras.find(camera => camera.id === cameraId);
    const camera = localCamera || remoteCameras.find(item => item.id === cameraId);
    if (!camera) return;
    const active = !camera.active;
    camera.stream.getVideoTracks().forEach(track => { track.enabled = active; });
    const updateCameras = current => current.map(item => item.id === cameraId ? { ...item, active } : item);
    if (localCamera) {
      setLocalCameras(updateCameras);
      if (localCamera.primary) setCameraOn(active);
    } else {
      setRemoteCameras(updateCameras);
    }
  };

  const toggleMute = () => {
    const primaryCamera = localCamerasRef.current.find(camera => camera.primary);
    if (!primaryCamera) return;
    const nextMuted = !muted;
    primaryCamera.stream.getAudioTracks().forEach(track => { track.enabled = !nextMuted; });
    setMuted(nextMuted);
  };

  const enableRemoteAudio = () => {
    if (!remoteAudioRef.current) return;
    remoteAudioRef.current.play()
      .then(() => setSpeakerNeedsGesture(false))
      .catch(error => {
        setSpeakerNeedsGesture(true);
        setCallError(`Could not play the senior doctor's audio: ${error.message}`);
      });
  };

  const openPage = (nextPage) => {
    if (activeCall) hangUpCall();
    setPage(nextPage);
    setMobileNavOpen(false);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword }),
      });
      const result = await response.json();

      if (!response.ok) {
        setLoginError(result.detail || 'Unable to sign in. Check your username and password.');
        return;
      }

      if (result.role !== 'junior_doctor' && result.role !== 'senior_doctor') {
        setLoginError('This account does not have a supported demo role.');
        return;
      }

      setUserRole(result.role === 'junior_doctor' ? 'junior' : 'senior');
      setPage('overview');
      setIsAuthenticated(true);
      setLoginPassword('');
    } catch {
      setLoginError('Could not connect to the demo login service. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    hangUpCall();
    setIsAuthenticated(false);
    setUserRole('junior');
    setPage('overview');
    setShowDemoLogin(false);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
  };

  const handleBooking = (event) => {
    event.preventDefault();
    if (!patientRef.trim() || !visitReason.trim()) {
      notify('Add a patient or case reference and the reason for consultation.');
      return;
    }
    if (!consent) {
      notify('Confirm the patient consent check before continuing.');
      return;
    }
    const roomId = `RM-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const caseReference = patientRef.trim();
    const newSession = {
      id: roomId,
      patient: patientRef.trim(),
      doctor: selectedDoctor,
      role: 'Junior doctor',
      date: bookingMode === 'now' ? 'Today, now' : `${scheduledDate}, ${scheduledTime}`,
      duration: '—',
      status: bookingMode === 'now' ? 'Invitation sent' : 'Pending acceptance',
      type: visitReason,
    };
    setRooms(current => [{
      id: roomId,
      caseRef: caseReference,
      reason: visitReason,
      junior: displayName,
      seniorDoctors: [selectedDoctor],
      updated: 'Just now',
      status: 'Invitation pending',
      scheduled: bookingMode === 'now' ? 'Today · Immediate request' : `${scheduledDate} · ${scheduledTime}`,
      consent: true,
      recording: false,
    }, ...current]);
    setSelectedRoomId(roomId);
    setSessions(current => [newSession, ...current]);
    notify(bookingMode === 'now' ? 'Private consultation invitation sent.' : 'Consultation request sent for confirmation.');
    setPage('rooms');
    setPatientRef('');
    setVisitReason('');
    setConsent(false);
  };

  const reviewEnrollment = (id, status) => {
    setEnrollments(current => current.map(request => request.id === id ? { ...request, status } : request));
    notify(`Doctor enrollment ${status.toLowerCase()}.`);
  };

  const renderRooms = () => {
    const selectedRoom = rooms.find(room => room.id === selectedRoomId) || rooms[0];
    const statusTone = selectedRoom?.status === 'Ready to join' ? 'green' : selectedRoom?.status === 'Completed' ? 'blue' : 'amber';
    return (
      <>
        <div className="welcome-row">
          <div><div className="eyebrow">SECURE CONSULTATION WORKSPACE</div><h1>Private consultation rooms</h1><p className="page-subtitle">Patient-linked rooms are isolated to the invited care team.</p></div>
          <button className="button button-primary" onClick={() => openPage('book')}><Icon name="plus" /> Create private room</button>
        </div>
        <div className="room-security-banner"><span className="room-security-icon"><Icon name="shield" size={18} /></span><span><b>Private by design</b><small>Only approved participants can see case details or join the room. Room links are not public.</small></span><span className="security-live"><i /> Access controls on</span></div>
        <div className="rooms-layout">
          <section className="panel rooms-list-panel">
            <div className="panel-heading"><div><h2>Your rooms</h2><p>Scheduled, active and completed consultations</p></div><span className="room-total">{rooms.length}</span></div>
            <div className="room-list">
              {rooms.map(room => (
                <button key={room.id} className={`room-list-item${selectedRoom?.id === room.id ? ' room-selected' : ''}`} onClick={() => setSelectedRoomId(room.id)}>
                  <span className={`room-list-symbol ${room.status === 'Ready to join' ? 'room-symbol-ready' : ''}`}><Icon name="shield" size={17} /></span>
                  <span className="room-list-copy"><b>{room.caseRef}</b><small>{room.reason}</small><small>{room.updated}</small></span>
                  <span className="room-list-status"><StatusPill tone={room.status === 'Ready to join' ? 'green' : room.status === 'Completed' ? 'blue' : 'amber'}>{room.status}</StatusPill><small>{room.id}</small></span>
                </button>
              ))}
            </div>
            <div className="room-list-foot"><Icon name="shield" size={15} /> Patient details are visible only in the selected authorized room.</div>
          </section>

          {selectedRoom && <section className="panel room-detail-panel">
            <div className="room-detail-top"><div><div className="eyebrow">PRIVATE ROOM · {selectedRoom.id}</div><h2>{selectedRoom.caseRef}</h2><p>{selectedRoom.reason} <span>·</span> {selectedRoom.scheduled}</p></div><StatusPill tone={statusTone}>{selectedRoom.status}</StatusPill></div>
            <div className="room-private-note"><Icon name="shield" size={16} /><span>Private patient information. Share only with the authorized care team.</span></div>
            <div className="room-detail-section">
              <div className="room-section-heading"><h3>Patient & visit details</h3><span>Junior doctor entered</span></div>
              <div className="room-case-grid"><div><small>Case reference</small><b>{selectedRoom.caseRef}</b></div><div><small>Reason for consult</small><b>{selectedRoom.reason}</b></div><div><small>Clinic</small><b>Sunrise Dental Clinic</b></div><div><small>Patient consent</small><b className="approved-value"><Icon name="check" size={13} /> {selectedRoom.consent ? 'Confirmed' : 'Not confirmed'}</b></div></div>
            </div>
            <div className="room-detail-section">
              <div className="room-section-heading"><h3>Invited care team</h3><button className="text-button" onClick={() => notify('Additional doctors can be invited after room permissions are checked.')}><Icon name="plus" size={14} /> Invite doctor</button></div>
              <div className="room-team-list">
                <RoomParticipant initials="AM" name={selectedRoom.junior} role="Junior doctor · Room host" color="mint" you={userRole === 'junior'} />
                {selectedRoom.seniorDoctors.map((doctor, index) => {
                  const profile = doctors.find(person => person.name === doctor) || doctors[index % doctors.length];
                  return <RoomParticipant key={doctor} initials={profile.initials} name={doctor} role={index === 0 ? 'Senior doctor · Invited' : 'Senior doctor · Invited'} color={profile.color} you={userRole === 'senior' && index === 0} />;
                })}
              </div>
            </div>
            <div className="room-checklist">
              <div><span className="check-circle"><Icon name="check" size={12} /></span><span><b>Private room access</b><small>Only named participants can join</small></span><b className="check-state">Ready</b></div>
              <div><span className={`check-circle${selectedRoom.consent ? '' : ' check-pending'}`}>{selectedRoom.consent ? <Icon name="check" size={12} /> : '!'}</span><span><b>Patient consent</b><small>{selectedRoom.consent ? 'Recorded before consultation' : 'Required before starting'}</small></span><b className="check-state">{selectedRoom.consent ? 'Confirmed' : 'Required'}</b></div>
              <div><span className="check-circle"><Icon name="camera" size={12} /></span><span><b>Cameras & microphone</b><small>Check devices before joining the call</small></span><button className="text-button" onClick={() => notify('Device check is a wireframe preview. Camera hardware will be tested before a live call.')}>Check devices</button></div>
            </div>
            <div className="room-detail-footer"><span><Icon name="shield" size={15} /> Room activity and playback access are audited.</span><button className="button button-primary" disabled={selectedRoom.status !== 'Ready to join' || !selectedRoom.consent} onClick={openLiveCall}><Icon name="video" /> Join private session</button></div>
          </section>}
        </div>
      </>
    );
  };

  const renderOverview = () => (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">MONDAY, 26 OCTOBER 2026</div>
          <h1>Good morning, {userRole === 'junior' ? 'Dr. Asha' : 'Dr. Meera'} <span className="wave">✦</span></h1>
          <p className="page-subtitle">Here’s what’s happening with your consultations today.</p>
        </div>
        <button className="button button-primary" onClick={() => openPage('book')}><Icon name="plus" /> New consultation</button>
      </div>

      <section className="stat-grid" aria-label="Consultation summary">
        <StatCard label="Consultations today" value={userRole === 'junior' ? '04' : '06'} change="+2 from last week" icon="calendar" tone="lavender" />
        <StatCard label="Consultation hours" value={userRole === 'junior' ? '2.4' : '3.8'} suffix="hrs" change="This month" icon="clock" tone="blue" />
        <StatCard label="Available seniors" value="03" change="Ready to consult" icon="user" tone="green" />
        <StatCard label="Recordings ready" value="12" change="Private & secure" icon="video" tone="peach" />
      </section>

      <div className="dashboard-grid">
        <section className="panel schedule-panel">
          <div className="panel-heading">
            <div><h2>Today’s schedule</h2><p>Your upcoming and recent sessions</p></div>
            <button className="text-button" onClick={() => openPage('history')}>View all <Icon name="chevron" size={15} /></button>
          </div>
          <div className="schedule-list">
            <ScheduleItem time="09:00" period="AM" patient="Case #D-2048" detail="Endodontic review" doctor="Dr. Meera Nair" initials="MN" color="mint" state="Completed" />
            <ScheduleItem time="10:30" period="AM" patient="Case #D-2052" detail="Post-op follow-up" doctor="Dr. Arjun Patel" initials="AP" color="lilac" state="In 15 min" highlighted onJoin={openLiveCall} />
            <ScheduleItem time="11:30" period="AM" patient="Case #D-2054" detail="Dental pain assessment" doctor="Dr. Samuel Thomas" initials="ST" color="blue" state="Upcoming" />
          </div>
        </section>

        <section className="panel availability-panel">
          <div className="panel-heading">
            <div><h2>Available specialists</h2><p>Find a senior doctor for a consult</p></div>
            <button className="icon-button subtle" aria-label="View availability" onClick={() => openPage('availability')}><Icon name="chevron" /></button>
          </div>
          <div className="doctor-list">
            {doctors.slice(0, 3).map(doctor => <DoctorRow key={doctor.name} doctor={doctor} onBook={() => { setSelectedDoctor(doctor.name); openPage('book'); }} />)}
          </div>
          <button className="button button-secondary button-full" onClick={() => openPage('availability')}>See all specialists</button>
        </section>
      </div>

      <section className="panel recent-panel">
        <div className="panel-heading">
          <div><h2>Recent consultations</h2><p>Quick access to your latest sessions</p></div>
          <button className="text-button" onClick={() => openPage('history')}>Session history <Icon name="chevron" size={15} /></button>
        </div>
        <SessionTable rows={visibleSessions.slice(0, 3)} onOpen={(session) => { setPage('recordings'); notify(`Opening ${session.patient} session details.`); }} />
      </section>
    </>
  );

  const renderEnrollment = () => (
    <>
      <div className="welcome-row">
        <div><div className="eyebrow">CLINIC ADMINISTRATION</div><h1>Doctor enrollment</h1><p className="page-subtitle">Review doctor applications before granting access to the clinic workspace.</p></div>
        <span className="review-count">{enrollments.filter(request => request.status === 'Pending review').length} pending reviews</span>
      </div>
      <div className="info-strip"><Icon name="shield" size={18} /><span>Verify the doctor’s identity, professional credentials, role, and clinic membership before approval. Only approved doctors can set availability or join consultations.</span></div>
      <section className="panel enrollment-panel">
        <div className="panel-heading"><div><h2>Enrollment requests</h2><p>Submitted doctor profiles awaiting review</p></div><div className="search-box"><Icon name="search" size={17} /><input placeholder="Search doctor or clinic" /></div></div>
        {enrollments.map(request => <article className="enrollment-row" key={request.id}>
          <Avatar initials={request.initials} color="lilac" />
          <div className="enrollment-person"><b>{request.name}</b><small>{request.specialty} · {request.clinic}</small><small>Request {request.id} · Submitted {request.submitted}</small></div>
          <StatusPill tone={request.status === 'Approved' ? 'green' : request.status === 'Rejected' ? 'red' : 'amber'}>{request.status}</StatusPill>
          {request.status === 'Pending review' ? <div className="enrollment-actions"><button className="button button-secondary button-sm" onClick={() => reviewEnrollment(request.id, 'Rejected')}>Decline</button><button className="button button-primary button-sm" onClick={() => reviewEnrollment(request.id, 'Approved')}><Icon name="check" size={13} /> Approve</button></div> : <span className="reviewed-label">Reviewed</span>}
        </article>)}
      </section>
      <div className="enroll-footer"><span>Approved accounts are added to the doctor directory after credential checks.</span><button className="text-button" onClick={() => openPage('availability')}>View doctor directory <Icon name="chevron" size={14} /></button></div>
    </>
  );

  const renderBooking = () => (
    <div className="page-narrow">
      <div className="page-heading-block">
        <div className="eyebrow">CONSULTATION REQUEST</div>
        <h1>Start a consultation</h1>
        <p className="page-subtitle">Create a private case and invite an available senior doctor.</p>
      </div>
      <div className="booking-layout">
        <form className="panel booking-form" onSubmit={handleBooking}>
          <div className="step-label"><span>1</span> Choose when to consult</div>
          <div className="mode-switch">
            <button type="button" className={bookingMode === 'now' ? 'mode-option selected' : 'mode-option'} onClick={() => setBookingMode('now')}>
              <span className="mode-icon"><Icon name="video" /></span><span><b>Start now</b><small>Invite an available senior</small></span>
              {bookingMode === 'now' && <span className="radio-mark"><Icon name="check" size={13} /></span>}
            </button>
            <button type="button" className={bookingMode === 'schedule' ? 'mode-option selected' : 'mode-option'} onClick={() => setBookingMode('schedule')}>
              <span className="mode-icon"><Icon name="calendar" /></span><span><b>Schedule ahead</b><small>Choose a time that works</small></span>
              {bookingMode === 'schedule' && <span className="radio-mark"><Icon name="check" size={13} /></span>}
            </button>
          </div>
          {bookingMode === 'schedule' && <div className="form-grid"><Field label="Date"><input type="date" value={scheduledDate} onChange={event => setScheduledDate(event.target.value)} /></Field><Field label="Time"><select value={scheduledTime} onChange={event => setScheduledTime(event.target.value)}><option value="11:00 AM">11:00 AM</option><option value="11:30 AM">11:30 AM</option><option value="1:00 PM">1:00 PM</option><option value="2:30 PM">2:30 PM</option></select></Field></div>}

          <div className="form-divider" />
          <div className="step-label"><span>2</span> Choose a senior doctor</div>
          <Field label="Available specialists">
            <select value={selectedDoctor} onChange={event => setSelectedDoctor(event.target.value)}>
              {doctors.filter(d => d.status === 'Available').map(doctor => <option key={doctor.name} value={doctor.name}>{doctor.name} — {doctor.specialty}</option>)}
            </select>
          </Field>
          <div className="selected-doctor-card">
            <Avatar initials={doctors.find(d => d.name === selectedDoctor)?.initials || 'MN'} color={doctors.find(d => d.name === selectedDoctor)?.color || 'mint'} />
            <div><b>{selectedDoctor}</b><small>{doctors.find(d => d.name === selectedDoctor)?.specialty || 'Specialist'}</small></div>
            <StatusPill>Available now</StatusPill>
          </div>

          <div className="form-divider" />
          <div className="step-label"><span>3</span> Add patient and visit details</div>
          <div className="form-grid">
            <Field label="Patient / case reference" hint="Use the clinic case ID; avoid unnecessary personal details.">
              <input value={patientRef} onChange={event => setPatientRef(event.target.value)} placeholder="e.g. Case #D-2058" required />
            </Field>
            <Field label="Reason for consultation">
              <select value={visitReason} onChange={event => setVisitReason(event.target.value)} required>
                <option value="">Select a reason</option><option>Dental pain assessment</option><option>Endodontic review</option><option>Post-op follow-up</option><option>Oral examination</option><option>Other clinical advice</option>
              </select>
            </Field>
          </div>
          <label className="consent-check"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} /><span>I confirm the required patient consent and clinic approval have been obtained before sharing case information or starting a recording.</span></label>
          <div className="secure-note"><Icon name="shield" size={17} /><span>Only invited doctors can access this private consultation. Patient details are not included in invitations.</span></div>
          <div className="form-actions"><button type="button" className="button button-plain" onClick={() => openPage('overview')}>Cancel</button><button type="submit" className="button button-primary"><Icon name="video" /> {bookingMode === 'now' ? 'Send invitation' : 'Request booking'}</button></div>
        </form>
        <aside className="booking-aside">
          <div className="panel aside-card">
            <div className="aside-icon"><Icon name="clock" size={20} /></div><h3>30-minute recording limit</h3><p>Recording stops at 30 minutes. Your live consultation can continue. Everyone will see when recording is active.</p>
          </div>
          <div className="panel aside-card soft-green">
            <div className="aside-icon"><Icon name="shield" size={20} /></div><h3>Patient privacy first</h3><p>Use the clinic case reference where possible. Access to patient details and playback is limited to authorized participants.</p>
          </div>
          <div className="support-card"><span className="support-dot" /> Need urgent help? <span className="support-copy">Use your clinic’s approved phone or emergency process.</span></div>
        </aside>
      </div>
    </div>
  );

  const renderAvailability = () => (
    <>
      <div className="welcome-row">
        <div><div className="eyebrow">CARE TEAM</div><h1>Doctor availability</h1><p className="page-subtitle">Find the right specialist and request a private consultation.</p></div>
        <button className="button button-secondary"><Icon name="calendar" /> My schedule</button>
      </div>
      <div className="availability-banner">
        <div><span className="live-indicator" /> <b>Your status</b><small>Control whether juniors can request you now</small></div>
        <select value={availability} onChange={event => { setAvailability(event.target.value); notify(`Your status is now ${event.target.value.toLowerCase()}.`); }}><option>Available</option><option>Busy</option><option>Unavailable</option></select>
      </div>
      <section className="panel directory-panel">
        <div className="panel-heading directory-heading"><div><h2>Senior doctors</h2><p>Availability updates automatically. Private calendar details are not shown.</p></div><div className="search-box"><Icon name="search" size={17} /><input placeholder="Search name or specialty" /></div></div>
        <div className="directory-list">
          {doctors.map(doctor => <div className="directory-row" key={doctor.name}>
            <Avatar initials={doctor.initials} color={doctor.color} />
            <div className="directory-person"><b>{doctor.name}</b><small>{doctor.specialty} · Sunrise Dental Clinic</small></div>
            <div className="directory-status"><StatusPill tone={doctor.status === 'Available' ? 'green' : 'amber'}>{doctor.status}</StatusPill><small>{doctor.next}</small></div>
            <button className="button button-secondary button-sm" disabled={doctor.status !== 'Available'} onClick={() => { setSelectedDoctor(doctor.name); openPage('book'); }}>Request consult</button>
          </div>)}
        </div>
      </section>
      <div className="info-strip"><Icon name="shield" size={18} /><span><b>Availability privacy</b> Only current availability and the next known available time are shared—not personal calendar details.</span></div>
    </>
  );

  const renderHistory = () => (
    <>
      <div className="welcome-row">
        <div><div className="eyebrow">YOUR ACTIVITY</div><h1>Session history</h1><p className="page-subtitle">Consultations you participated in, with duration and case reference.</p></div>
        <button className="button button-secondary"><Icon name="filter" /> Filter dates</button>
      </div>
      <section className="stat-grid history-stats">
        <StatCard label="Completed sessions" value="28" change="This month" icon="check" tone="green" />
        <StatCard label="Consultation hours" value="16.5" suffix="hrs" change="This month" icon="clock" tone="blue" />
        <StatCard label="As junior doctor" value="19" change="Consultations" icon="user" tone="lavender" />
        <StatCard label="As senior reviewer" value="09" change="Consultations" icon="shield" tone="peach" />
      </section>
      <section className="panel history-table-panel">
        <div className="panel-heading"><div><h2>All consultations</h2><p>Patient references are visible only to authorized participants.</p></div><div className="search-box"><Icon name="search" size={17} /><input placeholder="Search case or doctor" /></div></div>
        <SessionTable rows={visibleSessions} onOpen={(session) => { setPage('recordings'); notify(`Opening ${session.patient} session details.`); }} />
      </section>
    </>
  );

  const renderRecordings = () => (
    <>
      <div className="welcome-row">
        <div><div className="eyebrow">SECURE LIBRARY</div><h1>Recordings</h1><p className="page-subtitle">Private playback for consultations where recording consent was given.</p></div>
        <div className="recording-cap"><Icon name="clock" size={16} /><span><b>30 min</b> max per consultation</span></div>
      </div>
      <div className="recording-notice"><Icon name="shield" size={19} /><div><b>Protected clinical recordings</b><p>Playback is logged and restricted to authorized participants. Recordings are retained according to clinic policy.</p></div></div>
      <section className="recording-grid">
        {sessions.filter(session => session.status === 'Completed').map((session, index) => <article className="panel recording-card" key={session.id}>
          <div className={`recording-thumb thumb-${index % 3}`}><div className="video-placeholder"><span className="tooth-mark">✦</span><span>CAMERA {index + 1} · DENTAL VIEW</span></div><button className="play-button" aria-label={`Play ${session.patient}`} onClick={() => notify('Wireframe preview only — secure video playback will be connected to the recording service.')}><Icon name="play" size={19} /></button><span className="duration-chip">{session.duration}</span></div>
          <div className="recording-content"><div className="recording-meta"><span>{session.date}</span><span className="secure-mini"><Icon name="shield" size={13} /> Private</span></div><h3>{session.patient}</h3><p>{session.type}</p><div className="recording-footer"><div className="participant-stack"><Avatar initials={initials} color="mint" small /><Avatar initials={session.doctor.split(' ').slice(1).map(s => s[0]).join('').replace('.', '')} color="lilac" small /></div><span>{session.doctor}</span><button className="icon-button subtle" aria-label="Open recording" onClick={() => notify('Wireframe preview only — recording details open here after backend integration.')}><Icon name="chevron" /></button></div></div>
        </article>)}
      </section>
    </>
  );

  const renderProfile = () => (
    <>
      <div className="page-heading-block"><div className="eyebrow">ACCOUNT SETTINGS</div><h1>Doctor profile</h1><p className="page-subtitle">Manage your clinic profile, enrollment and working availability.</p></div>
      <div className="profile-layout">
        <section className="panel profile-card"><div className="profile-hero"><Avatar initials={initials} color="mint" /><div><h2>{displayName}</h2><p>{userRole === 'junior' ? 'Junior Doctor' : 'Senior Doctor'} · Sunrise Dental Clinic</p><StatusPill>Account approved</StatusPill></div></div><div className="profile-details"><ProfileLine label="Clinic" value="Sunrise Dental Clinic" /><ProfileLine label="Doctor ID" value="DV-DOC-0018" /><ProfileLine label="Specialty" value={userRole === 'junior' ? 'General dentistry' : 'Restorative dentistry'} /><ProfileLine label="Enrollment status" value="Verified and active" /></div><button className="button button-secondary">Edit profile</button></section>
        <section className="panel profile-card"><div className="panel-heading"><div><h2>Working availability</h2><p>Let colleagues know when you can consult</p></div></div><div className="availability-settings"><div><b>Current status</b><small>Visible to approved doctors in your clinic</small></div><select value={availability} onChange={event => setAvailability(event.target.value)}><option>Available</option><option>Busy</option><option>Unavailable</option></select></div><div className="profile-details"><ProfileLine label="Monday – Friday" value="9:00 AM – 5:00 PM" /><ProfileLine label="Saturday" value="By appointment" /><ProfileLine label="Next available" value="Today, now" /></div><button className="button button-secondary">Manage schedule</button></section>
      </div>
      <div className="info-strip"><Icon name="shield" size={18} /><span>Enrollment documents and patient data are handled according to clinic policy. Contact your administrator to update verified credentials.</span></div>
    </>
  );

  const renderCall = () => {
    const callRoom = rooms.find(room => room.id === selectedRoomId) || rooms[0];
    const statusLabels = {
      requesting: 'Requesting camera and microphone access',
      waiting: `Waiting for ${userRole === 'junior' ? 'senior' : 'junior'} doctor`,
      connecting: 'Connecting live audio and video',
      connected: 'Live connection active',
      disconnected: 'Connection interrupted',
      failed: 'Connection failed',
    };
    const remoteName = userRole === 'junior' ? 'Dr. Meera Nair' : 'Dr. Asha Menon';
    const remoteInitials = userRole === 'junior' ? 'MN' : 'AM';
    const cameras = [
      ...localCameras.map(camera => ({ ...camera, local: true })),
      ...remoteCameras.map(camera => ({ ...camera, local: false })),
    ];

    return (
      <div className="call-page">
        <div className="call-topline"><button className="text-button" onClick={() => openPage('overview')}>← Back to dashboard</button><span className="call-encrypted"><Icon name="shield" size={15} /> Live consultation</span></div>
        <div className="call-title">
        <div><StatusPill tone={callStatus === 'connected' ? 'green' : callStatus === 'failed' || callStatus === 'disconnected' ? 'red' : 'amber'}>{statusLabels[callStatus] || 'Starting call'}</StatusPill><h1>Private consultation</h1><p>{callRoom.caseRef} · {callRoom.reason}</p></div>
          <button className="button button-danger" onClick={() => { hangUpCall(); setPage('history'); }}>End consultation</button>
        </div>
        <div className="call-layout">
          <section className="call-main">
            <audio ref={remoteAudioRef} className="remote-audio-output" autoPlay playsInline />
            <div className="call-video-grid">
              {cameras.map(camera => <MediaTile key={camera.id} camera={camera} onToggle={toggleCamera} />)}
              {remoteCameras.length === 0 && <div className="call-video call-waiting-tile"><div className="camera-placeholder"><div className="camera-symbol"><Icon name="video" size={26} /></div><b>{callStatus === 'connected' ? 'Waiting for remote camera' : `Waiting for ${userRole === 'junior' ? 'senior' : 'junior'} doctor`}</b><span>The other participant needs to sign in and join this room.</span></div></div>}
              {cameras.length === 0 && <div className="call-video"><div className="camera-placeholder"><div className="camera-symbol"><Icon name="camera" size={26} /></div><b>Camera preview will appear here</b><span>Allow camera and microphone access when your browser asks.</span></div></div>}
            </div>
            <div className="camera-count-note">
              Cameras detected on this device: {detectedCameraCount} · Active: {localCameras.length} · Other doctor cameras: {remoteCameras.length}
            </div>
            <section className="camera-inventory" aria-label="Camera device status">
              <div><b>Camera devices on this device</b><button className="text-button" onClick={retryLiveCall}>Re-scan USB cameras</button></div>
              {cameraInventory.length > 0
                ? <ul>{cameraInventory.map(device => <li key={device.id}><span>{device.name}</span><b className={device.status === 'Live' ? 'camera-device-live' : ''}>{device.status}</b></li>)}</ul>
                : <p>No camera devices were reported by this browser. Check USB connection and browser permissions.</p>}
              {cameraDevicesChanged && <small>A camera was connected after the call started. Re-scan to add it to the call.</small>}
            </section>
            {cameraErrors.length > 0 && <div className="call-error camera-error-list" role="alert">
              <div><b>Some USB cameras could not be opened</b><ul>{cameraErrors.map(error => <li key={error}>{error}</li>)}</ul><span>Check browser camera permissions and that each camera is not in use by another app.</span></div>
              <button className="button button-secondary button-sm" onClick={retryLiveCall}>Retry cameras</button>
            </div>}
            <div className="call-controls">
              <button className={`call-control${muted ? ' control-active' : ''}`} onClick={toggleMute} disabled={!localCameras.length}><Icon name={muted ? 'micOff' : 'mic'} /><span>{muted ? 'Unmute mic' : 'Mute mic'}</span></button>
              <button className={`call-control${!cameraOn ? ' control-active' : ''}`} onClick={() => { const primaryCamera = localCameras.find(camera => camera.primary); if (primaryCamera) toggleCamera(primaryCamera.id); }} disabled={!localCameras.length}><Icon name="camera" /><span>{cameraOn ? 'Camera on' : 'Camera off'}</span></button>
              <button className="call-control" onClick={enableRemoteAudio} disabled={!remoteAudioStream}><span>{speakerNeedsGesture ? 'Enable speaker' : remoteAudioStream ? 'Speaker on' : 'Waiting for audio'}</span></button>
            </div>
            {callError && <div className="call-error" role="alert"><span>{callError}</span><button className="button button-secondary button-sm" onClick={retryLiveCall}>Retry connection</button></div>}
            <div className="connection-note"><span className={`connection-indicator${callStatus === 'connected' ? ' connection-live' : ''}`} /><span>{statusLabels[callStatus] || 'Starting call'}</span><span className="spacer" /><span>Allow camera and microphone access for live audio and video.</span></div>
          </section>
          <aside className="call-sidebar">
            <div className="panel participants-panel"><div className="panel-heading"><div><h2>Participants <span className="count-badge">2</span></h2><p>Join from the junior and senior doctor accounts</p></div></div><Participant initials={initials} name={displayName} label={`${userRole === 'junior' ? 'Junior' : 'Senior'} doctor · You`} color={userRole === 'junior' ? 'mint' : 'lilac'} /><Participant initials={remoteInitials} name={remoteName} label={callStatus === 'connected' ? 'Connected' : 'Waiting to join'} color={userRole === 'junior' ? 'lilac' : 'mint'} /></div>
            <div className="patient-summary"><span>CASE REFERENCE</span><b>{callRoom.caseRef}</b><small>{callRoom.reason}</small></div>
          </aside>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <main className="login-screen">
        <div className="login-brand">
          <span className="brand-mark"><span>+</span></span>
          <span className="brand-name">dento<span>vision</span><small>CARE CONNECTED</small></span>
        </div>
        <section className="login-card panel">
          <div className="eyebrow">WIREFRAME DEMO</div>
          <h1>Sign in to Dentovision</h1>
          <p className="login-intro">Explore the consultation workspace with a demo account.</p>
          <form onSubmit={handleLogin}>
            <label className="login-field">
              <span>Username</span>
              <input autoComplete="username" value={loginUsername} onChange={event => setLoginUsername(event.target.value)} required />
            </label>
            <label className="login-field">
              <span>Password</span>
              <input type="password" autoComplete="current-password" value={loginPassword} onChange={event => setLoginPassword(event.target.value)} required />
            </label>
            {loginError && <p className="login-error" role="alert">{loginError}</p>}
            <button className="button button-primary login-submit" type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing in…' : 'Sign in to demo'}
            </button>
          </form>
          <div className="login-demo-accounts">
            <div className="login-demo-heading">Choose a demo account</div>
            <div className="login-demo-options">
              <button type="button" onClick={() => { setLoginUsername('junior'); setLoginPassword('password123'); setLoginError(''); }}>
                <Avatar initials="AM" color="mint" small />
                <span><b>Junior doctor</b><small>Username: junior</small></span>
              </button>
              <button type="button" onClick={() => { setLoginUsername('senior'); setLoginPassword('password123'); setLoginError(''); }}>
                <Avatar initials="MN" color="lilac" small />
                <span><b>Senior doctor</b><small>Username: senior</small></span>
              </button>
            </div>
            <p>Demo password: <code>password123</code></p>
          </div>
          <div className="demo-login-note"><Icon name="shield" size={15} /> Prototype only — use demo data, not real patient information.</div>
        </section>
        <p className="login-footer">Dentovision · Care connected</p>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar${mobileNavOpen ? ' sidebar-open' : ''}`}>
        <div className="brand"><span className="brand-mark"><span>+</span></span><span className="brand-name">dento<span>vision</span><small>CARE CONNECTED</small></span><button className="sidebar-close" onClick={() => setMobileNavOpen(false)} aria-label="Close menu"><Icon name="close" /></button></div>
        <div className="clinic-switcher"><span className="clinic-mark">S</span><span><b>Sunrise Dental</b><small>Rural Care Clinic</small></span><Icon name="down" size={15} /></div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.filter(item => !item.adminOnly || userRole === 'admin').map(item => <button key={item.id} className={`nav-item${page === item.id ? ' nav-active' : ''}`} onClick={() => openPage(item.id)}><Icon name={item.icon} /><span>{item.label}</span>{item.id === 'book' && <i className="nav-count">2</i>}</button>)}
        </nav>
        <div className="nav-caption nav-caption-lower">ACCOUNT</div>
        <button className={`nav-item${page === 'profile' ? ' nav-active' : ''}`} onClick={() => openPage('profile')}><Icon name="user" /><span>Profile & availability</span></button>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><Icon name="phone" size={18} /></div><b>Need urgent help?</b><p>Use your clinic’s approved phone or emergency process for urgent care.</p><button onClick={() => notify('Follow your clinic’s emergency contact and escalation procedure.')} className="help-link">View support options <Icon name="chevron" size={13} /></button></div>
          <button className="account-row" onClick={() => setShowDemoLogin(true)}><Avatar initials={initials} color="mint" small /><span><b>{displayName}</b><small>{userRole === 'junior' ? 'Junior doctor' : 'Senior doctor'}</small></span><Icon name="down" size={15} /></button>
        </div>
      </aside>
      {mobileNavOpen && <button className="nav-backdrop" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button>
          <div className="breadcrumb">Workspace <Icon name="chevron" size={14} /> <b>{navItems.find(item => item.id === page)?.label || (page === 'call' ? 'Live consultation' : 'Profile')}</b></div>
          <div className="topbar-actions"><span className="demo-badge"><i /> Wireframe demo</span><button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify('You’re all caught up on notifications.')}><Icon name="bell" /><i /></button><span className="topbar-divider" /><button className="role-switch" onClick={() => setShowDemoLogin(true)}><Avatar initials={initials} color={userRole === 'junior' ? 'mint' : userRole === 'senior' ? 'lilac' : 'peach'} small /><span><b>{displayName}</b><small>{userRole === 'junior' ? 'Junior doctor' : userRole === 'senior' ? 'Senior doctor' : 'Clinic administrator'}</small></span><Icon name="down" size={15} /></button></div>
        </header>
        <div className={`content${activeCall ? ' content-call' : ''}`}>
          {activeCall ? renderCall() : page === 'overview' ? renderOverview() : page === 'rooms' ? renderRooms() : page === 'book' ? renderBooking() : page === 'availability' ? renderAvailability() : page === 'history' ? renderHistory() : page === 'recordings' ? renderRecordings() : page === 'enrollment' ? renderEnrollment() : renderProfile()}
        </div>
      </main>
      {toast && <div className="toast-message"><span><Icon name="check" size={16} /></span>{toast}</div>}
      {showDemoLogin && <div className="modal-backdrop" onClick={() => setShowDemoLogin(false)}><div className="demo-modal panel" onClick={event => event.stopPropagation()}><button className="modal-close icon-button" onClick={() => setShowDemoLogin(false)} aria-label="Close"><Icon name="close" /></button><div className="eyebrow">PROTOTYPE PREVIEW</div><h2>Switch your workspace view</h2><p>This wireframe uses demo data only. Select a role to preview the experience.</p><div className="role-options"><button onClick={() => { setUserRole('junior'); setShowDemoLogin(false); }}><Avatar initials="AM" color="mint" /><span><b>Junior doctor</b><small>Book, join and review consultations</small></span><Icon name="chevron" /></button><button onClick={() => { setUserRole('senior'); setShowDemoLogin(false); }}><Avatar initials="MN" color="lilac" /><span><b>Senior doctor</b><small>Manage availability and review sessions</small></span><Icon name="chevron" /></button><button onClick={() => { setUserRole('admin'); setPage('enrollment'); setShowDemoLogin(false); }}><Avatar initials="CA" color="peach" /><span><b>Clinic administrator</b><small>Approve doctor enrollment requests</small></span><Icon name="chevron" /></button></div><div className="demo-login-note"><Icon name="shield" size={15} /> No credentials or patient data are saved in this preview.</div><button className="button button-secondary button-full" onClick={handleLogout}>Sign out</button></div></div>}
    </div>
  );
}

function StatCard({ label, value, suffix, change, icon, tone }) {
  const isCheck = icon === 'check';
  return <article className="panel stat-card"><div className={`stat-icon stat-${tone}`}><Icon name={isCheck ? 'check' : icon} size={19} /></div><div className="stat-content"><span>{label}</span><div><strong>{value}</strong>{suffix && <small>{suffix}</small>}</div><p>{change}</p></div><span className="stat-spark" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span></article>;
}

function ScheduleItem({ time, period, patient, detail, doctor, initials, color, state, highlighted, onJoin }) {
  return <div className={`schedule-item${highlighted ? ' schedule-highlighted' : ''}`}><div className="schedule-time">{time}<small>{period}</small></div><div className="timeline-rail"><i /></div><div className="schedule-info"><div className="schedule-case"><b>{patient}</b><span className={highlighted ? 'tag-soon' : ''}>{state}</span></div><p>{detail}</p><div className="schedule-doctor"><Avatar initials={initials} color={color} small /> {doctor}</div>{onJoin && <button className="text-button join-call-button" onClick={onJoin}><Icon name="video" size={13} /> Join live call</button>}</div><button className="icon-button subtle schedule-open" aria-label={`Open ${patient}`} onClick={onJoin}><Icon name="chevron" size={16} /></button></div>;
}

function DoctorRow({ doctor, onBook }) {
  return <div className="doctor-row"><Avatar initials={doctor.initials} color={doctor.color} /><div className="doctor-info"><b>{doctor.name}</b><small>{doctor.specialty}</small></div><StatusPill tone={doctor.status === 'Available' ? 'green' : 'amber'}>{doctor.status}</StatusPill><button className="icon-button subtle" aria-label={`Request ${doctor.name}`} disabled={doctor.status !== 'Available'} onClick={onBook}><Icon name="chevron" size={16} /></button></div>;
}

function SessionTable({ rows, onOpen }) {
  return <div className="table-scroll"><table className="session-table"><thead><tr><th>CASE REFERENCE</th><th>CONSULTATION WITH</th><th>DATE & TIME</th><th>DURATION</th><th>STATUS</th><th /></tr></thead><tbody>{rows.map(session => <tr key={session.id}><td><b>{session.patient}</b><small>{session.type}</small></td><td><div className="table-person"><Avatar initials={session.doctor.split(' ').slice(1).map(s => s[0]).join('').replace('.', '') || 'DR'} color="lilac" small /><span>{session.doctor}<small>{session.role}</small></span></div></td><td>{session.date}</td><td>{session.duration}</td><td><StatusPill tone={session.status === 'Completed' ? 'green' : 'amber'}>{session.status}</StatusPill></td><td><button className="icon-button subtle" aria-label="Open session" onClick={() => onOpen(session)}><Icon name="chevron" size={16} /></button></td></tr>)}</tbody></table></div>;
}

function Field({ label, hint, children }) {
  return <label className="form-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function Participant({ initials, name, label, color }) {
  return <div className="participant-row"><Avatar initials={initials} color={color} /><div><b>{name}</b><small>{label}</small></div><span className="participant-online" /></div>;
}

function MediaTile({ camera, onToggle }) {
  return (
    <div className={`call-video${camera.primary ? ' call-video-primary' : ''}`}>
      <video
        ref={element => {
          if (element && element.srcObject !== camera.stream) element.srcObject = camera.stream;
        }}
        className="call-video-feed"
        autoPlay
        muted
        playsInline
      />
      {!camera.active && <div className="call-camera-disabled">Camera disabled</div>}
      <button className="camera-toggle" onClick={() => onToggle(camera.id)}>{camera.active ? 'Disable camera' : 'Enable camera'}</button>
      <div className="video-label">{camera.local ? 'You' : 'Remote doctor'} · {camera.name}</div>
    </div>
  );
}

function RoomParticipant({ initials, name, role, color, you }) {
  return <div className="room-team-member"><Avatar initials={initials} color={color} /><span><b>{name}{you && <em>YOU</em>}</b><small>{role}</small></span><StatusPill>{you ? 'In this room' : 'Invited'}</StatusPill></div>;
}

function ProfileLine({ label, value }) {
  return <div className="profile-line"><span>{label}</span><b>{value}</b></div>;
}

export default App;
