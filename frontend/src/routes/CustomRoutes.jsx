import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../Auth/Login';
import Signup from '../Auth/Signup';
import Chatuser from '../pages/Chatuser';
import Header from '../pages/Header';
import Alluser from '../pages/Alluser';

const CustomRoutes = () => {


  
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>} /> 
        <Route path='/login' element={<Login/>} /> 
        <Route path='/signup' element={<Signup/>} /> 
        <Route path='/chat/:id' element={<Chatuser/>} /> 
        <Route path='/alluser' element={<Alluser/>}/> 
      </Routes>
    </div>
  )
}

export default CustomRoutes
