import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Toaster, toast } from 'sonner';
import { api } from '../Api';
import axios from 'axios';
const Signup = () => {

  const [signupForm , setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading , setLoading] = useState(false);
  const navigate = useNavigate()
  let handleChange = (e) => {
    let {name , value} = e.target;
    setSignupForm((prev) => ({
      ...prev,
      [name]: value
    })) 
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    let {firstName, lastName , email, password} = signupForm;
    if(!firstName || !lastName || !email || !password){
      toast.warning("All filed reqried")
      return
    }
    try {
      setLoading(true)
      let res = await api.post("/api/v1/signup",{
        firstName,
        lastName,
        email,
        password
      })
      toast.success(res.data.message);
      setSignupForm({firstName: "", lastName: "", email: "", password: ""})
      setTimeout(() => {navigate('/login') } , 1000)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      toast.error(error.response.data.message);
      
    }


  }

    let inputStyle = 'py-3 px-4 rounded-lg outline-none  focus:ring-2 ring-[#22C55E]  border-[0.5px] bg-[#374151] border-[#dadada6b] w-full'

  return (
    <div className='py-20 bg-black h-screen flex justify-center items-center' >
      <Toaster richColors position='top-center' closeButton />
     <form onSubmit={handleSignup} >
       <div  className='rounded-xl bg-[#1F2937] w-[450px] flex justify-center px-10 gap-y-4 flex-col  h-[550px]'>
        <h1 className='font-bold text-3xl text-center text-[#4ADE80]'>Join ChatApp!</h1>
        <label className='text-[17px] text-[#e0e0e0dc] flex flex-col gap-y-1'>
          Fisrt Name
          <input 
          name='firstName'
          value={signupForm.firstName}
          onChange={handleChange}
          type="text" 
          className={inputStyle}
           placeholder='First Name' />
        </label>
        <label  className='text-[17px] text-[#e0e0e0dc] flex flex-col gap-y-1'>
          Last Name
          <input 
           name='lastName'
          value={signupForm.lastName}
          onChange={handleChange}
          type="text"
          className={inputStyle} placeholder='Last Name' />
        </label>
        <label className='text-[17px] text-[#e0e0e0dc] flex flex-col gap-y-1'>
          Email
          <input 
          name='email'
          value={signupForm.email}
          onChange={handleChange}
          type="email" 
          className={inputStyle} placeholder='Email' />
        </label>
        <label className='text-[17px] text-[#e0e0e0dc] flex flex-col gap-y-1'>
          Password
          <input
          name='password'
          value={signupForm.password}
          onChange={handleChange}
           type="password" 
           className={inputStyle} placeholder='Password' />
        </label>

        <button className='w-full bg-[#16A34A] py-3 px-4 rounded-md text-xl font-semibold  text-white'>{loading ? <div className='h-8 w-8 text-white border-4 border-t-transparent  border-[#fff] animate-spin rounded-full' ></div> : "Signup" }</button>
        <p className='text-center text-sm text-[#dadadabc]'>Already have an account? <Link to={'/login'} className='hover:underline text-[#4ADE80] font-semibold' >Login here</Link></p>
      </div>
     </form>
    </div>
  )
}

export default Signup
