import "./Features.css";

function Features() {
  return (
    <div className="features">
      <div className="features-heading">
        <h1>Why Choose Meetify?</h1>
        <p>Everything you need for seamless video collaboration</p>
      </div>
      <div className="features-list">
        <div className="feature-content feature-1">
          <i className="fa-solid fa-video"></i>
          <h1>HD Video Quality</h1>
          <p>Crystal clear video and audio for professional meetings</p>
        </div>
        <div className="feature-content feature-2">
          <i className="fa-solid fa-user-group"></i>
          <h1>Unlimited Participants</h1>
          <p>Host meetings with up to 100+ participants</p>
        </div>
        <div className="feature-content feature-3">
          <i className="fa-solid fa-shield"></i>
          <h1>Secure & Private</h1>
          <p>End-to-end encryption for all your meetings</p>
        </div>
        <div className="feature-content feature-4">
          <i className="fa-solid fa-bolt"></i>
          <h1>Instant Join</h1>
          <p>No downloads, join meetings in seconds</p>
        </div>
      </div>
    </div>
  );
}

export default Features;
