import React, { useContext, useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../context/Context';
import { api } from '../Api';
import moment from 'moment';
import Alluser from './Alluser';
import io from 'socket.io-client';
import { encryptMessage, decryptMessage } from '../utils/crypto';
import { toast } from 'react-hot-toast';
import {
  LuPhone,
  LuVideo,
  LuSearch,
  LuEllipsisVertical,
  LuSmile,
  LuPlus,
  LuMic,
  LuSend,
  LuX,
  LuCheck,
  LuCheckCheck,
  LuFileText,
  LuImage,
  LuCamera,
  LuUser,
  LuDownload,
  LuMicOff,
  LuVideoOff,
  LuVolumeX,
  LuArrowLeft
} from 'react-icons/lu';

// Ringtone Synthesizer using browser Web Audio API (No downloads required)
let audioCtx = null;
let ringInterval = null;

const playDialTone = (ctx) => {
  try {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    // US ringback tone dual frequencies (350Hz + 440Hz)
    osc1.frequency.setValueAtTime(350, ctx.currentTime);
    osc2.frequency.setValueAtTime(440, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.12, ctx.currentTime + 1.0);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.15);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.2);
    osc2.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.error("Dial tone gen error", e);
  }
};

const playIncomingTone = (ctx) => {
  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = 'triangle';
    
    const now = ctx.currentTime;
    // Repeating WhatsApp-style musical arpeggio ring
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(554.37, now + 0.15);
    osc.frequency.setValueAtTime(659.25, now + 0.3);
    osc.frequency.setValueAtTime(880, now + 0.45);
    
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.setValueAtTime(0.1, now + 0.6);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    
    osc.start();
    osc.stop(now + 0.75);
  } catch (e) {
    console.error("Incoming tone gen error", e);
  }
};

const playCallDisconnectSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    // Sliding descending beep for call cut
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.error("Disconnect sound error", e);
  }
};

const startRinging = (isOutgoing = false) => {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (ringInterval) clearInterval(ringInterval);
    
    const playTone = () => {
      if (isOutgoing) {
        playDialTone(audioCtx);
      } else {
        playIncomingTone(audioCtx);
      }
    };

    playTone();
    ringInterval = setInterval(playTone, isOutgoing ? 4000 : 1500);
  } catch (e) {
    console.log("Ringtone error", e);
  }
};

const stopRinging = () => {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
};

