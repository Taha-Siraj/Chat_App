// Alluser.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../Api';
import { GlobalContext } from '../context/Context';

const Alluser = () => {
  const [allUser, setAllUser] = useState([]);
  const { state } = useContext(GlobalContext);

  const fetchalluser = async () => {
    try {
      const res = await api.get('/api/v1/allusers');
      setAllUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchalluser();
  }, []);

  return (
    <div className="w-full md:w-[380px] h-screen bg-[#111b21] font-poppins flex flex-col">

      <header className="bg-[#202c33] px-4 py-3 flex items-center justify-between">
        <h1 className="text-green-500 font-semibold text-lg">Chats</h1>
      </header>

      <div className="bg-[#202c33] px-4 pb-3">
        <input
          type="text"
          placeholder="Search or start new chat"
          className="w-full bg-[#2a3942] text-sm text-white rounded-md px-4 py-2 outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2a3942] scrollbar-track-transparent">
        {allUser.map((u) => {
          const isMe = state.user.user_id === u._id;
          return (
            <Link
              key={u._id}
              to={`/chat/${u._id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] transition-colors"
            >
              <img
                src={
                  u.profile ||
                  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s'
                }
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  {u.firstName} {u.lastName}
                  {isMe && <span className="text-green-500 ml-2">(You)</span>}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {isMe ? 'Saved messages' : 'Tap to chat'}
                </p>
              </div>
              <span className="text-gray-500 text-xs">Yesterday</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Alluser;