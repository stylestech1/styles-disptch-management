"use client";
import React, { useMemo, useState, useCallback } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  Skeleton,
  TextField,
  InputAdornment,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import { IoSearch, IoCar, IoStatsChart } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { RootState, useAppSelector } from "@/redux/store";
import { TTruck, TTruckSummary, TTruckWithSummary } from "@/types/globalTypes";
import Titles from "@/components/ui/Titles";
import Erros from "@/components/ui/Erros";
import useError from "@/hook/useError";
import { muiTheme } from "@/theme/theme";
import {
  useGetTruckSummaryQuery
} from "@/redux/slices/truckApi";
import ChartSection from "@/components/ui/ChartSection";

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: muiTheme.palette.primary.main,
    color: muiTheme.palette.common.white,
    fontSize: 14,
    fontWeight: 600,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

// Custom debounce hook
function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Skeleton Loader Component
const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <TableBody>
    {Array.from({ length: rows }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton variant="text" width={20} /></TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={18} height={18} />
            <Skeleton variant="text" width={80} />
          </Box>
        </TableCell>
        <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
        <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
        <TableCell align="right"><Skeleton variant="text" width={80} /></TableCell>
        <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
        <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
        <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
        <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
        <TableCell align="right"><Skeleton variant="text" width={80} /></TableCell>
        <TableCell align="center"><Skeleton variant="rectangular" width={80} height={32} /></TableCell>
      </TableRow>
    ))}
  </TableBody>
);

