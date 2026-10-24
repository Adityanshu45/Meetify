import dovenv from "dotenv";
dovenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGo URI is not define in enviroment variables");
}

if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error("JWT ACCESS SECRET is not define in enviroment variables");
}

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT REFRESH SECRET is not define in enviroment variables");
}

if (!process.env.NODE_ENV) {
  throw new Error("NODE ENV is not define in enviroment variables");
}

const config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  NODE_ENV: process.env.NODE_ENV,
};

export default config;
