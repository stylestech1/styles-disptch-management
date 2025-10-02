import { TUserRole } from "@/types/globalTypes";

export const TABS_CONFIG: Record<TUserRole, string[]> = {
  admin: ["Loads", "Dispatchers", "Drivers", "Trucks", "Trailers"],
  employee: ["Loads"],
};
