import { Config, Effect } from "effect";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const configEffect = Effect.all({
  PORT: Config.number("PORT").pipe(Config.withDefault(8080)),
  MONGODB_URI: Config.string("MONGODB_URI"),
  JWT_SECRET: Config.string("JWT_SECRET")
});

export const config = Effect.runSync(configEffect);
