import React from 'react';
// import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from './components/HomePage/HomePage';
import QuizPage from './components/QuizPage/QuizPage';
import RoutinePage from './components/RoutinePage/RoutinePage';
import SkinHub from './components/SkinHub/SkinHub';
import NavBar from './components/NavBar/NavBar';
import Articles from './components/Articles/Articles';
// import CallBack from './components/LoginSet/CallBack';
// import DashBoard from './components/LoginSet/DashBoard';
// import LoginModal from './components/LoginSet/LoginModal';
// import Callback from './components/LoginSet/CallBack';
// import Dashboard from './components/LoginSet/DashBoard';
// import PrivateRoute from './components/LoginSet/PrivateRoute';
// import Login from './components/LoginSet/Login';
import './App.css';

const App = () => {
  // const [count, setCount] = useState(0)

  return (
    
    <div className='App'>
      <NavBar/>
      {/* <BrowserRouter> */}
      <Router>
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='/home' element={<HomePage />}></Route>
          <Route path='/quiz' element={<QuizPage />}></Route>
          <Route path='/skinhub' element={<SkinHub />}></Route>
          <Route path='/routine' element={<RoutinePage />}></Route>
          <Route path='/article' element={<Articles />}></Route>
          


          {/* <Route path="/callback" element={<CallBack />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/login" element={<LoginModal/>} /> */}

{/* 
<Route path="/login" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Navigate to="/login" />} /> */}


        </Routes>
        </Router>
        

        
      {/* </BrowserRouter> */}
    </div>
  )
}

export default App
