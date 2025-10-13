import { Column } from "@/components/ui/DataTable";

export const loadColumns: Column[] = [
  { key: "loadId", header: "Load ID", align: "center" },
  { key: "route", header: "Route", align: "left" },
  { key: "distance", header: "Distance", align: "center" },
  { key: "pricePerMile", header: "Price/Mile", align: "center" },
  { key: "total", header: "Total", align: "center" },
  { key: "status", header: "Status", align: "center" },
  { key: "driver", header: "Driver", align: "center" },
  { key: "pickup", header: "Pickup Appointment", align: "center" },
  { key: "delivery", header: "Delivery Appointment", align: "center" },
  { key: "completed", header: "Completed", align: "center" },
  { key: "notes", header: "Notes", align: "center" },
];