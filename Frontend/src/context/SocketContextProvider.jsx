import React, { useState, useEffect } from "react";
import SocketContext from "./SocketContext.js";
import { io } from "socket.io-client";
const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

function SocketContextProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(VITE_SOCKET_URL, {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      //remove console when production
      console.log(
        "Socket Global Context se connect ho gaya! ID:",
        newSocket.id,
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export default SocketContextProvider;
