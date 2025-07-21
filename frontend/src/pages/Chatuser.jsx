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
        const socket = io("http://localhost:5004");
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
            console.log("demoooooooo");
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
        <div className='flex  h-screen overflow-hidden'>
            <div className='md:w-1/3 w-full h-screen'>
                <Alluser className='h-full' />
            </div>
            <div className='flex flex-col justify-between bg-gradient-to-br from-gray-900 to-black text-white font-poppins w-full h-screen'>
                <div className='pb-4 flex justify-center items-center border-b border-gray-700 w-full capitalize bg-black bg-opacity-50 backdrop-blur-md'>
                    <img src={userdetails?.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} className='rounded-full h-16 w-16 mr-4 shadow-md' alt="User Profile" />
                    <h1 className='text-xl font-bold text-blue-400'>{userdetails.firstName} {userdetails.lastName}</h1>
                </div>

                <div className='p-4 overflow-y-auto flex flex-col gap-2'>
                    {allmessage?.map((msg) => (
                        <div
                            key={msg._id}
                            className={`px-4 py-3 rounded-xl shadow-md ${msg.from == state.user.user_id ? 'bg-indigo-600 text-white self-end' : 'bg-gray-800 text-white self-start'}`}
                        >
                            <p className='text-lg'>{msg.text}</p>
                            <span className='text-xs text-gray-400 mt-1 block'>{moment(msg?.createdOn).fromNow()}</span>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>

                <div className=''>
                    <input
                        value={message}
                        onChange={(e) => setChatMsg(e.target.value)}
                        type="text"
                        placeholder="Type your message..."
                        className='flex-grow bg-gray-700 border border-gray-600 text-white py-2 px-3 rounded-full focus:outline-none focus:border-blue-500 shadow-sm'
                    />
                    <button
                        onClick={sentMsg}
                        className='ml-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md'
                    >
                        <FiSend className="text-xl" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;