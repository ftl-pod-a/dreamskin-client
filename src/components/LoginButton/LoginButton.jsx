import React from 'react';
import { GoogleLogin } from 'react-google-login';

const LoginButton = ({ loginCallback}) => {

    const responseGoogle = (response) => {
        console.log(response);
        if(response.accessToken){
            loginCallback(response.accessToken);
        }
    };

    const clientId = "your-google-client-id.apps.googleusercontent.com";
    const buttonText = "Login";

    return (
        <GoogleLogin
        clientId = {clientId}
        buttonText = {buttonText}
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        cookiePolicy={'single_host_origin'}
        
        />
    )
}

export default LoginButton;


