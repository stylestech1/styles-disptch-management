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
  useLazyGetTruckSummaryQuery,
  useGetTruckSummaryQuery 
} from "@/redux/slices/truckApi";

// ✅ Styled cell
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

// ✅ Debounce hook
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

const TruckRow = React.memo(({ 
  truck, 
  index, 
  onViewStats 
}: { 
  truck: TTruck; 
  index: number; 
  onViewStats: (id: string) => void; 
}) => {
  const { data: summaryData, isLoading: summaryLoading } = useGetTruckSummaryQuery(
    truck.id, 
    { 
      skip: !truck.id,
      refetchOnMountOrArgChange: false,
    }
  );

  const summary = summaryData?.data?.summary;

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
        {summaryLoading ? <Skeleton width={40} height={18} /> : summary?.totalLoads ?? 0}
      </TableCell>

      {/* Miles */}
      <TableCell align="right">
        {summaryLoading ? <Skeleton width={60} height={18} /> : (summary?.totalMiles ?? 0).toLocaleString()}
      </TableCell>

      {/* Gross Revenue */}
      <TableCell align="right">
        {summaryLoading ? <Skeleton width={80} height={18} /> : `$${(summary?.totalRevenue ?? 0).toLocaleString()}`}
      </TableCell>

      {/* Fuel Cost */}
      <TableCell align="right">
        {summaryLoading ? <Skeleton width={60} height={18} /> : `$${(summary?.fuelCost ?? 0).toLocaleString()}`}
      </TableCell>

      {/* Driver Pay */}
      <TableCell align="right">
        {summaryLoading ? <Skeleton width={60} height={18} /> : `$${(summary?.driverPay ?? 0).toLocaleString()}`}
      </TableCell>

      {/* Insurance Cost */}
      <TableCell align="right">
        {summaryLoading ? <Skeleton width={60} height={18} /> : `$${(summary?.insuranceCost ?? 0).toLocaleString()}`}
      </TableCell>

      {/* Repair Cost */}
      <TableCell align="right">
        {summaryLoading ? <Skeleton width={60} height={18} /> : `$${(summary?.repairCost ?? 0).toLocaleString()}`}
      </TableCell>

      {/* Net Profit */}
      <TableCell
        align="right"
        sx={{
          fontWeight: 600,
          color: (summary?.netProfit ?? 0) >= 0 ? "success.main" : "error.main",
        }}
      >
        {summaryLoading ? <Skeleton width={80} height={18} /> : `$${(summary?.netProfit ?? 0).toLocaleString()}`}
      </TableCell>

      <TableCell align="center">
        <button
          onClick={() => onViewStats(truck.id)}
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

const TruckDashboard = () => {
  const [search, setSearch] = useState("");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  const debouncedSearch = useDebounce(hasUserInteracted ? search : "", 400);

  const router = useRouter();
  const { setError } = useError();
  const token = useAppSelector((state: RootState) => state.auth.token);

  const { 
    data: allTrucksData, 
    isLoading, 
    error,
    isFetching 
  } = useGetAllTrucksQuery(undefined, { 
    skip: !token,
    refetchOnMountOrArgChange: false, 
  });

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

  useEffect(() => {
    const savedSearch = sessionStorage.getItem('truckDashboardSearch');
    const savedHasInteracted = sessionStorage.getItem('truckDashboardHasInteracted');
    
    if (savedSearch) {
      setSearch(savedSearch);
      sessionStorage.removeItem('truckDashboardSearch');
    }
    
    if (savedHasInteracted === 'true') {
      setHasUserInteracted(true);
      sessionStorage.removeItem('truckDashboardHasInteracted');
    }
  }, []);

  if (isLoading)
    return (
      <Box className="flex flex-col items-center justify-center h-[80vh] gap-2">
        <CircularProgress />
        <Typography>Loading all trucks...</Typography>
      </Box>
    );

  if (error)
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