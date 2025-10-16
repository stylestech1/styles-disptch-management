"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { TDriver, TErrors, TLoads, TStatusLoad ,TLoadSummary,TPeriod} from "@/types/globalTypes";
import Erros from "@/components/ui/Erros";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import {
  IoPersonCircleOutline,
  IoMailOutline,
  IoCallOutline,
  IoIdCardOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoStatsChart,
  IoNavigate,
  IoCashOutline,
  IoTimeOutline,
  IoFilterOutline,
} from "react-icons/io5";
import { FaMoneyBillWave } from "react-icons/fa";
import useLoading from "@/hook/useLoading";
import useError from "@/hook/useError";
import { apiClient } from "@/utils/apiClient";
import DataTable from "@/components/ui/DataTable";
import { driverSummaryColumns } from "@/data/driverSummaryTable";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { motion } from "framer-motion";

// ------------------------- Small reusable components -------------------------

const StatusBadge = ({ status }: { status: TStatusLoad }) => {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    pending: {
      color: "bg-amber-100 text-amber-800 border-amber-300",
      icon: <IoTimeOutline size={14} className="mr-1" />,
    },
    in_transit: {
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <IoNavigate size={14} className="mr-1" />,
    },
    delivered: {
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: <IoCheckmarkCircleOutline size={14} className="mr-1" />,
    },
    cancelled: {
      color: "bg-red-100 text-red-800 border-red-300",
      icon: <IoTimeOutline size={14} className="mr-1" />,
    },
  };

  const config = statusConfig[status] ?? statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      {status.replace("_", " ")}
    </span>
  );
};

const FilterDateRange = ({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  onReset,
}: {
  fromDate: Dayjs | null;
  toDate: Dayjs | null;
  setFromDate: (d: Dayjs | null) => void;
  setToDate: (d: Dayjs | null) => void;
  onReset: () => void;
}) => {
  return (
    <div className="flex items-center gap-3 text-sm bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="From Date"
          value={fromDate}
          onChange={(v) => setFromDate(v)}
          format="YYYY-MM-DD"
          slotProps={{
            textField: { size: "medium", sx: { width: 160 } },
          }}
        />
        <DatePicker
          label="To Date"
          value={toDate}
          onChange={(v) => setToDate(v)}
          format="YYYY-MM-DD"
          slotProps={{
            textField: { size: "medium", sx: { width: 160 } },
          }}
        />
      </LocalizationProvider>

      <button
        onClick={onReset}
        className="px-4 py-2.5 text-sm text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap font-medium"
      >
        Reset
      </button>
    </div>
  );
};

// ------------------------- Main component -------------------------

