import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import { GlobalContext } from '../context/Context';
import Header from './Header';
import {
  LuUser,
  LuMail,
  LuPhone,
  LuCompass,
  LuKey,
  LuPen
} from 'react-icons/lu';

const ViewProfile = () => {
  const state = useContext(GlobalContext).state; // wait, let's keep original context line or target content carefully


  return (
    <>
      <Header />
      <div className='pt-28 pb-20 bg-[#0b141a] min-h-screen text-[#e9edef] relative font-sans px-4 transition-all'>
        {/* Glow backdrop */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#00a884]/5 rounded-full blur-[80px] pointer-events-none z-0"></div>

        <div className='flex flex-col justify-center items-center gap-y-6 max-w-md mx-auto relative z-10 select-none animate-fade-in'>
          <h1 className='text-xl font-bold tracking-wider text-white uppercase font-display'>
            Account Profile
          </h1>

          <div className='px-6 py-8 flex justify-center items-center flex-col gap-y-4.5 rounded-2xl w-full bg-[#111b21] border border-[#222d34] shadow-2xl transition-all' >
            
            {/* Avatar */}
            <div className="relative mb-4">
              <img 
                className='border-2 border-zinc-700 h-24 w-24 rounded-full object-cover shadow-lg' 
                src={state.user.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} 
                alt="avatar" 
              />
            </div>

            {/* Info Items */}
            <div className='rounded-xl border border-[#222d34]/60 w-full py-3.5 px-4 flex justify-start items-center gap-x-4 bg-[#0b141a]/40 shadow-inner hover:border-zinc-700 transition'> 
              <LuUser className='text-lg text-[#00a884]'/>
              <div className='text-xs text-zinc-300' >
                <span className='text-[10px] text-zinc-450 font-bold uppercase tracking-wider block mb-0.5' >Full Name</span> 
                <span className="text-sm font-semibold text-white">{state?.user?.firstName} {state?.user?.lastName}</span>
              </div>
            </div>

            <div className='rounded-xl border border-[#222d34]/60 w-full py-3.5 px-4 flex justify-start items-center gap-x-4 bg-[#0b141a]/40 shadow-inner hover:border-zinc-700 transition'> 
              <LuMail className='text-lg text-[#00a884]'/>
              <div className='text-xs text-zinc-300' >
                <span className='text-[10px] text-zinc-450 font-bold uppercase tracking-wider block mb-0.5' >Email Address</span> 
                <span className="text-sm font-semibold text-white">{state?.user?.email}</span>
              </div>
            </div>

            <div className='rounded-xl border border-[#222d34]/60 w-full py-3.5 px-4 flex justify-start items-center gap-x-4 bg-[#0b141a]/40 shadow-inner hover:border-zinc-700 transition'> 
              <LuPhone className='text-base text-[#00a884]'/>
              <div className='text-xs text-zinc-300' >
                <span className='text-[10px] text-zinc-450 font-bold uppercase tracking-wider block mb-0.5' >Phone Number</span> 
                <span className="text-sm font-semibold text-white">{state?.user?.phoneNumber || 'No phone number set'}</span>
              </div>
            </div>

            <div className='rounded-xl border border-[#222d34]/60 w-full py-3.5 px-4 flex justify-start items-center gap-x-4 bg-[#0b141a]/40 shadow-inner hover:border-zinc-700 transition'> 
              <LuCompass className='text-lg text-[#00a884]'/>
              <div className="flex-1">
                <span className='text-[10px] text-zinc-450 font-bold uppercase tracking-wider block mb-0.5' >Bio</span> 
                <p className="text-sm font-semibold text-white mt-0.5 whitespace-pre-wrap">{state?.user?.bio || 'No bio set.'}</p>
              </div>
            </div>

            <div className='rounded-xl border border-[#222d34]/60 w-full py-3.5 px-4 flex justify-start items-center gap-x-4 bg-[#0b141a]/40 shadow-inner select-text hover:border-zinc-700 transition'> 
              <LuKey className='text-lg text-zinc-450'/>
              <div className='text-xs font-mono truncate flex-1' >
                <span className='text-[10px] text-zinc-450 font-bold uppercase tracking-wider block mb-0.5' >User Signature Hex</span> 
                <span className="text-[11px] text-zinc-400">{state?.user?.user_id}</span>
              </div>
            </div>

            <Link 
              to='/editprofile' 
              className='w-full py-3 px-4 text-[#111b21] font-bold text-xs uppercase tracking-wider bg-[#00a884] hover:bg-[#008f72] rounded-xl transition duration-200 flex justify-center items-center gap-x-2 mt-2 shadow hover:scale-105' 
            > 
              <LuPen className="text-sm" /> Edit Profile Details
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default ViewProfile
