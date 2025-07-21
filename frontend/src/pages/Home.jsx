import React, { useContext } from 'react'
import { Link} from 'react-router-dom'
import { FaHome } from "react-icons/fa";
import { FaComments, FaLock, FaRocket, FaMobileAlt, FaUsers } from 'react-icons/fa';
import { GlobalContext } from '../context/Context';
import Header from './Header';
const Home = () => {

  const {state} = useContext(GlobalContext);
  console.log(state)
  let arr = [
  {features: "Blazing Fast", icons: FaRocket , color: "#4ADE80", des: "Send and receive messages in real-time with lightning speed. No more waiting!" } ,
  {features: "Secure & Private", icons: FaLock , color: "#FACC15",   des: "Your conversations are encrypted and private. Chat with peace of mind." } ,
  {features: "Cross-Platform", icons: FaMobileAlt , color: "#60A5FA",  des: "Access your chats from any device - desktop, tablet, or mobile." } ,
  {features: "User-Friendly", icons: FaUsers , color: "#F87171",   des: "An intuitive interface designed for effortless communication." } ,
  ] 

  return (
    <>
    <Header />
    <div className='bg-black h-screen pt-24 font-poppins'>
     <div className='flex flex-col justify-center items-center h-full gap-y-3 px-3'>
      <span className='text-8xl  text-[#6366F1]' > <FaComments /></span>
     <h1 className='md:text-7xl sm:text-5xl text-4xl text-center font-black text-white'>Connect Instantly.</h1>
     <h1 className='md:text-7xl sm:text-5xl text-4xl text-center font-black text-white'>Chat Seamlessly.</h1>
     <p className='text-sm md:text-xl  text-[#bcbbbbcb] text-center px-4'>Experience real-time conversations with friends, family, and colleagues. <br /> Fast, secure, and intuitive chat at your fingertips.</p>
     <Link to={'/chat'} className='py-4 px-7 rounded-full  bg-[#4F46E5] text-white font-semibold text-xl' >Go to Chat </Link>
     </div>

     <div className='bg-[#1F2937] w-full flex justify-center items-center flex-col py-5' >
      <h1 className='text-4xl text-white font-extrabold'>Why Choose ChatApp?</h1>
      <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4 justify-between items-center px-10 py-10 gap-x-6'>
        {arr.map((item, index) => {
          const Icon = item.icons;
          return(
            <div key={index}className='rounded-lg text-white p-5 gap-y-3 text-center bg-[#111827] flex flex-col justify-center items-center h-[200px] w-full   md:w-[250px]' > 
          <span style={{color: item.color}} className='text-4xl'>
           <Icon />
          </span>
            <h1 className='text-2xl font-bold'>{item.features}</h1>
            <p className='text-[#bcbbbbcb] text-[14px]'>{item.des}</p>
            </div>
          )
        })}
      </div>
     </div>

     <div className='bg-black py-20 flex flex-col justify-center items-center gap-y-5 '>
         <h1 className='md:text-5xl sm:text-5xl text-4xl text-center font-black text-white'>Ready to Start Chatting?</h1>
          <p className='text-sm md:text-xl  text-[#bcbbbbcb] text-center px-4'>Join thousands of users who are enjoying seamless  communication.<br />  Sign up now and connect with your world!</p>
           <Link to={'/chat'} className='py-4 px-6 rounded-full  bg-[#4F46E5] text-white font-semibold text-xl' >Continue to Chat</Link>
     </div>
    </div>
    </>
  )
}

export default Home
