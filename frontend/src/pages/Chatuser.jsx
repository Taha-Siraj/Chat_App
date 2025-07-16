import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GlobalContext } from '../context/Context';
import axios from 'axios';
import { api } from '../Api';
import { useEffect } from 'react';

const Chat = () => {
  const { state } = useContext(GlobalContext);
  const { id } = useParams(); 
  const [message, setChatMsg] = useState("");
  const [allmessage , setallMessage] = useState([])

  const sentMsg = async () => {
    try {
      let res = await api.post(`/api/v1/chat/${id}`, {
        from: id,
        to: state.user.user_id,
        message: message
      });
      fetchmsg()
      console.log(res.data);
    } catch (error) {
      console.log("Axios error:", error.response?.data || error.message);
    }
  };


  const fetchmsg = async () => {
    try {
      let res = await api.get(`/api/v1/conversation/${id}`)
      console.log(res.data)
      setallMessage(res.data.usermsg)
      
    } catch (error) {
      console.log(error)
    }
  }
useEffect(() => {
  fetchmsg()
} ,[] )
  return (
    <div className='py-20 bg-black h-screen text-white font-poppins'>
      <h1 className='text-5xl font-bold'>Chat</h1>

<div>
  {allmessage.map((msg) => (
    <div key={msg?._id} >
      {msg.text}
    </div>
  ))}
</div>

      <input
        value={message}
        onChange={(e) => setChatMsg(e.target.value)}
        type="text"
        className='text-black py-2 px-4 rounded-md'
      />
      <br />
      <button
        onClick={sentMsg}
        className='py-2 px-4 bg-green-600 rounded-md mt-2'
      >
        Send Msg
      </button>
    </div>
  );
};

export default Chat;
