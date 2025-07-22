import React, { useContext } from 'react'
import { api } from '../Api'
import { useEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../context/Context';

const Alluser = () => {
 const [allUser , setAllUser] = useState([])
 

 const {state } = useContext(GlobalContext)
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
    <div id='user-scroll' className='bg-gray-600 font-poppins h-screen'>
      <h1 className='text-2xl text-center underline text-green-500' >All active User</h1>
      <div className='bg-gray-600 h-screen overflow-y-scroll  flex flex-col justify-center' id='user-scroll' >
        {allUser.map((eachuser) => (
            <Link to={`/chat/${eachuser?._id}`} key={eachuser._id} className='w-[250px] text-xl text-white flex justify-start hover:bg-blue-600 transition-all duration-300 items-center px-5 py-5 gap-4 '>
                <img src={eachuser?.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} alt="" className='rounded-full h-12 w-12' />
                <h1 className='text-sm' >{eachuser?.firstName} {eachuser?.lastName} <span className='text-green-500 font-bold'> {state.user.user_id === eachuser?._id ? "(You) & Me" : null}</span>   </h1>
            </Link>
        ) )}
      </div>
    </div>
  )
}

export default Alluser
