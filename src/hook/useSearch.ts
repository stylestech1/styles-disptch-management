import { UseSearchProps } from '@/types/globalTypes';
import { useMemo } from 'react';

export const useSearch = <T,>({ 
  data, 
  searchFields, 
  initialSearch = "" 
}: UseSearchProps<T>) => {
  const filteredData = useMemo(() => {
    if (!initialSearch.trim()) return data;

    const searchTerm = initialSearch.toLowerCase();
    
    return data.filter((item: T) =>
      searchFields.some((field) => {
        const fieldString = field as string;
        
        if (!fieldString.includes('.')) {
          const value = item[field as keyof T];
          return handleValueSearch(value, searchTerm);
        }
        
        const fieldParts = fieldString.split('.');
        let currentValue: unknown = item;
        
        for (const part of fieldParts) {
          if (currentValue && typeof currentValue === 'object') {
            currentValue = (currentValue as Record<string, unknown>)[part];
          } else {
            currentValue = null;
            break;
          }
        }
        
        return handleValueSearch(currentValue, searchTerm);
      })
    );
  }, [data, initialSearch, searchFields]);

  return {
    filteredData,
    hasSearch: initialSearch.trim().length > 0,
    resultsCount: filteredData.length,
    totalCount: data.length
  };
};

const handleValueSearch = (value: unknown, searchTerm: string): boolean => {
  if (typeof value === 'string') {
    return value.toLowerCase().includes(searchTerm);
  }
  if (typeof value === 'number') {
    return value.toString().includes(searchTerm);
  }
  if (typeof value === 'boolean') {
    return value.toString().includes(searchTerm);
  }
  return false;
};