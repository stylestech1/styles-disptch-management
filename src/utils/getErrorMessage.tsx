import { RTKError } from "@/types/globalTypes";

export const getErrorMessage = (error: unknown): string => {
  if (!error) return "Unknown error";

  if (typeof error === "string") return error;

  if (error instanceof Error) return error.message;

  // RTK Query Error handling
  const err = error as RTKError;
  const data = err?.data || err?.error?.data || err;

  // For validation errors
  if (Array.isArray(data?.errors)) {
    return data.errors.map((e) => e.msg).join("\n \n");
  }

  // Normal Errors
  if (data?.message) return data.message;
  if (err?.message) return err.message;

  return "An error occurred";
};
