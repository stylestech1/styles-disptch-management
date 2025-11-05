import { Column } from "@/components/ui/DataTable";

export const customerColumns: Column[] = [
  { key: "customerId", header: "Customer ID", align: "center" },
  { key: "details", header: "Customer Details", align: "left" },
  { key: "address", header: "Address", align: "center" },
  { key: "note", header: "Note", align: "center" },
  { key: "type", header: "Type", align: "center" },
  { key: "edit", header: "Edit", align: "center" },
];
