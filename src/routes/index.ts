import { Effect, Schema, Layer } from "effect"
import { config } from "../config/config"; // Import Effect-based config
import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpMiddleware
} from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { createServer } from "node:http"
import mongoose from "mongoose"

import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

import { TodoSchema } from "../models/Todo"
import { UserSchema } from "../models/User"

const UserModel = mongoose.model("User", UserSchema)
const TodoModel = mongoose.model("Todo", TodoSchema)

// Helper to verify JWT and extract user id
const verifyToken = (token: string) =>
  Effect.tryPromise(() =>
    new Promise<{ id: string }>((resolve, reject) => {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string }
        if (!decoded.id) return reject(new Error("Invalid token"))
        resolve(decoded)
      } catch (error) {
        reject(error)
      }
    })
  )

// Helper to extract the Bearer token from the Authorization header
const extractToken = (headers?: { authorization?: string }) => { // Changed to lowercase
    if (!headers?.authorization || !headers.authorization.startsWith("Bearer ")) {
      console.error("Missing or malformed authorization header:", headers);
      throw new Error("Missing authorization header");
    }
    return headers.authorization.replace("Bearer ", "").trim();
  };
  
  

// --------------------
// Define Users API Group
// --------------------
const registerUserEndpoint = HttpApiEndpoint.post("registerUser", "/users")
  .setPayload(Schema.Struct({ email: Schema.String, password: Schema.String }))
  .addSuccess(Schema.String)

const loginUserEndpoint = HttpApiEndpoint.post("loginUser", "/users/login")
  .setPayload(Schema.Struct({ email: Schema.String, password: Schema.String }))
  .addSuccess(Schema.String)

const usersGroup = HttpApiGroup.make("users")
  .add(registerUserEndpoint)
  .add(loginUserEndpoint)

// --------------------
// Define Todos API Group (secured endpoints)
// --------------------
const authHeaderSchema = Schema.Struct({ 
    authorization: Schema.optional(Schema.String) // Changed to lowercase
  })
  


const getTodosEndpoint = HttpApiEndpoint.get("getTodos", "/todos")
  .setHeaders(authHeaderSchema)
  .addSuccess(
    Schema.Array(
      Schema.Struct({
        id: Schema.String,
        text: Schema.String,
        completed: Schema.Boolean
      })
    )
  )

const addTodoEndpoint = HttpApiEndpoint.post("addTodo", "/todos")
  .setHeaders(authHeaderSchema)
  .setPayload(Schema.Struct({ text: Schema.String }))
  .addSuccess(
    Schema.Struct({
      id: Schema.String,
      text: Schema.String,
      completed: Schema.Boolean
    })
  )

const updateTodoEndpoint = HttpApiEndpoint.patch("updateTodo", "/todos/:id")
  .setHeaders(authHeaderSchema)
  .setPath(Schema.Struct({ id: Schema.String }))
  .setPayload(
    Schema.Struct({
      text: Schema.optional(Schema.String),
      completed: Schema.optional(Schema.Boolean)
    })
  )
  .addSuccess(Schema.String)

const deleteTodoEndpoint = HttpApiEndpoint.del("deleteTodo", "/todos/:id")
  .setHeaders(authHeaderSchema)
  .setPath(Schema.Struct({ id: Schema.String }))
  .addSuccess(Schema.String)

const todosGroup = HttpApiGroup.make("todos")
  .add(getTodosEndpoint)
  .add(addTodoEndpoint)
  .add(updateTodoEndpoint)
  .add(deleteTodoEndpoint)

// --------------------
// Create Top-Level API
// --------------------
const api = HttpApi.make("TodoApi")
  .add(usersGroup)
  .add(todosGroup)

// --------------------
// Implement API Handlers
// --------------------

