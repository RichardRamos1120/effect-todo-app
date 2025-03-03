import mongoose from "mongoose";
import { MONGODB_URI } from "../config/config";
export const connectDB = () => mongoose.connect(MONGODB_URI);