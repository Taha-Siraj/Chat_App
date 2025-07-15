import React from 'react'
import CustomRoutes from './routes/CustomRoutes'
import { useEffect } from 'react'
import { api } from './Api'

const App = () => {

  useEffect(()=>{
      const userProfile = async() => {
      try {
        let res= await api.get("/api/v1/userprofile");
        console.log(res.data)
      } catch (error) {
        console.log(error)
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