// Users group handlers
export const usersGroupLive = HttpApiBuilder.group(api, "users", (handlers) => {
    return handlers
      .handle("registerUser", ({ payload }) =>
        Effect.promise(async () => {
          const hashedPassword = await bcrypt.hash(payload.password, 10)
          const newUser = await UserModel.create({ email: payload.email, password: hashedPassword })
          return `User registered successfully ${newUser.id.toString()}`
        }))


      .handle("loginUser", ({ payload }) =>
        Effect.promise(async () => {
          const user = await UserModel.findOne({ email: payload.email })
          if (!user || !(await bcrypt.compare(payload.password, user.password))) {
            throw new Error("Invalid credentials")
          }
          const token = jwt.sign({ id: user._id.toString() }, config.JWT_SECRET, {
            expiresIn: "30d",
          })
          return token
        }))
  })

// Todos group handlers (secured via the Authorization header)
export const todosGroupLive = HttpApiBuilder.group(api, "todos", (handlers) => {
    return handlers

    .handle("getTodos", ({ headers }) =>
      Effect.promise(async () => {
        try {
          if (!config.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
          const token = extractToken(headers);
          const decoded = await Effect.runPromise(verifyToken(token));
          const todos = await TodoModel.find({ _creator: decoded.id });
          return todos.map(todo => ({
            id: todo._id.toString(),
            text: todo.text,
            completed: todo.completed,
          }));
        } catch (error) {
          console.error("Error in getTodos:", error);
          throw new Error("Unauthorized or Internal Server Error");
        }
      })
    )
    .handle("addTodo", ({ payload, headers }) =>
        Effect.promise(async () => {
          try {
            console.log("Received headers:", headers);
      
            if (!config.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
      
            const token = extractToken(headers);
      
            // ✅ Instead of using Effect.runPromise, verify token directly
            const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string };
      
            if (!decoded.id) throw new Error("Invalid token");
      
            const todo = await TodoModel.create({
              text: payload.text,
              completed: false,
              _creator: decoded.id,
            });
      
            return {
              id: todo._id.toString(),
              text: todo.text,
              completed: todo.completed,
            };
          } catch (error) {
            console.error("Error in addTodo:", error);
            throw new Error("Unauthorized or Internal Server Error");
          }
        })
    )
    .handle("updateTodo", ({ path, payload, headers }) =>
        Effect.promise(async () => {
          try {
            if (!config.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
            const token = extractToken(headers);
            const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string };
            const updateData: Partial<{ text: string; completed: boolean }> = {};
            if (payload.text !== undefined) updateData.text = payload.text;
            if (payload.completed !== undefined) updateData.completed = payload.completed;
            const updatedTodo = await TodoModel.findOneAndUpdate(
              { _id: path.id, _creator: decoded.id },
              updateData,
              { new: true }
            );
            if (!updatedTodo) throw new Error("Todo not found or unauthorized");
            return "Todo updated successfully";
          } catch (error) {
            console.error("Error in updateTodo:", error);
            throw new Error("Unauthorized or Internal Server Error");
          }
        })
    )
    .handle("deleteTodo", ({ path, headers }) =>
        Effect.promise(async () => {
          try {
            if (!config.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
            const token = extractToken(headers);
            const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string };
            const deletedTodo = await TodoModel.findOneAndDelete({
              _id: path.id,
              _creator: decoded.id,
            });
            if (!deletedTodo) throw new Error("Todo not found or unauthorized");
            return "Todo deleted successfully";
          } catch (error) {
            console.error("Error in deleteTodo:", error);
            throw new Error("Unauthorized or Internal Server Error");
          }
        })
    );

  });
  
// Combine group implementations into a top-level API implementation
export const apiLive = HttpApiBuilder.api(api)
  .pipe(Layer.provide(usersGroupLive))
  .pipe(Layer.provide(todosGroupLive))

// --------------------
// Set Up and Launch the Server
// --------------------
const serverLayer = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors({ allowedHeaders: ["Authorization"] })),
  Layer.provide(apiLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: Number(config.PORT) || 3000 }))
)

// Launch the server
Layer.launch(serverLayer).pipe(NodeRuntime.runMain({}))