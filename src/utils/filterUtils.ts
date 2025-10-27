import toast from "react-hot-toast";
import { getErrorMessage } from "./getErrorMessage";

interface FilterParams {
  id: string;
  fromDate?: string;
  toDate?: string;
  fetchFunction: (params: { id: string; from?: string; to?: string }) => Promise<any>;
}

export const applyGlobalFilter = async ({
  id,
  fromDate,
  toDate,
  fetchFunction,
}: FilterParams) => {
  if (!fromDate && !toDate) {
    toast.error("Please select at least one date", {
      style: { background: "#dc2626", color: "#fff" },
    });
    return;
  }

  const params: { id: string; from?: string; to?: string } = { id };
  if (fromDate) params.from = `${fromDate}T00:00:00Z`;
  if (toDate) params.to = `${toDate}T23:59:59Z`;

  try {
    await fetchFunction(params);
    toast.success("Filter applied successfully", {
      style: { background: "#10b981", color: "#fff" },
    });
  } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Creating user failed ❌");
      throw err;
    }
};

export const resetGlobalFilter = async ({
  id,
  fetchFunction,
}: { 
  id: string;
  fetchFunction: (params: { id: string }) => Promise<any>;
}) => {
  try {
    await fetchFunction({ id });
    toast.success("Reset successfully", {
      style: { background: "#3b82f6", color: "#fff" },
    });
  } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        toast.error(errorMessage || "Creating user failed ❌");
        throw err;
      }
};
