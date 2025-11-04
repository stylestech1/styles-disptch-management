import { Column } from "@/components/ui/DataTable";

export const driverColumns: Column[] = [
  { key: "driverId", header: "Driver ID", align: "left" },
  { key: "details", header: "Driver Details", align: "left" },
  { key: "phone", header: "Phone Number", align: "left" },
  { key: "license", header: "License & Pricing", align: "left" },
  { key: "pricePerMile", header: "Price/Mile", align: "left" },
  { key: "hireDate", header: "Hire Date", align: "left" },
  { key: "status", header: "Status", align: "left" },
  { key: "actions", header: "Actions", align: "left" },
];
