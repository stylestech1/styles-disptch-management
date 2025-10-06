"use client";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IoClose,
  IoAdd,
  IoSearch,
  IoCar,
  IoCalendar,
  IoScale,
  IoPerson,
  IoConstruct,
  IoPencil,
  IoTrash,
} from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import { TTruck } from "@/types/globalTypes";

const TrucksPage = () => {
  const [trucks, setTrucks] = useState<TTruck[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [popup, setPopup] = useState(false);
  const [editPopup, setEditPopup] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTruck, setSelectedTruck] = useState<TTruck | null>(null);
  const [deleteAlert, setDeleteAlert] = useState<{ show: boolean; truckId: string | null; truckName: string }>({
    show: false,
    truckId: null,
    truckName: ""
  });

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
        if (!res.ok) throw new Error(result.message);

        setTrucks(result.data?.data || []);
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message || "Loading Failed");
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

  // Search Filter
  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.model.toLowerCase().includes(search.toLowerCase()) ||
      truck.plateNumber.toLowerCase().includes(search.toLowerCase())
  );

  // Create Truck
  const handleCreateTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiURL}/api/v1/trucks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plateNumber: newTruck.plateNumber,
          model: newTruck.model,
          year: Number(newTruck.year),
          capacity: Number(newTruck.capacity),
          status: newTruck.status.toLowerCase(),
          type: newTruck.type,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach((err: { msg?: string }) => {
            toast.error(err.msg || "Validation error", {
              style: { background: "#dc2626", color: "#fff" },
            });
          });
        } else {
          toast.error(result.message || "Create truck failed", {
            style: { background: "#dc2626", color: "#fff" },
          });
        }
        return;
      }

      toast.success("Truck created successfully!");
      setTrucks((prev) => [...prev, result.data]);
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

  // Update Truck
  const handleUpdateTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTruck) return;

    try {
      const truckId = selectedTruck.id;
      const res = await fetch(`${apiURL}/api/v1/trucks/${truckId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plateNumber: updateTruck.plateNumber,
          model: updateTruck.model,
          year: Number(updateTruck.year),
          capacity: Number(updateTruck.capacity),
          status: updateTruck.status.toLowerCase(),
          type: updateTruck.type,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || "Update truck failed");
        return;
      }

      toast.success("Truck updated successfully!");
      setTrucks((prev) =>
        prev.map((t) => (t.id === truckId ? result.data : t))
      );
      setEditPopup(false);
      setSelectedTruck(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  // Show Delete Alert
  const showDeleteAlert = (truckId: string, truckName: string) => {
    setDeleteAlert({
      show: true,
      truckId,
      truckName
    });
  };

  // Hide Delete Alert
  const hideDeleteAlert = () => {
    setDeleteAlert({
      show: false,
      truckId: null,
      truckName: ""
    });
  };

  // Delete Truck
  const handleDeleteTruck = async () => {
    if (!deleteAlert.truckId) return;

    try {
      const res = await fetch(`${apiURL}/api/v1/trucks/${deleteAlert.truckId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete truck");
      }

      toast.success("Truck deleted successfully!");
      setTrucks((prev) =>
        prev.filter((t) => t.id !== deleteAlert.truckId)
      );
      hideDeleteAlert();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Delete failed");
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="relative p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between mb-8">
        <div>
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
          <IoSearch className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by model or plate number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {err && <Erros message={err} />}
      {/* Truck Statistics */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium">Total Trucks</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{trucks.length}</p>
      </div>
      <div className="p-2 bg-blue-50 rounded-lg">
        <IoCar size={20} className="text-blue-600" />
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium">Available</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">
          {trucks.filter(t => t.status === "available").length}
        </p>
      </div>
      <div className="p-2 bg-emerald-50 rounded-lg">
        <IoCar size={20} className="text-emerald-600" />
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium">Booked</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">
          {trucks.filter(t => t.status === "busy").length}
        </p>
      </div>
      <div className="p-2 bg-amber-50 rounded-lg">
        <IoCar size={20} className="text-amber-600" />
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium">Inactive</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">
          {trucks.filter(t => t.status === "inactive").length}
        </p>
      </div>
      <div className="p-2 bg-slate-50 rounded-lg">
        <IoCar size={20} className="text-slate-600" />
      </div>
    </div>
  </div>
</div>


      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">Truck</th>
              <th className="p-4 text-left">Specifications</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredTrucks.length > 0 ? (
              filteredTrucks.map((truck, i) => (
                <tr key={truck.id} className="hover:bg-slate-50">
                  <td className="p-4">{i + 1}</td>
                  <td className="p-4">
                    <div className="font-medium">{truck.model}</div>
                    <div className="text-slate-500 text-sm">{truck.plateNumber}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-600">Year: {truck.year}</div>
                    <div className="text-slate-600">Capacity: {truck.capacity} kg</div>
                  </td>
                  <td className="p-4 ">{truck.type || "-"}</td>
                  <td className="p-4 capitalize">{truck.status}</td>
                  <td className="p-4 flex gap-2 justify-center">
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
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-xs font-medium"
                    >
                      <IoPencil size={14} />
                    </button>

                    <button
                      onClick={() => showDeleteAlert(truck.id, truck.model)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-medium"
                    >
                      <IoTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-500">
                  No trucks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Alert */}
      {deleteAlert.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-md">
            <div className="flex flex-col items-center text-center">
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <IoTrash size={32} className="text-red-600" />
              </div>

              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Delete Truck
              </h3>

              <p className="text-slate-600 mb-6">
                Are you sure you want to delete <strong>"{deleteAlert.truckName}"</strong>?
                This action cannot be undone.
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
          </div>
        </div>
      )}

      {/* Create Popup */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Add New Truck</h3>
              <button onClick={() => setPopup(false)}>
                <IoClose size={24} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateTruck} className="space-y-3">
              <input
                type="text"
                placeholder="Plate Number"
                value={newTruck.plateNumber}
                onChange={(e) => setNewTruck({ ...newTruck, plateNumber: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
                required
              />
              <input
                type="text"
                placeholder="Model"
                value={newTruck.model}
                onChange={(e) => setNewTruck({ ...newTruck, model: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
                required
              />
              <input
                type="number"
                placeholder="Year"
                value={newTruck.year}
                onChange={(e) => setNewTruck({ ...newTruck, year: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
                required
              />
              <input
                type="number"
                placeholder="Capacity (kg)"
                value={newTruck.capacity}
                onChange={(e) => setNewTruck({ ...newTruck, capacity: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
                required
              />

              <select
                value={newTruck.type}
                onChange={(e) => setNewTruck({ ...newTruck, type: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
                required
              >
                <option value="">Select Type</option>
                <option value="reefer">reefer</option>
                <option value="van">van</option>
              </select>


              <select
                value={newTruck.status}
                onChange={(e) => setNewTruck({ ...newTruck, status: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg"
              >
                Create Truck
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Popup */}
      {editPopup && selectedTruck && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Edit Truck</h3>
              <button onClick={() => setEditPopup(false)}>
                <IoClose size={24} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateTruck} className="space-y-4">
              <input
                type="text"
                placeholder="Plate Number"
                value={updateTruck.plateNumber}
                onChange={(e) => setUpdateTruck({ ...updateTruck, plateNumber: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
              />

              <input
                type="text"
                placeholder="Model"
                value={updateTruck.model}
                onChange={(e) => setUpdateTruck({ ...updateTruck, model: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
              />

              <input
                type="number"
                placeholder="Year"
                value={updateTruck.year}
                onChange={(e) => setUpdateTruck({ ...updateTruck, year: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
              />

              <input
                type="number"
                placeholder="Capacity (kg)"
                value={updateTruck.capacity}
                onChange={(e) => setUpdateTruck({ ...updateTruck, capacity: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
              />

              <select
                value={updateTruck.type}
                onChange={(e) => setUpdateTruck({ ...updateTruck, type: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
                required
              >
                <option value="">Select Type</option>
                <option value="reefer">reefer</option>
                <option value="van">van</option>
              </select>


              <select
                value={updateTruck.status}
                onChange={(e) => setUpdateTruck({ ...updateTruck, status: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Update Truck
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default TrucksPage;