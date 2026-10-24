import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import AuthContextProvider from "./context/AuthContextProvider.jsx";
import SocketContextProvider from "./context/SocketContextProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketContextProvider>
      <AuthContextProvider>
        <App />
        <ToastContainer autoClose={3000} theme="colored" />
      </AuthContextProvider>
    </SocketContextProvider>
  </StrictMode>,
);
