// components/admin/order-status-badge.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_MAP } from "@/lib/constants";

interface OrderStatusBadgeProps {
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig = ORDER_STATUS_MAP[status] || {
    label: status,
    color: "text-muted",
    bg: "bg-elevated",
  };

  // Convert status to variant matching components/ui/badge.tsx CVA variants
  let variant: "default" | "gold" | "crimson" | "green" | "blue" | "outline" = "default";
  
  if (status === "PENDING") variant = "gold";
  else if (status === "PROCESSING" || status === "SHIPPED") variant = "blue";
  else if (status === "DELIVERED") variant = "green";
  else if (status === "CANCELLED") variant = "crimson";
  else if (status === "REFUNDED") variant = "outline";

  return (
    <Badge variant={variant} className="rounded">
      {statusConfig.label}
    </Badge>
  );
}
export default OrderStatusBadge;
