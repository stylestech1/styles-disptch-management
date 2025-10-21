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
import {
  TLoads,
} from "@/types/globalTypes";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CiStickyNote } from "react-icons/ci";
import {
  IoAdd,
  IoRefresh,
  IoCheckmark,
  IoTime,
  IoCar,
  IoNavigate,
  IoSearch,
  IoLocationSharp,
} from "react-icons/io5";
import { LiaShippingFastSolid } from "react-icons/lia";
import { RxUpdate } from "react-icons/rx";
import { MdEdit } from "react-icons/md";
import {
  useGetLoadsQuery,
  useGetAllLoadsQuery,
  useGetDriversQuery,
  useGetTrucksQuery,
  useGetNotesQuery,
} from "@/redux/slices/apiSlice";

// Import the new modal components
import CreateEditLoadModal from "@/components/loads/CreateEditLoadModal";
import AddNoteModal from "@/components/loads/AddNoteModal";
import UpdateStatusModal from "@/components/loads/UpdateStatusModal";
import ViewAppointmentsModal from "@/components/loads/ViewAppointmentsModal";
import ViewNotesModal from "@/components/loads/ViewNotesModal";

const LoadsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showViewNotesModal, setShowViewNotesModal] = useState(false);
  const [showViewAppointmentsModal, setShowViewAppointmentsModal] = useState(false);

  // Selected items for modals
  const [selectedLoadForNotes, setSelectedLoadForNotes] = useState<TLoads | null>(null);
  const [selectedLoadForAppointments, setSelectedLoadForAppointments] = useState<TLoads | null>(null);
  const [editingLoad, setEditingLoad] = useState<TLoads | null>(null);
  const { loading, setLoading } = useLoading();
  const { error, setError } = useError();

  // RTK Query
  const {
    data: loadsData,
    isLoading: loadsLoading,
    isError: loadsError,
    refetch: refetchLoads,
  } = useGetLoadsQuery({ page, limit: 10 });

  const {
    data: allLoadsData,
    isLoading: allLoadsLoading,
  } = useGetAllLoadsQuery();

  const {
    isLoading: driversLoading,
    isError: driversError,
  } = useGetDriversQuery();

  const {
    isLoading: trucksLoading,
    isError: trucksError,
  } = useGetTrucksQuery();

  const {
    isLoading: notesLoading,
  } = useGetNotesQuery(selectedLoadForNotes?.id || "", {
    skip: !selectedLoadForNotes?.id,
  });

  // responses
  const load = loadsData?.data || [];
  const pagination = loadsData?.paginationResult || null;
  const allLoads = allLoadsData?.data || [];

  // إدارة حالة ال loading بناءً على جميع ال queries
  useEffect(() => {
    const isLoading =
      loadsLoading ||
      allLoadsLoading ||
      driversLoading ||
      trucksLoading ||
      notesLoading;
    setLoading(isLoading);
  }, [
    loadsLoading,
    allLoadsLoading,
    driversLoading,
    trucksLoading,
    notesLoading,
    setLoading,
  ]);

  // إدارة الأخطاء
  useEffect(() => {
    if (loadsError) {
      const errorMessage = getErrorMessage(loadsError);
      setError(errorMessage);
      toast.error(errorMessage || "Loading failed ❌", {
        style: { background: "#dc2626", color: "#fff" },
      });
    }
    if (driversError) {
      const errorMessage = getErrorMessage(driversError);
      setError(errorMessage);
      toast.error(errorMessage || "Loading drivers failed ❌", {
        style: { background: "#dc2626", color: "#fff" },
      });
    }
    if (trucksError) {
      const errorMessage = getErrorMessage(trucksError);
      setError(errorMessage);
      toast.error(errorMessage || "Loading trucks failed ❌", {
        style: { background: "#dc2626", color: "#fff" },
      });
    }
  }, [loadsError, driversError, trucksError, setError]);

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

  // TODO: Open Edit Load
  const openEditLoadPopup = async (loadItem: TLoads) => {
    if (!loadItem?.id) return;
    setEditingLoad(loadItem);
    setShowCreateEditModal(true);
  };

  // TODO: Open Note for Selected Load
  const openAllNotesPopup = async (loadItem: TLoads) => {
    if (!loadItem?.id) return;
    setSelectedLoadForNotes(loadItem);
    setShowViewNotesModal(true);
  };

  // TODO: Open Appointments for Selected Load
  const openAllAppointmentsPopup = async (loadItem: TLoads) => {
    if (!loadItem?.id) return;
    setSelectedLoadForAppointments(loadItem);
    setShowViewAppointmentsModal(true);
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
  const renderLoadRow = (loadItem: TLoads, index: number) => (
    <tr key={index} className="hover:bg-slate-50 transition-colors group">
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

      {/* Appointments */}
      <td className="p-4 text-center text-slate-600 text-xs">
        <button
          onClick={() => openAllAppointmentsPopup(loadItem)}
          className="cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-800 hover:text-purple-200 transition-colors"
        >
          <LiaShippingFastSolid />
          <span>Appointments</span>
        </button>
      </td>

      {/* Notes */}
      <td className="p-4 text-center text-slate-600 text-xs">
        <button
          onClick={() => openAllNotesPopup(loadItem)}
          className="cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-800 hover:text-blue-200 transition-colors"
        >
          <CiStickyNote />
          <span>view</span>
        </button>
      </td>

      {/* LoadEdit */}
      <td className="p-4 text-center text-slate-600 text-xs">
        <button
          onClick={() => openEditLoadPopup(loadItem)}
          className="cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-800 hover:text-yellow-200 transition-colors"
        >
          <RxUpdate />
          <span>Update</span>
        </button>
      </td>
    </tr>
  );

  return (
    <section className="relative p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row md:items-center lg:justify-between mb-10">
        <div className="mb-4 lg:mb-0">
          <Titles>Load Management</Titles>
          <p className="text-slate-600 mt-2 text-sm">
            Manage and track all your shipments and deliveries
          </p>
        </div>

        {/* Search */}
        <div>
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearch className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search loads by ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddNoteModal(true)}
            className="flex items-center gap-2 py-3 px-5 cursor-pointer text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm font-medium"
          >
            <MdEdit size={18} />
            Add Note
          </button>

          <button
            onClick={() => setShowUpdateStatusModal(true)}
            className="flex items-center gap-2 py-3 px-5 cursor-pointer text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm font-medium"
          >
            <IoRefresh size={18} />
            Update Status
          </button>

          <button
            onClick={() => {
              setEditingLoad(null);
              setShowCreateEditModal(true);
            }}
            className="flex items-center gap-2 py-3 px-5 cursor-pointer text-white bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-lg shadow-sm font-medium"
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

      <AddNoteModal
        isOpen={showAddNoteModal}
        onClose={() => {
          setShowAddNoteModal(false);
          refetchLoads();
        }}
      />

      <UpdateStatusModal
        isOpen={showUpdateStatusModal}
        onClose={() => {
          setShowUpdateStatusModal(false);
          refetchLoads();
        }}
      />

      <ViewNotesModal
        isOpen={showViewNotesModal}
        onClose={() => {
          setShowViewNotesModal(false);
          setSelectedLoadForNotes(null);
        }}
        selectedLoad={selectedLoadForNotes}
        onAddNote={() => {
          setShowViewNotesModal(false);
          setShowAddNoteModal(true);
        }}
      />

      <ViewAppointmentsModal
        isOpen={showViewAppointmentsModal}
        onClose={() => {
          setShowViewAppointmentsModal(false);
          setSelectedLoadForAppointments(null);
        }}
        selectedLoad={selectedLoadForAppointments}
      />
    </section>
  );
};

export default LoadsPage;