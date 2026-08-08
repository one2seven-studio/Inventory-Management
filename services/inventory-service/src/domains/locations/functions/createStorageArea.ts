import { ApiError, type CreateStorageAreaInput, type StorageArea } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { mapStorageAreaToDto } from "../internal/mapLocationToDto.js";

/** PRD §3.5 — register a sub-storage area (walk-in cooler, dry store, bar, freezer) within a location. */
export async function createStorageArea(input: CreateStorageAreaInput, restaurantId: string): Promise<StorageArea> {
  const location = await prisma.location.findUnique({ where: { id: input.locationId } });
  if (!location || location.restaurantId !== restaurantId) {
    throw ApiError.notFound(`Location ${input.locationId} not found`);
  }

  const area = await prisma.storageArea.create({
    data: { locationId: input.locationId, name: input.name, type: input.type },
  });
  return mapStorageAreaToDto(area);
}
