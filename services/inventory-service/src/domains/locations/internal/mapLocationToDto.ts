import type { Location, LocationType, StorageArea, StorageAreaType } from "@platform/contracts";
import type { Location as PrismaLocation, StorageArea as PrismaStorageArea } from "@platform/db";

export function mapLocationToDto(location: PrismaLocation): Location {
  return {
    id: location.id,
    name: location.name,
    type: location.type as LocationType,
    address: location.address,
    isActive: location.isActive,
  };
}

export function mapStorageAreaToDto(area: PrismaStorageArea): StorageArea {
  return {
    id: area.id,
    locationId: area.locationId,
    name: area.name,
    type: area.type as StorageAreaType,
  };
}
