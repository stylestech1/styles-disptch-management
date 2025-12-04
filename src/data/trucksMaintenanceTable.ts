import { Column } from "@/components/ui/DataTable";

export const truckMaintenanceMilesColumns: Column[] = [
  { key: "type", header: "Service Type", align: "center" },
  { key: "repeatBy", header: "Repeat By", align: "center" },
  { key: "intervalMile", header: "Interval Mile", align: "right" },
  { key: "remindBeforeMile", header: "Remind Before", align: "right" },
  { key: "view", header: "View Trucks", align: "center" },
];

export const truckMaintenanceTimesColumns: Column[] = [
  { key: "type", header: "Service Type", align: "center" },
  { key: "repeatBy", header: "Repeat By", align: "center" },
  { key: "intervalDays", header: "Interval Days", align: "right" },
  { key: "remindBeforeDays", header: "Remind Before", align: "right" },
  { key: "view", header: "View Trucks", align: "center" },
];
