import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../Api';
import { toast, Toaster } from 'react-hot-toast';
import { GlobalContext } from '../context/Context';
import {
  LuHouse,
  LuMessageSquare,
  LuUser,
  LuLogOut,
  LuMenu,
  LuX
} from 'react-icons/lu';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [IsOpenProfile, setIsOpenProfile] = useState(false);
  const { state, dispatch } = useContext(GlobalContext);

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/logout');
      dispatch({ type: "USER_LOGOUT", user: {} })
      toast.success("Logged out successfully")
      setIsOpenProfile(false)
    } catch (error) {
      console.log("logout error", error)
      toast.error("Logout failed")
    }
  }

  return (
    <div className="z-50 relative font-sans">
      <Toaster position='top-center' />
      <header className='bg-[#0b141a] border-b border-[#222d34] fixed h-[70px] w-full flex justify-between md:px-16 px-8 items-center gap-x-5 z-50 transition-all'>
        <h1 className='text-lg font-bold tracking-wider text-white font-display uppercase flex items-center gap-2 select-none'> 
          <img 
            src="https://static.whatsapp.net/rsrc.php/v3/y6/r/R457WSN2Z2k.png" 
            className="w-6 h-6 object-contain" 
            alt="logo" 
          />
          <Link to="/" className="hover:text-[#00a884] transition">WhatsApp</Link>
        </h1>

        <div className='md:flex hidden justify-center items-center gap-x-6 select-none'>
          <Link className='flex gap-x-1.5 justify-center items-center text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors' to={'/'}> 
            <LuHouse className="text-sm" /> Home
          </Link>
          {state.isLogin === true && (
            <Link className='flex gap-x-1.5 justify-center items-center text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors' to={'/chat'}> 
              <LuMessageSquare className="text-sm" /> Chat Console
            </Link>
          )}
        </div>

        <div className='flex justify-center items-center gap-x-4'>
          {state.isLogin === true ? (
            <img 
              onClick={() => setIsOpenProfile(!IsOpenProfile)} 
              src={state.user.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} 
              className='border border-[#222d34] hover:border-[#00a884] cursor-pointer h-9 w-9 rounded-full object-cover transition shadow' 
              alt="avatar" 
            />
          ) : (
            <Link to={'/login'} className='py-2 px-5 rounded-xl bg-[#00a884] hover:bg-[#008f72] text-[#111b21] font-bold text-xs uppercase tracking-wider transition shadow hover:scale-105'> 
              Sign In
            </Link> 
          )}
          <button className='md:hidden text-2xl font-bold text-zinc-450 hover:text-white transition-colors p-1' onClick={() => setIsOpen(!isOpen)}>
            <LuMenu />
          </button>
        </div>
      </header>

      {/* User Profile Dropdown Menu */}
      {IsOpenProfile && (
        <div className='flex justify-between py-5 items-center flex-col text-white bg-[#111b21] border border-[#222d34] w-[240px] fixed right-8 md:right-16 top-[78px] rounded-2xl z-50 shadow-2xl animate-fade-in-down'>
          <div className='border-b pb-4 border-[#222d34]/60 w-full flex flex-col justify-center items-center px-4 select-none'>
            <img
              src={state.user.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"}
              className='border border-primary h-14 w-14 rounded-full object-cover mb-2.5 shadow'
              alt="avatar"
            />
            <h1 className='text-sm font-semibold text-white text-center truncate w-full'>
              {state?.user?.firstName} {state?.user?.lastName}
            </h1>
            <p className='text-xs text-zinc-400 truncate w-full text-center font-mono mt-0.5'>{state.user.email}</p>
          </div>
          
          <div className='flex justify-start px-2 py-2 items-start w-full flex-col gap-y-1 mt-1.5'>
            <Link onClick={() => setIsOpenProfile(false)} to="/chat" className='text-xs text-zinc-300 hover:text-white flex gap-x-3 items-center w-full px-3 py-2.5 rounded-xl hover:bg-zinc-800/40 transition'>
              <LuUser className='text-sm text-zinc-400' /> View Profile Details
            </Link>
            
            <button onClick={handleLogout} className='w-full text-start text-xs text-red-400 hover:text-red-300 flex gap-x-3 items-center px-3 py-2.5 rounded-xl hover:bg-red-500/5 transition border-t border-[#222d34]/30 mt-1 pt-2.5'>
              <LuLogOut className='text-sm' /> Log out
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isOpen && (     
        <div className='md:hidden bg-[#0b141a] h-screen fixed inset-0 flex flex-col justify-center items-center gap-y-6 z-50 transition-all' >
          <button onClick={() => setIsOpen(!isOpen)} className='text-3xl font-bold text-zinc-450 hover:text-white absolute right-8 top-6 transition' >
            <LuX />
          </button>
          
          <Link onClick={() => setIsOpen(false)} className='flex gap-x-3 font-semibold items-center text-xl text-zinc-300 hover:text-white transition' to={'/'}> 
            Home
          </Link>
          {state.isLogin === true ? (
            <>
              <Link onClick={() => setIsOpen(false)} className='flex gap-x-3 font-semibold items-center text-xl text-zinc-300 hover:text-white transition' to={'/chat'}> 
                Chat Console
              </Link>
              <button onClick={() => { setIsOpen(false); handleLogout(); }} className='flex gap-x-3 font-semibold items-center text-xl text-red-400 hover:text-red-300 transition'> 
                Logout
              </button>
            </>
          ) : (
            <Link onClick={() => setIsOpen(false)} to={'/login'} className='py-2.5 px-7 rounded-xl bg-[#00a884] hover:bg-[#008f72] text-[#111b21] font-bold text-sm transition shadow'> 
              Sign In
            </Link> 
          )}
        </div>
      )}
    </div>
  )
}

export default Header
