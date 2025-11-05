"use client";
import DataTable from "@/components/ui/DataTable";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Pagination from "@/components/ui/Pagination";
import StatsCard from "@/components/ui/StatsCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { loadColumns } from "@/data/loadTables";
import useError from "@/hook/useError";
import useLoading from "@/hook/useLoading";
import { TLoads } from "@/types/globalTypes";
import { useEffect, useMemo, useState } from "react";
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
  useGetLoadsWithFilterQuery,
} from "@/redux/slices/apiSlice";
// Import the new modal components
import CreateEditLoadModal from "@/components/loads/CreateEditLoadModal";
import { useRouter } from "next/navigation";
// ✅ Import MUI DateTimePicker
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Dayjs } from "dayjs";
import DateRangeFilter from "@/components/ui/Filter";
import {
  alpha,
  Box,
  Button,
  InputAdornment,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
// Utils
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useSearch } from "@/hook/useSearch";
import { RootState, useAppSelector } from "@/redux/store";

const LoadsPageDetails = () => {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const userRole = useAppSelector((state: RootState) => state.auth.user?.role);
  const theme = useAppSelector((state: RootState) => state.palette);

  // Modal states
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);

  // Selected items for modals
  const [selectedLoadForNotes, setSelectedLoadForNotes] =
    useState<TLoads | null>(null);
  const [editingLoad, setEditingLoad] = useState<TLoads | null>(null);
  const { loading, setLoading } = useLoading();
  const { error, setError } = useError();

  // ✅ Search And Filter
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // RTK Query
  const {
    data: loadsData,
    isLoading: loadsLoading,
    error: loadsError,
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
  const { data: filteredData } = useGetLoadsWithFilterQuery(
    {
      from: fromDate ? fromDate.format("YYYY-MM-DD") : undefined,
      to: toDate ? toDate.format("YYYY-MM-DD") : undefined,
    },
    { skip: !isFiltered }
  );

  // responses
  const load = isFiltered ? filteredData?.data || [] : loadsData?.data || [];
  const allLoads = allLoadsData?.data || [];
  const pagination = loadsData?.paginationResult || null;

  // Handling Loading
  useEffect(() => {
    const isLoading = loadsLoading || allLoadsLoading || notesLoading;
    setLoading(isLoading);
  }, [loadsLoading, allLoadsLoading, notesLoading, setLoading]);

  // handling Errors
  useEffect(() => {
    if (loadsError) {
      const errorMessage = getErrorMessage(loadsError);
      setError(errorMessage);
      toast.error(errorMessage || "Loading failed ❌", {
        style: { background: "#dc2626", color: "#fff" },
      });
    }
  }, [loadsError, setError]);

  // Filter and Search loads
  const { filteredData: searchedLoads } = useSearch({
    data: searchInput ? allLoads : load,
    searchFields: ["loadId", "driverId.phone"],
    initialSearch: searchInput,
  });
  const tableData = searchInput ? searchedLoads : load;

  // StatsCard
   const statsData = useMemo(() => {
    const currentData = tableData; 
    const totalData = allLoads
    
    return {
      totalLoads: (searchInput || isFiltered) ? currentData.length : totalData.length,
      pending: currentData.filter((l: TLoads) => l.status === "pending").length,
      inTransit: currentData.filter((l: TLoads) => l.status === "in_transit").length,
      delivered: currentData.filter((l: TLoads) => l.status === "delivered").length,
    };
  }, [tableData, allLoads, searchInput, isFiltered]);

  // TODO: set loading
  if (loading) return <Loading />;

  // TODO: Table
  const renderLoadRow = (loadItem: TLoads, index: number) => {
    const hasComments = loadItem.comments && loadItem.comments.length > 0;
    const commentsCount = loadItem.comments?.length || 0;

    return (
      <TableRow
        sx={{
          "&:hover": {
            backgroundColor: alpha(theme.currentPalette.primary, 0.05),
          },
        }}
        key={index}
        className="transition-colors group cursor-pointer"
        onClick={() => {
          if (userRole === "admin") {
            router.push(
              `/admin/loadDetails/${encodeURIComponent(loadItem.loadId)}`
            );
          } else if (userRole === "employee") {
            router.push(
              `/dispatchers/loadDetails/${encodeURIComponent(loadItem.loadId)}`
            );
          }
        }}
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
          {loadItem.pricePerMile
            ? `${loadItem.pricePerMile.toFixed(2)} $`
            : "-"}
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
                  if (userRole === "admin") {
                    router.push(
                      `/admin/loadDetails/${encodeURIComponent(
                        loadItem.loadId
                      )}`
                    );
                  } else if (userRole === "employee") {
                    router.push(
                      `/dispatchers/loadDetails/${encodeURIComponent(
                        loadItem.loadId
                      )}`
                    );
                  }
                }}
                title={`${commentsCount} comment(s) - Click to view`}
              >
                <Box sx={{backgroundColor: theme.currentPalette.primary}} className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm group-hover/note:bg-blue-600 transition-colors">
                  <IoChatbubbleEllipses size={16} className="text-white" />
                </Box>

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
                  router.push(
                    `/admin/loadDetails/${loadItem.loadId}?tab=comments`
                  );
                }}
                title="No comments - Click to add"
              >
                <IoChatbubbleEllipses size={16} className="text-slate-500" />
              </div>
            )}
          </div>
        </td>
      </TableRow>
    );
  };

  return (
    <section className="relative p-6">
      {/* Header */}
      <div className="space-y-6 mb-10">
        {/* Title */}
        <Box
          component="div"
          className="flex flex-col xl:items-start xl:justify-between gap-1"
        >
          <Typography
            sx={{ color: theme.currentPalette.text, fontSize: "45px", fontWeight: "bold" }}
          >
            Load Management
          </Typography>
          <Typography sx={{ color: alpha(theme.currentPalette.text, 0.7), fontSize: "16px" }}>
            Manage and track all your shipments and deliveries in one place.
            Monitor status, assign drivers, and update load information.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-10">
          <StatsCard
            title="Total Loads"
            value={statsData.totalLoads}
            icon={IoCar}
            iconColor={theme.currentPalette.primary}
          />

          <StatsCard
            title="Pending"
            value={statsData.pending}
            icon={IoTime}
            iconColor={theme.currentPalette.primary}
          />

          <StatsCard
            title="In Transit"
            value={statsData.inTransit}
            icon={IoNavigate}
            iconColor={theme.currentPalette.primary}
          />

          <StatsCard
            title="Delivered"
            value={statsData.delivered}
            icon={IoCheckmark}
            iconColor={theme.currentPalette.primary}
          />
        </div>

        {/* Button */}
        <Box display="flex" justifyContent="end" sx={{ mt: 2 }}>
          <Button
            onClick={() => {
              setEditingLoad(null);
              setShowCreateEditModal(true);
            }}
            variant="contained"
            startIcon={<IoAdd size={22} />}
            sx={{
              py: 1.5,
              px: 4,
              fontWeight: "bold",
              fontSize: "1rem",
              borderRadius: 2,
              textTransform: "none",
              width: { xs: "100%", lg: "auto" },
              background: `linear-gradient(to right, ${theme.currentPalette.primary}, ${theme.currentPalette.secondary})`,
              color: "#fff",
              "&:hover": {
                background: `linear-gradient(to right, ${theme.currentPalette.secondary}, ${theme.currentPalette.primary})`,
              },
              transition: "all 0.3s ease",
            }}
          >
            New Load
          </Button>
        </Box>

        {/* Search & Filter */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: "end",
            gap: 2,
            p: 2,
            mt: 5,
            border: `1px solid ${theme.currentPalette.primary}33`,
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            backgroundColor: theme.currentPalette.background,
          }}
        >
          {/* Search */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search loads by ID or driver number"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IoSearch size={20} color="#9ca3af" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: { xs: "100%", lg: "80%" },
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                backgroundColor: "#fff",
                "& fieldset": { borderColor: "#e5e7eb" },
                "&:hover fieldset": { borderColor: theme.currentPalette.primary },
                "&.Mui-focused fieldset": { borderColor: theme.currentPalette.primary },
              },
              "& input": {
                color: theme.currentPalette.text,
              },
            }}
          />

          {/* Filter */}
          <DateRangeFilter
            onApply={(from, to) => {
              if (!from || !to) {
                setIsFiltered(false);
                setFromDate(null);
                setToDate(null);
              } else {
                setIsFiltered(true);
                setFromDate(from);
                setToDate(to);
              }
            }}
          />
        </Box>
      </div>

      <Toaster position="top-right" />

      {/* Errors */}
      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Table For Loads */}
      <DataTable
        columns={loadColumns}
        data={tableData}
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

export default LoadsPageDetails;
