import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { api } from '../Api';
import { GlobalContext } from '../context/Context';

const Login = () => {
 const {state , dispatch} = useContext(GlobalContext)
 console.log(state)
  const [LoginData , setLoginData] = useState({
    email: "",
    password: "",
  })
  const navigate = useNavigate()
  let handleChange = (e) => {
    let {name , value} = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value
    })) 
  }
  
  const loginForm =  async (e) => {
    e.preventDefault();
    let {email , password} = LoginData;
    if(!email || !password){
      toast.warning("All field requried");
      return
    }
    try {
      let res = await api.post('/api/v1/login',{
        email,
        password
      })
      dispatch({type: "USER_LOGIN", user: res.data.user})
      console.log(res.data)
      setLoginData({email: "", password: ""})
      toast.success(`Welcome Back`)
      setTimeout(() => {
        navigate("/alluser")
      }, 1500);
    } catch (error) {
      toast.error(error.response.data.message)
      
    }

  }

  let inputStyle = 'py-3 px-4 rounded-lg outline-none  focus:ring-2 ring-[#22C55E]  border-[0.5px] bg-[#374151] border-[#dadada6b] w-full'

  return (
   <>
    <div className='py-20 bg-black h-screen flex justify-center items-center' >
         <Toaster richColors position='top-center' closeButton />
        <form onSubmit={loginForm} >
          <div  className='rounded-xl bg-[#1F2937] w-[450px] flex justify-center px-10 gap-y-4 flex-col  h-[400px]'>
           <h1 className='font-bold text-3xl text-center text-[#4ADE80]'>Welcome Back!</h1>

           <label className='text-[17px] text-[#e0e0e0dc] flex flex-col gap-y-1'>
             Email
             <input 
             value={LoginData.email}
             onChange={handleChange}
             name='email'
             type="email" 
             className={inputStyle} placeholder='Email' />
           </label>
           <label className='text-[17px] text-[#e0e0e0dc] flex flex-col gap-y-1'>
             Password
             <input
              value={LoginData.password}
              onChange={handleChange}
              name='password'
              type="password" 
              className={inputStyle} placeholder='Password' />
           </label>
   
           <button className='w-full bg-[#16A34A] py-3 px-4 rounded-md text-xl font-semibold  text-white'>Login</button>
           <p className='text-center text-sm text-[#dadadabc]'>Don’t have an account yet?  <Link to={'/Signup'} className='hover:underline text-[#4ADE80] font-semibold' >Sign up </Link></p>
         </div>
        </form>
       </div>
   </>
  )
}

export default Login
