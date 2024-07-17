import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage/HomePage';
import QuizPage from './components/QuizPage/QuizPage';
import NavBar from './components/NavBar/NavBar';
import './App.css';

const App = () => {
  const [count, setCount] = useState(0)

  return (
    
    <div className='App'>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='/quiz' element={<QuizPage />}></Route>
        </Routes>
        
      </BrowserRouter>
    </div>
  )
}

export default App
