import type { FastifyInstance } from "fastify";
import {
  loginInputSchema,
  refreshInputSchema,
  selectRestaurantInputSchema,
  updateProfileInputSchema,
  changePasswordInputSchema,
} from "./schema.js";
import { getRequestAuthContext, requireAuthenticated } from "../../plugins/requestAuthContext.js";
import { ApiError } from "@platform/contracts";
import { login } from "./functions/login.js";
import { refreshAccessToken } from "./functions/refreshAccessToken.js";
import { logout } from "./functions/logout.js";
import { getCurrentUser } from "./functions/getCurrentUser.js";
import { updateProfile } from "./functions/updateProfile.js";
import { changePassword } from "./functions/changePassword.js";
import { selectRestaurant } from "../restaurants/functions/selectRestaurant.js";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (request) => {
    const input = loginInputSchema.parse(request.body);
    return login(input);
  });

  app.post("/auth/refresh", async (request) => {
    const input = refreshInputSchema.parse(request.body);
    return refreshAccessToken(input);
  });

  app.post("/auth/logout", async (request, reply) => {
    const input = refreshInputSchema.parse(request.body);
    await logout(input.refreshToken);
    reply.code(204);
    return null;
  });

  app.get("/auth/me", { preHandler: requireAuthenticated }, async (request) => {
    const { userId, restaurantId } = getRequestAuthContext(request);
    if (!userId) throw ApiError.unauthorized();
    return getCurrentUser(userId, restaurantId);
  });

  app.patch("/auth/me", { preHandler: requireAuthenticated }, async (request) => {
    const { userId, restaurantId } = getRequestAuthContext(request);
    if (!userId) throw ApiError.unauthorized();
    const input = updateProfileInputSchema.parse(request.body);
    return updateProfile(userId, input, restaurantId);
  });

  app.post("/auth/change-password", { preHandler: requireAuthenticated }, async (request, reply) => {
    const { userId } = getRequestAuthContext(request);
    if (!userId) throw ApiError.unauthorized();
    const input = changePasswordInputSchema.parse(request.body);
    await changePassword(userId, input);
    reply.code(204);
    return null;
  });

  // Switches the session's active restaurant for an Owner with 2+ (or a
  // fresh login left restaurant-less pending a pick) — issues a new token
  // pair scoped to it. See RestaurantSwitcher / the /restaurants/new and
  // /select-restaurant pages in the web app.
  app.post("/auth/select-restaurant", { preHandler: requireAuthenticated }, async (request) => {
    const { userId } = getRequestAuthContext(request);
    if (!userId) throw ApiError.unauthorized();
    const input = selectRestaurantInputSchema.parse(request.body);
    return selectRestaurant(userId, input);
  });
}
