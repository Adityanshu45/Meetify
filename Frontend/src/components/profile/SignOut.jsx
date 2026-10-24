import style from "./SignOut.module.css";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { toast } from "react-toastify";
import api from "../../api/axios";

function SignOut() {
  const { setUser } = useContext(AuthContext);

  const handleLogout = async (e) => {
    try {
      e.preventDefault();
      const response = await api.post("/auth/logout");
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "somthing went wrong");
    } finally {
      setTimeout(() => {
        window.location.href = "/";
        setUser(null);
      }, 2000);
    }
  };

  return (
    <div className={style.signOut}>
      <a href="/" onClick={handleLogout}>
        Sign Out
      </a>
    </div>
  );
}

export default SignOut;
