import { Link } from "react-router-dom";
import style from "./PublicNavbar.module.css";

function PublicNavbar() {
  return (
    <nav className={`navbar navbar-expand ${style.publicNavbar}`}>
      <Link to="/" className="navbar-brand">
        <div className={style.navbarLogo}>
          <i className={`fa-solid fa-video ${style.gradientText}`}></i>
          <h3 className={style.gradientText}>Meetify</h3>
        </div>
      </Link>

      <div className="navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link to={"/login"} className={style.login}>
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link to={"/register"} className={style.signUp}>
              Sign Up
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default PublicNavbar;
