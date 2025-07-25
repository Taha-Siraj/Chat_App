import React, { useContext } from 'react'
import CustomRoutes from './routes/CustomRoutes'
import { useEffect } from 'react'
import { api } from './Api'
import { GlobalContext } from './context/Context'
import axios from 'axios'
import io from 'socket.io-client';
import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast';

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


   useEffect(() => {
  if (notification.length > 0) {
    const lastMsg = notification[notification.length - 1];
    toast.success(`${lastMsg?.from?.firstName} ${lastMsg?.from?.lastName}: ${lastMsg?.text}`,{
        duration: 5000,
        style: {
      background: "#1f2937",
      color: "#fff",
      cursor: "pointer",
    },
    });
  }
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
