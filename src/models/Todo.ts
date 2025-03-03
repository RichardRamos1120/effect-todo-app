import mongoose from "mongoose";
const TodoSchema = new mongoose.Schema({ text: String, completed: Boolean, _creator: mongoose.Schema.Types.ObjectId });
export const Todo = mongoose.model("Todo", TodoSchema);