const LoadSummary = () => {
  const [loadSummary, setLoadSummary] = useState<TLoadSummary[]>([]);
  const [originalLoadSummary, setOriginalLoadSummary] = useState<TLoadSummary[]>([]);
  const [drivers, setDrivers] = useState<TDriver[]>([]);
  const [profile, setProfile] = useState<TDriver | null>(null);
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [search, setSearch] = useState("");

  const { id } = useParams();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const { loading, setLoading } = useLoading();
  const { error, setError } = useError();
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // Unified data fetch (drivers + profile + summary) using Promise.all
  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const driversReq = apiClient(`${apiURL}/api/v1/drivers`, token);
        const profileReq = id ? apiClient(`${apiURL}/api/v1/drivers/${id}`, token) : Promise.resolve({ data: null });
        const summaryReq = id ? apiClient(`${apiURL}/api/v1/loads/driver-summary/${id}`, token) : Promise.resolve({ data: [] });

        const [driversRes, profileRes, summaryRes] = await Promise.all([driversReq, profileReq, summaryReq]);

        setDrivers(driversRes?.data as TDriver[]);
        setProfile(profileRes?.data as TDriver);

        const summaryData = Array.isArray(summaryRes?.data) ? summaryRes.data : (summaryRes?.data ? [summaryRes.data] : []);
        setLoadSummary(summaryData);
        setOriginalLoadSummary(summaryData);
      } catch (err) {
        console.error("Fetch error:", err);
        const msg = err instanceof Error ? err.message : "Failed to fetch data";
        setError(msg);
        toast.error(msg, { style: { background: "#dc2626", color: "#fff" } });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [apiURL, token, id, router, setLoading, setError]);

  // derived flattenedLoads memoized
  const flattenedLoads = useMemo(() => loadSummary.flatMap((s) => s.loads), [loadSummary]);

  // Apply date filtering + search filtering
  useEffect(() => {
    if (!originalLoadSummary.length) return;

    const filteredSummary = originalLoadSummary.map((summary) => {
      const filtered = summary.loads.filter((load) => {
        const loadDateStr = load.deliveredAt || load.createdAt;
        if (!loadDateStr) return false;
        const loadDay = dayjs(loadDateStr);

        const fromOk = !fromDate || loadDay.isAfter(fromDate.subtract(1, "day"));
        const toOk = !toDate || loadDay.isBefore(toDate.add(1, "day"));

        const matchesDate = fromOk && toOk;
        const matchesSearch = search ? (load.loadId ?? "").toLowerCase().includes(search.toLowerCase()) : true;

        return matchesDate && matchesSearch;
      });

      const totalLoads = filtered.length;
      const totalMiles = filtered.reduce((s, l) => s + (l.distanceMiles || 0), 0);
      const totalEarnings = filtered.reduce((s, l) => s + (l.totalPrice || 0), 0);
      const pricePerMile = totalMiles > 0 ? totalEarnings / totalMiles : 0;

      return { ...summary, loads: filtered, totalLoads, totalMiles, totalEarnings, pricePerMile };
    });

    setLoadSummary(filteredSummary);
  }, [fromDate, toDate, search, originalLoadSummary]);

  const resetFilter = useCallback(() => {
    setFromDate(null);
    setToDate(null);
    setSearch("");
  }, []);

  const renderDriverSummaryRow = useCallback((load: TLoads, index: number) => (
    <tr key={index} className="hover:bg-slate-50 transition-colors group">
      <td className="p-4 font-medium text-slate-900">
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{load.loadId}</span>
      </td>
      <td className="p-4 text-slate-700 max-w-[140px]">
        <div className="truncate" title={load.origin}>{load.origin}</div>
      </td>
      <td className="p-4 text-slate-700 max-w-[140px]">
        <div className="truncate" title={load.destination}>{load.destination}</div>
      </td>
      <td className="p-4 text-right text-slate-700 font-medium">{(load.distanceMiles || 0).toLocaleString()}</td>
      <td className="p-4 text-right text-slate-700">{load.currency} {Number(load.pricePerMile || 0).toFixed(2)}</td>
      <td className="p-4 text-right font-semibold text-emerald-700">{load.currency} {Number(load.totalPrice || 0).toLocaleString()}</td>
      <td className="p-4 text-center"><StatusBadge status={load.status} /></td>
      <td className="p-4 text-slate-700 font-mono text-xs">{load.truckId?.plateNumber || "-"}</td>
      <td className="p-4 text-center text-slate-600 text-xs">{load.deliveredAt ? load.deliveredAt.split("T")[0] : "-"}</td>
    </tr>
  ), []);

  if (loading) {
    return (
      <section className="container mx-auto p-6">
        <Titles>Driver Summary</Titles>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {[1, 2, 3].map((i) => (
            <motion.div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
          ))}
      </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <Titles>Driver Summary</Titles>
          <p className="text-slate-600 mt-1 text-sm py-4">Detailed overview of driver performance and loads</p>
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search loadId..."
              className="px-3 py-2 border border-slate-200 rounded-md text-sm outline-none"
            />
            <button onClick={() => setSearch("")} className="text-sm text-slate-600">Clear</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FilterDateRange fromDate={fromDate} toDate={toDate} setFromDate={setFromDate} setToDate={setToDate} onReset={resetFilter} />

       
        </div>
      </div>

      {(fromDate || toDate || search) && (
        <div className="flex items-center justify-between text-sm text-slate-700 mb-6 border border-slate-200 rounded-lg px-4 py-3 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <IoFilterOutline className="text-blue-600" size={18} />
            <span className="text-blue-600 font-medium">Active Filter:</span>
            <span className="font-semibold text-blue-800">{fromDate ? fromDate.format("YYYY-MM-DD") : "Any"} → {toDate ? toDate.format("YYYY-MM-DD") : "Any"}</span>
            <span className="text-xs text-blue-500 ml-2">({flattenedLoads.length} loads)</span>
          </div>
          <button onClick={resetFilter} className="text-blue-700 hover:text-blue-900 font-medium text-sm bg-white hover:bg-blue-100 px-3 py-1.5 border border-blue-300 rounded-md transition-colors">Clear Filter</button>
        </div>
      )}

      {error && <div className="mb-6"><Erros message={error} /></div>} 

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {profile && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-slate-100 rounded-xl">
                <IoPersonCircleOutline size={28} className="text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{profile.name}</h3>
                <p className="text-slate-500 text-sm mt-0.5">{profile.driverId}</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-sm"><IoMailOutline className="text-slate-400" size={16} /><span className="text-slate-600 truncate">{profile.email}</span></div>
              <div className="flex items-center gap-3 text-sm"><IoCallOutline className="text-slate-400" size={16} /><span className="text-slate-600">{profile.phone}</span></div>
              <div className="flex items-center gap-3 text-sm"><IoIdCardOutline className="text-slate-400" size={16} /><span className="text-slate-600 font-mono text-xs">{profile.licenseNumber}</span></div>
              <div className="flex items-center gap-3 text-sm"><IoCalendarOutline className="text-slate-400" size={16} /><span className="text-slate-600">{new Date(profile.hireDate).toLocaleDateString()}</span></div>
              <div className="flex items-center gap-3 text-sm"><IoCheckmarkCircleOutline className="text-slate-400" size={16} /><span className={`px-2.5 py-1 rounded-full text-xs font-medium`}>{profile.status}</span></div>
            </div>
          </div>
        )}

        {loadSummary.length > 0 && loadSummary.map((sum, i) => (
          <div key={i} className="xl:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Total Loads</p>
                    <p className="text-2xl font-bold text-slate-800">{sum.totalLoads}</p>
                  </div>
                  <div className="p-2.5 bg-blue-50 rounded-lg"><IoStatsChart size={20} className="text-blue-600" /></div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Total Miles</p>
                    <p className="text-2xl font-bold text-slate-800">{sum.totalMiles.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-lg"><IoNavigate size={20} className="text-emerald-600" /></div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold text-slate-800">{sum.currency} {sum.totalEarnings.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-lg"><IoCashOutline size={20} className="text-amber-600" /></div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Price Per Mile</p>
                    <p className="text-2xl font-bold text-slate-800">{sum.currency} {sum.pricePerMile.toFixed(2)}</p>
                  </div>
                  <div className="p-2.5 bg-red-50 rounded-lg"><FaMoneyBillWave size={20} className="text-red-500" /></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><IoCalendarOutline size={14} className="flex-shrink-0" /><span>Period: </span><span className="font-medium text-slate-700">{sum.period.from.split("T")[0]} to {sum.period.to.split("T")[0]}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Load Details</h3>
          <p className="text-slate-500 text-sm">Detailed breakdown of all loads</p>
        </div>

        {flattenedLoads.length > 0 ? (
          <DataTable columns={driverSummaryColumns} data={flattenedLoads} renderRow={renderDriverSummaryRow} loading={loading} />
        ) : (
          <div className="px-4 py-12 text-center text-slate-500">
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl mb-3">📦</div>
              <div className="text-slate-600">{fromDate || toDate || search ? "No load records found for the selected filter" : "No load records found"}</div>
              <div className="text-slate-400 text-sm mt-1">{fromDate || toDate || search ? "Please adjust your filters" : "There are no loads available for this driver"}</div>
            </div>
          </div>
        )}
      </div>

      {loadSummary.length > 0 && (
        <div className="mt-6 flex justify-end">
          <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
            <p className="text-sm text-slate-600">Showing {flattenedLoads.length} loads{(fromDate || toDate || search) && " (filtered)"}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default LoadSummary;
