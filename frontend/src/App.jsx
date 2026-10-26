import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [cameras, setCameras] = useState([]);
  const [remoteCameras, setRemoteCameras] = useState([]);

  const [callActive, setCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const cameraStreamsRef = useRef([]);
  const remoteCameraMetadataRef = useRef(new Map());
  const wsRef = useRef(null);

  useEffect(() => {
    if (callActive && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [callActive]);

  const ICE_SERVERS = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Could not connect to backend server. Make sure FastAPI is running on port 8000.');
    }
  };

  const handleLogout = () => {
    hangUpCall();
    setUser(null);
    setUsername('');
    setPassword('');
  };

  const toggleCamera = (id) => {
    const updateCameras = user?.role === 'senior_doctor' ? setRemoteCameras : setCameras;
    updateCameras(current => current.map(camera => {
      if (camera.id !== id) return camera;
      const active = !camera.active;
      camera.stream.getVideoTracks().forEach(track => { track.enabled = active; });
      return { ...camera, active };
    }));
  };

  const getCameraMetadata = () => cameraStreamsRef.current.map(({ id, name, primary }) => ({
    id,
    name,
    primary
  }));

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const videoDevices = (await navigator.mediaDevices.enumerateDevices())
        .filter(device => device.kind === 'videoinput');
      const primaryTrack = stream.getVideoTracks()[0];
      const primaryDeviceId = primaryTrack.getSettings().deviceId;
      const primaryDevice = videoDevices.find(device => device.deviceId === primaryDeviceId);
      const streams = [{
        id: stream.id,
        name: primaryDevice?.label || 'Default camera',
        stream,
        primary: true,
        active: true
      }];

      for (const device of videoDevices.filter(device => device.deviceId !== primaryDeviceId).slice(0, 2)) {
        try {
          const cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: device.deviceId } },
            audio: false
          });
          streams.push({
            id: cameraStream.id,
            name: device.label || `Camera ${streams.length + 1}`,
            stream: cameraStream,
            primary: false,
            active: true
          });
        } catch (cameraError) {
          console.warn(`Could not open camera ${device.label || device.deviceId}`, cameraError);
        }
      }
      cameraStreamsRef.current = streams;
      setCameras(streams);
      remoteCameraMetadataRef.current = new Map();

      const websocketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsRef.current = new WebSocket(`${websocketProtocol}//${window.location.host}/ws/signaling`);
      
      wsRef.current.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        if (message.cameras) {
          remoteCameraMetadataRef.current = new Map(
            message.cameras.map(camera => [camera.id, camera])
          );
        }
        if (!peerConnectionRef.current) createPeerConnection();

        if (message.offer) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.offer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          wsRef.current.send(JSON.stringify({ answer, cameras: getCameraMetadata() }));
        } else if (message.answer) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.answer));
        } else if (message.iceCandidate) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(message.iceCandidate));
          } catch (e) {
            console.error('Error adding received ice candidate', e);
          }
        }
      };

      wsRef.current.onopen = async () => {
        createPeerConnection();
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        wsRef.current.send(JSON.stringify({ offer, cameras: getCameraMetadata() }));
      };

      setCallActive(true);
    } catch (err) {
      alert('Error accessing microphone/camera for voice call: ' + err.message);
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    cameraStreamsRef.current.forEach(camera => {
      camera.stream.getTracks().forEach(track => pc.addTrack(track, camera.stream));
    });

    pc.ontrack = (event) => {
      if (event.track.kind !== 'video') return;
      const stream = event.streams[0] || new MediaStream([event.track]);
      const metadata = remoteCameraMetadataRef.current.get(stream.id);
      const remoteCamera = {
        id: stream.id,
        name: metadata?.name || 'Remote camera',
        stream,
        primary: metadata?.primary || false,
        active: true
      };

      if (remoteCamera.primary && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      setRemoteCameras(current => [
        ...current.filter(camera => camera.id !== remoteCamera.id),
        remoteCamera
      ]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({ iceCandidate: event.candidate }));
      }
    };
  };

  const hangUpCall = () => {
    cameraStreamsRef.current.forEach(camera => {
      camera.stream.getTracks().forEach(track => track.stop());
    });
    cameraStreamsRef.current = [];
    localStreamRef.current = null;
    setCameras([]);
    setRemoteCameras([]);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    setCallActive(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const displayedCameras = user?.role === 'senior_doctor' ? remoteCameras : cameras;

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '35px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '320px' }}>
          <h2 style={{ marginBottom: '10px', color: '#333' }}>Linux Teleconsult Portal</h2>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Sign in as Junior or Senior Doctor</p>
          
          {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Username</label>
            <input 
              type="text" 
              placeholder="junior or senior"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }}
              required 
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Password</label>
            <input 
              type="password" 
              placeholder="password123"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }}
              required 
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
            Login
          </button>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#888', background: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
            <strong>Demo Credentials:</strong><br/>
            • Junior: <code>junior</code> / <code>password123</code><br/>
            • Senior: <code>senior</code> / <code>password123</code>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '25px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #dee2e6', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>Linux Medical Multi-Camera & Voice Portal</h2>
          <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
            Logged in as: <strong>{user.name}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!callActive ? (
            <button onClick={startCall} style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              🎙️ Connect Voice/Video Call
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={toggleMute} style={{ padding: '10px 15px', background: isMuted ? '#ffc107' : '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isMuted ? 'Unmute Mic' : 'Mute Mic'}
              </button>
              <button onClick={hangUpCall} style={{ padding: '10px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                End Call
              </button>
            </div>
          )}
          <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#343a40', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>
      </header>

      {callActive && (
        <div style={{ background: '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ced4da', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: '0 0 5px 0' }}>Live Voice & Video Call Active</h4>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div>
                <p style={{ fontSize: '12px', margin: '0 0 3px 0' }}>My Video/Audio</p>
                <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '160px', height: '120px', background: '#000', borderRadius: '4px', objectFit: 'cover' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', margin: '0 0 3px 0' }}>Remote Doctor Video/Audio</p>
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '160px', height: '120px', background: '#000', borderRadius: '4px', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {user.role === 'junior_doctor' && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '12px 18px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #c3e6cb' }}>
          ℹ️ <strong>Junior Doctor Station:</strong> Browser cameras are shared with the Senior Doctor during the call.
        </div>
      )}

      {user.role === 'senior_doctor' && (
        <div style={{ background: '#d1ecf1', color: '#0c5460', padding: '12px 18px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #bee5eb' }}>
          ℹ️ <strong>Senior Doctor Review:</strong> Camera feeds arrive from the Junior Doctor's browser during the call.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {displayedCameras.map((cam) => (
          <div key={cam.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e3e6f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, color: '#333' }}>{cam.name}</h4>
              <button 
                onClick={() => toggleCamera(cam.id)}
                style={{ 
                  padding: '5px 12px', 
                  background: cam.active ? '#dc3545' : '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {cam.active ? 'Disable Camera' : 'Enable Camera'}
              </button>
            </div>
            
            <div style={{ background: '#000', borderRadius: '6px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '280px' }}>
              {cam.active ? (
                <video
                  ref={video => {
                    if (video && video.srcObject !== cam.stream) video.srcObject = cam.stream;
                  }}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              ) : (
                <span style={{ color: '#fff', fontSize: '14px' }}>Camera Disabled</span>
              )}
            </div>
          </div>
        ))}
        {displayedCameras.length === 0 && (
          <p>{user.role === 'senior_doctor' ? 'Waiting for camera streams from the Junior Doctor.' : 'No browser cameras are available.'}</p>
        )}
      </div>
    </div>
  );
}

export default App;
