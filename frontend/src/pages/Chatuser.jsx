import React, { useContext, useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GlobalContext } from '../context/Context';
import { api } from '../Api';
import moment from 'moment';
import Alluser from './Alluser';
import io from 'socket.io-client';
import { LuMessageSquareMore } from 'react-icons/lu';
import { FiSend } from 'react-icons/fi';
import { FaBars } from 'react-icons/fa';

const Chat = () => {
  const { state } = useContext(GlobalContext);
  const { id } = useParams();
  const [message, setChatMsg] = useState('');
  const [allmessage, setallMessage] = useState([]);
  const [userdetails, setuserdetails] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollRef = useRef(null);

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

  useEffect(() => {
    const socket = io('http://localhost:5004');
    socket.on('connect', () => console.log('connected'));
    socket.on(`${id}-${state.user.user_id}`, (data) =>
      setallMessage((prev) => [...prev, data])
    );
    return () => socket.disconnect();
  }, [id, state.user.user_id]);

  const sentMsg = async () => {
    if (!message.trim()) return;
    try {
      const res = await api.post(`/api/v1/chat/${id}`, {
        from: state.user.user_id,
        to: id,
        message,
      });
      setallMessage((prev) => [...prev, res.data.conversation]);
      setChatMsg('');
    } catch (error) {
      console.log('send msg error', error);
    }
  };

  useEffect(() => {
    fetchmsg();
    fetchUserdetails();
  }, [id]);

  return (
    <div className="flex h-screen bg-[#111b21] font-poppins">
      <div
        className={`md:relative md:translate-x-0 absolute top-0 left-0 h-full z-20 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:z-auto w-full md:w-[380px]`}
      >
        <Alluser />
      </div>

      <div className="flex-1 flex flex-col relative">
        {id && userdetails ? (
          <>
            <header className="flex items-center gap-3 px-4 py-3 bg-[#202c33] text-white">
              <button
                className="md:hidden text-xl"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <FaBars />
              </button>
              <img
                src={userdetails.profile}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="leading-tight">
                <h1 className="text-md font-semibold">
                  {userdetails.firstName} {userdetails.lastName}
                </h1>
                <p className="text-xs text-[#8696a0]">Online</p>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-[#0b141a]">
              {allmessage.map((msg) => (
                <div key={msg._id}
                  className={`max-w-[65%] px-3 py-2 rounded-lg shadow text-sm leading-snug ${
                    msg.from._id === state.user.user_id
                      ? 'bg-[#005c4b] text-white self-end rounded-br-none ml-auto'
                      : 'bg-[#202c33] text-white self-start rounded-bl-none'
                  } break-words`}>

                  <p>{msg.text}</p>
                  <span className="text-[10px] text-[#8696a0] mt-1 block">
                    {moment(msg.createdOn).format('LT')}
                  </span>
                </div>
              ))}
              <div ref={scrollRef} />
            </main>

            <footer className="flex items-center gap-3 px-4 py-3 bg-[#202c33]">
              <input
                type="text"
                value={message}
                onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Type a message"
                className="flex-1 bg-[#2a3942] text-white rounded-full px-4 py-2 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && sentMsg()}/>
              <button
                onClick={sentMsg}
                className="p-2 rounded-full bg-[#005c4b] hover:bg-[#026c55] text-white">
                <FiSend className="text-xl" />
              </button>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center bg-[#111b21] text-white">
            <LuMessageSquareMore className="text-8xl text-[#8696a0] mb-4" />
            <h2 className="text-2xl font-semibold">
              Select a chat to start messaging
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;