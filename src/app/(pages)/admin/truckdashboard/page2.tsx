import { useSearch } from "@/hook/useSearch";
import { useSearchSubmit } from "@/hook/useSearchSubmit";
import { useGetTruckSummaryQuery } from "@/redux/slices/apiSlice";
import { RootState, useAppSelector } from "@/redux/store";
import { alpha, Box, SxProps, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import Erros from "@/components/ui/Erros";

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
    p: 3,
    my: 3,
    border: `1px solid ${alpha(theme.currentPalette.primary, 0.2)}`,
    borderRadius: 2,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: theme.currentPalette.background,
  };

  return (
    <Box sx={containerSx}>
      {/* Stats Cards Truck-Dashboard */}
      <Box sx={{ my: 5 }}>
        <Typography variant="h3" sx={{ color: theme.currentPalette.primary }}>
          Performance Overview
        </Typography>

        <Box
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 rounded-xl"
          sx={{ borderColor: alpha(theme.currentPalette.text, 0.5) }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ color: theme.currentPalette.primary, fontSize: "20px" }}
            >
              Total Revenue/Mile
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TruckDashboard2;
