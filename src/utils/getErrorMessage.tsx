export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  // للتعامل مع أخطاء RTK Query
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const rtkError = error as { data?: { message?: string } };
    if (rtkError.data?.message) {
      return rtkError.data.message;
    }
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }
  
  return 'An unknown error occurred';
};