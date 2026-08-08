import Fastify from "fastify";
import { registerErrorHandler } from "./plugins/errorHandler.js";
import { registerAuthRoutes } from "./domains/auth/routes.js";
import { registerUserRoutes } from "./domains/users/routes.js";
import { registerRestaurantRoutes } from "./domains/restaurants/routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  registerErrorHandler(app);

  app.get("/health", async () => ({ status: "ok", service: "identity-service" }));

  app.register(registerAuthRoutes);
  app.register(registerUserRoutes);
  app.register(registerRestaurantRoutes);

  return app;
}
