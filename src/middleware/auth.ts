import { Security } from "effect-http";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { Effect } from "effect";

export const authSecurity = Security.bearer({ description: "JWT Authentication" }).pipe(
  Security.mapEffect(token =>
    config.JWT_SECRET.pipe(
      Effect.flatMap(secret =>
        Effect.promise(() => new Promise((resolve, reject) => {
          try {
            const decoded = jwt.verify(token, secret);
            if (typeof decoded !== "object" || !("id" in decoded)) {
              throw new Error("Invalid token");
            }
            resolve(decoded);
          } catch (error) {
            reject(error);
          }
        }))
      )
    )
  )
);
