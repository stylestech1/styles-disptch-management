"use client";
import LocationAutocomplete, {
  TPlace,
} from "@/components/sections/LocationAutocomplete";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import {
  TDriver,
  TLoads,
  TPagination,
  TTruck,
  TStatusLoad,
} from "@/types/globalTypes";
import { apiFetcher } from "@/utils/APIFetcher";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IoClose, IoAdd, IoRefresh, IoCheckmark, IoTime, IoCar, IoNavigate, IoCash, IoCalendar } from "react-icons/io5";

const LoadsPage = () => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [pagination, setPagination] = useState<TPagination | null>(null);
  const [page, setPage] = useState(1);
  const [popup, setPopup] = useState(false);
  const [popupLoadStatus, setPopupLoadStatus] = useState(false);

  const [load, setLoad] = useState<TLoads[]>([]);
  const [drivers, setDrivers] = useState<TDriver[]>([]);
  const [truck, setTruck] = useState<TTruck[]>([]);
  const [origin, setOrigin] = useState<TPlace | null>(null);
  const [destination, setDestination] = useState<TPlace | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [price, setPrice] = useState<string>("");
  const [driverId, setDriverId] = useState<string>("");
  const [truckId, setTruckId] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [selectedLoadId, setSelectedLoadId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TStatusLoad>("pending");

  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // Get all Loads
  useEffect(() => {
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }

    setLoading(true);

    const fetchLoads = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${apiURL}/api/v1/loads?page=${page}&limit=10`,
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();

        if (!res.ok) throw new Error(result.message);

        setLoad(result.data);
        setPagination(result.paginationResult);
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message || "Loading Failed");
          alert(error.message || "Loading Failed");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLoads();
  }, [apiURL, token, router, page]);

  // Get all driver
  useEffect(() => {
    setLoading(true);

    const getDrivers = async () => {
      try {
        const res = await fetch(`${apiURL}/api/v1/drivers?status=available`, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        setDrivers(result.data);
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message || "Loading Failed");
          alert(error.message || "Loading Failed");
        }
      } finally {
        setLoading(false);
      }
    };

    getDrivers();
  }, [apiURL, token]);

  // Get all trucks
  useEffect(() => {
    setLoading(true);

    const getDrivers = async () => {
      try {
        const res = await fetch(`${apiURL}/api/v1/trucks?status=available`, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        setTruck(result.data.data);
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message || "Loading Failed");
          alert(error.message || "Loading Failed");
        }
      } finally {
        setLoading(false);
      }
    };

    getDrivers();
  }, [apiURL, token]);

  // Calc Mile
  const haversineDistance = (
    coords1: { lat: number; lon: number },
    coords2: { lat: number; lon: number }
  ) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 3958.8;

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);

    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Get Miles
  useEffect(() => {
    if (origin && destination) {
      const miles = haversineDistance(
        { lat: parseFloat(origin.lat), lon: parseFloat(origin.lon) },
        { lat: parseFloat(destination.lat), lon: parseFloat(destination.lon) }
      );
      setDistance(miles);
    } else {
      setDistance(null);
    }
  }, [origin, destination]);

  // helper: reload loads
  const fetchLoads = async () => {
    try {
      setLoading(true);
      const result = await apiFetcher(
        `${apiURL}/api/v1/loads?page=${page}&limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoad(result.data);
      setPagination(result.paginationResult);
    } catch (error) {
      if (error instanceof Error) {
        setErr(error.message || "Loading Failed");
        alert(error.message || "Loading Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // fetch on mount
  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }
    fetchLoads();
  }, [apiURL, token, router, page]);

  // Create Load
  const handleCreateLoad = async (e: React.FormEvent) => {
    e.preventDefault();

    const total = Number(price);

    if (!origin || !destination)
      return alert("Please select origin and destination");
    if (!driverId || !truckId) return alert("Please select driver and truck");
    if (!total || total <= 0) return alert("Please enter a valid total price");
    if (!distance || distance <= 0) return alert("Invalid distance calculated");

    const body = {
      origin: { address: origin.display_name },
      destination: { address: destination.display_name },
      driverId,
      truckId,
      distanceMiles: Math.round(distance),
      totalPrice: total,
      pricePerMile: total / distance,
      currency,
    };

    try {
      const result = await apiFetcher(`${apiURL}/api/v1/loads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      toast.success(result.message || "Load created ✅", {
        style: { background: "#16a34a", color: "#fff" },
      });

      await fetchLoads();
      setPopup(false);
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };

  // Update Load Status
  const handleUpdateLoadStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoadId) return alert("Please select a load");

    try {
      const result = await apiFetcher(
        `${apiURL}/api/v1/loads/status/${selectedLoadId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: selectedStatus }),
        }
      );

      toast.success(result.message || "Load updated ✅", {
        style: { background: "#16a34a", color: "#fff" },
      });

      await fetchLoads();
      setPopupLoadStatus(false);
    } catch (error) {
      if (error instanceof Error) {
        setErr(error.message || "Update failed");
        alert(error.message || "Update failed");
      }
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: TStatusLoad }) => {
    const statusConfig = {
      pending: { color: "bg-amber-100 text-amber-800 border-amber-300", icon: <IoTime size={14} className="mr-1" /> },
      in_transit: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: <IoNavigate size={14} className="mr-1" /> },
      delivered: { color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: <IoCheckmark size={14} className="mr-1" /> },
      cancelled: { color: "bg-red-100 text-red-800 border-red-300", icon: <IoClose size={14} className="mr-1" /> },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.icon}
        {status.replace('_', ' ')}
      </span>
    );
  };

  // set loading
  if (loading) return <Loading />;

  return (
    <section className="relative p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <Titles>Load Management</Titles>
          <p className="text-slate-600 mt-2 text-sm">Manage and track all your shipments and deliveries</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPopupLoadStatus(true)}
            className="flex items-center gap-2 py-3 px-5 cursor-pointer text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm font-medium"
          >
            <IoRefresh size={18} />
            Update Status
          </button>

          <button
            onClick={() => setPopup(true)}
            className="flex items-center gap-2 py-3 px-5 cursor-pointer text-white bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-lg shadow-sm font-medium"
          >
            <IoAdd size={18} />
            New Load
          </button>
        </div>
      </div>

      <Toaster position="top-right" />

      {/* Errors */}
      {err && <div className="mb-6"><Erros message={err} /></div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Loads</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{pagination?.totalPages || 0}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <IoCar size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {load.filter(l => l.status === 'pending').length}
              </p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <IoTime size={20} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">In Transit</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {load.filter(l => l.status === 'in_transit').length}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <IoNavigate size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Delivered</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {load.filter(l => l.status === 'delivered').length}
              </p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <IoCheckmark size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table For Loads */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-medium text-slate-600">Load ID</th>
                <th className="text-left p-4 font-medium text-slate-600">Route</th>
                <th className="text-right p-4 font-medium text-slate-600">Distance</th>
                <th className="text-right p-4 font-medium text-slate-600">Price/Mile</th>
                <th className="text-right p-4 font-medium text-slate-600">Total</th>
                <th className="text-center p-4 font-medium text-slate-600">Status</th>
                <th className="text-left p-4 font-medium text-slate-600">Driver</th>
                <th className="text-left p-4 font-medium text-slate-600">Truck</th>
                <th className="text-center p-4 font-medium text-slate-600">Delivered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {load.length > 0 ? (
                load.map((loadItem, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium">
                        {loadItem.loadId}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-700">
                          <IoNavigate size={14} className="text-slate-400" />
                          <span className="text-sm max-w-[120px] truncate" title={loadItem.origin}>
                            {loadItem.origin?.split(",")[0] || "-"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <IoCheckmark size={14} className="text-slate-400" />
                          <span className="text-sm max-w-[120px] truncate" title={loadItem.destination}>
                            {loadItem.destination?.split(",")[0] || "-"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right text-slate-700 font-medium">
                      {loadItem.distanceMiles ? `${loadItem.distanceMiles} mi` : "-"}
                    </td>
                    <td className="p-4 text-right text-slate-700">
                      {loadItem.pricePerMile ? `${loadItem.currency} ${loadItem.pricePerMile.toFixed(2)}` : "-"}
                    </td>
                    <td className="p-4 text-right font-semibold text-emerald-700">
                      {loadItem.totalPrice ? `${loadItem.currency} ${loadItem.totalPrice}` : "-"}
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={loadItem.status} />
                    </td>
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
                    <td className="p-4 text-slate-700 text-sm">
                      {loadItem.truckId?.model || "-"}
                    </td>
                    <td className="p-4 text-center text-slate-600 text-xs">
                      {loadItem.deliveredAt ? loadItem.deliveredAt.split("T")[0] : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-3xl mb-3">📦</div>
                      <div className="text-slate-600">No load records found</div>
                      <div className="text-slate-400 text-sm mt-1">Get started by creating your first load</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-slate-600">
            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.totalPages)} of {pagination.totalPages} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-slate-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Popup For Create Load */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Create New Load</h3>
              <button
                onClick={() => setPopup(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateLoad} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LocationAutocomplete
                  label="Pick Up (Origin)"
                  value={origin}
                  setValue={setOrigin}
                  placeholder="Enter origin address"
                />

                <LocationAutocomplete
                  label="Deliver (Destination)"
                  value={destination}
                  setValue={setDestination}
                  placeholder="Enter destination address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Calculated Distance</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={distance ? `${distance.toFixed(2)} miles` : ""}
                      className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Total Price</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IoCash className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                  <select
                    className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="" disabled>Select Currency</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="EGP">EGP</option>
                    <option value="GBP">GBP</option>
                    <option value="SAR">SAR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Driver</label>
                  <select
                    className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    required
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((d, i) => (
                      <option key={i} value={d.id}>
                        {d.name} ({d.driverId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Truck</label>
                  <select
                    className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    value={truckId}
                    onChange={(e) => setTruckId(e.target.value)}
                    required
                  >
                    <option value="">Select Truck</option>
                    {truck.map((t, i) => (
                      <option key={i} value={t.id}>
                        {t.model} ({t.truckId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mt-4"
              >
                <IoAdd size={18} />
                Create Load
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Popup For Update Load Status */}
      {popupLoadStatus && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Update Load Status</h3>
              <button
                onClick={() => setPopupLoadStatus(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateLoadStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Load ID</label>
                <select
                  className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors cursor-pointer"
                  value={selectedLoadId}
                  onChange={(e) => setSelectedLoadId(e.target.value)}
                  required
                >
                  <option value="">Select Load</option>
                  {load.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.loadId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors cursor-pointer"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as TStatusLoad)}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
              >
                <IoRefresh size={18} />
                Update Status
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default LoadsPage;