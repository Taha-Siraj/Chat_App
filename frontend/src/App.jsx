import React, { useContext } from 'react'
import CustomRoutes from './routes/CustomRoutes'
import { useEffect } from 'react'
import { api } from './Api'
import { GlobalContext } from './context/Context'
import axios from 'axios'

const App = () => {

  const {state, dispatch} = useContext(GlobalContext);
  useEffect( () => {
      const userProfile = async() => {
      try {
        let res= await api.get("/api/v1/userprofile");
        console.log(res.data)
        dispatch({type: "USER_LOGIN", user: res.data.user})
      } catch (error) {
        console.log(error)
        dispatch({type: "USER_LOGOUT", user: {}})
      }
    }
    userProfile()
    },[])
  return (
    <>
    <CustomRoutes/>
    </>
  )
}

export default App
