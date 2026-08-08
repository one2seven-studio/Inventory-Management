import type { Location } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { mapLocationToDto } from "../internal/mapLocationToDto.js";

export async function listLocations(restaurantId: string): Promise<Location[]> {
  const locations = await prisma.location.findMany({
    where: { restaurantId, isActive: true },
    orderBy: { name: "asc" },
  });
  return locations.map(mapLocationToDto);
}
