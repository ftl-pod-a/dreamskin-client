import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage/HomePage';
import QuizPage from './components/QuizPage/QuizPage';
import NavBar from './components/NavBar/NavBar';
import SkinHub from './components/SkinHub/SkinHub';
// import CommentModal from './components/CommentModal/CommentModal';

import './App.css';

const App = () => {
  const [count, setCount] = useState(0)

  return (
    
    <div className='App'>
      {/* <CommentModal/> */}
      {/* <HomePage/> */}
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='/quiz' element={<QuizPage />}></Route>
          <Route path='/skinhub' element={<SkinHub />}></Route>
        </Routes>
        
      </BrowserRouter>
    </div>
  )
}

export default App
