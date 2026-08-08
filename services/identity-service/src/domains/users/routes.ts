import type { FastifyInstance, FastifyRequest } from "fastify";
import { ApiError } from "@platform/contracts";
import { createUserInputSchema, assignRolesInputSchema } from "./schema.js";
import { requireCapability } from "../../plugins/requireCapability.js";
import { getRequestAuthContext } from "../../plugins/requestAuthContext.js";
import { createUser } from "./functions/createUser.js";
import { getUserById } from "./functions/getUserById.js";
import { listUsers } from "./functions/listUsers.js";
import { assignRoles } from "./functions/assignRoles.js";
import { deactivateUser } from "./functions/deactivateUser.js";

/** Every route here manages staff *within* the caller's own active restaurant — never across restaurants. */
function requireCallerRestaurant(request: FastifyRequest): string {
  const { restaurantId } = getRequestAuthContext(request);
  if (!restaurantId) throw ApiError.badRequest("Select a restaurant first");
  return restaurantId;
}

export async function registerUserRoutes(app: FastifyInstance) {
  app.get("/users", { preHandler: requireCapability("MANAGE_USERS") }, async (request) => {
    return listUsers(requireCallerRestaurant(request));
  });

  app.get<{ Params: { id: string } }>(
    "/users/:id",
    { preHandler: requireCapability("MANAGE_USERS") },
    async (request) => {
      return getUserById(request.params.id, { requireRestaurantId: requireCallerRestaurant(request) });
    }
  );

  app.post("/users", { preHandler: requireCapability("MANAGE_USERS") }, async (request, reply) => {
    const restaurantId = requireCallerRestaurant(request);
    const input = createUserInputSchema.parse(request.body);
    const user = await createUser(input, restaurantId);
    reply.code(201);
    return user;
  });

  app.patch<{ Params: { id: string } }>(
    "/users/:id/roles",
    { preHandler: requireCapability("MANAGE_USERS") },
    async (request) => {
      const restaurantId = requireCallerRestaurant(request);
      const input = assignRolesInputSchema.parse(request.body);
      return assignRoles(request.params.id, input, restaurantId);
    }
  );

  app.post<{ Params: { id: string } }>(
    "/users/:id/deactivate",
    { preHandler: requireCapability("MANAGE_USERS") },
    async (request) => {
      return deactivateUser(request.params.id, requireCallerRestaurant(request));
    }
  );
}
