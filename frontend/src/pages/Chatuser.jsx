import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GlobalContext } from '../context/Context';
import { api } from '../Api';
import { useEffect } from 'react';
import moment from 'moment';
import Alluser from './Alluser';
import io from 'socket.io-client';

const Chat = () => {
  const { state } = useContext(GlobalContext);
  const { id } = useParams(); 
  const [message, setChatMsg] = useState("");
  const [allmessage , setallMessage] = useState([])
  const [userdetails , setuserdetails] = useState("")
  
  
   const fetchmsg = async () => {
    try {
      let res = await api.get(`/api/v1/conversation/${id}`)
      console.log(res.data)
      setallMessage(res.data.conversion)
    } catch (error) {
      console.log(error)
    }
  }


  const fetchUserdetails = async() => {
        try {
          let res = await api.get(`/api/v1/userprofile?user_id=${id}`)
          console.log(res.data)
          console.log(res.data.user.firstName ,  res.data.user.lastName)
          setuserdetails(res.data.user)

        } catch (error) {
          console.log("error user det", error)
        }
  }


   useEffect(() => {
    const socket = io("http://localhost:5004");
    socket.on('connect', () => {
            console.log("Connected to server");
            socket.emit("join-room", state.user.user_id);
        });

        socket.on(`${id}-${state.user.user_id}`, (data) => {
          console.log("recive data", data.text)
          setallMessage(prev => [...prev, data])
        })
        socket.on('disconnect', (reason) => {
            console.log("Disconnected. Reason:", reason);
        });
        socket.on('error', (error) => {
            console.log("Error:", error);
        });
        return (() => {
          console.log("Component unmount")
          socket.disconnect(); 
        })
   },[id, state.user.user_id])

 const sentMsg = async () => {
    try {
      let res = await api.post(`/api/v1/chat/${id}`, {
        from: id,
        to: state.user.user_id,
        message: message
      });
      
      console.log("mesg sent" , res.data);
      setChatMsg('')
      fetchmsg()
    } catch (error) {
      console.log(error)
      console.log("Axios error:", error.response?.data || error.message);
    }
  };

    useEffect(() => {
      fetchmsg()
      fetchUserdetails()
    } ,[id] )
  return (
   <>
   <div className='flex pt-18'>
   <Alluser className='h-screen w-full ' />
    <div className='py-20 bg-black overflow-y-scroll h-screen text-white font-poppins w-full'>
      <h1 className='text-5xl font-bold'>Chat</h1>
      <h1 className='text-3xl font-extrabold text-blue-500 capitalize'> Chat with {userdetails.firstName} {userdetails.lastName} </h1>

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
