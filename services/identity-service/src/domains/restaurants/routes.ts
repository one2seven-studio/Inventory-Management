import type { FastifyInstance } from "fastify";
import { ApiError } from "@platform/contracts";
import { createRestaurantInputSchema } from "./schema.js";
import { requireCapability } from "../../plugins/requireCapability.js";
import { getRequestAuthContext } from "../../plugins/requestAuthContext.js";
import { createRestaurant } from "./functions/createRestaurant.js";

export async function registerRestaurantRoutes(app: FastifyInstance) {
  // Owner-only — creates a restaurant they own and immediately switches the
  // session into it. See PRD-adjacent onboarding: /restaurants/new in the web app.
  app.post("/restaurants", { preHandler: requireCapability("MANAGE_RESTAURANTS") }, async (request, reply) => {
    const { userId } = getRequestAuthContext(request);
    if (!userId) throw ApiError.unauthorized();
    const input = createRestaurantInputSchema.parse(request.body);
    reply.code(201);
    return createRestaurant(userId, input);
  });
}
