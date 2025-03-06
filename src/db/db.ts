import mongoose from "mongoose";
import { Effect } from "effect";
import { config } from "../config/config";

// `connectDB` will only resolve MONGODB_URI when it is called
export const connectDB = async () => {
  const mongodbUri = await Effect.runPromise(config.MONGODB_URI);
  return mongoose.connect(mongodbUri);
};
