import type { Item, ItemCategory, ItemStatus } from "@platform/contracts";
import type { Item as PrismaItem } from "@platform/db";

export function mapItemToDto(item: PrismaItem): Item {
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    category: item.category as ItemCategory,
    subCategory: item.subCategory,
    description: item.description,
    imageUrl: item.imageUrl,
    barcode: item.barcode,
    purchaseUom: item.purchaseUom,
    stockUom: item.stockUom,
    recipeUom: item.recipeUom,
    purchaseToStockFactor: item.purchaseToStockFactor,
    stockToRecipeFactor: item.stockToRecipeFactor,
    isPerishable: item.isPerishable,
    defaultShelfLifeDays: item.defaultShelfLifeDays,
    lastPurchasePrice: item.lastPurchasePrice,
    averageCost: item.averageCost,
    status: item.status as ItemStatus,
    createdAt: item.createdAt.toISOString(),
  };
}
