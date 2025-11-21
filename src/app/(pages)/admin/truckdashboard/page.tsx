"use client";
import { useSearch } from "@/hook/useSearch";
import { useSearchSubmit } from "@/hook/useSearchSubmit";
import { useGetTruckSummaryQuery } from "@/redux/slices/apiSlice";
import { RootState, useAppSelector } from "@/redux/store";
import { alpha, Box, SxProps, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import Erros from "@/components/ui/Erros";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import BarChartTruckDashboard from "@/components/truck/BarChartTruckDashboard";
import { TTruckSummaryResponse } from "@/types/globalTypes";

const TruckDashboard2 = () => {
  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const theme = useAppSelector((state: RootState) => state.palette);
  const searchHook = useSearchSubmit();
  const { searchInput, searchTerm, isSearching } = searchHook;

  // API Query
  const {
    data: allTrucksData,
    isLoading: trucksLoading,
    error: trucksError,
    isFetching,
  } = useGetTruckSummaryQuery(undefined, {
    skip: !token,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false,
  });

  const { filteredData: searchedTrucks } = useSearch({
    data: allTrucksData?.data?.trucksSummary || [],
    searchFields: ["plateNumber"],
    initialSearch: searchTerm,
  });

  const displayTrucks = isSearching
    ? searchedTrucks
    : allTrucksData?.data?.trucksSummary || [];

  // State Cards
  const StatCard = ({
    title,
    value,
    change,
    positive,
  }: {
    title: string;
    value: string;
    change: number;
    positive: boolean;
  }) => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          padding: 2.5,
          borderRight: {
            lg: `1px solid ${alpha(theme.currentPalette.primary, 0.1)}`,
          },
          borderBottom: {
            sx: `1px solid ${alpha(theme.currentPalette.primary, 0.1)}`,
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: `${theme.currentPalette.primary}`, fontSize: "16px" }}
        >
          {title}
        </Typography>

        <Typography sx={{ fontSize: "35px", fontWeight: "normal" }}>
          {value}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: positive ? "#16a34a" : "#dc2626",
            fontSize: "14px",
          }}
        >
          {positive ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
          {positive ? "+" : "-"}
          {change}% vs last month
        </Typography>
      </Box>
    );
  };

  // Error state
  if (trucksError) {
    return (
      <Box p={3}>
        <Erros message="Failed to load truck data. Please try again later." />
      </Box>
    );
  }

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
    border: `1px solid ${alpha(theme.currentPalette.primary, 0.1)}`,
    borderRadius: 2,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: theme.currentPalette.background,
  };

  return (
    <Box sx={containerSx}>
      {/* Stats Cards Truck-Dashboard */}
      <Box>
        <Typography
          variant="h5"
          sx={{ color: theme.currentPalette.primary, fontWeight: 500 }}
        >
          Performance Overview
        </Typography>

        <Box
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          sx={{
            my: 3,
            border: `1px solid ${alpha(theme.currentPalette.primary, 0.3)}`,
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <StatCard
            title="Total Revenue/Mile"
            value={`$${allTrucksData?.data.totalSummary.totalRevenue.toFixed(
              2
            )}`}
            change={12.5}
            positive={true}
          />

          <StatCard
            title="Total Cost/Mile"
            value={`$${allTrucksData?.data.totalSummary.totalExpenses.toFixed(
              2
            )}`}
            change={8.2}
            positive={false}
          />

          <StatCard
            title="Total Profit/Mile"
            value={`$${allTrucksData?.data.totalSummary.netProfit.toFixed(2)}`}
            change={24.3}
            positive={true}
          />

          <StatCard
            title="Profit Margin %"
            value={`${(allTrucksData?.data.totalSummary.totalExpenses
              ? allTrucksData?.data.totalSummary.netProfit /
                allTrucksData?.data.totalSummary.totalExpenses
              : 0
            ).toFixed(2)}%`}
            change={3.1}
            positive={true}
          />
        </Box>
      </Box>

      {/* Profitability Analysis */}
      <Box sx={{ my: 5 }}>
        <Typography
          variant="h5"
          sx={{ color: theme.currentPalette.primary, fontWeight: 500 }}
        >
          Profitability Analysis
        </Typography>
        
        <Box sx={{my: 3}}>
          <BarChartTruckDashboard data={displayTrucks} />
        </Box>
      </Box>
    </Box>
  );
};

export default TruckDashboard2;
