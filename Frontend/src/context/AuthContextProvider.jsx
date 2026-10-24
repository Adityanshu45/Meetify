import "./AuthContextProvider.css";
import React from "react";
import AuthContext from "./AuthContext.js";
import { useState } from "react";
import { useEffect } from "react";
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import api from "../api/axios.js";
import {
  setAccessToken as setAxiosAccessToken,
  attachTokenSync,
} from "../api/axios.js";
import axios from "axios";

function AuthContextProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //run on page refresh
  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        const response = await axios.post(
          `${VITE_API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        //update accessToken
        setAccessToken(response.data.accessToken);
      } catch (error) {
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };
    verifyRefreshToken();
  }, []);

  //update accessToken
  useEffect(() => {
    setAxiosAccessToken(accessToken);
  }, [accessToken]);

  //update new accessToken
  useEffect(() => {
    attachTokenSync((newToken) => {
      setAccessToken(newToken);
    });
  }, []);

  // get userData
  useEffect(() => {
    async function getUser() {
      setLoading(true);
      if (!accessToken) {
        setUser(null);
        return;
      }
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, [accessToken]);

  // Show loading while checking refresh token
  if (loading) {
    return (
      <div className="loadingContainer">
        <div className="loader"></div>

        <h3>Loading application...</h3>

        <p>Please wait a moment</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, user, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;
