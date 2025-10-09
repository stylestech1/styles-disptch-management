import { Column } from "@/components/ui/DataTable";

export const dispatcherColumns: Column[] = [
  { key: "index", header: "#", align: "left" },
  { key: "name", header: "Name", align: "left" },
  { key: "email", header: "Email", align: "left" },
  { key: "phone", header: "Phone", align: "left" },
  { key: "role", header: "Role", align: "left" },
  { key: "position", header: "Position", align: "left" },
  { key: "jobId", header: "Job ID", align: "left" },
  { key: "status", header: "Status", align: "center" },
  { key: "setting", header: "Setting", align: "center" },
];