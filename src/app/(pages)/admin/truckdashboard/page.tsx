"use client";
import React, { useMemo, useCallback } from "react";
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
  Skeleton,
  SxProps,
  alpha,
} from "@mui/material";
import { IoCar, IoStatsChart } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { RootState, useAppSelector } from "@/redux/store";
import { TTruck, TTruckSummary, TTruckWithSummary } from "@/types/globalTypes";
import Titles from "@/components/ui/Titles";
import Erros from "@/components/ui/Erros";
import { muiTheme } from "@/theme/theme";
import ChartSection from "@/components/ui/ChartSection";
import { useGetTruckSummaryQuery } from "@/redux/slices/apiSlice";
import { useSearch } from "@/hook/useSearch";
import { StyledTableCell, TableSkeleton } from "@/components/ui/TablesMUI";
import { useSearchSubmit } from "@/hook/useSearchSubmit";
import SearchInput from "@/components/ui/SearchInput";

// Memoized Truck Row Component
const TruckRow = React.memo(
  ({
    truck,
    index,
    onViewStats,
  }: {
    truck: TTruckWithSummary;
    index: number;
    onViewStats: (_id: string) => void;
  }) => {
    const summary = truck.summary;
    const hasSummary = !!summary;

    const profitValue = summary?.netProfit ?? 0;
    const profitColor = profitValue >= 0 ? "success.main" : "error.main";

    return (
      <TableRow
        key={truck.truckId}
        hover
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <TableCell>{index + 1}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IoCar size={18} color="#64748b" />
            <Typography variant="body2" fontWeight={500}>
              {truck.plateNumber}
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
  }
);
TruckRow.displayName = "TruckRow";

const TruckDashboard = () => {
  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const theme = useAppSelector((state: RootState) => state.palette);

  const searchHook = useSearchSubmit();

  const {
    searchInput,
    searchTerm,
    isSearching,
  } = searchHook;

  const {
    data: allTrucksData,
    isLoading: trucksLoading,
    error: trucksError,
    isFetching,
  } = useGetTruckSummaryQuery(undefined, {
    skip: !token,
  });

  const { filteredData: searchedTrucks } = useSearch({
    data: allTrucksData?.data?.trucksSummary || [],
    searchFields: ["truckId", "model", "plateNumber"],
    initialSearch: searchTerm,
  });

  const displayTrucks = isSearching
    ? searchedTrucks
    : allTrucksData?.data?.trucksSummary || [];

  // chart data
  const chartData = useMemo(() => {
    const trucksWithSummaries = displayTrucks.filter(
      (truck: TTruck & { summary?: TTruckSummary }) => truck.summary
    );

    if (trucksWithSummaries.length === 0) return null;

    const labels = trucksWithSummaries.map(
      (truck: TTruck) => `Truck ${truck.truckId} (${truck.plateNumber})`
    );

    const milesData = trucksWithSummaries.map(
      (truck: TTruck & { summary?: TTruckSummary }) =>
        truck.summary?.totalMiles || 0
    );

    const profitData = trucksWithSummaries.map(
      (truck: TTruck & { summary?: TTruckSummary }) =>
        truck.summary?.netProfit || 0
    );

    const baseColors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#C9CBCF",
      "#7CDBED",
      "#FF97B7",
      "#5DE2A0",
    ];

    const colors = Array.from(
      { length: trucksWithSummaries.length },
      (_, i) => baseColors[i % baseColors.length]
    );

    return {
      milesChart: {
        labels,
        datasets: [
          {
            label: "Total Miles",
            data: milesData,
            backgroundColor: colors,
            borderColor: colors.map((color) => color.replace("0.2", "1")),
            borderWidth: 2,
          },
        ],
      },
      profitChart: {
        labels,
        datasets: [
          {
            label: "Net Profit ($)",
            data: profitData,
            backgroundColor: colors,
            borderColor: colors.map((color) => color.replace("0.2", "1")),
            borderWidth: 2,
          },
        ],
      },
    };
  }, [displayTrucks]);

  const handleViewStats = useCallback(
    (_id: string) => {
      sessionStorage.setItem("truckDashboardSearch", searchInput);
      router.push(`/admin/truckSummary/${_id}`);
    },
    [router, searchInput]
  );

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

  // Container styles
  const containerSx: SxProps = {
    backgroundColor: theme.currentPalette.background,
    minHeight: "100vh",
    p: 3,
  };
  
  const searchFilterContainerSx: SxProps = {
    display: "flex",
    flexDirection: { xs: "column", lg: "row" },
    alignItems: "end",
    gap: 2,
    p: 3,
    my: 3,
    border: `1px solid ${alpha(theme.currentPalette.primary, 0.2)}`,
    borderRadius: 2,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: theme.currentPalette.background,
  };

  return (
    <Box sx={containerSx}>
      {/* Header */}
      <Box className="flex justify-between items-start flex-col md:flex-row mb-6">
        <Box className="flex flex-col w-full">
          <Box className="mb-6">
            <Titles>Truck Dashboard</Titles>
            <Typography variant="body1" color="text.secondary" className="mt-2">
              {trucks.length > 0
                ? `Managing ${trucks.length} trucks in your fleet${
                    isFetching ? " (updating...)" : ""
                  }`
                : "No trucks available in your fleet"}
            </Typography>
          </Box>
        </Box>

        {/* Charts Section */}
        {chartData && (
          <Box>
            <ChartSection chartData={chartData} />
          </Box>
        )}
      </Box>

      {/* Search Bar باستخدام SearchInput */}
      <Box sx={searchFilterContainerSx}>
        <SearchInput
          searchHook={searchHook}
          placeholder="Search trucks by ID, model, or plate number"
          fullWidth
          showClearButton
          sx={{ width: "100%" }}
          inputSx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#fff",
              py: 0.5,
            },
          }}
        />
      </Box>

      {/* Table Section */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          overflow: "hidden",
          overflowX: "auto",
          maxWidth: "100%",
          "&::-webkit-scrollbar": {
            height: 8,
          },
          "&::-webkit-scrollbar-track": {
            background: muiTheme.palette.grey[100],
          },
          "&::-webkit-scrollbar-thumb": {
            background: muiTheme.palette.grey[400],
            borderRadius: 4,
          },
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
                      {isSearching
                        ? "No trucks match your search"
                        : "No trucks available"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TruckDashboard;