import { Column } from "@/components/ui/DataTable";

export const truckColumns: Column[] = [
  { key: "index", header: "#", align: "left" },
  { key: "details", header: "Truck Details", align: "left" },
  { key: "specifications", header: "Specifications", align: "left" },
  { key: "type", header: "Type", align: "left" },
  { key: "status", header: "Status", align: "left" },
  { key: "actions", header: "Actions", align: "center" },
];