const Chat = () => {
  const { state } = useContext(GlobalContext);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [message, setChatMsg] = useState('');
  const [allmessage, setallMessage] = useState([]);
  const [userdetails, setuserdetails] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Attachment menu states
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [msgReactions, setMsgReactions] = useState({});
  const [viewerImage, setViewerImage] = useState(null);

  // Calling States
  const [callActive, setCallActive] = useState(false);
  const [callingState, setCallingState] = useState(null); // 'dialing', 'ringing', 'connected'
  const [callType, setCallType] = useState('audio'); // 'audio' or 'video'
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerId, setCallerId] = useState(null);
  const [callerName, setCallerName] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  // Status and Typing States
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [lastSeen, setLastSeen] = useState(null);

  const scrollRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  const typingTimeoutRef = useRef(null);
  const callStartTimeRef = useRef(null);

  const saveCallLog = async (receiverId, status, duration = 0) => {
    try {
      await api.post('/api/v1/calllogs', {
        receiverId,
        type: callType,
        status,
        duration
      });
    } catch (err) {
      console.error("Failed to save call log:", err);
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        if (audioBlob.size > 0) {
          await uploadAndSendFile(audioBlob, 'voice-note.webm', 'audio');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Could not access microphone for voice note");
    }
  };

  const stopRecording = (shouldSend = true) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (!shouldSend) {
        audioChunksRef.current = [];
      }
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleFileAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setShowAttachMenu(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let fileType = 'document';
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
    } else if (file.type.startsWith('audio/')) {
      fileType = 'audio';
    }

    await uploadAndSendFile(file, file.name, fileType);
    e.target.value = '';
  };

  const uploadAndSendFile = async (fileBlobOrFile, fileName, fileType) => {
    const loadingToast = toast.loading(`Uploading ${fileType}...`);
    try {
      const formData = new FormData();
      formData.append('file', fileBlobOrFile, fileName);

      const uploadRes = await api.post('/api/v1/chat/upload', formData);

      const { fileUrl } = uploadRes.data;
      const encryptedMsg = encryptMessage(`[Sent a ${fileType}]`);

      const sendRes = await api.post(`/api/v1/chat/${id}`, {
        from: state.user.user_id,
        to: id,
        message: encryptedMsg,
        fileUrl,
        fileType
      });

      setallMessage((prev) => [...prev, sendRes.data.conversation]);
      toast.success(`${fileType} sent successfully!`, { id: loadingToast });
    } catch (err) {
      console.error("File upload/send error:", err);
      toast.error(`Failed to send ${fileType}`, { id: loadingToast });
    }
  };

  // Local state emoji handler
  const handleReactToMessage = (msgId, emoji) => {
    const toggledEmoji = emoji === msgReactions[msgId] ? null : emoji;
    setMsgReactions(prev => ({
      ...prev,
      [msgId]: toggledEmoji
    }));
    if (socketRef.current) {
      socketRef.current.emit('message-reaction', { to: id, msgId, emoji: toggledEmoji });
    }
  };

  const renderMessageContent = (msg) => {
    switch (msg.fileType) {
      case 'image':
        return (
          <div className="flex flex-col gap-1.5">
            <img 
              src={msg.fileUrl} 
              alt="attachment" 
              className="rounded-lg max-w-full max-h-[300px] object-cover cursor-zoom-in hover:brightness-95 transition"
              onClick={() => setViewerImage(msg.fileUrl)}
            />
            {msg.text && msg.text !== '[Sent a image]' && (
              <p className="font-light tracking-wide text-xs mt-1">{decryptMessage(msg.text)}</p>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="flex flex-col gap-1.5">
            <video 
              src={msg.fileUrl} 
              controls 
              className="rounded-lg max-w-full max-h-[300px] shadow-sm border border-primary/20" 
            />
            {msg.text && msg.text !== '[Sent a video]' && (
              <p className="font-light tracking-wide text-xs mt-1">{decryptMessage(msg.text)}</p>
            )}
          </div>
        );
      case 'audio':
        return (
          <div className="flex flex-col gap-1.5 min-w-[280px]">
            <div className="flex items-center gap-3 bg-[#111b21]/30 rounded-xl p-3 border border-primary/20">
              <div className="w-10 h-10 rounded-full bg-[#00a884]/20 flex items-center justify-center text-[#00a884] flex-shrink-0">
                <LuMic className="text-xl" />
              </div>
              <audio 
                src={msg.fileUrl} 
                controls 
                className="w-full text-xs h-8 outline-none filter invert brightness-200" 
              />
            </div>
            {msg.text && msg.text !== '[Sent a audio]' && (
              <p className="font-light tracking-wide text-xs">{decryptMessage(msg.text)}</p>
            )}
          </div>
        );
      case 'document':
        let displayName = "Document";
        try {
          const parts = msg.fileUrl.split('/');
          displayName = parts[parts.length - 1];
        } catch (e) {}
        
        return (
          <div className="flex flex-col gap-1.5 min-w-[240px]">
            <a 
              href={msg.fileUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-3 bg-[#111b21]/45 rounded-xl p-3.5 hover:bg-[#111b21]/70 transition border border-[#222d34]"
            >
              <div className="w-10 h-10 rounded bg-[#00a884]/20 flex items-center justify-center text-[#00a884] flex-shrink-0 text-xs font-bold shadow">
                DOC
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{displayName}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Click to download</p>
              </div>
            </a>
            {msg.text && msg.text !== '[Sent a document]' && (
              <p className="font-light tracking-wide text-xs">{decryptMessage(msg.text)}</p>
            )}
          </div>
        );
      case 'text':
      default:
        return <p className="font-light tracking-wide leading-relaxed">{decryptMessage(msg.text)}</p>;
    }
  };

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allmessage]);

  const fetchmsg = async () => {
    try {
      const res = await api.get(`/api/v1/conversation/${id}`);
      setallMessage(res.data.conversion);
    } catch (error) {
      console.log('fetch msg error', error);
    }
  };

  const fetchUserdetails = async () => {
    try {
      const res = await api.get(`/api/v1/userprofile?user_id=${id}`);
      setuserdetails(res.data.user);
    } catch (error) {
      console.log('fetch user det error', error);
    }
  };

  // Socket Connection and Event Listeners (WebRTC calling)
  useEffect(() => {
    if (!id || id === ':id' || !state?.user?.user_id) return;
    const socket = io('http://localhost:5004', {
      query: { userId: state.user.user_id }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('connected to chat socket');
      socket.emit('register', state.user.user_id);
      socket.emit('get-user-status', id);
      socket.emit('viewing-chat', { chatId: id });
    });

    socket.on('typing-status', ({ from, isTyping }) => {
      if (from === id) {
        setIsOtherTyping(isTyping);
      }
    });

    socket.on('status-update', ({ userId, status, lastSeen }) => {
      if (userId === id) {
        setOnlineStatus(status);
        if (lastSeen) setLastSeen(lastSeen);
      }
    });

    socket.on('initial-statuses', (statuses) => {
      const userStat = statuses[id];
      if (userStat) {
        setOnlineStatus(userStat.status);
        if (userStat.lastSeen) setLastSeen(userStat.lastSeen);
      }
    });

    socket.on('messages-read', ({ readerId }) => {
      if (readerId === id) {
        setallMessage((prev) =>
          prev.map((msg) => {
            const msgFromId = msg.from?._id || msg.from;
            return msgFromId === state.user.user_id
              ? { ...msg, status: 'read' }
              : msg;
          })
        );
      }
    });

    // Message channel
    socket.on(`${id}-${state.user.user_id}`, (data) => {
      setallMessage((prev) => [...prev, data]);
      socket.emit('viewing-chat', { chatId: id });
    });

    socket.on('message-reaction-received', ({ msgId, emoji }) => {
      setMsgReactions(prev => ({
        ...prev,
        [msgId]: emoji
      }));
    });

    // Call channels
    socket.on('incoming-call', async ({ signal, from, type }) => {
      console.log('incoming-call event received', from, type);
      try {
        const res = await api.get(`/api/v1/userprofile?user_id=${from}`);
        setCallerName(`${res.data.user.firstName} ${res.data.user.lastName}`);
      } catch (e) {
        setCallerName('Active Node');
      }
      setCallerId(from);
      setCallerSignal(signal);
      setCallType(type);
      setIncomingCall(true);
      setCallingState('ringing');
      startRinging(false);
    });

    socket.on('call-accepted', async ({ signal }) => {
      console.log('call-accepted event received');
      setCallingState('connected');
      callStartTimeRef.current = new Date();
      stopRinging();
      try {
        if (peerConnectionRef.current && signal) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        }
      } catch (err) {
        console.error('Error setting remote description on call acceptance', err);
      }
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      console.log('ice-candidate received');
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding ICE candidate', err);
      }
    });

    socket.on('call-ended', () => {
      console.log('call-ended received');
      toast.error("Call ended");
      
      let duration = 0;
      let status = 'missed';
      if (callStartTimeRef.current) {
        duration = Math.round((new Date() - callStartTimeRef.current) / 1000);
        status = 'answered';
      } else if (incomingCall) {
        status = 'missed';
      } else {
        status = 'rejected';
      }
      
      const peerId = callerId || id;
      if (peerId && peerId !== ':id') {
        saveCallLog(peerId, status, duration);
      }
      
      endCallCleanup();
    });

    return () => {
      socket.emit('viewing-chat', { chatId: null });
      socket.disconnect();
      stopRinging();
    };
  }, [id, state.user.user_id]);

  const sentMsg = async () => {
    if (!message.trim()) return;
    try {
      if (socketRef.current && typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socketRef.current.emit('typing', { to: id, isTyping: false });
        typingTimeoutRef.current = null;
      }

      const encrypted = encryptMessage(message);
      const res = await api.post(`/api/v1/chat/${id}`, {
        from: state.user.user_id,
        to: id,
        message: encrypted,
      });
      setallMessage((prev) => [...prev, res.data.conversation]);
      setChatMsg('');
    } catch (error) {
      console.log('send msg error', error);
    }
  };

  useEffect(() => {
    if (id && id !== ':id') {
      fetchmsg();
      fetchUserdetails();
      setIsOtherTyping(false);
      setOnlineStatus(null);
      setLastSeen(null);
      if (socketRef.current) {
        socketRef.current.emit('get-user-status', id);
        socketRef.current.emit('viewing-chat', { chatId: id });
      }
    } else {
      setallMessage([]);
      setuserdetails('');
      setIsOtherTyping(false);
      setOnlineStatus(null);
      setLastSeen(null);
    }

    return () => {
      if (socketRef.current && id && id !== ':id') {
        socketRef.current.emit('typing', { to: id, isTyping: false });
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [id]);

  // WebRTC Implementation
  const startLocalStream = async (isVideo) => {
    try {
      const constraints = { audio: true, video: isVideo };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Error accessing user media devices", err);
      toast.error("Could not access camera/microphone");
      return null;
    }
  };

  const initCall = async (isVideo = false) => {
    console.log("Initializing WebRTC call, type:", isVideo ? "video" : "audio");
    setCallType(isVideo ? 'video' : 'audio');
    setCallActive(true);
    setCallingState('dialing');
    startRinging(true);

    const stream = await startLocalStream(isVideo);
    if (!stream) {
      endCallCleanup();
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', { to: id, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log('Remote track received');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("RTC connection state change:", pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        toast.error("Call connection lost");
        endCallCleanup();
      }
    };

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (socketRef.current) {
        socketRef.current.emit('call-user', {
          userToCall: id,
          signalData: offer,
          from: state.user.user_id,
          type: isVideo ? 'video' : 'audio'
        });
      }
    } catch (err) {
      console.error("Error creating RTC offer", err);
    }
  };

  const acceptIncomingCall = async () => {
    console.log("Accepting incoming call");
    setIncomingCall(false);
    setCallActive(true);
    setCallingState('connected');
    callStartTimeRef.current = new Date();
    stopRinging();

    const isVideo = callType === 'video';
    const stream = await startLocalStream(isVideo);
    if (!stream) {
      rejectIncomingCall();
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', { to: callerId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log('Remote track received on answer');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("RTC connection state change:", pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        toast.error("Call connection lost");
        endCallCleanup();
      }
    };

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(callerSignal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (socketRef.current) {
        socketRef.current.emit('accept-call', { to: callerId, signalData: answer });
      }
    } catch (err) {
      console.error("Error accepting RTC call", err);
    }
  };

  const rejectIncomingCall = () => {
    console.log("Rejecting incoming call");
    stopRinging();
    if (socketRef.current && callerId) {
      socketRef.current.emit('end-call', { to: callerId });
      saveCallLog(callerId, 'rejected', 0);
    }
    toast.error("Call declined");
    endCallCleanup();
  };

  const terminateCall = () => {
    console.log("Terminating active call");
    const peerId = id && id !== ':id' ? id : callerId;
    if (socketRef.current && peerId) {
      socketRef.current.emit('end-call', { to: peerId });
      
      let duration = 0;
      let status = 'missed';
      if (callStartTimeRef.current) {
        duration = Math.round((new Date() - callStartTimeRef.current) / 1000);
        status = 'answered';
      }
      saveCallLog(peerId, status, duration);
    }
    toast.error("Call ended");
    endCallCleanup();
  };

  const endCallCleanup = () => {
    const wasActive = callActive || incomingCall || callingState !== null;
    stopRinging();
    setCallActive(false);
    setIncomingCall(false);
    setCallingState(null);
    setCallerId(null);
    setCallerSignal(null);
    setAudioMuted(false);
    setVideoMuted(false);
    callStartTimeRef.current = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (wasActive) {
      playCallDisconnectSound();
    }
  };

  const toggleMuteAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleMuteVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const handleInputChange = (e) => {
    setChatMsg(e.target.value);
    
    if (socketRef.current) {
      if (!typingTimeoutRef.current) {
        socketRef.current.emit('typing', { to: id, isTyping: true });
      }
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing', { to: id, isTyping: false });
        typingTimeoutRef.current = null;
      }, 2000);
    }
  };

  const getStatusText = () => {
    if (isOtherTyping) return <span className="text-[#00a884] font-medium animate-pulse">typing...</span>;
    if (onlineStatus === 'online') return 'online';
    if (onlineStatus === 'offline' && lastSeen) {
      return `last seen ${moment(lastSeen).calendar().toLowerCase()}`;
    }
    return 'offline';
  };

  const renderTicks = (status) => {
    switch (status) {
      case 'read':
        return <LuCheckCheck className="text-[#53bdeb] text-sm flex-shrink-0 stroke-[2.5px]" />;
      case 'delivered':
        return <LuCheckCheck className="text-[#8696a0] text-sm flex-shrink-0 stroke-[2.5px]" />;
      case 'sent':
      default:
        return <LuCheck className="text-[#8696a0] text-sm flex-shrink-0 stroke-[2.5px]" />;
    }
  };

  const hasChatActive = id && id !== ':id';

  return (
    <div className="flex h-screen bg-[#111b21] text-[#e9edef] relative overflow-hidden font-sans">
      
      {/* Sidebar Layout panel hook */}
      <div
        className={`h-full z-20 transition-transform duration-300 md:relative md:translate-x-0 w-full md:w-[420px] flex-shrink-0 ${
          hasChatActive 
            ? (sidebarOpen ? 'absolute top-0 left-0 translate-x-0' : 'absolute top-0 left-0 -translate-x-full')
            : 'translate-x-0'
        }`}
      >
        {sidebarOpen && (
          <button 
            className="absolute top-4 right-4 text-white z-50 text-xl md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <LuX />
          </button>
        )}
        <Alluser />
      </div>

      {/* Chat Pane */}
      <div className={`flex-1 flex flex-col relative z-10 border-l border-[#222d34]/60 min-w-0 ${
        hasChatActive ? 'flex' : 'hidden md:flex'
      }`}>
        {id && id !== ':id' && userdetails ? (
          <>
            {/* WhatsApp Chat Header */}
            <header className="h-[60px] flex items-center justify-between px-6 bg-[#202c33] text-white shadow-sm flex-shrink-0 border-b border-[#222d34]/20">
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  className="md:hidden text-[#aebac1] hover:text-white text-lg transition-colors p-1"
                  onClick={() => navigate('/chat')}
                >
                  <LuArrowLeft />
                </button>
                
                <img
                  src={userdetails.profile || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s'}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover shadow border border-primary/20"
                />
                
                <div className="leading-tight min-w-0">
                  <h1 className="text-sm font-semibold text-[#e9edef] truncate">
                    {userdetails.firstName} {userdetails.lastName}
                  </h1>
                  <p className="text-[11px] text-[#8696a0] flex items-center gap-1 leading-none mt-0.5">{getStatusText()}</p>
                </div>
              </div>

              {/* Call Controls & Action Buttons */}
              <div className="flex items-center gap-5 text-[#aebac1]">
                <button 
                  onClick={() => initCall(false)} 
                  className="hover:text-white hover:scale-105 active:scale-95 transition-all p-1.5 rounded-full hover:bg-zinc-800/40"
                  title="Voice call"
                >
                  <LuPhone className="text-base" />
                </button>
                <button 
                  onClick={() => initCall(true)} 
                  className="hover:text-white hover:scale-105 active:scale-95 transition-all p-1.5 rounded-full hover:bg-zinc-800/40"
                  title="Video call"
                >
                  <LuVideo className="text-base" />
                </button>
                <div className="w-[1px] h-[18px] bg-[#222d34] mx-1"></div>
                <button className="hover:text-white transition-colors p-1" title="Search messages">
                  <LuSearch className="text-[18px]" />
                </button>
                <button className="hover:text-white transition-colors p-1" title="Menu">
                  <LuEllipsisVertical className="text-[18px]" />
                </button>
              </div>
            </header>

            {/* Messages Display (Wallpaper) */}
            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4 whatsapp-wallpaper custom-scrollbar flex flex-col bg-zinc-950">
              {allmessage.map((msg) => {
                const isSelf = msg.from && (msg.from._id === state.user.user_id || msg.from === state.user.user_id);
                return (
                  <div 
                    key={msg._id}
                    className="flex flex-col relative message-bubble-container"
                  >
                    {/* Reaction Bar above bubble (shows on hover via CSS) */}
                    <div className={`reaction-bar absolute -top-8 bg-[#202c33]/95 border border-[#222d34] rounded-full px-2 py-1 flex gap-2.5 shadow-lg z-20 transition-all duration-200 ${
                      isSelf ? 'right-2' : 'left-2'
                    }`}>
                      {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                        <button 
                          key={emoji} 
                          onClick={() => handleReactToMessage(msg._id, emoji)} 
                          className="hover:scale-130 transition-transform text-sm select-none"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Chat bubble body */}
                    <div
                      className={`max-w-[65%] md:max-w-[45%] px-3.5 py-2.5 rounded-xl text-[14.2px] leading-snug shadow relative ${
                        isSelf
                          ? 'bg-[#005c4b] text-[#e9edef] self-end ml-auto rounded-tr-none bubble-tail-sender'
                          : 'bg-[#202c33] text-[#e9edef] self-start rounded-tl-none bubble-tail-receiver'
                      } break-words`}
                    >
                      {renderMessageContent(msg)}
                      
                      <div className="flex items-center justify-end gap-1.5 mt-2 select-none">
                        <span className="text-[9px] text-[#8696a0] font-light">
                          {moment(msg.createdOn).format('LT')}
                        </span>
                        {isSelf && renderTicks(msg.status)}
                      </div>

                      {/* Display reaction if any */}
                      {msgReactions[msg._id] && (
                        <span className="absolute -bottom-2.5 right-3 bg-[#202c33] border border-[#222d34] rounded-full px-1.5 py-0.5 text-[11px] shadow-sm z-10 flex items-center select-none scale-105 transition-all">
                          {msgReactions[msg._id]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </main>

            {/* Input Message Footer */}
            <footer className="flex items-center gap-2 px-4 py-3.5 bg-[#202c33] flex-shrink-0 min-h-[66px] relative border-t border-[#222d34]/20 z-15">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              
              {/* Attachment Drawer Popover */}
              {showAttachMenu && (
                <div className="absolute bottom-[72px] left-6 bg-[#202c33] border border-[#222d34] rounded-2xl p-3 flex flex-col gap-3.5 shadow-2xl z-30 animate-fade-in-down">
                  <button 
                    onClick={handleFileAttachClick}
                    className="flex items-center gap-3.5 hover:bg-[#2a3942] p-2.5 rounded-xl transition text-left text-xs font-semibold text-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white"><LuFileText /></div>
                    Document File
                  </button>
                  <button 
                    onClick={handleFileAttachClick}
                    className="flex items-center gap-3.5 hover:bg-[#2a3942] p-2.5 rounded-xl transition text-left text-xs font-semibold text-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white"><LuImage /></div>
                    Photos & Videos
                  </button>
                  <button 
                    onClick={handleFileAttachClick}
                    className="flex items-center gap-3.5 hover:bg-[#2a3942] p-2.5 rounded-xl transition text-left text-xs font-semibold text-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white"><LuCamera /></div>
                    Camera Shoot
                  </button>
                  <button 
                    onClick={handleFileAttachClick}
                    className="flex items-center gap-3.5 hover:bg-[#2a3942] p-2.5 rounded-xl transition text-left text-xs font-semibold text-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white"><LuUser /></div>
                    Send Contact
                  </button>
                </div>
              )}

              {isRecording ? (
                // Recording Mode UI
                <div className="flex-1 flex items-center justify-between px-5 py-2 bg-[#2a3942] border border-[#222d34]/60 rounded-xl text-[#e9edef] h-[44px] animate-pulse">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Recording</span>
                    <span className="text-xs font-semibold tracking-widest font-mono bg-[#1f2c34] px-2.5 py-0.5 rounded text-white">{formatDuration(recordingDuration)}</span>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <button 
                      onClick={() => stopRecording(false)} 
                      className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Cancel recording"
                    >
                      <LuX className="text-lg" />
                    </button>
                    <button 
                      onClick={() => stopRecording(true)} 
                      className="p-2 bg-[#00a884] text-[#111b21] hover:scale-105 rounded-full transition-all shadow"
                      title="Send Voice Note"
                    >
                      <LuSend className="text-sm" />
                    </button>
                  </div>
                </div>
              ) : (
                // Normal Typing Mode UI
                <>
                  <div className="flex items-center text-[#aebac1] gap-1">
                    <button className="p-2 hover:text-white transition-colors hover:scale-105" title="Emoji">
                      <LuSmile className="text-xl" />
                    </button>
                    <button 
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className={`p-2 hover:text-white transition-all rounded-full hover:bg-zinc-800/40 ${showAttachMenu ? 'rotate-45 text-[#00a884]' : ''}`} 
                      title="Attach Content"
                    >
                      <LuPlus className="text-xl" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    placeholder="Type a message"
                    className="flex-1 bg-[#2a3942] text-white rounded-xl px-5 py-2.5 outline-none text-xs placeholder-[#8696a0] h-[44px] focus:border-[#00a884] border border-transparent transition shadow-inner"
                    onKeyDown={(e) => e.key === 'Enter' && sentMsg()}
                  />
                  <div className="text-[#aebac1] px-1 flex-shrink-0">
                    {message.trim() ? (
                      <button
                        onClick={sentMsg}
                        className="p-2 text-[#00a884] hover:text-[#00c59b] hover:scale-105 transition-all"
                        title="Send message"
                      >
                        <LuSend className="text-xl" />
                      </button>
                    ) : (
                      <button
                        onClick={startRecording}
                        className="p-2 hover:text-white transition-all hover:scale-105"
                        title="Voice message"
                      >
                        <LuMic className="text-xl" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </footer >
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col justify-center items-center text-center bg-[#222e35]/15 px-6">
            <img 
              src="https://static.whatsapp.net/rsrc.php/v3/y6/r/R457WSN2Z2k.png" 
              className="w-64 opacity-60 mb-6 invert dark:invert-0" 
              alt="whatsapp logo" 
            />
            <h2 className="text-2xl font-light text-[#e9edef] tracking-wide">
              WhatsApp Web
            </h2>
            <p className="text-xs text-[#8696a0] mt-3 max-w-sm font-light leading-relaxed">
              Send and receive messages securely. Click a contact in the sidebar tab to open an end-to-end encrypted connection.
            </p>
            
            <button
              onClick={() => setSidebarOpen(true)}
              className="mt-6 md:hidden px-5 py-2 bg-[#00a884] hover:bg-[#008f72] text-[#111b21] font-semibold text-xs rounded transition-colors"
            >
              Open Contacts
            </button>
          </div>
        )}
      </div>

      {/* Full-Screen Image Gallery Viewer Overlay */}
      {viewerImage && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-fade-in">
          <div className="absolute top-4 right-4 flex gap-4 text-white text-xl z-55">
            <a 
              href={viewerImage} 
              download 
              target="_blank" 
              rel="noreferrer"
              className="p-2 bg-zinc-800/60 rounded-full hover:bg-zinc-700/80 transition"
              title="Download image"
            >
              <LuDownload />
            </a>
            <button 
              onClick={() => setViewerImage(null)} 
              className="p-2 bg-zinc-800/60 rounded-full hover:bg-zinc-700/80 transition"
              title="Close viewer"
            >
              <LuX />
            </button>
          </div>
          <div className="max-w-4xl max-h-[85vh] flex items-center justify-center">
            <img 
              src={viewerImage} 
              alt="expanded gallery item" 
              className="max-h-full max-w-full object-contain rounded shadow-2xl border border-zinc-800"
            />
          </div>
        </div>
      )}

      {/* Call HUD Overlay (WebRTC Streaming UI) */}
      {callActive && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center call-overlay text-white p-6 font-sans">
          
          {/* Main Video Stream Window */}
          <div className="relative w-full max-w-2xl h-[450px] bg-black/60 rounded-2xl border border-[#222d34] flex items-center justify-center overflow-hidden shadow-2xl">
            {/* Always render remote video element when connected so audio always plays */}
            {callingState === 'connected' && (
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover ${callType === 'video' ? 'block' : 'hidden'}`} 
              />
            )}

            {/* Show avatar and name details for voice calls or when not connected yet */}
            {(callType === 'audio' || callingState !== 'connected') && (
              <div className="text-center z-10">
                <img 
                  src={userdetails.profile || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s'} 
                  className={`w-32 h-32 rounded-full object-cover border-2 border-zinc-700 mx-auto mb-4 ${callingState !== 'connected' ? 'call-pulse' : ''}`}
                  alt="avatar" 
                />
                <h3 className="text-xl font-semibold tracking-tight">
                  {userdetails.firstName} {userdetails.lastName}
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 uppercase tracking-widest font-mono">
                  {callingState === 'dialing' ? 'Dialing...' : callingState === 'ringing' ? 'Ringing...' : 'Connected'}
                </p>
              </div>
            )}

            {/* Mini Local Video Stream */}
            {callType === 'video' && (
              <div className="absolute bottom-4 right-4 w-36 h-28 bg-[#18181b] border border-zinc-700 rounded-xl overflow-hidden z-20">
                {videoMuted ? (
                  <div className="w-full h-full flex items-center justify-center bg-[#18181b] text-zinc-500">
                    <LuVideoOff />
                  </div>
                ) : (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
            )}
          </div>

          {/* Call Controls HUD Bar */}
          <div className="mt-8 flex items-center gap-6 z-10">
            <button
              onClick={toggleMuteAudio}
              className={`p-4 rounded-full border text-lg transition-colors shadow-lg ${
                audioMuted 
                  ? 'bg-red-600/20 border-red-500 text-red-500 hover:bg-red-600/30' 
                  : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300'
              }`}
              title={audioMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {audioMuted ? <LuMicOff /> : <LuMic />}
            </button>

            {callType === 'video' && (
              <button
                onClick={toggleMuteVideo}
                className={`p-4 rounded-full border text-lg transition-colors shadow-lg ${
                  videoMuted 
                    ? 'bg-red-600/20 border-red-500 text-red-500 hover:bg-red-600/30' 
                    : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300'
                }`}
                title={videoMuted ? "Start Camera" : "Stop Camera"}
              >
                {videoMuted ? <LuVideoOff /> : <LuVideo />}
              </button>
            )}

            <button
              onClick={terminateCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-750 text-white text-lg transition-colors shadow-xl"
              title="Hang up call"
            >
              <LuPhoneOff className="rotate-[135deg]" />
            </button>
          </div>

        </div>
      )}

      {/* Incoming Call Popup Modal */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 font-sans">
          <div className="bg-[#1f2c34] border border-[#222d34] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in-down">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s" 
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border border-zinc-700 call-pulse"
              alt="avatar" 
            />
            <h3 className="text-lg font-semibold text-white">{callerName}</h3>
            <p className="text-xs text-[#00a884] font-medium mt-1.5 uppercase tracking-widest font-mono">
              Incoming {callType} Call...
            </p>

            <div className="mt-8 flex justify-center gap-6 w-full">
              <button
                onClick={rejectIncomingCall}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs tracking-wider transition-colors flex items-center justify-center gap-2 shadow"
              >
                <LuPhoneOff /> DECLINE
              </button>
              <button
                onClick={acceptIncomingCall}
                className="flex-1 py-3 bg-[#00a884] hover:bg-[#008f72] text-[#111b21] rounded-xl font-semibold text-xs tracking-wider transition-colors flex items-center justify-center gap-2 shadow"
              >
                <LuPhone /> ACCEPT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Chat;