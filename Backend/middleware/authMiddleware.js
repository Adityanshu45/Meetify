import jwt from "jsonwebtoken";
import config from "../config/config.js";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: "AccessToken required",
    });
  }

  const [scheme, accessToken] = authHeader.split(" ");
  if (scheme !== "Bearer" || !accessToken) {
    return res.status(401).json({
      message: "Invalid authorization header",
    });
  }

  //verify accessToken
  try {
    const decode = jwt.verify(accessToken, config.JWT_ACCESS_SECRET);
    req.user = decode;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Access token expired",
    });
  }
}

export default authMiddleware;
