import "./Hero.css";
import { Link } from "react-router-dom";
import heroImg from "../../assets/hero-img.png";

function Hero() {
  return (
    <div className="hero">
      <div className="hero-details ">
        <h4>✨ Secure & Reliable Video Conferencing</h4>
        <h1>
          Connect Instantly with{" "}
          <span className="gradient-text">Video Meetings</span>
        </h1>
        <p>
          Host professional video conferences with crystal-clear quality. No
          downloads required, join from any device.
        </p>
        <div className="start-join-btn">
          <Link className="start-meeting" to={"/login"}>
            Start Meeting
          </Link>
          <Link className="join-meeting" to={"/login"}>
            Join Meeting
          </Link>
        </div>
      </div>
      <div className="hero-img">
        <img src={heroImg} alt="heroImage" />
      </div>
    </div>
  );
}

export default Hero;
