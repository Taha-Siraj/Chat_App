import React from 'react'
import { api } from '../Api'
import { useEffect } from 'react';

const Alluser = () => {


//   const alluser = async () => {
//    try {
//     let res = await api.get("/api/v1/allusers");
//     console.log(res.data)
//    } catch (error) {
//     console.log(error)
//    }
//   }
//   useEffect(() => {
//     alluser()
//   })
   return (
    <div>
      <h1>All user</h1>
    </div>
  )
}

export default Alluser
