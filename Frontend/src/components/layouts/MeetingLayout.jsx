import { useContext, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext.js";
import { toast } from "react-toastify";

function MeetingLayout() {
  const { accessToken } = useContext(AuthContext);

  useEffect(() => {
    if (!accessToken) {
      toast.error("You need to login first to access this page.", {
        toastId: "auth-login-required",
      });
    }
  }, [accessToken]);
  acces;
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MeetingLayout;
