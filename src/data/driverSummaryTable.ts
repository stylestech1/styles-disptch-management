import { Column } from "@/components/ui/DataTable";

export const driverSummaryColumns: Column[] = [
  { key: "loadId", header: "Load ID", align: "left" },
  { key: "origin", header: "Origin", align: "left" },
  { key: "destination", header: "Destination", align: "left" },
  { key: "miles", header: "Miles", align: "right" },
  { key: "pricePerMile", header: "Price/Mile", align: "right" },
  { key: "total", header: "Total", align: "right" },
  { key: "status", header: "Status", align: "center" },
  { key: "truck", header: "Truck Number", align: "left" },
  { key: "delivered", header: "Delivered", align: "center" },
];