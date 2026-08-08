import type { FastifyInstance, FastifyRequest } from "fastify";
import { ApiError } from "@platform/contracts";
import { createLocationInputSchema, createStorageAreaInputSchema } from "./schema.js";
import { requireCapability } from "../../plugins/requireCapability.js";
import { requireAuthenticated, getRequestAuthContext } from "../../plugins/requestAuthContext.js";
import { createLocation } from "./functions/createLocation.js";
import { listLocations } from "./functions/listLocations.js";
import { createStorageArea } from "./functions/createStorageArea.js";
import { listStorageAreas } from "./functions/listStorageAreas.js";

function requireCallerRestaurant(request: FastifyRequest): string {
  const { restaurantId } = getRequestAuthContext(request);
  if (!restaurantId) throw ApiError.badRequest("Select a restaurant first");
  return restaurantId;
}

export async function registerLocationRoutes(app: FastifyInstance) {
  app.get("/locations", { preHandler: requireAuthenticated }, async (request) => {
    return listLocations(requireCallerRestaurant(request));
  });

  app.post("/locations", { preHandler: requireCapability("MANAGE_ITEM_MASTER") }, async (request, reply) => {
    const restaurantId = requireCallerRestaurant(request);
    const input = createLocationInputSchema.parse(request.body);
    reply.code(201);
    return createLocation(input, restaurantId);
  });

  app.get<{ Params: { locationId: string } }>(
    "/locations/:locationId/storage-areas",
    { preHandler: requireAuthenticated },
    async (request) => listStorageAreas(request.params.locationId)
  );

  app.post(
    "/storage-areas",
    { preHandler: requireCapability("MANAGE_ITEM_MASTER") },
    async (request, reply) => {
      const restaurantId = requireCallerRestaurant(request);
      const input = createStorageAreaInputSchema.parse(request.body);
      reply.code(201);
      return createStorageArea(input, restaurantId);
    }
  );
}
