import React from 'react';
// import { useState } from 'react';
import { BrowserRouter , Routes, Route, Navigate } from "react-router-dom";
import HomePage from './components/HomePage/HomePage';
import QuizPage from './components/QuizPage/QuizPage';
import SkinHub from './components/SkinHub/SkinHub';
import NavBar from './components/NavBar/NavBar';
import CallBack from './components/LoginSet/CallBack';
import DashBoard from './components/LoginSet/DashBoard';
import LoginModal from './components/LoginSet/LoginModal';

import './App.css';

const App = () => {
  // const [count, setCount] = useState(0)

  return (
    
    <div className='App'>
      <NavBar/>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='/home' element={<HomePage />}></Route>
          <Route path='/quiz' element={<QuizPage />}></Route>
          <Route path='/skinhub' element={<SkinHub />}></Route>
          <Route path="/callback" element={<CallBack />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/login" element={<LoginModal/>} />
        </Routes>
        
      </BrowserRouter>
    </div>
  )
}

export default App
