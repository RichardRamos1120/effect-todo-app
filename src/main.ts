import { Layer } from "effect"
import {
  HttpApiBuilder,
  HttpMiddleware
} from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { createServer } from "node:http"
import { apiLive } from "./routes"
import { config } from "./config/config"


// Set Up and Launch the Server
// --------------------
const serverLayer = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors({ allowedHeaders: ["Authorization"] })),
  Layer.provide(apiLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: Number(config.JWT_SECRET) || 3000 }))
)

// Launch the server
Layer.launch(serverLayer).pipe(NodeRuntime.runMain({}))