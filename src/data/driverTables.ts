import { Column } from "@/components/ui/DataTable";

export const driverColumns: Column[] = [
  { key: "index", header: "#", align: "left" },
  { key: "details", header: "Driver Details", align: "left" },
  { key: "contact", header: "Contact Information", align: "left" },
  { key: "license", header: "License & Pricing", align: "left" },
  { key: "status", header: "Status", align: "left" },
  { key: "actions", header: "Actions", align: "left" },
];
