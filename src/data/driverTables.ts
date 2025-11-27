import { Column } from "@/components/ui/DataTable";

export const driverColumns: Column[] = [
  { key: "driverId", header: "Driver ID", align: "left" },
  { key: "details", header: "Driver Details", align: "left" },
  { key: "phone", header: "Phone Number", align: "center" },
  { key: "license", header: "License & Pricing", align: "center" },
  { key: "pricePerMile", header: "Price/Mile", align: "center" },
  { key: "hireDate", header: "Hire Date", align: "center" },
  { key: "status", header: "Status", align: "center" },
  { key: "actions", header: "Actions", align: "center" },
];
