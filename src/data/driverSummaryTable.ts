import { Column } from "@/components/ui/DataTable";

export const driverSummaryColumns: Column[] = [
  { key: "loadId", header: "Load ID", align: "center" },
  { key: "plateNumber", header: "Plate Number", align: "center" },
  { key: "origin", header: "Origin", align: "left" },
  { key: "destination", header: "Destination", align: "left" },
  { key: "miles", header: "Miles", align: "right" },
  { key: "pricePerMile", header: "Price/Mile", align: "right" },
  { key: "total", header: "Total Price", align: "right" },
  { key: "delivered", header: "Delivery Date", align: "center" },
];