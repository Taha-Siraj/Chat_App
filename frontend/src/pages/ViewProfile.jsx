import React from 'react'
import { CgProfile } from "react-icons/cg";
import { FaEdit } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { Link } from 'react-router-dom';
const ViewProfile = () => {
  return (
    <div className='pt-20 bg-black h-screen font-poppins text-white'>
      <div className='flex flex-col justify-center items-center gap-y-5'>
         <h1 className='text-[#818CF8] mt-4 text-5xl text-center font-extrabold' >view profile</h1>

         <div className='px-4  flex  justify-center items-center flex-col py-5 gap-y-6 rounded-lg max-h-[500px] bg-[#1F2937] w-[400px] ' >
          <div><img  className='border-2 border-[#818CF8] cursor-pointer h-28 rounded-full w-28' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s" alt="" /></div>
          <div className='rounded-lg w-full py-3 px-3 flex justify-start items-center gap-x-3 bg-[#111827]'> 
          <CgProfile className='text-2xl text-[#818CF8]'/>
           <h1 className='text-[18px]  text-[#ffffffb6]' ><span className='text-sm text-[#e8e8e89e] font-normal' >Full Name</span> <br />  Taha Siraj  </h1>
          </div>
          <div className='rounded-lg w-full py-3 px-3 flex justify-start items-center gap-x-3 bg-[#111827]'> 
          <MdOutlineEmail className='text-2xl text-[#4ADE80]'/>
           <h1 className='text-[18px]  text-[#ffffffbe]' ><span className='text-sm text-[#e8e8e8d7] font-normal' >Email Address</span> <br />  TahaSiraj@gmail.com  </h1>
          </div>
          <button className='w-full py-4 px-4 text-white font-semibold bg-blue-800 rounded-md hover:scale-105 transition-all duration-150 flex justify-center items-center gap-x-2' > <FaEdit/> <Link  to={'/editprofile'}>  Edit Profile </Link></button>
         </div>
      </div>
    </div>
  )
}

export default ViewProfile
