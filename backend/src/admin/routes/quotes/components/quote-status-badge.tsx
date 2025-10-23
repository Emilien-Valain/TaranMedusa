import { StatusBadge } from "@medusajs/ui";

const StatusTitles: Record<string, string> = {
  accepted: "Accepted",
  customer_rejected: "Rejeté par le Client",
  merchant_rejected: "Rejeté par le Vendeur",
  pending_merchant: "En Attente du Vendeur",
  pending_customer: "En Attente du Client",
};

const StatusColors: Record<string, "green" | "orange" | "red" | "blue"> = {
  accepted: "green",
  customer_rejected: "orange",
  merchant_rejected: "red",
  pending_merchant: "blue",
  pending_customer: "blue",
};

export default function QuoteStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge color={StatusColors[status]}>
      {StatusTitles[status]}
    </StatusBadge>
  );
}
