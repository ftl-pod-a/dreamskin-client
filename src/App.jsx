import React, {useState} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage/HomePage';
import QuizPage from './components/QuizPage/QuizPage';
import RoutinePage from './components/RoutinePage/RoutinePage';
import SkinHub from './components/SkinHub/SkinHub';
import LoginPage from './components/LoginPage/LoginPage';
import Register from './components/Register/Register';
import NavBar from './components/NavBar/NavBar';
import Articles from './components/Articles/Articles';
import Footer from './components/Footer/Footer';
import './App.css';

const App = () => {
  const [token, setToken] = useState("");

  return (
    
    <div className='App'>
      <BrowserRouter>
        {/* <NavBar setToken={setToken} token={token}/> */}
        <NavBar />
          <Routes>
            <Route path='/' element={<HomePage />}></Route>
            <Route path='/home' element={<HomePage />}></Route>
            <Route path='/quiz' element={<QuizPage />}></Route>
            <Route path='/skinhub' element={<SkinHub />}></Route>
            <Route path="/routine" element={<RoutinePage/>}></Route>
            <Route path="/login" element={<LoginPage/>}></Route>
            <Route path="/register" element={<Register/>}></Route>
            <Route path='/article' element={<Articles />}></Route>
          </Routes>
      </BrowserRouter>
      <Footer/>
      
    
    </div>
  )
}

export default App
