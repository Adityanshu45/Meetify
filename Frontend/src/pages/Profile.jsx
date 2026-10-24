import React from "react";
import Hero from "../components/profile/Hero.jsx";
import Stats from "../components/profile/Stats.jsx";
import Back from "../components/profile/Back.jsx";
import SignOut from "../components/profile/SignOut.jsx";

function Profile() {
  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#060611",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Hero />
      <Stats />
      <Back />
      <SignOut />
    </div>
  );
}

export default Profile;
