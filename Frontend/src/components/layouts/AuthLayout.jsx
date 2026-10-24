import React, { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthContext from "../../context/AuthContext";

function AuthLayout() {
  const { accessToken } = useContext(AuthContext);

  if (accessToken) {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default AuthLayout;
