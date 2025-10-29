import { useState, useCallback } from 'react';

const useLoading = (initialState: boolean = false) => {
  const [loading, setLoading] = useState(initialState);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);
  const toggleLoading = useCallback(() => setLoading(prev => !prev), []);

  const withLoading = useCallback(async <T>(asyncFunction: () => Promise<T>): Promise<T> => {
    try {
      startLoading();
      const result = await asyncFunction();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading
  };
};

export default useLoading;