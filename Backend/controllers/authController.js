import userModel from "../models/userModel.js";
import { registerSchema, loginSchema } from "../validations/authValidation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

//Register user
async function registerUser(req, res) {
  let data = req.body;
  //validate schema
  const { error, value } = registerSchema.validate(data, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((e) => ({
        field: e.path[0],
        message: e.message.replace(/['"]/g, ""),
      })),
    });
  }
  //check email exist or not
  try {
    const userExist = await userModel.findOne({ email: value.email });
    if (userExist) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    //convert password into hashform
    const hashedPassword = await bcrypt.hash(value.password, 12);

    //save user into database
    const newUser = new userModel({
      fullName: value.fullName,
      email: value.email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful! Please log in to continue.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error in DB",
    });
  }
}

//Login User
async function loginUser(req, res) {
  let data = req.body;
  //validate schema
  const { error, value } = loginSchema.validate(data, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((e) => ({
        field: e.path[0],
        message: e.message.replace(/['"]/g, ""),
      })),
    });
  }

  try {
    //check user is exist
    const user = await userModel.findOne({ email: value.email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //compare password
    const match = await bcrypt.compare(value.password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email of password",
      });
    }

    // create refresh Token
    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_REFRESH_SECRET,
      {
        expiresIn: "15d",
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    //create access token
    const accessToken = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      },
    );

    res.status(200).json({
      success: true,
      message: "login successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error in DB",
    });
  }
}

//user profile
async function userProfile(req, res) {
  const userId = req.user.id;
  const userData = await userModel.findById(userId);
  res.send(userData);
}

//refreshAccessToken
async function refreshAccessToken(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token expired",
    });
  }

  try {
    const decode = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    //genrate accessToken
    const accessToken = jwt.sign(
      {
        id: decode.id,
      },
      config.JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      },
    );

    res.status(200).json({
      success: true,
      accessToken: accessToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expire refreshToken",
    });
  }
}

//logout
async function logout(req, res) {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "none",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error during logout",
    });
  }
}

export { registerUser, loginUser, userProfile, refreshAccessToken, logout };
