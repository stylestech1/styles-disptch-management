import toast from "react-hot-toast";
import { getErrorMessage } from "./getErrorMessage";
import { Dayjs } from "dayjs";

// تعريف أنواع عامة للبيانات المرتجعة
interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
}
 
// أنواع معاملات الفلتر
interface FilterParams<T = unknown> {
  id: string;
  fromDate?: string | Dayjs | null;
  toDate?: string | Dayjs | null;
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
  const fromDateStr = fromDate ? (typeof fromDate === 'string' ? fromDate : fromDate.format('YYYY-MM-DD')) : undefined;
  const toDateStr = toDate ? (typeof toDate === 'string' ? toDate : toDate.format('YYYY-MM-DD')) : undefined;

  if (!fromDate && !toDate) {
    toast.error("Please select at least one date", {
      style: { background: "#dc2626", color: "#fff" },
    });
    throw new Error("No date selected");
  }

  const params: { id: string; from?: string; to?: string } = { id };
  if (fromDate) params.from = fromDateStr;
  if (toDate) params.to = toDateStr;

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