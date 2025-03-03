import { Config } from "effect";
import dotenv from "dotenv";
dotenv.config();

export const config = {
  PORT: Config.number(process.env.PORT) || '',
  MONGODB_URI: Config.string(process.env.MONGODB_URI) || '',
  JWT_SECRET: Config.string(process.env.JWT_SECRET) || ''
};

export const { PORT, MONGODB_URI, JWT_SECRET } = process.env;
