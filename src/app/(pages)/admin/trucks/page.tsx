"use client";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IoAdd,
  IoSearch,
  IoCar,
  IoCalendar,
  IoScale,
  IoConstruct,
  IoPencil,
  IoTrash,
  IoCheckmark,
  IoTime,
  IoStop,
} from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import { TErrors, TPagination, TTruck } from "@/types/globalTypes";
import { apiFetcher } from "@/utils/APIFetcher";
import StatsCard from "@/components/ui/StatsCard";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modals";
import DataTable from "@/components/ui/DataTable";
import { truckColumns } from "@/data/truckTables";
import useLoading from "@/hook/useLoading";
import useError from "@/hook/useError";
import { apiClient } from "@/utils/apiClient";

const TrucksPage = () => {
  const [trucks, setTrucks] = useState<TTruck[]>([]);
  const [popup, setPopup] = useState(false);
  const [editPopup, setEditPopup] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTruck, setSelectedTruck] = useState<TTruck | null>(null);
  const [allTrucks, setAllTrucks] = useState<TTruck[]>([]);
  const [deleteAlert, setDeleteAlert] = useState<{
    show: boolean;
    truckId: string | null;
    truckName: string;
  }>({
    show: false,
    truckId: null,
    truckName: "",
  });
  const [pagination, setPagination] = useState<TPagination | null>(null);
  const [page, setPage] = useState(1);
  const [newTruck, setNewTruck] = useState({
    plateNumber: "",
    model: "",
    year: "",
    capacity: "",
    status: "available",
    type: "",
  });

  const [updateTruck, setUpdateTruck] = useState({
    plateNumber: "",
    model: "",
    year: "",
    capacity: "",
    status: "available",
    type: "",
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

  // FIXME: Create Truck
  const handleCreateTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }

    try {
      const result = await apiClient(`${apiURL}/api/v1/trucks`, token, {
        method: "POST",
        body: JSON.stringify({
          plateNumber: newTruck.plateNumber,
          model: newTruck.model,
          year: Number(newTruck.year),
          capacity: Number(newTruck.capacity),
          status: newTruck.status.toLowerCase(),
          type: newTruck.type,
        }),
      });

      toast.success("Truck created successfully!");
      setTrucks((prev) => [...prev, result.data] as TTruck[]);
      setPopup(false);
      setNewTruck({
        plateNumber: "",
        model: "",
        year: "",
        capacity: "",
        status: "available",
        type: "",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  // FIXME: Update Truck
  const handleUpdateTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }
    if (!selectedTruck) return;

    try {
      const truckId = selectedTruck.id;

      const result = await apiClient(`${apiURL}/api/v1/trucks/${truckId}`, token, {
        method: "PUT",
        body: JSON.stringify({
          plateNumber: updateTruck.plateNumber,
          model: updateTruck.model,
          year: Number(updateTruck.year),
          capacity: Number(updateTruck.capacity),
          status: updateTruck.status.toLowerCase(),
          type: updateTruck.type,
        }),
      })

      toast.success("Truck updated successfully!");
      setTrucks((prev) =>
        prev.map((t) => (t.id === truckId ? result.data : t)) as TTruck[]
      );
      setEditPopup(false);
      setSelectedTruck(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  // TODO: Show Delete Alert
  const showDeleteAlert = (truckId: string, truckName: string) => {
    setDeleteAlert({
      show: true,
      truckId,
      truckName,
    });
  };

  // TODO: Hide Delete Alert
  const hideDeleteAlert = () => {
    setDeleteAlert({
      show: false,
      truckId: null,
      truckName: "",
    });
  };

  // FIXME: Delete Truck
  const handleDeleteTruck = async () => {
    if (!deleteAlert.truckId) return;

    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }

    try {
      const result = await apiClient(`${apiURL}/api/v1/trucks/${deleteAlert.truckId}`, token, {
        method: "DELETE"
      })

      toast.success("Truck deleted successfully!");
      setTrucks((prev) => prev.filter((t) => t.id !== deleteAlert.truckId));
      hideDeleteAlert();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Delete failed");
      }
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      available: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: <IoCar size={14} className="mr-1" />,
      },
      busy: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: <IoCar size={14} className="mr-1" />,
      },
      maintenance: {
        color: "bg-amber-100 text-amber-800 border-amber-300",
        icon: <IoConstruct size={14} className="mr-1" />,
      },
      inactive: {
        color: "bg-slate-100 text-slate-800 border-slate-300",
        icon: <IoCar size={14} className="mr-1" />,
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

  // TODO: Table
  const renderTruckRow = (truck: TTruck, index: number) => (
    <tr key={truck.id} className="hover:bg-slate-50 transition-colors group">
      {/* # */}
      <td className="p-4 text-slate-600 font-medium">{index + 1}</td>

      {/* Truck Details */}
      <td className="p-4">
        <span className="flex items-center gap-3">
          <span className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
            <IoCar size={18} className="text-slate-600" />
          </span>
          <span>
            <span className="font-medium text-slate-900">{truck.model}</span>
            <span className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                {truck.plateNumber}
              </span>
              <span className="text-xs text-slate-500">
                ID: {truck.truckId}
              </span>
            </span>
          </span>
        </span>
      </td>

      {/* Specifications */}
      <td className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-700">
            <IoCalendar size={14} className="text-slate-400" />
            <span className="text-sm">Year: {truck.year}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <IoScale size={14} className="text-slate-400" />
            <span className="text-sm">Capacity: {truck.capacity} kg</span>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="p-4">
        <TypeBadge type={truck.type} />
      </td>

      {/* Status */}
      <td className="p-4">
        <StatusBadge status={truck.status} />
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setSelectedTruck(truck);
              setUpdateTruck({
                plateNumber: truck.plateNumber,
                model: truck.model,
                year: String(truck.year),
                capacity: String(truck.capacity),
                status: truck.status,
                type: truck.type || "",
              });
              setEditPopup(true);
            }}
            className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <IoPencil size={14} />
            Edit
          </button>

          <button
            onClick={() => showDeleteAlert(truck.id, truck.model)}
            className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <IoTrash size={14} />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading) return <Loading />;

  return (
    <section className="relative p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <Titles>Truck Management</Titles>
          <p className="text-slate-600 mt-2 text-sm">
            Manage your truck fleet and assignments
          </p>
        </div>

        <button
          onClick={() => setPopup(true)}
          className="flex items-center gap-2 py-3 px-6 cursor-pointer text-white bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-lg shadow-sm font-medium"
        >
          <IoAdd size={20} />
          Add New Truck
        </button>
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

      {/* Table */}
      <DataTable
        columns={truckColumns}
        data={filteredTrucks}
        renderRow={renderTruckRow}
        loading={loading}
        emptyState={
          <tr className="flex flex-col items-center justify-center px-4 py-12">
            <td className="text-3xl mb-3">🚛</td>
            <td className="text-slate-600">No trucks found</td>
            <td className="text-slate-400 text-sm mt-1">
              {search
                ? "Try adjusting your search terms"
                : "Get started by adding your first truck"}
            </td>
          </tr>
        }
      />

      {/* Delete Alert */}
      <Modal
        isOpen={deleteAlert.show}
        onClose={hideDeleteAlert}
        title="Delete Truck"
        size="md"
        showCloseButton={false}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <IoTrash size={32} className="text-red-600" />
          </div>

          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Delete Truck
          </h3>

          <p className="text-slate-600 mb-6">
            Are you sure you want to delete{" "}
            <strong>{`"${deleteAlert.truckName}"`}</strong>? This action cannot
            be undone.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={hideDeleteAlert}
              className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleDeleteTruck}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Popup */}
      <Modal
        isOpen={popup}
        onClose={() => setPopup(false)}
        title="Add New Truck"
        size="md"
      >
        <form onSubmit={handleCreateTruck} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Plate Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoCar className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="ABC-1234"
                value={newTruck.plateNumber}
                onChange={(e) =>
                  setNewTruck({ ...newTruck, plateNumber: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Model
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoCar className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Volvo FH16"
                value={newTruck.model}
                onChange={(e) =>
                  setNewTruck({ ...newTruck, model: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Year
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoCalendar className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  placeholder="2010"
                  value={newTruck.year}
                  onChange={(e) =>
                    setNewTruck({ ...newTruck, year: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Capacity (kg)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoScale className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  placeholder="25000"
                  value={newTruck.capacity}
                  onChange={(e) =>
                    setNewTruck({ ...newTruck, capacity: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type
            </label>
            <select
              value={newTruck.type}
              onChange={(e) =>
                setNewTruck({ ...newTruck, type: e.target.value })
              }
              className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              required
            >
              <option value="">Select Type</option>
              <option value="reefer">Reefer</option>
              <option value="van">Van</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={newTruck.status}
              onChange={(e) =>
                setNewTruck({ ...newTruck, status: e.target.value })
              }
              className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mt-4"
          >
            <IoAdd size={18} />
            Create Truck
          </button>
        </form>
      </Modal>

      {/* Edit Popup */}
      <Modal
        isOpen={editPopup}
        onClose={() => setEditPopup(false)}
        title="Edit Truck"
        size="md"
      >
        <form onSubmit={handleUpdateTruck} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Plate Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoCar className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="ABC-1234"
                value={updateTruck.plateNumber}
                onChange={(e) =>
                  setUpdateTruck({
                    ...updateTruck,
                    plateNumber: e.target.value,
                  })
                }
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Model
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoCar className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Volvo FH16"
                value={updateTruck.model}
                onChange={(e) =>
                  setUpdateTruck({ ...updateTruck, model: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Year
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoCalendar className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  placeholder="2010"
                  value={updateTruck.year}
                  onChange={(e) =>
                    setUpdateTruck({ ...updateTruck, year: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Capacity (kg)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoScale className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  placeholder="25000"
                  value={updateTruck.capacity}
                  onChange={(e) =>
                    setUpdateTruck({
                      ...updateTruck,
                      capacity: e.target.value,
                    })
                  }
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type
            </label>
            <select
              value={updateTruck.type}
              onChange={(e) =>
                setUpdateTruck({ ...updateTruck, type: e.target.value })
              }
              className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              required
            >
              <option value="">Select Type</option>
              <option value="reefer">Reefer</option>
              <option value="van">Van</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={updateTruck.status}
              onChange={(e) =>
                setUpdateTruck({ ...updateTruck, status: e.target.value })
              }
              className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 mt-4"
          >
            <IoPencil size={18} />
            Update Truck
          </button>
        </form>
      </Modal>

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

export default TrucksPage;
