import React, { useState } from 'react'
import { FaHome } from 'react-icons/fa'
import { IoChatbubblesSharp } from 'react-icons/io5'
import { Link } from 'react-router-dom'
import { IoMenu } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { FaEdit } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
const Header = () => {

  const [isOpen , setIsOpen] = useState(false);
  return (
    <div>

      <header className='bg-[#111827] fixed  h-[70px] w-full flex justify-between md:px-16 px-8 items-center gap-x-5'>
        <h1 className='text-4xl font-black text-white'> <span className='text-[#818CF8]'>Chat</span>App </h1>

        <div className='md:flex hidden  justify-center items-center gap-x-5'>
            <Link className='flex gap-x-2 justify-center items-center text-xl text-[#bcbbbbcb]'  to={'/'} > <FaHome className='text-[#bcbbbbcb]' /> Home</Link>
            <Link className='flex gap-x-2 justify-center items-center text-xl text-[#bcbbbbcb]'  to={'/'} > <IoChatbubblesSharp className='text-[#bcbbbbcb]' /> Chat</Link>
        </div>

        <div className='flex justify-center items-center gap-x-4'>
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s" className='border-2 border-[#818CF8] h-12 rounded-full w-12' alt="" />
          <span className='md:hidden cursor-pointer text-4xl font-bold text-white' onClick={() => setIsOpen(!isOpen)} ><IoMenu/></span>
        </div>
      </header>


     {isOpen ?     
     <div className='md:hidden animate-fade-in-left bg-[#111827]/95 h-screen fixed top-0 left-0 right-0 flex flex-col justify-center items-center gap-y-5  ' >
      <span onClick={() => setIsOpen(!isOpen)} className='text-5xl font-bold hover:cursor-pointer text-white absolute right-6 top-4' ><IoClose /></span>
      <Link className='flex gap-x-2 font-semibold justify-start items-center text-2xl text-[#ffffffcb] hover:text-white'  to={'/'} > <FaHome /> Home</Link>
      <Link className='flex gap-x-2 justify-start font-semibold items-center text-2xl text-[#BDBEC0] hover:text-white'  to={'/'} > <IoChatbubblesSharp /> Chat</Link>
      <Link className='flex gap-x-2 justify-start font-semibold items-center text-2xl text-[#BDBEC0] hover:text-white'  to={'/'} > <CgProfile /> profile</Link>
      <Link className='flex gap-x-2 justify-start font-semibold items-center text-2xl text-[#BDBEC0] hover:text-white'  to={'/'} > <FaEdit /> Edit</Link>
      <Link className='flex gap-x-2 justify-start font-semibold items-center text-2xl text-red-400 hover:text-red-300'  to={'/'} > <HiOutlineLogout /> Logout</Link>
      </div>

     : null}
      
      <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-left {
                    from { opacity: 0; transform: translateX(-100%); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
                .animate-fade-in-left { animation: fade-in-left 0.3s ease-out forwards; }
            `}</style>
    </div>
  )
}

export default Header
