import { TUserRole } from "@/types/globalTypes";

export const TABS_CONFIG: Record<TUserRole, string[]> = {
  admin: [
    "Loads",
    "Dispatchers",
    "Drivers",
    "Trucks",
    "TruckDashboard",
    "Calculation",
    "Trailers",
  ],
  employee: ["Loads", "Calculation"],
};
