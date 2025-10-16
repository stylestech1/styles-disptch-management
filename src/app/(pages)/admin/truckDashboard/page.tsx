"use client";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IoSearch,
  IoCar,
  IoCheckmark,
  IoTime,
  IoStop,
  IoStatsChart,
} from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import { TErrors, TPagination, TTruck } from "@/types/globalTypes";
import { apiFetcher } from "@/utils/APIFetcher";
import StatsCard from "@/components/ui/StatsCard";
import Pagination from "@/components/ui/Pagination";
import useLoading from "@/hook/useLoading";
import useError from "@/hook/useError";
import { apiClient } from "@/utils/apiClient";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, styled, Typography } from '@mui/material';
import { muiTheme } from "@/theme/theme";

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: muiTheme.palette.primary.main,
    color: muiTheme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));



interface TTruckSummary {
  truckId: number;
  summary: {
    totalLoads: number;
    totalMiles: number;
    totalRevenue: number;
    fuelCost: number;
    repairCost: number;
    insuranceCost: number;
    driverPay: number;
    netProfit: number;
    avgRevenuePerMile: number;
    avgExpensePerMile: number;
    currency: string;
  };
}

const TruckDashboard = () => {
  const [trucks, setTrucks] = useState<TTruck[]>([]);
  const [truckSummaries, setTruckSummaries] = useState<{ [key: string]: TTruckSummary }>({});
  const [popup, setPopup] = useState(false);
  const [search, setSearch] = useState("");
  const [allTrucks, setAllTrucks] = useState<TTruck[]>([]);

  const [pagination, setPagination] = useState<TPagination | null>(null);
  const [page, setPage] = useState(1);
  const [newTruck, setNewTruck] = useState({
    plateNumber: "",
    model: "",
    year: "",
    capacity: "",
    status: "available",
    type: "",
    fuelPerMile: "",
    insuranceCost: "",
    repairCost: "",
  });

  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const { loading, setLoading } = useLoading();
  const { error, setError } = useError();
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // Get all Trucks
  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }

    const fetchTrucks = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiURL}/api/v1/trucks`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) {
          if (Array.isArray(result.errors)) {
            result.errors.forEach((err: TErrors) => {
              toast.error(err.msg || "Create user failed", {
                style: { background: "#dc2626", color: "#fff" },
              });
            });
          }
          return;
        }

        setTrucks(result.data?.data || []);
        setPagination(result.data.paginationResult);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message || "Loading Failed");
          toast.error(error.message || "Loading Failed", {
            style: { background: "#dc2626", color: "#fff" },
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrucks();
  }, [apiURL, token, router]);

  // Fetch truck summaries
  const fetchTruckSummaries = async (trucks: TTruck[]) => {
    if (!token) return;

    try {
      const summaries: { [key: string]: TTruckSummary } = {};
      
      for (const { id } of trucks) {
        try {
          const res = await fetch(`${apiURL}/api/v1/loads/truck-summary/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const result = await res.json();
            summaries[id] = result.data;
          }
        } catch (error) {
          console.error(`Error fetching summary for truck ${id}:`, error);
        }
      }

      setTruckSummaries(summaries);
    } catch (error) {
      console.error("Error fetching truck summaries:", error);
    }
  };

  useEffect(() => {
    if (trucks.length > 0) {
      fetchTruckSummaries(trucks);
    }
  }, [trucks, token, apiURL]);

  // Filter TruckId & Model & PlateNumber
  const fetchAllTrucks = async () => {
    try {
      const result = await apiFetcher(`${apiURL}/api/v1/trucks?limit=1000`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setAllTrucks(result.data.data || []);
    } catch (error) {
      console.error("Error fetching all loads:", error);
    }
  };
  
  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }
    fetchAllTrucks();
  }, [apiURL, token, router, page]);

  const filteredTrucks = search
    ? allTrucks.filter(
        (t) =>
          t.truckId.toString().toLowerCase().includes(search.toLowerCase()) ||
          t.model.toLowerCase().includes(search.toLowerCase()) ||
          t.plateNumber.toLowerCase().includes(search.toLowerCase())
      )
    : trucks;

  if (loading) return <Loading />;

  return (
    <section className="relative p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <Titles>Truck Management</Titles>
          <p className="text-slate-600 mt-2 text-sm">
            Manage your truck fleet and financial performance
          </p>
        </div>

      
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearch className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by model or plate number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Trucks"
          value={trucks.length}
          icon={IoCar}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />

        <StatsCard
          title="Available"
          value={trucks.filter((t) => t.status === "available").length}
          icon={IoCheckmark}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
        />

        <StatsCard
          title="Booked"
          value={trucks.filter((t) => t.status === "busy").length}
          icon={IoTime}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />

        <StatsCard
          title="In Active"
          value={trucks.filter((t) => t.status === "inactive").length}
          icon={IoStop}
          iconColor="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      {/* MUI Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table sx={{ minWidth: 700 }} aria-label="trucks financial table">
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <StyledTableCell >#</StyledTableCell>
              <StyledTableCell >Truck ID</StyledTableCell>
              <StyledTableCell  align="right">Total Loads</StyledTableCell>
              <StyledTableCell  align="right">Total Miles</StyledTableCell>
              <StyledTableCell  align="right">Gross($)</StyledTableCell>
              <StyledTableCell  align="right">Fuel Cost ($)</StyledTableCell>
              <StyledTableCell  align="right">Driver Pay ($)</StyledTableCell>
              <StyledTableCell  align="right">Insurance ($)</StyledTableCell>
              <StyledTableCell  align="right">Repair ($)</StyledTableCell>
              <StyledTableCell  align="right">Net Profit ($)</StyledTableCell>
              <StyledTableCell  align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrucks.map((truck, index) => {
              const summary = truckSummaries[truck.id]?.summary;
              
              return (
                <TableRow 
                  key={truck.id} 
                  sx={{ 
                    '&:hover': { backgroundColor: '#f8fafc' },
                    transition: 'background-color 0.2s ease',
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {index + 1}
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IoCar size={18} color="#64748b" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {truck.truckId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {truck.plateNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell align="right" sx={{ color: 'text.secondary' }}>
                    {summary?.totalLoads || 0}
                  </TableCell>

                  <TableCell align="right" sx={{ color: 'text.secondary' }}>
                    {summary?.totalMiles?.toLocaleString() || 0}
                  </TableCell>

                  <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                    ${summary?.totalRevenue?.toLocaleString() || 0}
                  </TableCell>

                  <TableCell align="right" sx={{ color: 'warning.main' }}>
                    ${summary?.fuelCost?.toLocaleString() || 0}
                  </TableCell>

                  <TableCell align="right" sx={{ color: 'info.main' }}>
                    ${summary?.driverPay?.toLocaleString() || 0}
                  </TableCell>

                  <TableCell align="right" sx={{ color: 'primary.main' }}>
                    ${summary?.insuranceCost?.toLocaleString() || 0}
                  </TableCell>

                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    ${summary?.repairCost?.toLocaleString() || 0}
                  </TableCell>

                  <TableCell align="right" sx={{ fontWeight: 600, color: (summary?.netProfit || 0) >= 0 ? 'success.main' : 'error.main' }}>
                    ${summary?.netProfit?.toLocaleString() || 0}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Stats Button */}
                      <button
                        onClick={() => router.push(`/admin/truckSummary/${truck.id}`)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-950 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        <IoStatsChart size={14} />
                        Stats
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Summary Row */}
            {filteredTrucks.length > 0 && (
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell colSpan={2} sx={{ fontWeight: 600, borderTop: '2px solid #e2e8f0' }}>
                  Total
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderTop: '2px solid #e2e8f0' }}>
                  {filteredTrucks.reduce((sum, t) => sum + (truckSummaries[t.id]?.summary?.totalLoads || 0), 0)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderTop: '2px solid #e2e8f0' }}>
                  {filteredTrucks.reduce((sum, t) => sum + (truckSummaries[t.id]?.summary?.totalMiles || 0), 0).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderTop: '2px solid #e2e8f0' }}>
                  ${filteredTrucks.reduce((sum, t) => sum + (truckSummaries[t.id]?.summary?.totalRevenue || 0), 0).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderTop: '2px solid #e2e8f0' }}>
                  ${filteredTrucks.reduce((sum, t) => sum + (truckSummaries[t.id]?.summary?.fuelCost || 0), 0).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderTop: '2px solid #e2e8f0' }}>
                  ${filteredTrucks.reduce((sum, t) => sum + (truckSummaries[t.id]?.summary?.driverPay || 0), 0).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderTop: '2px solid #e2e8f0' }}>
                  ${filteredTrucks.reduce((sum, t) => sum + (truckSummaries[t.id]?.summary?.insuranceCost || 0), 0).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderTop: '2px solid #e2e8f0' }}>
                  ${filteredTrucks.reduce((sum, t) => sum + (truckSummaries[t.id]?.summary?.repairCost || 0), 0).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderTop: '2px solid #e2e8f0', color: 'success.main' }}>
                  ${filteredTrucks.reduce((sum, t) => sum + (truckSummaries[t.id]?.summary?.netProfit || 0), 0).toLocaleString()}
                </TableCell>
                <TableCell sx={{ borderTop: '2px solid #e2e8f0' }}></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        page={page}
        setPage={setPage}
        pageSize={10}
        showInfo={true}
      />
    </section>
  );
};

export default TruckDashboard ;