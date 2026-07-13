import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../shared/Navbar';

const ProctorDashboard = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState({});
  const socketRef = useRef(null);
  const peerConnections = useRef({});
  const videoRefs = useRef({});

  const STUN_CONFIG = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
      upgrade: false
    });
    socketRef.current.emit('proctor-join', { examId });

    socketRef.current.on('candidate-joined', ({ candidateId, candidateName }) => {
      setCandidates(prev => ({ ...prev, [candidateId]: { name: candidateName, stream: null } }));

      const pc = new RTCPeerConnection(STUN_CONFIG);
      peerConnections.current[candidateId] = pc;

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.current.emit('ice-candidate', { candidate: e.candidate, targetId: candidateId });
        }
      };

      pc.ontrack = (e) => {
        setCandidates(prev => ({ ...prev, [candidateId]: { ...prev[candidateId], stream: e.streams[0] } }));
        if (videoRefs.current[candidateId]) {
          videoRefs.current[candidateId].srcObject = e.streams[0];
        }
      };

      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        socketRef.current.emit('webrtc-offer', { offer, targetId: candidateId });
      });
    });

    socketRef.current.on('webrtc-answer', ({ answer, fromId }) => {
      peerConnections.current[fromId]?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socketRef.current.on('ice-candidate', ({ candidate, fromId }) => {
      peerConnections.current[fromId]?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socketRef.current.disconnect();
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, [examId]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar title={`Live Proctor — Exam #${examId}`} />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '22px' }}>Live Candidates</h2>

        {Object.keys(candidates).length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '4rem', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Waiting for candidates to join...</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Candidates will appear here when they start the exam</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {Object.entries(candidates).map(([candidateId, candidate]) => (
              <div key={candidateId} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <video ref={el => videoRefs.current[candidateId] = el} autoPlay muted style={{ width: '100%', height: '180px', background: 'var(--bg-secondary)', objectFit: 'cover' }} />
                <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>{candidate.name}</p>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '99px', background: candidate.stream ? 'var(--success-light)' : 'var(--warning-light)', color: candidate.stream ? 'var(--success)' : 'var(--warning)' }}>
                    {candidate.stream ? 'Live' : 'Connecting...'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctorDashboard;