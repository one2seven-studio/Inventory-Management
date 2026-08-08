import type { DashboardSummary } from "@platform/contracts";
import { Wallet, PieChart, TriangleAlert, Truck } from "lucide-react";
import { StatTile } from "@/components/ui/StatTile";
import { formatCurrency } from "@/lib/format/formatCurrency";

export function StatTiles({ summary }: { summary: DashboardSummary }) {
  const tiles = [
    { label: "Stock value", value: formatCurrency(summary.stockValue), icon: Wallet },
    {
      label: "Food cost %",
      value: summary.foodCostPercent != null ? `${summary.foodCostPercent.toFixed(1)}%` : "—",
      icon: PieChart,
    },
    { label: "Low stock items", value: String(summary.lowStockItemCount), icon: TriangleAlert },
    { label: "Pending POs", value: String(summary.pendingPoCount), icon: Truck },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {tiles.map((tile, index) => (
        <StatTile
          key={tile.label}
          label={tile.label}
          value={tile.value}
          icon={<tile.icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
          delayMs={index * 60}
        />
      ))}
    </div>
  );
}
