import style from "./Back.module.css";
import { Link } from "react-router-dom";

function Back() {
  return (
    <div className={style.Back}>
      <Link to={"/home"}>Back</Link>
    </div>
  );
}

export default Back;
