import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../Auth/Login';
import Signup from '../Auth/Signup';
import Chatuser from '../pages/Chatuser';
import Header from '../pages/Header';
import Alluser from '../pages/Alluser';
import { GlobalContext } from '../context/Context';

const CustomRoutes = () => {

    const {state} = useContext(GlobalContext);
  
  return (
    <div>
      <Routes>
      <Route path='/' element={<Alluser/>} /> 
      {state?.isLogin === true && (
      <>
       <Route path='/alluser' element={<Alluser/>}/> 
       <Route path='/chat/:id' element={<Chatuser/>} /> 
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
