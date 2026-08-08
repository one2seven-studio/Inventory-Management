import type { Grn, GrnLineResult } from "@platform/contracts";
import type { Grn as PrismaGrn, GrnLine as PrismaGrnLine } from "@platform/db";

export type PrismaGrnWithLines = PrismaGrn & { lines: PrismaGrnLine[] };

export function mapGrnToDto(grn: PrismaGrnWithLines): Grn {
  return {
    id: grn.id,
    purchaseOrderId: grn.purchaseOrderId,
    locationId: grn.locationId,
    lines: grn.lines.map(mapGrnLineToDto),
    hasDiscrepancy: grn.hasDiscrepancy,
    receivedByUserId: grn.receivedByUserId,
    createdAt: grn.createdAt.toISOString(),
  };
}

function mapGrnLineToDto(line: PrismaGrnLine): GrnLineResult {
  return {
    itemId: line.itemId,
    quantityOrdered: line.quantityOrdered,
    quantityReceived: line.quantityReceived,
    discrepancy: line.discrepancy,
    discrepancyType: line.discrepancyType as GrnLineResult["discrepancyType"],
  };
}
