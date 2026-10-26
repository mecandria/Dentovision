import React, { useMemo, useState } from 'react';
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
  const [showDemoLogin, setShowDemoLogin] = useState(false);

  const displayName = userRole === 'junior' ? 'Dr. Asha Menon' : userRole === 'senior' ? 'Dr. Meera Nair' : 'Clinic Admin';
  const initials = userRole === 'junior' ? 'AM' : userRole === 'senior' ? 'MN' : 'CA';
  const visibleSessions = useMemo(() => sessions, [sessions]);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  };

  const openPage = (nextPage) => {
    setPage(nextPage);
    setMobileNavOpen(false);
    setActiveCall(false);
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
            <div className="room-detail-footer"><span><Icon name="shield" size={15} /> Room activity and playback access are audited.</span><button className="button button-primary" disabled={selectedRoom.status !== 'Ready to join' || !selectedRoom.consent} onClick={() => { setActiveCall(true); setPage('rooms'); }}><Icon name="video" /> Join private session</button></div>
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
            <ScheduleItem time="10:30" period="AM" patient="Case #D-2052" detail="Post-op follow-up" doctor="Dr. Arjun Patel" initials="AP" color="lilac" state="In 15 min" highlighted onJoin={() => setActiveCall(true)} />
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

  const renderCall = () => (
    <div className="call-page">
      <div className="call-topline"><button className="text-button" onClick={() => { setActiveCall(false); setPage('overview'); }}>← Back to dashboard</button><span className="call-encrypted"><Icon name="shield" size={15} /> Secure consultation</span></div>
      <div className="call-title"><div><StatusPill tone="red">Recording · {muted ? '00:18' : '00:12'} / 30:00</StatusPill><h1>Private consultation</h1><p>Case #D-2058 · Endodontic review · Started 9:12 AM</p></div><button className="button button-danger" onClick={() => { setActiveCall(false); notify('Consultation ended. Session summary is ready.'); setPage('history'); }}>End consultation</button></div>
      <div className="call-layout">
        <section className="call-main">
          <div className="call-video-grid">
            <div className="call-video call-video-primary"><div className="camera-placeholder"><div className="camera-symbol"><Icon name="camera" size={30} /></div><b>Intraoral camera</b><span>Live camera preview placeholder</span></div><div className="video-label"><Avatar initials="AM" color="mint" small /> Dr. Asha Menon <span>● LIVE</span></div></div>
            <div className="call-video"><div className="camera-placeholder warm"><div className="camera-symbol"><Icon name="camera" size={26} /></div><b>Full head view</b><span>Camera 2 preview placeholder</span></div><div className="video-label">Camera 2</div></div>
            <div className="call-video"><div className="camera-placeholder cool"><div className="camera-symbol"><Icon name="camera" size={26} /></div><b>Room view</b><span>Camera 3 preview placeholder</span></div><div className="video-label">Camera 3</div></div>
          </div>
          <div className="call-controls"><button className={`call-control${muted ? ' control-active' : ''}`} onClick={() => setMuted(!muted)}><Icon name={muted ? 'micOff' : 'mic'} /><span>{muted ? 'Unmute' : 'Mute'}</span></button><button className={`call-control${!cameraOn ? ' control-active' : ''}`} onClick={() => setCameraOn(!cameraOn)}><Icon name="camera" /><span>{cameraOn ? 'Camera on' : 'Camera off'}</span></button><button className="call-control" onClick={() => notify('Screen sharing is a wireframe control.')}><Icon name="grid" /><span>Layout</span></button><button className="call-control" onClick={() => notify('Recording is limited to 30 minutes for this pilot.')}><Icon name="video" /><span>Recording</span></button></div>
          <div className="connection-note"><span className="signal-bars"><i /><i /><i /><i /></span><span>Connection is stable</span><span>·</span><span>720p</span><span className="spacer" /><span>Recording stops at 30 min. The call can continue.</span></div>
        </section>
        <aside className="call-sidebar">
          <div className="panel participants-panel"><div className="panel-heading"><div><h2>Participants <span className="count-badge">3</span></h2><p>Only invited doctors can join</p></div><button className="icon-button subtle" onClick={() => notify('Only the junior doctor can invite a participant in this wireframe.')}><Icon name="plus" /></button></div><Participant initials="AM" name="Dr. Asha Menon" label="Junior doctor · You" color="mint" /><Participant initials="MN" name="Dr. Meera Nair" label="Senior doctor" color="lilac" /><Participant initials="AP" name="Dr. Arjun Patel" label="Senior doctor" color="peach" /></div>
          <div className="panel call-notes"><div className="panel-heading"><div><h2>Session notes</h2><p>Visible to participants</p></div><button className="text-button" onClick={() => notify('Notes are a wireframe preview; saving will be connected to the API.')}>Save</button></div><textarea placeholder="Add clinical notes for this consultation…" /><div className="notes-ai"><span>✦</span> AI draft notes can be reviewed after the call.</div></div>
          <div className="patient-summary"><span>CASE REFERENCE</span><b>Case #D-2058</b><small>Consent confirmed · Recording enabled</small><button className="text-button">View case details <Icon name="chevron" size={14} /></button></div>
        </aside>
      </div>
    </div>
  );

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
      {showDemoLogin && <div className="modal-backdrop" onClick={() => setShowDemoLogin(false)}><div className="demo-modal panel" onClick={event => event.stopPropagation()}><button className="modal-close icon-button" onClick={() => setShowDemoLogin(false)} aria-label="Close"><Icon name="close" /></button><div className="eyebrow">PROTOTYPE PREVIEW</div><h2>Switch your workspace view</h2><p>This wireframe uses demo data only. Select a role to preview the experience.</p><div className="role-options"><button onClick={() => { setUserRole('junior'); setShowDemoLogin(false); }}><Avatar initials="AM" color="mint" /><span><b>Junior doctor</b><small>Book, join and review consultations</small></span><Icon name="chevron" /></button><button onClick={() => { setUserRole('senior'); setShowDemoLogin(false); }}><Avatar initials="MN" color="lilac" /><span><b>Senior doctor</b><small>Manage availability and review sessions</small></span><Icon name="chevron" /></button><button onClick={() => { setUserRole('admin'); setPage('enrollment'); setShowDemoLogin(false); }}><Avatar initials="CA" color="peach" /><span><b>Clinic administrator</b><small>Approve doctor enrollment requests</small></span><Icon name="chevron" /></button></div><div className="demo-login-note"><Icon name="shield" size={15} /> No credentials or patient data are saved in this preview.</div></div></div>}
    </div>
  );
}

