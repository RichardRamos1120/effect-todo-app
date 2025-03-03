import { Effect } from "effect";
import {  RouterBuilder } from "effect-http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { controller } from "../controllers/";
import { Todo } from "../models/Todo";
import { User } from "../models/User";
import { JWT_SECRET } from "../config/config";


export const router = RouterBuilder.make(controller).pipe(
  RouterBuilder.handle("registerUser", ({ body }) => 
    Effect.promise(async () => {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      await User.create({ email: body.email, password: hashedPassword });
      return "User registered successfully";
    })
  ),
  RouterBuilder.handle("loginUser", ({ body }) => 
    Effect.promise(async () => {
      const user = await User.findOne({ email: body.email });
      if (!user || !(await bcrypt.compare(body.password, user.password))) {
        throw new Error("Invalid credentials");
      }
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
      return token;
    })
  ),

  RouterBuilder.handle("getTodos", (_, security: { id: string }) => 
    Effect.promise(async () => {
      console.log("Security payload:", security); // Debugging
      return await Todo.find({ _creator: security.id });
    })
  ),

  RouterBuilder.handle("addTodo", ({ body }, security: { id: string }) =>
    Effect.promise(async () => {
      if (!security.id) throw new Error("Unauthorized");
      const todo = await Todo.create({ text: body.text, completed: false, _creator: security.id });
      return { id: todo._id.toString(), text: todo.text, completed: todo.completed };
    })
  ),

  RouterBuilder.handle("updateTodo", ({ path, body }, security: { id: string }) =>
    Effect.promise(async () => {
      if (!security.id) throw new Error("Unauthorized");
  
      const updateData: Partial<{ completed: boolean; text: string }> = {};
      if (body.completed !== undefined) updateData.completed = body.completed;
      if (body.text !== undefined) updateData.text = body.text; // Allow text update
  
      const updatedTodo = await Todo.findOneAndUpdate(
        { _id: path.id, _creator: security.id },
        updateData,
        { new: true }
      );
      
      if (!updatedTodo) throw new Error("Todo not found or unauthorized");
      return "Todo updated successfully";
    })
  ),

  RouterBuilder.handle("deleteTodo", ({ path }, security: {id: string}) =>
    Effect.promise(async () => {
      if (!security.id) throw new Error("Unauthorized");
      const deletedTodo = await Todo.findOneAndDelete({ _id: path.id, _creator: security.id });
      if (!deletedTodo) throw new Error("Todo not found or unauthorized");
      return "Todo deleted successfully";
    })
  ),

  RouterBuilder.build
);