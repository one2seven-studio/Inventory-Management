import type { CreateLocationInput, Location } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { mapLocationToDto } from "../internal/mapLocationToDto.js";

/** PRD §3.5/§3.15 — register a branch, central kitchen, or warehouse, scoped to the caller's active restaurant. */
export async function createLocation(input: CreateLocationInput, restaurantId: string): Promise<Location> {
  const location = await prisma.location.create({
    data: { restaurantId, name: input.name, type: input.type, address: input.address ?? null },
  });
  return mapLocationToDto(location);
}
