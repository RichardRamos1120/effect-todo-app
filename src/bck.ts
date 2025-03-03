
import { Effect, Schema } from "effect";
import { Api, RouterBuilder, Security } from "effect-http";
import { NodeRuntime } from "@effect/platform-node";
import { NodeServer } from "effect-http-node";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config();
const { PORT, MONGODB_URI, JWT_SECRET } = process.env;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define Mongoose schemas and models
const UserSchema = new mongoose.Schema({
  email: String,
  password: String
});
const TodoSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
  _creator: mongoose.Schema.Types.ObjectId
});
const User = mongoose.model("User", UserSchema);
const Todo = mongoose.model("Todo", TodoSchema);

// Define authentication security
const authSecurity = Security.bearer({ description: "JWT Authentication" }).pipe(
  Security.mapEffect(token => 
    Effect.promise(() => new Promise((resolve, reject) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        if (!decoded.id) throw new Error("Invalid token");
        resolve(decoded); // Return the full decoded token so we can access id
      } catch (error) {
        reject(error);
      }
    }))
  )
);


// Define API
const controller = Api.make({ title: "TODO API" }).pipe(
  Api.addEndpoint(
    Api.post("registerUser", "/users").pipe(
      Api.setRequestBody(Schema.Struct({ email: Schema.String, password: Schema.String })),
      Api.setResponseBody(Schema.String)
    )
  ),
  Api.addEndpoint(
    Api.post("loginUser", "/users/login").pipe(
      Api.setRequestBody(Schema.Struct({ email: Schema.String, password: Schema.String })),
      Api.setResponseBody(Schema.String)
    )
  ),
  Api.addEndpoint(
    Api.get("getTodos", "/todos").pipe(
      Api.setSecurity(authSecurity),
      Api.setResponseBody(Schema.Array(Schema.Struct({ text: Schema.String, completed: Schema.Boolean, id: Schema.String })))
    )
  ),
  Api.addEndpoint(
    Api.post("addTodo", "/todos").pipe(
      Api.setSecurity(authSecurity),
      Api.setRequestBody(Schema.Struct({ text: Schema.String })),
      Api.setResponseBody(Schema.Struct({ text: Schema.String, completed: Schema.Boolean, id: Schema.String }))
    )
  ),
  Api.addEndpoint(
    Api.patch("updateTodo", "/todos/:id").pipe(
      Api.setSecurity(authSecurity),
      Api.setRequestPath(Schema.Struct({ id: Schema.String })),
      Api.setRequestBody(Schema.Struct({ text: Schema.optional(Schema.String), completed: Schema.optional(Schema.Boolean) })),
      Api.setResponseBody(Schema.String)
    )
  ),
  Api.addEndpoint(
    Api.delete("deleteTodo", "/todos/:id").pipe(
      Api.setSecurity(authSecurity),
      Api.setRequestPath(Schema.Struct({ id: Schema.String })),
      Api.setResponseBody(Schema.String)
    )
  )
);

// Implement API Handlers
const app = RouterBuilder.make(controller).pipe(
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
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
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

// Start server
app.pipe(NodeServer.listen({ port: Number(PORT) }), NodeRuntime.runMain);