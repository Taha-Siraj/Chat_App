import React, { useContext } from 'react'
import { CgProfile } from "react-icons/cg";
import { FaEdit } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { Link } from 'react-router-dom';
import { GlobalContext } from '../context/Context';
import { FaRegIdCard } from "react-icons/fa";
import { FaPhoneVolume } from "react-icons/fa6";
const ViewProfile = () => {
  const {state } = useContext(GlobalContext)
  return (
    <div className='py-20 bg-black min:h-screen font-poppins text-white'>
      <div className='flex flex-col justify-center items-center gap-y-5'>
         <h1 className='text-[#818CF8] mt-4 text-5xl text-center font-extrabold' >view profile</h1>

         <div className='px-5  flex  justify-center items-center flex-col py-5 gap-y-6 rounded-lg min-h-[500px] bg-[#1F2937] w-[450px] ' >
          <div><img  className='border-2 border-[#818CF8] cursor-pointer h-28 rounded-full w-28' src={state.user.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} alt="" /></div>
          <div className='rounded-lg w-full py-3 px-3 flex justify-start items-center gap-x-3 bg-[#111827]'> 
          <CgProfile className='text-2xl text-[#818CF8]'/>
           <h1 className='text-[18px]  text-[#ffffffb6]' ><span className='text-sm text-[#e8e8e89e] font-normal' >Full Name</span> <br />  {state?.user?.firstName } {state?.user?.lastName}  </h1>
          </div>
          <div className='rounded-lg w-full py-3 px-3 flex justify-start items-center gap-x-3 bg-[#111827]'> 
          <MdOutlineEmail className='text-2xl text-[#4ADE80]'/>
           <h1 className='text-[18px]  text-[#ffffffbe]' ><span className='text-sm text-[#e8e8e8d7] font-normal' >Email Address</span> <br />  {state?.user?.email} </h1>
          </div>
          <div className='rounded-lg w-full py-3 px-3 flex justify-start items-center gap-x-3 bg-[#111827]'> 
          <FaPhoneVolume className='text-2xl text-[#5da778]'/>
           <h1 className='text-[18px]  text-[#ffffffbe]' ><span className='text-sm text-[#e8e8e8d7] font-normal' >Phone Number</span> <br />  {state?.user?.phoneNumber} </h1>
          </div>
          <div className='rounded-lg w-full py-3 px-3 flex justify-start items-center gap-x-3 bg-[#111827]'> 
           <h1 className='text-[18px]  text-[#ffffffbe]' ><span className='text-sm text-[#e8e8e8d7] font-normal' >Bio</span> <br />  {state?.user?.bio} </h1>
          </div>
          <div className='rounded-lg w-full py-3 px-3 flex justify-start items-center gap-x-3 bg-[#111827]'> 
          <FaRegIdCard className='text-2xl text-[#C084FC]'/>
           <h1 className='text-[18px]  text-[#ffffffbe]' ><span className='text-sm text-[#e8e8e8d7] font-normal' >User ID </span> <br />  {state?.user?.user_id} </h1>
          </div>
          <button className='w-full py-4 px-4 text-white font-semibold bg-blue-800 rounded-md hover:scale-105 transition-all duration-150 flex justify-center items-center gap-x-2' > <FaEdit/> <Link  to={'/editprofile'}>  Edit Profile </Link></button>
         </div>
      </div>
    </div>
  )
}

export default ViewProfile
