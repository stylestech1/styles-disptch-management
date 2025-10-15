"use client";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { TTruck, TErrors } from "@/types/globalTypes";
import { useState, useEffect } from "react";
import Erros from "@/components/ui/Erros";
import toast, { Toaster } from "react-hot-toast";
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
  IoPencil,
  IoTrash,
  IoArrowBack,
  IoCalendar,
  IoScale,
} from "react-icons/io5";
import useLoading from "@/hook/useLoading";
import useError from "@/hook/useError";
import { apiClient } from "@/utils/apiClient";
import Modal from "@/components/ui/Modals";

const TruckSummary = () => {
  const [profile, setProfile] = useState<TTruck | null>(null);
  const [editPopup, setEditPopup] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState<{
    show: boolean;
    truckId: string | null;
    truckName: string;
  }>({
    show: false,
    truckId: null,
    truckName: "",
  });
  const [updateTruck, setUpdateTruck] = useState({
    plateNumber: "",
    model: "",
    year: "",
    capacity: "",
    status: "available",
    type: "",
  });

  const { id } = useParams();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const { loading, setLoading } = useLoading();
  const { error, setError } = useError();
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  //  Get Truck
 useEffect(() => {
    if (!id) return;
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }
    const getProfile = async () => {
      setLoading(true);
      try {
        const result = await apiClient(`${apiURL}/api/v1/trucks/${id}`, token);
        const truckData = result.data as TTruck;
        setProfile(truckData);
        
        setUpdateTruck({
          plateNumber: truckData.plateNumber,
          model: truckData.model,
          year: String(truckData.year),
          capacity: String(truckData.capacity),
          status: truckData.status,
          type: truckData.type || "",
        });
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message, {
            style: { background: "#dc2626", color: "#fff" },
          });
        }
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, [apiURL, token, id, router]);

  //  Update Truck
  const handleUpdateTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }
    if (!profile) return;

    try {
      const result = await apiClient(`${apiURL}/api/v1/trucks/${profile.id}`, token, {
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
      setProfile(result.data as TTruck);
      setEditPopup(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  //  Show Delete Alert
  const showDeleteAlert = () => {
    if (!profile) return;
    setDeleteAlert({
      show: true,
      truckId: profile.id,
      truckName: profile.model,
    });
  };

  //  Hide Delete Alert
  const hideDeleteAlert = () => {
    setDeleteAlert({
      show: false,
      truckId: null,
      truckName: "",
    });
  };

  //  Delete Truck
  const handleDeleteTruck = async () => {
    if (!deleteAlert.truckId) return;

    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }

    try {
      await apiClient(`${apiURL}/api/v1/trucks/${deleteAlert.truckId}`, token, {
        method: "DELETE"
      })

      toast.success("Truck deleted successfully!");
      hideDeleteAlert();
      router.push('/admin/trucks'); 
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

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

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

  if (loading) return <Loading />;

  return (
    <section className="container mx-auto p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/trucks')}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <IoArrowBack size={20} />
              Back
            </button>
            <div>
              <Titles>Truck Summary - {profile?.truckId}</Titles>
              <p className="text-slate-600 mt-2 text-sm">
                Detailed overview of truck information and specifications
              </p>
            </div>
          </div>
        </div>

        {/* Edit &Delete */}
        {profile && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditPopup(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              <IoPencil size={16} />
              Edit Truck
            </button>
            <button
              onClick={showDeleteAlert}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <IoTrash size={16} />
              Delete Truck
            </button>
          </div>
        )}
      </div>

      {/* Errors */}
      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Truck Profile Card */}
      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <span className="font-medium text-slate-800">{profile.year}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <IoScaleOutline className="text-slate-400" size={18} />
                  <span className="text-slate-600">Capacity</span>
                </div>
                <span className="font-medium text-slate-800">{profile.capacity} kg</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <IoCheckmarkCircleOutline className="text-slate-400" size={18} />
                  <span className="text-slate-600">Status</span>
                </div>
                <StatusBadge status={profile.status} />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-sm">
                  <IoPersonOutline className="text-slate-400" size={18} />
                  <span className="text-slate-600">Created By</span>
                </div>
                <span className="font-medium text-slate-800">{profile.createdBy}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-slate-800">Quick Stats</h4>
                <IoStatsChart size={24} className="text-blue-500" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Truck ID</span>
                  <span className="font-mono font-semibold text-slate-800">{profile.truckId}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Vehicle Age</span>
                  <span className="font-semibold text-slate-800">{new Date().getFullYear() - profile.year} years</span>
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
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Status Overview</h4>
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
                  <span className={`font-medium ${profile.status === 'available' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {profile.status === 'available' ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Popup Modal */}
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

      {/* Delete Alert Modal */}
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

      {!profile && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">🚛</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Truck Not Found</h3>
          <p className="text-slate-600 mb-4">{"The truck you're looking for doesn't exist or you don't have access to it."}</p>
          <button
            onClick={() => router.push('/admin/trucks')}
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