// Memoized Truck Row Component
const TruckRow = React.memo(({
  truck,
  index,
  onViewStats
}: {
  truck: TTruckWithSummary
  index: number;
  onViewStats: (_id: string) => void;
}) => {
  const summary = truck.summary;
  const hasSummary = !!summary;

  const profitValue = summary?.netProfit ?? 0;
  const profitColor = profitValue >= 0 ? "success.main" : "error.main";

  return (
    <TableRow key={truck.truckId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IoCar size={18} color="#64748b" />
          <Typography variant="body2" fontWeight={500}>
            {truck.truckId}
          </Typography>
        </Box>
      </TableCell>

      {/* Loads */}
      <TableCell align="right">
        {!hasSummary ? (
          <Skeleton width={60} height={18} />
        ) : (
          summary.totalLoads || 0
        )}
      </TableCell>

      {/* Miles */}
      <TableCell align="right">
        {!hasSummary ? (
          <Skeleton width={60} height={18} />
        ) : (
          (summary.totalMiles ?? 0).toLocaleString()
        )}
      </TableCell>

      {/* Gross Revenue */}
      <TableCell align="right">
        {!hasSummary ? (
          <Skeleton width={80} height={18} />
        ) : (
          `$${(summary.totalRevenue ?? 0).toLocaleString()}`
        )}
      </TableCell>

      {/* Fuel Cost */}
      <TableCell align="right">
        {!hasSummary ? (
          <Skeleton width={60} height={18} />
        ) : (
          `$${(summary.fuelCost ?? 0).toLocaleString()}`
        )}
      </TableCell>

      {/* Driver Pay */}
      <TableCell align="right">
        {!hasSummary ? (
          <Skeleton width={60} height={18} />
        ) : (
          `$${(summary.driverPay ?? 0).toLocaleString()}`
        )}
      </TableCell>

      {/* Insurance Cost */}
      <TableCell align="right">
        {!hasSummary ? (
          <Skeleton width={60} height={18} />
        ) : (
          `$${(summary.insuranceCost ?? 0).toLocaleString()}`
        )}
      </TableCell>

      {/* Repair Cost */}
      <TableCell align="right">
        {!hasSummary ? (
          <Skeleton width={60} height={18} />
        ) : (
          `$${(summary.repairCost ?? 0).toLocaleString()}`
        )}
      </TableCell>

      {/* Net Profit */}
      <TableCell
        align="right"
        sx={{
          fontWeight: 600,
          color: profitColor,
        }}
      >
        {!hasSummary ? (
          <Skeleton width={80} height={18} />
        ) : (
          `$${profitValue.toLocaleString()}`
        )}
      </TableCell>

      <TableCell align="center">
        <button
          onClick={() => onViewStats(truck._id)}
          className="flex items-center gap-1 px-3 py-2 bg-blue-950 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors duration-200"
          disabled={!hasSummary}
        >
          <IoStatsChart size={14} />
          Stats
        </button>
      </TableCell>
    </TableRow>
  );
});

TruckRow.displayName = 'TruckRow';

const TruckDashboard = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { setError } = useError();
  const token = useAppSelector((state: RootState) => state.auth.token);

  const {
    data: allTrucksData,
    isLoading: trucksLoading,
    error: trucksError,
    isFetching
  } = useGetTruckSummaryQuery(undefined, {
    skip: !token
  });

  // Debounce search
  const debouncedSearch = useDebounce(search, 400);

  // تحسين البحث مع useMemo
  const filteredTrucks = useMemo(() => {
    const allTrucks = allTrucksData?.data?.trucksSummary || [];

    if (!debouncedSearch.trim()) return allTrucks;

    const term = debouncedSearch.toLowerCase();
    return allTrucks.filter((truck: TTruck & { summary?: TTruckSummary }) => {
      const searchFields = [
        String(truck.truckId || ""),
        String(truck.model || ""),
        String(truck.plateNumber || "")
      ];

      return searchFields.some(field =>
        field.toLowerCase().includes(term)
      );
    });
  }, [allTrucksData, debouncedSearch]);

  // تحسين chart data
  const chartData = useMemo(() => {
    const trucksWithSummaries = (allTrucksData?.data?.trucksSummary || []).filter(
      (truck: TTruck & { summary?: TTruckSummary }) => truck.summary
    );

    if (trucksWithSummaries.length === 0) return null;

    const labels = trucksWithSummaries.map(
      (truck: TTruck) => `Truck ${truck.truckId} (${truck.plateNumber})`
    );

    const milesData = trucksWithSummaries.map(
      (truck: TTruck & { summary?: TTruckSummary }) => truck.summary?.totalMiles || 0
    );

    const profitData = trucksWithSummaries.map(
      (truck: TTruck & { summary?: TTruckSummary }) => truck.summary?.netProfit || 0
    );

    const baseColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#C9CBCF', '#7CDBED', '#FF97B7', '#5DE2A0'
    ];

    const colors = Array.from({ length: trucksWithSummaries.length }, (_, i) =>
      baseColors[i % baseColors.length]
    );

    return {
      milesChart: {
        labels,
        datasets: [
          {
            label: 'Total Miles',
            data: milesData,
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('0.2', '1')),
            borderWidth: 2,
          },
        ],
      },
      profitChart: {
        labels,
        datasets: [
          {
            label: 'Net Profit ($)',
            data: profitData,
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('0.2', '1')),
            borderWidth: 2,
          },
        ],
      },
    };
  }, [allTrucksData]);

  // Event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleViewStats = useCallback((_id: string) => {
    sessionStorage.setItem('truckDashboardSearch', search);
    router.push(`/admin/truckSummary/${_id}`);
  }, [router, search]);

  // Loading state
  if (trucksLoading) {
    return (
      <Box className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading truck dashboard...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (trucksError) {
    return (
      <Box p={3}>
        <Erros message="Failed to load truck data. Please try again later." />
      </Box>
    );
  }

  const trucks = allTrucksData?.data?.trucksSummary || [];
  const displayTrucks = filteredTrucks;

  return (
    <section className="relative p-6 max-w-7xl mx-auto">
      {/* Header */}
      <Box className="mb-8">
        <Titles>Truck Dashboard</Titles>
        <Typography variant="body1" color="text.secondary" className="mt-2">
          {trucks.length > 0
            ? `Managing ${trucks.length} trucks in your fleet${isFetching ? ' (updating...)' : ''}`
            : 'No trucks available in your fleet'
          }
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box className="mb-8">
        <TextField
          fullWidth
          placeholder="Search by truck ID, model, or plate number..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IoSearch className="text-slate-400" />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: '400px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'white',
            }
          }}
        />
      </Box>

      {/* Charts Section */}
      {chartData && (
        <Box className="mb-8">
          <ChartSection chartData={chartData} />
        </Box>
      )}

      {/* Table Section */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          overflow: 'hidden'
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>#</StyledTableCell>
              <StyledTableCell>Truck</StyledTableCell>
              <StyledTableCell align="right">Loads</StyledTableCell>
              <StyledTableCell align="right">Miles</StyledTableCell>
              <StyledTableCell align="right">Gross</StyledTableCell>
              <StyledTableCell align="right">Fuel</StyledTableCell>
              <StyledTableCell align="right">Driver Pay</StyledTableCell>
              <StyledTableCell align="right">Insurance</StyledTableCell>
              <StyledTableCell align="right">Repair</StyledTableCell>
              <StyledTableCell align="right">Profit</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          {isFetching ? (
            <TableSkeleton rows={5} />
          ) : (
            <TableBody>
              {displayTrucks.map((truck: TTruckWithSummary, index: number) => (
                <TruckRow
                  key={truck.truckId}
                  truck={truck}
                  index={index}
                  onViewStats={handleViewStats}
                />
              ))}

              {displayTrucks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search ? "No trucks match your search" : "No trucks available"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </section>
  );
};

export default TruckDashboard;