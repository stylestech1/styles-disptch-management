"use client";
import DataTable from "@/components/ui/DataTable";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Pagination from "@/components/ui/Pagination";
import StatsCard from "@/components/ui/StatsCard";
import StatusBadge from "@/components/ui/StatusBadge";
import Titles from "@/components/ui/Titles";
import { loadColumns } from "@/data/loadTables";
import useError from "@/hook/useError";
import useLoading from "@/hook/useLoading";
import { TLoads } from "@/types/globalTypes";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  IoAdd,
  IoCheckmark,
  IoTime,
  IoCar,
  IoNavigate,
  IoSearch,
  IoLocationSharp,
  IoChatbubbleEllipses,
} from "react-icons/io5";
import {
  useGetLoadsQuery,
  useGetAllLoadsQuery,
  useGetNotesQuery,
  useUploadDocumentsMutation,
  useGetLoadsWithFilterQuery,
} from "@/redux/slices/apiSlice";

// Import the new modal components
import CreateEditLoadModal from "@/components/loads/CreateEditLoadModal";
import { useRouter } from "next/navigation";

const LoadsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Modal states
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);

  // Selected items for modals
  const [selectedLoadForNotes, setSelectedLoadForNotes] =
    useState<TLoads | null>(null);
  const [editingLoad, setEditingLoad] = useState<TLoads | null>(null);
  const { loading, setLoading } = useLoading();
  const { error, setError } = useError();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);

  // RTK Query
  const {
    data: loadsData,
    isLoading: loadsLoading,
    isError: loadsError,
    refetch: refetchLoads,
  } = useGetLoadsQuery({ page, limit: 10 });

  const { data: allLoadsData, isLoading: allLoadsLoading } =
    useGetAllLoadsQuery();

  const { isLoading: notesLoading } = useGetNotesQuery(
    selectedLoadForNotes?.id || "",
    {
      skip: !selectedLoadForNotes?.id,
    }
  );

  const [updateLoads] = useUploadDocumentsMutation();
  const { data: filteredData, refetch: refetchFiltered } = useGetLoadsWithFilterQuery(
    { from: fromDate, to: toDate },
    { skip: !isFiltered } // عشان ميعملش request طول الوقت
  );

  // responses
  const load = isFiltered ? filteredData?.data || [] : loadsData?.data || [];
  const pagination = loadsData?.paginationResult || null;
  const allLoads = allLoadsData?.data || [];

  // إدارة حالة ال loading بناءً على جميع ال queries
  useEffect(() => {
    const isLoading = loadsLoading || allLoadsLoading || notesLoading;
    setLoading(isLoading);
  }, [loadsLoading, allLoadsLoading, notesLoading, setLoading]);

  // إدارة الأخطاء
  useEffect(() => {
    if (loadsError) {
      const errorMessage = getErrorMessage(loadsError);
      setError(errorMessage);
      toast.error(errorMessage || "Loading failed ❌", {
        style: { background: "#dc2626", color: "#fff" },
      });
    }
  }, [loadsError, setError]);

  // Error Handling
  interface RTKError {
    data?: {
      message?: string;
    };
    message?: string;
  }
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }
    // للتعامل مع أخطاء RTK Query
    const rtkError = error as RTKError;
    if (rtkError?.data?.message) {
      return rtkError.data.message;
    }
    if (rtkError?.message) {
      return rtkError.message;
    }
    return "An error occurred";
  };

  // Filter loads للبحث
  const filteredLoads = search
    ? allLoads.filter((l: TLoads) =>
      l.loadId.toLowerCase().includes(search.toLowerCase())
    )
    : load;

  // TODO: set loading
  if (loading) return <Loading />;

  // TODO: Table
  const renderLoadRow = (loadItem: TLoads, index: number) => {


    const hasComments = loadItem.comments && loadItem.comments.length > 0;
    const commentsCount = loadItem.comments?.length || 0;

    return (
      <tr key={index} className="hover:bg-slate-50 transition-colors group cursor-pointer"
        onClick={() => router.push(`/admin/loadDetails/${loadItem.loadId}`)}
      >
        {/* Load ID */}
        <td className="p-4 text-center">
          <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium">
            {loadItem.loadId}
          </span>
        </td>

        {/* Route */}
        <td className="p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-700">
              <IoLocationSharp size={14} className="text-slate-400" />
              <span
                className="text-sm max-w-[120px] truncate"
                title={loadItem.DHO}
              >
                {loadItem.DHO || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <IoNavigate size={14} className="text-slate-400" />
              <span
                className="text-sm max-w-[120px] truncate"
                title={loadItem.origin}
              >
                {loadItem.origin || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <IoCheckmark size={14} className="text-slate-400" />
              <span
                className="text-sm max-w-[120px] truncate"
                title={
                  Array.isArray(loadItem.destination)
                    ? loadItem.destination.join(", ")
                    : loadItem.destination
                }
              >
                {Array.isArray(loadItem.destination)
                  ? loadItem.destination.join(", ")
                  : loadItem.destination || "-"}
              </span>
            </div>
          </div>
        </td>

        {/* Distance */}
        <td className="p-4 text-center text-slate-700 font-medium">
          {loadItem.distanceMiles ? `${loadItem.distanceMiles} mi` : "-"}
        </td>

        {/* Price Per Mile */}
        <td className="p-4 text-center text-slate-700">
          {loadItem.pricePerMile ? `${loadItem.pricePerMile.toFixed(2)} $` : "-"}
        </td>

        {/* Total */}
        <td className="p-4 text-center font-semibold text-emerald-700">
          {loadItem.totalPrice ? `${loadItem.totalPrice} $` : "-"}
        </td>

        {/* Status */}
        <td className="p-4 text-center">
          <StatusBadge status={loadItem.status} size="md" />
        </td>

        {/* Driver */}
        <td className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
              <IoCar size={12} className="text-slate-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900 text-sm">
                {loadItem.driverId?.name || "-"}
              </div>
              <div className="text-xs text-slate-500">
                {loadItem.driverId?.phone || "-"}
              </div>
            </div>
          </div>
        </td>
        {/* Note */}
        <td className="p-4 text-center">
          <div className="flex items-center justify-center">
            {hasComments ? (
              <div
                className="relative cursor-pointer hover:scale-110 transition-transform group/note"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/loadDetails/${loadItem.loadId}?tab=comments`);
                }}
                title={`${commentsCount} comment(s) - Click to view`}
              >
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-sm group-hover/note:bg-amber-600 transition-colors">
                  <IoChatbubbleEllipses size={16} className="text-white" />
                </div>

                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs text-white font-bold">
                    {commentsCount > 9 ? "9+" : commentsCount}
                  </span>
                </div>

                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover/note:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {commentsCount} comment(s)
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            ) : (
              <div
                className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center opacity-50 cursor-pointer hover:opacity-70 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/loadDetails/${loadItem.loadId}?tab=comments`);
                }}
                title="No comments - Click to add"
              >
                <IoChatbubbleEllipses size={16} className="text-slate-500" />
              </div>
            )}
          </div>
        </td>
      </tr>


    );
  }
  return (
    <section className="relative p-6">
      {/* Header */}
      <div className="space-y-6 mb-10">
  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
    <div className="flex-1">
      <Titles>Load Management</Titles>
      <p className="text-slate-600 mt-2 text-sm max-w-2xl">
        Manage and track all your shipments and deliveries in one place. Monitor status, assign drivers, and update load information.
      </p>
    </div>
    
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col min-w-[140px]">
            <label className="text-xs font-medium text-slate-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex flex-col min-w-[140px]">
            <label className="text-xs font-medium text-slate-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!fromDate && !toDate) {
                toast.error("Please select at least one date");
                return;
              }
              setIsFiltered(true);
              refetchFiltered();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md whitespace-nowrap"
          >
            Apply Filter
          </button>

          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
              setIsFiltered(false);
              refetchLoads();
            }}
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200 whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  </div>

  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm ">
    {/* Search */}
    <div className="w-full sm:flex-none sm:w-80">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IoSearch className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search loads by ID, origin, destination, status, or driver..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
        />
      </div>
    </div>

    <button
      onClick={() => {
        setEditingLoad(null);
        setShowCreateEditModal(true);
      }}
      className="flex items-center justify-center gap-2 py-3 px-6 cursor-pointer text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg font-medium whitespace-nowrap w-full sm:w-auto"
    >
      <IoAdd size={18} />
      New Load
    </button>
  </div>
</div>

      

      <Toaster position="top-right" />

      {/* Errors */}
      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Loads"
          value={allLoads.length || 0}
          icon={IoCar}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />

        <StatsCard
          title="Pending"
          value={load.filter((l: TLoads) => l.status === "pending").length}
          icon={IoTime}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />

        <StatsCard
          title="In Transit"
          value={load.filter((l: TLoads) => l.status === "in_transit").length}
          icon={IoNavigate}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />

        <StatsCard
          title="Delivered"
          value={load.filter((l: TLoads) => l.status === "delivered").length}
          icon={IoCheckmark}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
        />
      </div>

      {/* Table For Loads */}
      <DataTable
        columns={loadColumns}
        data={filteredLoads}
        renderRow={renderLoadRow}
        loading={loading}
      />

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        page={page}
        setPage={setPage}
        pageSize={10}
        showInfo={true}
      />

      {/* Modal Components */}
      <CreateEditLoadModal
        isOpen={showCreateEditModal}
        onClose={() => {
          setShowCreateEditModal(false);
          setEditingLoad(null);
          refetchLoads();
        }}
        editingLoad={editingLoad}
      />
    </section>
  );
};

export default LoadsPage;
