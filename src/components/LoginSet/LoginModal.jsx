import React from 'react';
import LoginButton from '../LoginButton/LoginButton';
import {Link} from 'react-router-dom';


const LoginModal = ({showModal, closeModal}) => {
    return (
    <div className={`modal ${showModal ? 'show' : ''}`}>
      <h2>Log In</h2>
      <LoginButton />
      <p>Or</p>
      <Link to="/create-account">Create Account with Google</Link>
      <button onClick={closeModal}>Close</button>
    </div>
    );
}
export default LoginModal;



