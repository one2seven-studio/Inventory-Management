import type { Supplier } from "@platform/contracts";
import type { Supplier as PrismaSupplier } from "@platform/db";

export function mapSupplierToDto(supplier: PrismaSupplier): Supplier {
  return {
    id: supplier.id,
    name: supplier.name,
    contactName: supplier.contactName,
    contactEmail: supplier.contactEmail,
    contactPhone: supplier.contactPhone,
    paymentTerms: supplier.paymentTerms,
    leadTimeDays: supplier.leadTimeDays,
    deliverySchedule: supplier.deliverySchedule,
    rating: supplier.rating,
    isActive: supplier.isActive,
  };
}
