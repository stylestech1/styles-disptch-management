"use client";
import { useAppSelector } from "@/redux/store";
import { TABS_CONFIG } from "@/constants/tabs";
import { TUserRole } from "@/types/globalTypes";

export const useTabs = () => {
  const role = useAppSelector((state) => state.auth.user?.role.toLowerCase()) as TUserRole | undefined;
  if (!role) return [];
  return TABS_CONFIG[role] || [];
};