function StatCard({ label, value, suffix, change, icon, tone }) {
  const isCheck = icon === 'check';
  return <article className="panel stat-card"><div className={`stat-icon stat-${tone}`}><Icon name={isCheck ? 'check' : icon} size={19} /></div><div className="stat-content"><span>{label}</span><div><strong>{value}</strong>{suffix && <small>{suffix}</small>}</div><p>{change}</p></div><span className="stat-spark" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span></article>;
}

function ScheduleItem({ time, period, patient, detail, doctor, initials, color, state, highlighted, onJoin }) {
  return <div className={`schedule-item${highlighted ? ' schedule-highlighted' : ''}`}><div className="schedule-time">{time}<small>{period}</small></div><div className="timeline-rail"><i /></div><div className="schedule-info"><div className="schedule-case"><b>{patient}</b><span className={highlighted ? 'tag-soon' : ''}>{state}</span></div><p>{detail}</p><div className="schedule-doctor"><Avatar initials={initials} color={color} small /> {doctor}</div>{onJoin && <button className="text-button join-call-button" onClick={onJoin}><Icon name="video" size={13} /> Open call preview</button>}</div><button className="icon-button subtle schedule-open" aria-label={`Open ${patient}`} onClick={onJoin}><Icon name="chevron" size={16} /></button></div>;
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

function RoomParticipant({ initials, name, role, color, you }) {
  return <div className="room-team-member"><Avatar initials={initials} color={color} /><span><b>{name}{you && <em>YOU</em>}</b><small>{role}</small></span><StatusPill>{you ? 'In this room' : 'Invited'}</StatusPill></div>;
}

function ProfileLine({ label, value }) {
  return <div className="profile-line"><span>{label}</span><b>{value}</b></div>;
}

export default App;
