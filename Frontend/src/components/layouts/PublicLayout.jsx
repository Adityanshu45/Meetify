import React, { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import PublicNavbar from "../navbar/PublicNavbar.jsx";
import AuthContext from "../../context/AuthContext.js";
import Footer from "../common/Footer";

function PublicLayout() {
  const { accessToken } = useContext(AuthContext);

  // if user logged in -----> go /Home
  if (accessToken) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <PublicNavbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
