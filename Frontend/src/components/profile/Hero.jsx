import style from "./Hero.module.css";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

function Hero() {
  const { user } = useContext(AuthContext);

  return (
    <div className={style.profileHero}>
      <div className={style.profileBgColor}></div>
      <div className={style.profileLogoAndEdit}>
        <div className={style.logo}>
          {user?.fullName.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
      <div className={style.profileData}>
        <div className={style.about}>
          <h1>Aditya chaudhary</h1>
        </div>
        <div className={style.contectDetails}>
          <div className={style.email}>
            <i className="fas fa-envelope"></i>
            <div className={style.emailId}>
              <h1>Email</h1>
              <p>{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
