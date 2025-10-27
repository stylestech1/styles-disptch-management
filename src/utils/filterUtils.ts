import toast from "react-hot-toast";
import { getErrorMessage } from "./getErrorMessage";

// تعريف أنواع عامة للبيانات المرتجعة
interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
}

// أنواع معاملات الفلتر
interface FilterParams<T = unknown> {
  id: string;
  fromDate?: string;
  toDate?: string;
  fetchFunction: (params: { id: string; from?: string; to?: string }) => Promise<ApiResponse<T>>;
}

// أنواع معاملات الإعادة
interface ResetParams<T = unknown> {
  id: string;
  fetchFunction: (params: { id: string }) => Promise<ApiResponse<T>>;
}

export const applyGlobalFilter = async <T = unknown>({
  id,
  fromDate,
  toDate,
  fetchFunction,
}: FilterParams<T>): Promise<ApiResponse<T>> => {
  if (!fromDate && !toDate) {
    toast.error("Please select at least one date", {
      style: { background: "#dc2626", color: "#fff" },
    });
    throw new Error("No date selected");
  }

  const params: { id: string; from?: string; to?: string } = { id };
  if (fromDate) params.from = `${fromDate}T00:00:00Z`;
  if (toDate) params.to = `${toDate}T23:59:59Z`;

  try {
    const response = await fetchFunction(params);
    toast.success("Filter applied successfully", {
      style: { background: "#10b981", color: "#fff" },
    });
    return response;
  } catch (err: unknown) {
    const errorMessage = getErrorMessage(err);
    toast.error(errorMessage || "Filter application failed ❌");
    throw err;
  }
};

export const resetGlobalFilter = async <T = unknown>({
  id,
  fetchFunction,
}: ResetParams<T>): Promise<ApiResponse<T>> => {
  try {
    const response = await fetchFunction({ id });
    toast.success("Reset successfully", {
      style: { background: "#3b82f6", color: "#fff" },
    });
    return response;
  } catch (err: unknown) {
    const errorMessage = getErrorMessage(err);
    toast.error(errorMessage || "Reset failed ❌");
    throw err;
  }
};