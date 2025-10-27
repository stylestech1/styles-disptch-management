"use client";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import {
  TLoads,
  TStatusLoad,
} from "@/types/globalTypes";
import { useState, useEffect } from "react";
import Erros from "@/components/ui/Erros";
import { Toaster } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import {
  IoCar,
  IoCalendarOutline,
  IoScaleOutline,
  IoConstructOutline,
  IoCheckmarkCircleOutline,
  IoStatsChart,
  IoNavigate,
  IoCashOutline,
  IoTimeOutline,
  IoIdCardOutline,
  IoPersonOutline,
  IoArrowBack,
} from "react-icons/io5";
import { FaMoneyBillWave } from "react-icons/fa";
import useError from "@/hook/useError";
import DataTable from "@/components/ui/DataTable";
import { truckSummaryColumns } from "@/data/truckSummaryTable";

// ✅ Import RTK Query hooks
import {
  useGetTruckByIdQuery,
  useLazyGetTruckSummaryQuery,
  useLazyGetTruckSummaryWithFilterQuery,
} from "@/redux/slices/truckApi";
import { applyGlobalFilter, resetGlobalFilter } from "@/utils/filterUtils";

const TruckSummary = () => {
  const { id } = useParams();
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const router = useRouter();
  const { error, setError } = useError();

  // ✅ استخدام RTK Query hooks
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useGetTruckByIdQuery(id as string, {
    skip: !id,
  });

  const [
    fetchTruckSummary,
    { data: truckSummaryData, isLoading: summaryLoading, isError: summaryError },
  ] = useLazyGetTruckSummaryQuery();
const [fetchTruckSummaryWithFilter] = useLazyGetTruckSummaryWithFilterQuery();

  const profile = profileData?.data;
  const truckSummary = truckSummaryData?.data;

  // ✅ fetching
  useEffect(() => {
    if (id) {
      fetchTruckSummary(id as string);
    }
  }, [id, fetchTruckSummary]);


 const handleApplyFilter = async () => {
  if (!id) return;
  const truckId = Array.isArray(id) ? id[0] : id;

  try {
    await applyGlobalFilter({
      id: truckId,
      fromDate,
      toDate,
      fetchFunction: (params) =>
        fetchTruckSummaryWithFilter(params).unwrap(),
    });
    toast.success("Filter applied successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to apply filter");
  }
};


const handleReset = async () => {
  if (!id) return;
  const truckId = Array.isArray(id) ? id[0] : id;

  setFromDate("");
  setToDate("");

  try {
    await resetGlobalFilter({
      id: truckId,
      fetchFunction: (params) =>
        fetchTruckSummaryWithFilter(params).unwrap(),
    });
    toast.success("Filter reset successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to reset filter");
  }
};



  useEffect(() => {
    if (profileError || summaryError) {
      const errorMessage = getErrorMessage(profileError || summaryError);
      setError(errorMessage || "Failed to load data");
    }
  }, [profileError, summaryError, setError]);

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      available: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: <IoCheckmarkCircleOutline size={14} className="mr-1" />,
      },
      busy: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: <IoNavigate size={14} className="mr-1" />,
      },
      maintenance: {
        color: "bg-amber-100 text-amber-800 border-amber-300",
        icon: <IoConstructOutline size={14} className="mr-1" />,
      },
      inactive: {
        color: "bg-slate-100 text-slate-800 border-slate-300",
        icon: <IoTimeOutline size={14} className="mr-1" />,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.inactive;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.icon}
        {status}
      </span>
    );
  };

  // Load Status badge component
  const LoadStatusBadge = ({ status }: { status: TStatusLoad }) => {
    const statusConfig = {
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

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.icon}
        {status.replace("_", " ")}
      </span>
    );
  };

  // Type badge component
  const TypeBadge = ({ type }: { type: string }) => {
    const typeConfig = {
      reefer: { color: "bg-blue-100 text-blue-800 border-blue-300" },
      van: { color: "bg-slate-100 text-slate-800 border-slate-300" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || {
      color: "bg-slate-100 text-slate-800 border-slate-300",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {type || "Not specified"}
      </span>
    );
  };

  // TODO: Table Row Renderer للـ Loads
  const renderTruckSummaryRow = (load: TLoads, index: number) => (
    <tr key={index} className="hover:bg-slate-50 transition-colors group">
      {/* Load ID */}
      <td className="p-4 font-medium text-slate-900">
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
          {load.loadId}
        </span>
      </td>

      {/* Origin */}
      <td className="p-4 text-slate-700 max-w-[140px]">
        <div className="truncate" title={load.origin}>
          {load.origin}
        </div>
      </td>

      {/* Destination */}
      <td className="p-4 text-slate-700 max-w-[140px]">
        <div
          className="truncate"
          title={
            Array.isArray(load.destination)
              ? load.destination.join(", ")
              : load.destination
          }
        >
          {Array.isArray(load.destination)
            ? load.destination.join(", ")
            : load.destination}
        </div>
      </td>

      {/* Miles */}
      <td className="p-4 text-right text-slate-700 font-medium">
        {load.distanceMiles?.toLocaleString()}
      </td>

      {/* Price/Mile */}
      <td className="p-4 text-right text-slate-700">
        {load.currency} {load.pricePerMile?.toFixed(2)}
      </td>

      {/* Total */}
      <td className="p-4 text-right font-semibold text-emerald-700">
        {load.currency} {load.totalPrice?.toLocaleString()}
      </td>

      {/* Status */}
      <td className="p-4 text-center">
        <LoadStatusBadge status={load.status} />
      </td>

      {/* Driver */}
      <td className="p-4 text-slate-700 text-sm">
        {load.driverId?.name || "-"}
      </td>

      {/* Delivered */}
      <td className="p-4 text-center text-slate-600 text-xs">
        {load.deliveredAt ? load.deliveredAt.split("T")[0] : "-"}
      </td>
    </tr>
  );

  const flattenedLoads = truckSummary?.loads || [];
  const loading = profileLoading || summaryLoading;

  if (loading) return <Loading />;

  return (
    <section className="container mx-auto p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/truckDashboard")}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <IoArrowBack size={20} />
              Back
            </button>
            <div>
              <Titles>Truck Summary - {profile?.truckId}</Titles>
              <p className="text-slate-600 mt-2 text-sm">
                Detailed overview of truck information and performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Truck Profile Card */}
      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Truck Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-slate-100 rounded-xl">
                <IoCar size={32} className="text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {profile.model}
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  Truck ID: {profile.truckId}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <IoIdCardOutline className="text-slate-400" size={18} />
                  <span className="text-slate-600">Plate Number</span>
                </div>
                <span className="font-mono font-medium text-slate-800">
                  {profile.plateNumber}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <IoCar className="text-slate-400" size={18} />
                  <span className="text-slate-600">Type</span>
                </div>
                <TypeBadge type={profile.type} />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <IoCalendarOutline className="text-slate-400" size={18} />
                  <span className="text-slate-600">Year</span>
                </div>
                <span className="font-medium text-slate-800">
                  {profile.year}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <IoScaleOutline className="text-slate-400" size={18} />
                  <span className="text-slate-600">Capacity</span>
                </div>
                <span className="font-medium text-slate-800">
                  {profile.capacity} kg
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <IoCheckmarkCircleOutline
                    className="text-slate-400"
                    size={18}
                  />
                  <span className="text-slate-600">Status</span>
                </div>
                <StatusBadge status={profile.status} />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-sm">
                  <IoPersonOutline className="text-slate-400" size={18} />
                  <span className="text-slate-600">Created By</span>
                </div>
                <span className="font-medium text-slate-800">
                  {profile.createdBy}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-slate-800">
                  Quick Stats
                </h4>
                <IoStatsChart size={24} className="text-blue-500" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Truck ID</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {profile.truckId}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Vehicle Age</span>
                  <span className="font-semibold text-slate-800">
                    {new Date().getFullYear() - profile.year} years
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Capacity Category</span>
                  <span className="font-semibold text-slate-800">
                    {profile.capacity >= 20000 ? "Heavy Duty" : "Medium Duty"}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Overview */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">
                Status Overview
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Current Status</span>
                  <StatusBadge status={profile.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Vehicle Type</span>
                  <TypeBadge type={profile.type} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Availability</span>
                  <span
                    className={`font-medium ${profile.status === "available"
                      ? "text-emerald-600"
                      : "text-amber-600"
                      }`}
                  >
                    {profile.status === "available"
                      ? "Available"
                      : "Not Available"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Financial Summary Section */}
      {truckSummary && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Truck Summary Stats */}
          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Total Loads Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">
                      Total Loads
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {truckSummary.summary.totalLoads}
                    </p>
                  </div>
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <IoStatsChart size={20} className="text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Total Miles Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">
                      Total Miles
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {truckSummary.summary.totalMiles.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-lg">
                    <IoNavigate size={20} className="text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Total Revenue Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {truckSummary.summary.currency}{" "}
                      {truckSummary.summary.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-lg">
                    <IoCashOutline size={20} className="text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Net Profit Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">
                      Net Profit
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {truckSummary.summary.currency}{" "}
                      {truckSummary.summary.netProfit.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2.5 bg-red-50 rounded-lg">
                    <FaMoneyBillWave size={20} className="text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Period Info */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <IoCalendarOutline size={14} className="flex-shrink-0" />
                  <span>Period: </span>
                  <span className="font-medium text-slate-700">
                    {truckSummary.period.from.split("T")[0]} to{" "}
                    {truckSummary.period.to.split("T")[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}




      {/* ✅ Loads Table Section */}
      {truckSummary && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header مع الفلترة */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  Load Details
                </h3>
              </div>
            </div>
                {/* ✅ Filter Section */}
          <div className="flex flex-wrap items-center gap-3 mb-5 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex flex-col">
              <label className="text-sm text-slate-600 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-slate-600 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 mt-5 sm:mt-6">
              <button
                onClick={handleApplyFilter}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Apply Filter
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          </div>
          {/* Table For Truck Loads Summary */}
          {(flattenedLoads as TLoads[]).length > 0 ? (
            <DataTable
              columns={truckSummaryColumns}
              data={flattenedLoads as TLoads[]}
              renderRow={renderTruckSummaryRow}
              loading={loading}
            />
          ) : (
            <div className="px-4 py-12 text-center text-slate-500">
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl mb-3">📦</div>
                <div className="text-slate-600">
                  {fromDate || toDate
                    ? "No load records found for the selected date range"
                    : "No load records found"}
                </div>
                <div className="text-slate-400 text-sm mt-1">
                  {fromDate || toDate
                    ? "Please adjust your date filter"
                    : "There are no loads available for this truck"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ Summary Footer */}
      {truckSummary && (
        <div className="mt-6 flex justify-end">
          <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
            <p className="text-sm text-slate-600">
              Showing {(flattenedLoads as TLoads[]).length} loads
              {(fromDate || toDate) && " (filtered)"}
            </p>
          </div>
        </div>
      )}

      {!profile && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">🚛</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Truck Not Found
          </h3>
          <p className="text-slate-600 mb-4">
            {
              "The truck you're looking for doesn't exist or you don't have access to it."
            }
          </p>
          <button
            onClick={() => router.push("/admin/trucks")}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Back to Trucks
          </button>
        </div>
      )}
    </section>
  );
};

export default TruckSummary;
