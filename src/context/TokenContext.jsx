import React, { createContext, useState, useContext } from "react";

const TokenContext = createContext();


export const useToken = () => {
    return useContext(TokenContext);
  };


  export const TokenProvider = ({ children }) => {
    const [tokenContext, setTokenContext] = useState("");
    return (
        <TokenContext.Provider value={{ tokenContext, setTokenContext }}>
          {children}
        </TokenContext.Provider>
      );
    };