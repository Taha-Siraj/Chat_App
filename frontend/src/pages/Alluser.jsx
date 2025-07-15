import React from 'react'
import { api } from '../Api'
import { useEffect } from 'react';
import { useState } from 'react';

const Alluser = () => {
 const [allUser , setAllUser] = useState([])

  const fetchalluser = async () => {
   try {
    let res = await api.get("/api/v1/allusers");
    console.log(res.data.user);
    setAllUser(res.data.user)
   } catch (error) {
    console.log(error)
   }
  }
  useEffect(() => {
    fetchalluser()
  },[])
   return (
    <div>
      <h1>All user</h1>
      <div>
        {allUser.map((eachuser) => (
            <div key={eachuser._id} className='w-[250px] bg-gray-900 text-xl text-white flex justify-start hover:bg-blue-600 transition-all duration-300 items-center px-5 py-5 gap-4 '>
                <img src={eachuser?.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} alt="" className='rounded-full h-12 w-12' />
                <h1>{eachuser?.firstName} {eachuser?.lastName} </h1>
            </div>
        ) )}
      </div>
    </div>
  )
}

export default Alluser
