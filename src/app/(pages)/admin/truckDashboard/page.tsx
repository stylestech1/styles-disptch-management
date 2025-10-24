"use client";
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
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
} from "@mui/material";
 import { tableCellClasses } from "@mui/material/TableCell";
import { IoSearch, IoCar, IoStatsChart } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { RootState, useAppSelector } from "@/redux/store";
import { TTruck, TTruckSummary } from "@/types/globalTypes";
import Titles from "@/components/ui/Titles";
import Erros from "@/components/ui/Erros";
import useError from "@/hook/useError";
import { muiTheme } from "@/theme/theme";
import { 
  useGetAllTrucksQuery,
  useLazyGetTruckSummaryQuery 
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

function useDebounce(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
} 
const TruckDashboard = () => {
  const [search, setSearch] = useState("");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [summaries, setSummaries] = useState<Record<string, TTruckSummary>>({});
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  
  const router = useRouter();
  const { setError } = useError();
  const token = useAppSelector((state: RootState) => state.auth.token);

  const { 
    data: allTrucksData, 
    isLoading: trucksLoading, 
    error: trucksError 
  } = useGetAllTrucksQuery(undefined, { 
    skip: !token,
  });

  const [getTruckSummary] = useLazyGetTruckSummaryQuery();

  // fetch summaries
  const fetchAllSummaries = useCallback(async () => {
    if (!allTrucksData?.data?.data) return;
    
    setIsLoadingSummaries(true);
    try {
      const trucksWithIds = allTrucksData.data.data.filter(truck => truck.id);
      
      const promises = trucksWithIds.map(truck => 
        getTruckSummary(truck.id!).unwrap()
      );
      
      const results = await Promise.all(promises);
      
      const summaryMap: Record<string, TTruckSummary> = {};
      results.forEach((result, index) => {
        const truckId = trucksWithIds[index].id;
        if (truckId) {
          summaryMap[truckId] = result.data;
        }
      }); 
       
      setSummaries(summaryMap);
    } catch (error) {
      console.error('Error fetching truck summaries:', error);
      setError("Failed to load truck summaries");
    } finally {
      setIsLoadingSummaries(false);
    }
  }, [ getTruckSummary, setError]);

  useEffect(() => {
    if (allTrucksData?.data?.data && Object.keys(summaries).length === 0) {
      fetchAllSummaries();
    }
  }, [allTrucksData,  fetchAllSummaries]);

  
  const isLoading = trucksLoading || isLoadingSummaries;


  const chartData = useMemo(() => {
    const validTrucks = (allTrucksData?.data?.data || []).filter(truck => 
      truck.id && summaries[truck.id]
    );

    if (validTrucks.length === 0) return null;

    const labels = validTrucks.map(
      (truck) => `Truck ${truck.truckId} (${truck.plateNumber})`
    );

    const milesData = validTrucks.map((truck) => 
      summaries[truck.id!]?.summary?.totalMiles || 0
    );
    
    const profitData = validTrucks.map((truck) => 
      summaries[truck.id!]?.summary?.netProfit || 0
    );

    const generateColors = (count: number) => {
      const baseColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#C9CBCF', '#4BC0C0', '#FF6384'
      ];
      return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
    };

    const colors = generateColors(validTrucks.length);

    return {
      milesChart: {
        labels,
        datasets: [
          {
            label: 'Total Miles',
            data: milesData,
            backgroundColor: colors,
            borderColor: colors,
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
            borderColor: colors,
            borderWidth: 2,
          },
        ],
      },
    };
  }, [allTrucksData, summaries]);

  // filter and search 
  const debouncedSearch = useDebounce(hasUserInteracted ? search : "", 400);

  const filteredTrucks = useMemo(() => {
    const allTrucks = allTrucksData?.data?.data || [];
    
    if (!hasUserInteracted || !debouncedSearch) return allTrucks;
    
    const term = debouncedSearch.toLowerCase();
    return allTrucks.filter((t) => {
      const id = String(t.truckId || "").toLowerCase();
      const model = String(t.model || "").toLowerCase();
      const plate = String(t.plateNumber || "").toLowerCase();

      return id.includes(term) || model.includes(term) || plate.includes(term);
    });
  }, [allTrucksData, debouncedSearch, hasUserInteracted]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    
    if (!hasUserInteracted && value.trim() !== "") {
      setHasUserInteracted(true);
    }
  }, [hasUserInteracted]);

  const handleViewStats = useCallback((truckId: string) => {
    sessionStorage.setItem('truckDashboardSearch', search);
    sessionStorage.setItem('truckDashboardHasInteracted', hasUserInteracted.toString());
    router.push(`/admin/truckSummary/${truckId}`);
  }, [router, search, hasUserInteracted]);

  // ✅ TruckRow component 
  const TruckRow = React.memo(({ 
    truck, 
    index, 
    onViewStats,
    summary
  }: { 
    truck: TTruck; 
    index: number; 
    onViewStats: (id: string) => void;
    summary?: TTruckSummary;
  }) => {
    return (
      <TableRow key={truck.id} hover>
        <TableCell>{index + 1}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IoCar size={18} color="#64748b" />
            <Typography>{truck.truckId}</Typography>
          </Box>
        </TableCell>

        {/* Loads */}
        <TableCell align="right">
          {!summary ? (
            <Skeleton width={60} height={18} />
          ) : (
            summary.summary?.totalLoads || 0
          )}
        </TableCell>

        {/* Miles */}
        <TableCell align="right">
          {!summary ? (
            <Skeleton width={60} height={18} />
          ) : (
            (summary.summary?.totalMiles ?? 0).toLocaleString()
          )}
        </TableCell>

        {/* Gross Revenue */}
        <TableCell align="right">
          {!summary ? (
            <Skeleton width={80} height={18} />
          ) : (
            `$${(summary.summary?.totalRevenue ?? 0).toLocaleString()}`
          )}
        </TableCell>

        {/* Fuel Cost */}
        <TableCell align="right">
          {!summary ? (
            <Skeleton width={60} height={18} />
          ) : (
            `$${(summary.summary?.fuelCost ?? 0).toLocaleString()}`
          )}
        </TableCell>

        {/* Driver Pay */}
        <TableCell align="right">
          {!summary ? (
            <Skeleton width={60} height={18} />
          ) : (
            `$${(summary.summary?.driverPay ?? 0).toLocaleString()}`
          )}
        </TableCell>

        {/* Insurance Cost */}
        <TableCell align="right">
          {!summary ? (
            <Skeleton width={60} height={18} />
          ) : (
            `$${(summary.summary?.insuranceCost ?? 0).toLocaleString()}`
          )}
        </TableCell>

        {/* Repair Cost */}
        <TableCell align="right">
          {!summary ? (
            <Skeleton width={60} height={18} />
          ) : (
            `$${(summary.summary?.repairCost ?? 0).toLocaleString()}`
          )}
        </TableCell>

        {/* Net Profit */}
        <TableCell
          align="right"
          sx={{
            fontWeight: 600,
            color: (summary?.summary?.netProfit ?? 0) >= 0 ? "success.main" : "error.main",
          }}
        >
          {!summary ? (
            <Skeleton width={80} height={18} />
          ) : (
            `$${(summary.summary?.netProfit ?? 0).toLocaleString()}`
          )}
        </TableCell>

        <TableCell align="center">
          <button
            onClick={() => onViewStats(truck.id!)}
            className="flex items-center gap-1 px-3 py-2 bg-blue-950 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <IoStatsChart size={14} />
            Stats
          </button>
        </TableCell>
      </TableRow>
    );
  });
  TruckRow.displayName = 'TruckRow';

  if (trucksLoading)
    return (
      <Box className="flex flex-col items-center justify-center h-[80vh] gap-2">
        <CircularProgress />
        <Typography>Loading all trucks...</Typography>
      </Box>
    );

  if (trucksError)
    return (
      <Box p={3}>
        <Erros message="Failed to load trucks" />
      </Box>
    );

  return (
    <section className="relative p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Titles>Truck Dashboard</Titles>
          <p className="text-slate-600 mt-2 text-sm">
            {allTrucksData?.data?.data ? 
              `Viewing ${allTrucksData.data.data.length} trucks` : 
              'Overview of your truck fleet and performance'
            }
            {isLoadingSummaries && " (Loading summaries...)"}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearch className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by truck id, model or plate..."
            value={search}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Charts */}
      {chartData && <ChartSection chartData={chartData} />}

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: "8px" }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>#</StyledTableCell>
              <StyledTableCell>Truck</StyledTableCell>
              <StyledTableCell align="right">Loads</StyledTableCell>
              <StyledTableCell align="right">Miles</StyledTableCell>
              <StyledTableCell align="right">Gross</StyledTableCell>
              <StyledTableCell align="right">Fuel</StyledTableCell>
              <StyledTableCell align="right">DriverPay</StyledTableCell>
              <StyledTableCell align="right">Insurance</StyledTableCell>
              <StyledTableCell align="right">Repair</StyledTableCell>
              <StyledTableCell align="right">Profit</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrucks.map((truck, i) => (
              <TruckRow 
                key={truck.id}
                truck={truck}
                index={i}
                onViewStats={handleViewStats}
                summary={summaries[truck.id!]}
              />
            ))}
            {filteredTrucks.length === 0 && (
              <TableRow>
                <StyledTableCell colSpan={11} align="center" sx={{ py: 6 }}>
                  {hasUserInteracted && debouncedSearch ? "No trucks found" : `Showing all ${filteredTrucks.length} trucks`}
                </StyledTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
};

export default TruckDashboard;