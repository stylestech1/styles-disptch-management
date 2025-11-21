// components/ui/GlobalFilter.tsx
"use client";
import React from 'react';
import { useFilter } from '@/providers/FilterProvider';
import DateRangeFilter from './Filter';
import { Dayjs } from 'dayjs';

interface GlobalFilterProps {
  filterType: 'loads' | 'drivers' | 'trucks' | 'default';
  onFilterChange?: (from: Dayjs | null, to: Dayjs | null) => void;
}

const GlobalFilter: React.FC<GlobalFilterProps> = ({ 
  filterType, 
  onFilterChange 
}) => {
  const { applyFilter, clearFilter, isFiltered } = useFilter();

  const handleApply = (from: Dayjs | null, to: Dayjs | null) => {
    applyFilter(from, to);
    onFilterChange?.(from, to);
  };

  const handleClear = () => {
    clearFilter();
    onFilterChange?.(null, null);
  };

  const getPlaceholder = () => {
    switch (filterType) {
      case 'loads':
        return 'Filter by load date';
      case 'drivers':
        return 'Filter by driver join date';
      case 'trucks':
        return 'Filter by truck registration date';
      default:
        return 'Filter by date';
    }
  };

  return (
    <div>
      <DateRangeFilter
        onApply={handleApply}
        onClear={handleClear}
        onFilterApplied={(applied) => {
        }}
      />
    </div>
  );
};

export default GlobalFilter;