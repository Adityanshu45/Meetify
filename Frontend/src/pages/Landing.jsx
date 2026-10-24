import React from "react";
import PublicNavbar from "../components/navbar/PublicNavbar.jsx";
import Hero from "../components/landing/Hero.jsx";
import Features from "../components/landing/Features.jsx";
import CreateAccount from "../components/landing/CreateAccount.jsx";

function Landing() {
  return (
    <div>
      <Hero />
      <Features />
      <CreateAccount />
    </div>
  );
}

export default Landing;
