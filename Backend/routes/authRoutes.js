import { Router } from "express";
import {
  registerUser,
  loginUser,
  userProfile,
  refreshAccessToken,
  logout,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const authRoute = Router();

//  POST->  /api/auth/register
authRoute.post("/register", registerUser);
//POST-> /api/auth/login
authRoute.post("/login", loginUser);
//GET-> /api/auth/me
authRoute.get("/me", authMiddleware, userProfile);
//POST-> /api/auth/refresh
authRoute.post("/refresh", refreshAccessToken);

//POST-> /api/auth/refresh
authRoute.post("/logout", logout);

export default authRoute;
