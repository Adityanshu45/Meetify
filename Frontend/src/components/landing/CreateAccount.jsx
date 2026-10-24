import "./CreateAccount.css";
import { Link } from "react-router-dom";
function CreateAccount() {
  return (
    <div className="create-account">
      <h1>Ready to Get Started?</h1>
      <p>
        Join thousands of teams already using VidMeet for their video meetings
      </p>
      <Link to={"/register"} className="signUp-btn">
        Create Free Account
      </Link>
    </div>
  );
}

export default CreateAccount;
