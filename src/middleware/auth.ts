import { Security } from "effect-http";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";
import {Effect} from "effect"


export const authSecurity = Security.bearer({ description: "JWT Authentication" }).pipe(
  Security.mapEffect(token =>
    Effect.promise(() => new Promise((resolve, reject) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.id) throw new Error("Invalid token");
        resolve(decoded);
      } catch (error) {
        reject(error);
      }
    }))
  )
);