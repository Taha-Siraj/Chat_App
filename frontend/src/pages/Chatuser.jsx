import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GlobalContext } from '../context/Context';
import { api } from '../Api';
import { useEffect } from 'react';
import moment from 'moment';
import Alluser from './Alluser';

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
   <>
   <div className='flex'>
   <Alluser/>
    <div className='py-20 bg-black overflow-y-scroll h-screen text-white font-poppins w-full'>
      <h1 className='text-5xl font-bold'>Chat</h1>

<div className='flex justify-start items-start flex-col gap-3'>
  {allmessage.map((msg) => (
    <div key={msg?._id}  className={`py-2 px-4 rounded-md bg-blue-500 ${(msg.from == state.user.user_id) ? 'self-end bg-gray-400 text-black': ''}  `} >
      <p>{msg.text}</p>
      <span className='text-sm' >{moment(msg?.createdOn).fromNow()}</span>
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
   </div>
   </>
  );
};

export default Chat;
