"use client";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { TLoads, TStatusLoad } from "@/types/globalTypes";
import { useState, useEffect } from "react";
import Erros from "@/components/ui/Erros";
import toast, { Toaster } from "react-hot-toast";
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
  IoArrowBack,
} from "react-icons/io5";
import { FaMoneyBillWave } from "react-icons/fa";
import useError from "@/hook/useError";
import DataTable from "@/components/ui/DataTable";
import { driverSummaryColumns } from "@/data/driverSummaryTable";

// ✅ Import DateTimePicker
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Dayjs } from "dayjs";
import DateRangeFilter from "@/components/ui/Filter";
import {
  useGetDriverByIdQuery,
  useGetDriverSummaryWithFilterQuery,
} from "@/redux/slices/apiSlice";
import { useSearch } from "@/hook/useSearch";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Box } from "@mui/material";
import { RootState, useAppSelector } from "@/redux/store";

const DriverSummary = () => {
  const { id } = useParams();
  const router = useRouter();
  const { error, setError } = useError();
  const theme = useAppSelector((state: RootState) => state.palette)

  // ✅ Filter + Search
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);

  // ✅ Profile Query
  const { data: profileData, isLoading: profileLoading } =
    useGetDriverByIdQuery(id as string, { skip: !id });

  // ✅ Lazy Query for filtered data
  const {
    data: driverSummaryData,
    isLoading: summaryLoading,
    isFetching: summaryFetching,
    error: summaryError,
  } = useGetDriverSummaryWithFilterQuery({
    id: id as string,
    from: fromDate ? fromDate.toISOString() : undefined,
    to: toDate ? toDate.toISOString() : undefined,
  });

  // ✅ Error handling
  useEffect(() => {
    if (summaryError) {
      const errorMessage = getErrorMessage(summaryError);
      setError(errorMessage);
      toast.error(errorMessage || "Failed to load summary ❌", {
        style: { background: "#dc2626", color: "#fff" },
      });
    }
  }, [summaryError, setError]);

  const profile = profileData?.data;
  const summaryData = driverSummaryData?.data;

  // ✅ Search
  const loadsData: TLoads[] = Array.isArray(summaryData?.loads)
    ? summaryData.loads
    : [];

  const { filteredData: searchedDriver } = useSearch<TLoads>({
    data: loadsData,
    searchFields: ["loadId", "truckId.truckId"],
    initialSearch: searchInput,
  });

  const displayedData = searchInput ? searchedDriver : loadsData;

  // ✅ Apply Filter
  const handleApplyFilter = (from: Dayjs | null, to: Dayjs | null) => {
    setFromDate(from);
    setToDate(to);
    setIsFilterActive(!!from || !!to);
  };

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

  // ✅ Table Row Renderer for Loads
  const renderDriverSummaryRow = (load: TLoads, index: number) => (
    <tr
      key={load.loadId || index}
      className="hover:bg-slate-50 transition-colors group"
    >
      {/* Load ID */}
      <td className="p-4 font-medium text-slate-900">
        <span className="text-xs bg-slate-100 px-2 py-1 rounded">
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

      {/* Truck */}
      <td className="p-4 text-slate-700 text-sm">
        {load.truckId?.truckId || "-"}
      </td>

      {/* Delivered */}
      <td className="p-4 text-center text-slate-600 text-xs">
        {load.deliveredAt ? load.deliveredAt.split("T")[0] : "-"}
      </td>
    </tr>
  );

  // ✅ Intelligent Loading
  const isInitialLoading = profileLoading || (!summaryData && summaryLoading);

  if (isInitialLoading) return <Loading />;

  return (
    <section className="container mx-auto p-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push("/admin/drivers")}
              className="flex items-center w-fit cursor-pointer gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <IoArrowBack size={20} />
              Back
            </button>
            <div>
              <Titles>Driver Summary - ({profile?.driverId})</Titles>
              <p className="text-slate-600 mt-2 text-sm">
                Detailed overview of driver information and performance
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

      {/* Driver Profile Card */}
      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Driver Information */}
          <Box sx={{bgcolor: theme.currentPalette.background}} className="rounded-xl border shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <Box sx={{borderColor: theme.currentPalette.text}} className="p-3 border rounded-xl">
                <IoPersonCircleOutline size={32} className="text-slate-600" />
              </Box>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {profile.name}
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  Driver ID: {profile.driverId}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3 text-sm">
                  <IoMailOutline className="text-slate-400" size={18} />
                  <span className="text-slate-600">Email</span>
                </div>
                <span className="font-medium text-slate-800">
                  {profile.email}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3 text-sm">
                  <IoCallOutline className="text-slate-400" size={18} />
                  <span className="text-slate-600">Phone</span>
                </div>
                <span className="font-medium text-slate-800">
                  {profile.phone}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3 text-sm">
                  <IoIdCardOutline className="text-slate-400" size={18} />
                  <span className="text-slate-600">License Number</span>
                </div>
                <span className="font-medium text-slate-800">
                  {profile.licenseNumber}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3 text-sm">
                  <IoCalendarOutline className="text-slate-400" size={18} />
                  <span className="text-slate-600">Hire Date</span>
                </div>
                <span className="font-medium text-slate-800">
                  {new Date(profile.hireDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-sm">
                  <IoCheckmarkCircleOutline
                    className="text-slate-400"
                    size={18}
                  />
                  <span className="text-slate-600">Status</span>
                </div>
                <StatusBadge status={profile.status} />
              </div>
            </div>
          </Box>

          {/* Stats Cards */}
          <div className="space-y-4">
            <Box sx={{bgcolor: theme.currentPalette.background}} className="rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-slate-800">
                  Quick Stats
                </h4>
                <IoStatsChart size={24} className="text-blue-500" />
              </div>
              <div className="space-y-3">
                <Box sx={{borderColor: theme.currentPalette.text}} className="flex justify-between items-center p-3 border-b rounded-lg">
                  <span className="text-slate-600">Driver ID</span>
                  <span className="font-semibold text-slate-800">
                    {profile.driverId}
                  </span>
                </Box>
                <Box className="flex justify-between items-center p-3 rounded-lg">
                  <span className="text-slate-600">Price Per Mile</span>
                  <span className="font-semibold text-slate-800">
                    ${profile.pricePerMile?.toFixed(2)}
                  </span>
                </Box>
              </div>
            </Box>

            {/* Status Overview */}
            <Box sx={{bgcolor: theme.currentPalette.background}} className="rounded-xl border shadow-sm p-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">
                Status Overview
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Current Status</span>
                  <StatusBadge status={profile.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Availability</span>
                  <span
                    className={`font-medium ${
                      profile.status === "available"
                        ? "text-emerald-600"
                        : profile.status === "busy"
                        ? "text-blue-600"
                        : "text-slate-600"
                    }`}
                  >
                    {profile.status === "available"
                      ? "Available"
                      : profile.status === "busy"
                      ? "On Duty"
                      : "Inactive"}
                  </span>
                </div>
              </div>
            </Box>
          </div>
        </div>
      )}

      {/* ✅ Financial Summary Section */}
      {summaryData && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Driver Summary Stats */}
          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Total Loads Card */}
              <div className="rounded-xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">
                      Total Loads
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {summaryData.totalLoads}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg">
                    <IoStatsChart size={20} className="text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Total Miles Card */}
              <div className=" rounded-xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">
                      Total Miles
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {summaryData.totalMiles?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg">
                    <IoNavigate size={20} className="text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Total Earnings Card */}
              <div className="rounded-xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">
                      Total Earnings
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {summaryData.currency}{" "}
                      {summaryData.totalEarnings?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg">
                    <IoCashOutline size={20} className="text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Avg Price/Mile Card */}
              <div className="rounded-xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">
                      Avg Price/Mile
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {summaryData.currency}{" "}
                      {summaryData.pricePerMile?.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg">
                    <FaMoneyBillWave size={20} className="text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Period Info */}
            {summaryData && (
              <div className="flex justify-between items-center rounded-xl border p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <IoCalendarOutline size={14} className="flex-shrink-0" />
                    <span>Period: </span>
                    <span className="font-medium text-slate-700">
                      {isFilterActive
                        ? `${
                            fromDate ? fromDate.format("YYYY-MM-DD") : "Any"
                          } to ${toDate ? toDate.format("YYYY-MM-DD") : "Any"}`
                        : "All time"}
                    </span>
                    {(fromDate || toDate) && (
                      <span className="text-xs text-blue-500 ml-2">
                        ({displayedData.length} loads)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* ✅ Filter */}
                  <DateRangeFilter onApply={handleApplyFilter} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ Loads Table Section */}
      {displayedData && (
        <div className="rounded-xl border shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  Load Details
                </h3>
                <p className="text-slate-500 text-sm">
                  Detailed breakdown of all loads assigned to this driver
                  {isFilterActive && " (filtered)"}
                </p>
              </div>
            </div>
          </div>

          {/* Table For Driver Loads Summary */}
          {displayedData.length > 0 ? (
            <DataTable
              columns={driverSummaryColumns}
              data={displayedData}
              renderRow={renderDriverSummaryRow}
              loading={isInitialLoading}
            />
          ) : (
            <div className="px-4 py-12 text-center text-slate-500">
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl mb-3">📦</div>
                <div className="text-slate-600">
                  {isFilterActive
                    ? "No load records found for the selected date range"
                    : "No load records found"}
                </div>
                <div className="text-slate-400 text-sm mt-1">
                  {isFilterActive
                    ? "Please adjust your date filter"
                    : "There are no loads available for this driver"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ Summary Footer */}
      {displayedData && (
        <div className="mt-6 flex justify-end">
          <div className="rounded-lg px-4 py-3 border">
            <p className="text-sm text-slate-600">
              Showing {displayedData.length} loads
              {isFilterActive && " (filtered)"}
            </p>
          </div>
        </div>
      )}

      {!profile && !isInitialLoading && (
        <div className="rounded-xl border shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">👨‍💼</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Driver Not Found
          </h3>
          <p className="text-slate-600 mb-4">
            {
              "The driver you're looking for doesn't exist or you don't have access to it."
            }
          </p>
          <button
            onClick={() => router.push("/admin/drivers")}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Back to Drivers
          </button>
        </div>
      )}
    </section>
  );
};

export default DriverSummary;
