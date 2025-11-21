"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dayjs } from 'dayjs';

interface FilterContextType {
  fromDate: Dayjs | null;
  toDate: Dayjs | null;
  isFiltered: boolean;
  setFromDate: (date: Dayjs | null) => void;
  setToDate: (date: Dayjs | null) => void;
  setIsFiltered: (filtered: boolean) => void;
  applyFilter: (from: Dayjs | null, to: Dayjs | null) => void;
  clearFilter: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);

  const applyFilter = (from: Dayjs | null, to: Dayjs | null) => {
    setFromDate(from);
    setToDate(to);
    setIsFiltered(!!(from && to));
  };

  const clearFilter = () => {
    setFromDate(null);
    setToDate(null);
    setIsFiltered(false);
  };

  return (
    <FilterContext.Provider
      value={{
        fromDate,
        toDate,
        isFiltered,
        setFromDate,
        setToDate,
        setIsFiltered,
        applyFilter,
        clearFilter,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};