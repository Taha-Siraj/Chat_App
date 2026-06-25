import React, { useContext } from 'react'
import CustomRoutes from './routes/CustomRoutes'
import { useEffect } from 'react'
import { api } from './Api'
import { GlobalContext } from './context/Context'
import io from 'socket.io-client';
import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { decryptMessage } from './utils/crypto';

const App = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const [notification, setnotification] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const userProfile = async() => {
      try {
        let res = await api.get("/api/v1/userprofile");
        dispatch({ type: "USER_LOGIN", user: res.data.user })
      } catch (error) {
        console.log(error)
        dispatch({ type: "USER_LOGOUT", user: {} })
      }
    }
    userProfile()
  }, [])

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15); // short 150ms ping
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (notification.length === 0) return;

    const lastMsg = notification[notification.length - 1];
    if (!lastMsg || !lastMsg._id) return;

    // Suppress notification if message is from the current active chat session
    const pathParts = window.location.pathname.split('/');
    const activeChatId = pathParts[1] === 'chat' ? pathParts[2] : null;
    const isFromActiveChat = lastMsg.from && (lastMsg.from._id === activeChatId || lastMsg.from === activeChatId);

    if (isFromActiveChat) return;

    playNotificationSound();

    toast.custom((t) => (
      <div
        className="bg-[#202c33] border border-[#222d34] text-[#e9edef] px-4 py-3 rounded-lg shadow-xl cursor-pointer transition-transform hover:scale-95 flex items-center gap-3"
        onClick={() => {
          const senderId = lastMsg?.from?._id || lastMsg?.from;
          if (senderId) navigate(`/chat/${senderId}`);
          toast.dismiss(t.id);
        }}
      >
        <div className="flex-1">
          <strong className="text-xs font-semibold text-[#00a884]">
            {lastMsg?.from?.firstName || 'New Message'} {lastMsg?.from?.lastName || ''}
          </strong>
          <p className="text-xs text-zinc-300 truncate mt-0.5 max-w-[250px]">
            {decryptMessage(lastMsg?.text)}
          </p>
        </div>
      </div>
    ), {
      duration: 4000,
      position: 'top-center',
      id: lastMsg._id,
    });
  }, [notification]);

  useEffect(() => {
    if (!state.user.user_id) return;

    const socket = io("http://localhost:5004", {
      query: { userId: state.user.user_id }
    });

    socket.on('connect', () => {
      console.log("Connected to server with user ID:", state.user.user_id);
      socket.emit('register', state.user.user_id);
    });

    socket.on(`personal-channel-${state.user.user_id}`, (data) => {
      console.log("New personal channel message received:", data);
      setnotification(prev => [...prev, data]);
    });

    socket.on('disconnect', (reason) => {
      console.log("Disconnected. Reason:", reason);
    });

    return () => {
      socket.disconnect();
    };
  }, [state.user.user_id]);

  return (
    <>
      <Toaster position="top-center" />
      <CustomRoutes />
    </>
  )
}

export default App;
