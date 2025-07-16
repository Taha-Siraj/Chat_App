import React, { useContext } from 'react'
import CustomRoutes from './routes/CustomRoutes'
import { useEffect } from 'react'
import { api } from './Api'
import { GlobalContext } from './context/Context'

const App = () => {

  const {state , dipatch} = useContext(GlobalContext);
  useEffect( () => {
      const userProfile = async() => {
      try {
        let res= await api.get("/userprofile");
        dipatch({type: "USER_LOGIN", user:res.data.user})
      } catch (error) {
        console.log(error)
        dipatch({type: "USER_LOGOUT", user: null})
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
