import { Link } from "react-router-dom";
import style from "./PrivateNavbar.module.css";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext.js";
import { toast } from "react-toastify";
import api from "../../api/axios";

function PrivateNavbar() {
  const { user, setUser } = useContext(AuthContext);

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
    <nav className={`navbar navbar-expand ${style.privateNavbar}`}>
      <Link to="/" className="navbar-brand">
        <div className={style.navbarLogo}>
          <i className={`fa-solid fa-video ${style.gradientText}`}></i>
          <h3 className={style.gradientText}>Meetify</h3>
        </div>
      </Link>

      <div className={`nav-item dropdown ${style.profileDropdown}`}>
        <Link
          className="nav-link dropdown-toggle"
          to={"#"}
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <div className={style.profile}>
            <div className={style.profileLogo}>
              {user?.fullName.charAt(0).toUpperCase() || "U"}
            </div>
            <div className={style.profileData}>
              <div className={style.profileName}>{user?.fullName}</div>
              <div className={style.profileEmail}>{user?.email}</div>
            </div>
          </div>
        </Link>
        <ul className={`dropdown-menu dropdown-menu-end ${style.profileMenu}`}>
          <div className={style.profile}>
            <div className={style.profileLogo}>
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className={style.profileData}>
              <div className={style.profileName}>{user?.fullName}</div>
              <div className={style.profileEmail}>{user?.email}</div>
            </div>
          </div>
          <li>
            <Link
              className={`dropdown-item ${style.profileMenuItem}`}
              to={"/profile"}
            >
              <i className="fa-solid fa-user-tie"></i>
              My Profile
            </Link>
          </li>
          <li>
            <Link
              className={`dropdown-item ${style.profileMenuItem}`}
              to={"/home/upcomingmeetings"}
            >
              <i className="fa-regular fa-calendar"></i>
              Upcoming Meetings
            </Link>
          </li>

          <li>
            <Link
              className={`dropdown-item ${style.profileMenuItem}`}
              to={"/home/pastmeetings"}
            >
              <i className="fa-regular fa-message"></i>
              Past Meetings
            </Link>
          </li>

          <hr />

          <li>
            <a
              className={`dropdown-item ${style.signOut}`}
              href="/"
              onClick={handleLogout}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              Sign Out
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default PrivateNavbar;
