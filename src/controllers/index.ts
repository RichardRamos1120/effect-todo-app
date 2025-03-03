import { Schema } from "effect";
import { Api } from "effect-http";
import {authSecurity} from "../middleware/auth"


export const controller = Api.make({ title: "TODO API" }).pipe(
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