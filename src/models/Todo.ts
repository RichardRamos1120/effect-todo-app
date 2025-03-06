import mongoose from "mongoose";

export const TodoSchema = new mongoose.Schema({
    text: String,
    completed: Boolean,
    _creator: mongoose.Schema.Types.ObjectId
  });
