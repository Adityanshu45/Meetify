import styles from "./Hero.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../api/axios.js";
import { toast } from "react-toastify";

function Hero() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/auth/register", {
        fullName: data.fullname,
        email: data.email,
        password: data.password,
      });
      toast.success(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "somthing went wrong");
    }
  };

  return (
    <div className={styles.registerOverlay}>
      <div className={styles.registerCard}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => navigate("/")}
          aria-label="Close"
        >
          &times;
        </button>
        <h1 className={styles.heading}>Create Account</h1>
        <p className={styles.subtitle}>Join Meetify and start meeting today</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputGroup}>
            <label htmlFor="fullname">Full Name</label>
            <input
              placeholder="Alex Carey"
              {...register("fullname", {
                required: {
                  value: true,
                  message: "Please enter your full name",
                },
                pattern: {
                  value: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
                  message: "Use only letters, spaces, or hyphens",
                },
              })}
              type="text"
              id="fullname"
            />
            {errors.fullname && (
              <div className={styles.errorMsg}>{errors.fullname.message}</div>
            )}
          </div>

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

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              placeholder="Re-enter password"
              {...register("confirmPassword", {
                required: {
                  value: true,
                  message: "Please confirm your password",
                },
                validate: (value) => {
                  if (value === watch("password")) {
                    return true;
                  } else {
                    return "password don't match";
                  }
                },
              })}
              type="password"
              id="confirmPassword"
            />
            {errors.confirmPassword && (
              <div className={styles.errorMsg}>
                {errors.confirmPassword.message}
              </div>
            )}
          </div>

          <div className={styles.btn}>
            <input
              className={styles.createBtn}
              type="submit"
              value="Create Account"
            />
          </div>
        </form>
        <p className={styles.accountInfo}>
          Already have a account? <Link to={"/login"}>login</Link>
        </p>
      </div>
    </div>
  );
}

export default Hero;
