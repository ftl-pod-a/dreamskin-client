import React from "react";

const Login = () => {

  const handleLogin = () => {
    // This needs to be a full page reload to navigate to the OAuth page
    window.location.href = "http://localhost:3000/auth/login";
  };

  return (
    <div>
      {/* <h2>Login</h2> */}
      <button onClick={handleLogin}>Log in </button>
    </div>
  );
};

export default Login;