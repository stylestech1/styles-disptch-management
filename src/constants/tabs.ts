import { TUserRole } from "@/types/globalTypes";

export const TABS_CONFIG: Record<TUserRole, string[]> = {
  admin: [
    "Loads",
    "Users",
    "Drivers",
    "Trucks",
    "TruckDashboard",
    "Calculation",
    "Trailers",
  ],
  employee: ["Loads", "Calculation"],
};
