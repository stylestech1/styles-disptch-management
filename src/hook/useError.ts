import { useState, useCallback } from "react";

const useError = (initialState: string = "") => {
  const [error, setError] = useState(initialState);

  const setErrorMsg = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  }, []);

  const clearError = useCallback(() => setError(""), []);

  const withErrorHandling = useCallback(
    async <T>(
      asyncFunction: () => Promise<T>,
      errorMessage?: string
    ): Promise<T | null> => {
      try {
        clearError();
        const result = await asyncFunction();
        return result;
      } catch (err) {
        const message =
          errorMessage ||
          (err instanceof Error ? err.message : "Something went wrong");
        setErrorMsg(message);
        return null;
      }
    },
    [clearError, setErrorMsg]
  );

  return {
    error,
    setError,
    setErrorMsg,
    clearError,
    withErrorHandling,
  };
};

export default useError;
