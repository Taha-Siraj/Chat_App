import React, { useContext } from 'react'
import CustomRoutes from './routes/CustomRoutes'
import { useEffect } from 'react'
import { api } from './Api'
import { GlobalContext } from './context/Context'
import axios from 'axios'
import io from 'socket.io-client';
import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'

const App = () => {

  const {state, dispatch} = useContext(GlobalContext);
  const [notification, setnotification] = useState([])
  console.log("notification", notification)
  useEffect( () => {
      const userProfile = async() => {
      try {
        let res= await api.get("/api/v1/userprofile");
        dispatch({type: "USER_LOGIN", user: res.data.user})
      } catch (error) {
        console.log(error)
        dispatch({type: "USER_LOGOUT", user: {}})
      }
    }
    userProfile()
    },[])
 const navigate =  useNavigate()

 useEffect(() => {
  if (notification.length === 0) return;

  const lastMsg = notification[notification.length - 1];
  if (!lastMsg || !lastMsg._id) return;

  toast.custom((t) => (
    <div
      className="bg-white transition-all duration-300 hover:scale-90 text-black px-4 py-3 rounded shadow-lg cursor-pointer"
      onClick={() => {
        navigate(`/chat/${lastMsg?.from?._id}`);
        toast.dismiss(t.id);
      }}>
      <strong>{lastMsg?.from?.firstName} {lastMsg?.from?.lastName}</strong>
      <p className="text-sm">{lastMsg?.text}</p>
    </div>
  ), {
    duration: 5000,
    position: 'top-center',
    id: lastMsg._id,
  });

}, [notification]);


    useEffect(() => {
        const socket = io("http://localhost:5004");
         socket.on('connect', () => {
            console.log("Connected to server");
        });

        socket.on(`personal-channel-${state.user.user_id}`, (data) => {
            console.log("notify datat clg data", data);
            setnotification(prev => [...prev, data]);
        });

        
        socket.on('disconnect', (reason) => {
            console.log("Disconnected. Reason:", reason);
        });
        socket.on('error', (error) => {
            console.log("Error:", error);
        });

        return (() => {
            console.log("Component unmount")
          });
            
    } ,[state.user.user_id])
  return (
    <>
    <Toaster position="top-center" />
    <CustomRoutes/>
    </>
  )
}

export default App
