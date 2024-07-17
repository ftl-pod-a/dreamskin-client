import { useState } from 'react';;
import './App.css';
import NavBar from './components/NavBar/NavBar';
import HomePage from './components/HomePage/HomePage';

const App = () => {
  const [count, setCount] = useState(0)

  return (
    
    <div className='App'>
      <NavBar/>
      <HomePage/>
    </div>
  )
}

export default App
