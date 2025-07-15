import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../Auth/Login';
import Signup from '../Auth/Signup';
import Chatuser from '../pages/Chatuser';
import Header from '../pages/Header';

const CustomRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>} /> 
        <Route path='/login' element={<Login/>} /> 
        <Route path='/signup' element={<Signup/>} /> 
        <Route path='/chat' element={<Chatuser/>} /> 
      </Routes>
    </div>
  )
}

export default CustomRoutes
