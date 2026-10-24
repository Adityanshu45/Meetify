import styles from "./Hero.module.css";
import { useForm } from "react-hook-form";
import api from "../../api/axios.js";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext.js";

function Hero() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { setAccessToken } = useContext(AuthContext);

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      setTimeout(() => {
        setAccessToken(response.data.accessToken);
      }, 2000);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "somthing went wrong");
    }
  };

  return (
    <div className={styles.loginOverlay}>
      <div className={styles.loginCard}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => navigate("/")}
          aria-label="Close"
        >
          &times;
        </button>
        <h1 className={styles.heading}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to continue to Meetify</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              placeholder="you@gmail.com"
              {...register("email", {
                required: {
                  value: true,
                  message: "Please enter email",
                },
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email",
                },
              })}
              type="text"
              id="email"
            />
            {errors.email && (
              <div className={styles.errorMsg}>{errors.email.message}</div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              placeholder="Minimum 6 characters"
              {...register("password", {
                required: {
                  value: true,
                  message: "please enter password",
                },
                minLength: {
                  value: 6,
                  message: "Use at least 6 characters",
                },
                maxLength: {
                  value: 12,
                  message: "Use Maximum 12 characters",
                },
              })}
              type="password"
              id="password"
            />
            {errors.password && (
              <div className={styles.errorMsg}>{errors.password.message}</div>
            )}
          </div>
          <div className={styles.btn}>
            <input className={styles.createBtn} type="submit" value="Sign In" />
          </div>
        </form>
        <p className={styles.accountInfo}>
          Don't have an account? <Link to={"/register"}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Hero;
