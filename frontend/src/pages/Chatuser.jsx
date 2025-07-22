import React, { useContext, useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GlobalContext } from '../context/Context';
import { api } from '../Api';
import moment from 'moment';
import Alluser from './Alluser';
import io from 'socket.io-client';
import { LuMessageSquareMore } from "react-icons/lu";
import { FiSend } from 'react-icons/fi';

const Chat = () => {
    const { state } = useContext(GlobalContext);
    const { id } = useParams();
    const [message, setChatMsg] = useState("");
    const [allmessage, setallMessage] = useState([]);
    const [userdetails, setuserdetails] = useState("");

    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }, [allmessage]);

    const fetchmsg = async () => {
        try {
            let res = await api.get(`/api/v1/conversation/${id}`);
            setallMessage(res.data.conversion);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchUserdetails = async () => {
        try {
            let res = await api.get(`/api/v1/userprofile?user_id=${id}`);
            setuserdetails(res.data.user);
        } catch (error) {
            console.log("error user det", error);
        }
    };

    useEffect(() => {
        const socket = io("");
        socket.on('connect', () => {
            console.log("Connected to server");
        });

        socket.on(`${id}-${state.user.user_id}`, (data) => {
            console.log("receive data", data);
            setallMessage(prev => [...prev, data]);
        });

        socket.on('disconnect', (reason) => {
            console.log("Disconnected. Reason:", reason);
        });
        socket.on('error', (error) => {
            console.log("Error:", error);
        });
        return (() => {
            console.log("Component unmount");
            socket.disconnect();
        });
    }, [id, state.user.user_id]);

    const sentMsg = async () => {
        if (!message) {
            console.log("");
            return;
        }
        try {
            let res = await api.post(`/api/v1/chat/${id}`, {
                from: state.user.user_id,
                to: id,
                message: message
            });

            console.log("mesg sent", res.data);
            setallMessage(prev => [...prev, res.data.result]);
            setChatMsg('');
        } catch (error) {
            console.log(error);
            console.log("Axios error:", error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchmsg();
        fetchUserdetails();
    }, [id]);

    return (
    <>
    <div className='flex bg-gray-900 overflow-hidden h-screen'>
    <Alluser className='h-screen' />
    <div className='bg-gray-900 h-[100vh] w-full'>
        {id && userdetails ? 
    <div id='user-scroll' className='flex flex-col w-full  bg-gradient-to-br from-gray-900 to-black text-white h-[100vh]'>
    <div className='flex items-center gap-4 px-4 py-3 border-b border-gray-700 bg-black bg-opacity-50  backdrop-blur-md'>
      <img src={userdetails?.profile} className='rounded-full h-16 w-16 shadow-md' />
      <h1 className='text-xl font-bold text-blue-400'>
        {userdetails.firstName} {userdetails.lastName}
      </h1>
    </div>
    <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-2'>
      {allmessage?.map(msg => (
        <div key={msg._id}
          className={`px-4 py-3 rounded-xl shadow-md ${msg.from == state.user.user_id ? 'bg-indigo-600 self-end' : 'bg-gray-800 self-start'}`}>
         
        <p className="break-all break-words"> {msg.text}</p>
        
          <span className='text-xs text-gray-400 mt-1 block'>{moment(msg?.createdOn).fromNow()}</span>
        </div>
      ))}
      <div ref={scrollRef} />
    </div>
    <div className='flex items-center py-3 px-4 border-t border-gray-700'>
      <input
        value={message}
        onChange={(e) => setChatMsg(e.target.value)}
        type="text"
        placeholder="Type your message..."
        className='flex-grow bg-gray-700 border border-gray-600 text-white py-3 px-4 rounded-full focus:outline-none focus:border-blue-500'/>
      <button onClick={sentMsg} className='ml-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-md'>
        <FiSend className='text-xl' />
      </button>
    </div>
    </div>
    :
    <div className='bg-gradient-to-br from-gray-900 via-black to-gray-800 w-full h-screen flex justify-center items-center'> 
    <div className='text-center'>
    <LuMessageSquareMore className='text-9xl text-indigo-400 mx-auto animate-pulse' />
    <h1 className='text-4xl font-bold text-white capitalize flex justify-center items-center gap-x-4 mt-8 tracking-wider' >Select a User to Chat
    </h1>
    <p className='text-gray-400 mt-4'>Your conversations will appear here.</p>
    </div>
    </div>
    }
    </div>
    </div>
    </>
    );
};

export default Chat;