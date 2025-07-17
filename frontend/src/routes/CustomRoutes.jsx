import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../Auth/Login';
import Signup from '../Auth/Signup';
import Chatuser from '../pages/Chatuser';
import Header from '../pages/Header';
import Alluser from '../pages/Alluser';
import { GlobalContext } from '../context/Context';
import ViewProfile from '../pages/ViewProfile';
import EditProfile from '../pages/EditProfile';

const CustomRoutes = () => {

    const {state} = useContext(GlobalContext);
  
  return (
    <div>
       <Header/>
      <Routes> 
      <Route path='/' element={<Home/>} /> 
      {state?.isLogin === true && (
      <>
       <Route path='/' element={<Home/>}/> 
       <Route path='/alluser' element={<Alluser/>}/> 
       <Route path='/chat/:id' element={<Chatuser/>} /> 
       <Route path='/viewprofile' element={<ViewProfile/>} /> 
       <Route path='/editprofile' element={<EditProfile/>} /> 
       <Route path='*' element={<Navigate to={"/"}/>} /> 
      </>
      )} 

      {state.isLogin == false &&  (
      <>
      <Route path='/login' element={<Login/>} /> 
      <Route path='/signup' element={<Signup/>} /> 
      <Route path='*' element={<Navigate to={"/login"}/>} /> 
      </>)} 
       </Routes>
    </div>
  )
}

export default CustomRoutes
