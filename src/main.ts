import { NodeRuntime } from "@effect/platform-node";
import { NodeServer } from "effect-http-node";
import { PORT } from "./config/config";
import { connectDB } from "./db/db";
import { router } from "./routes";

async function startServer() {
  try {
    await connectDB(); // Ensure MongoDB is connected first
    console.log("✅ MongoDB connected. Starting server...");

    router.pipe(NodeServer.listen({ port: Number(PORT) }), NodeRuntime.runMain);
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
