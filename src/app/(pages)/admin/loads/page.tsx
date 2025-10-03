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
import { IoClose } from "react-icons/io5";

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

  // set loading
  if (loading) return <Loading />;

  return (
    <section className="relative">
      {/* Titles */}
      <div className="flex items-center justify-between">
        <Titles>All Loads</Titles>
        <Toaster position="top-right" />

        <div className="flex items-center gap-5">
          <button
            onClick={() => setPopupLoadStatus(true)}
            className="py-2 px-5 cursor-pointer text-white bg-blue-700 hover:bg-blue-800 transition-colors rounded-lg"
          >
            Update Load Status
          </button>

          <button
            onClick={() => setPopup(true)}
            className="py-2 px-5 cursor-pointer text-white bg-green-700 hover:bg-green-800 transition-colors rounded-lg"
          >
            Create New Load
          </button>
        </div>
      </div>

      {/* Errors */}
      {err && <Erros message={err} />}

      {/* Table For Loads */}
      <div className="overflow-x-auto my-10">
        <table className="w-full border border-gray-200 rounded-lg shadow-md text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Origin</th>
              <th className="p-3 text-left">Destination</th>
              <th className="p-3 text-center">Distance (mi)</th>
              <th className="p-3 text-center">Price/Mile</th>
              <th className="p-3 text-center">Total Price</th>
              <th className="p-3 text-center">Currency</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-left">Driver</th>
              <th className="p-3 text-center">Truck</th>
              <th className="p-3 text-center">Plate</th>
              <th className="p-3 text-center">Delivered At</th>
              <th className="p-3 text-center">Created By</th>
              <th className="p-3 text-center">Updated By</th>
            </tr>
          </thead>
          <tbody>
            {load.length > 0 ? (
              load.map((load, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-gray-50 odd:bg-white even:bg-gray-50"
                >
                  <td className="p-3 font-semibold">{load.loadId}</td>
                  <td className="p-3 truncate">
                    {load.origin?.split(",")[0] || "-"}
                  </td>
                  <td className="p-3 truncate">
                    {load.destination?.split(",")[0] || "-"}
                  </td>
                  <td className="p-3 text-center">
                    {load.distanceMiles || "-"}
                  </td>
                  <td className="p-3 text-center">
                    {load.pricePerMile ? load.pricePerMile.toFixed(2) : "-"}
                  </td>
                  <td className="p-3 text-center font-semibold text-green-700">
                    {load.totalPrice || "-"}
                  </td>
                  <td className="p-3 text-center">{load.currency || "-"}</td>
                  <td
                    className={`p-3 text-center font-medium ${
                      load.status === "in_transit"
                        ? "text-blue-600"
                        : load.status === "delivered"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {load.status || "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {load.driverId?.name || "-"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {load.driverId?.phone || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {load.truckId?.model || "-"}
                  </td>
                  <td className="p-3 text-center">
                    {load.truckId?.plateNumber || "-"}
                  </td>
                  <td className="p-3 text-center">
                    {load.deliveredAt ? load.deliveredAt.split("T")[0] : "-"}
                  </td>
                  <td className="p-3 text-center">{load.createdBy || "-"}</td>
                  <td className="p-3 text-center">{load.updatedBy || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={14}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No Load records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-end items-center gap-5 mt-5">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="cursor-pointer px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            className="cursor-pointer px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Popup For Create Load */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-50">
          <div className="relative rounded-lg shadow-xl border border-gray-300 bg-white/80 backdrop-blur-md p-5 max-w-3xl w-full">
            <button
              onClick={() => setPopup(false)}
              className="cursor-pointer text-white absolute top-3 right-3 p-1 rounded-lg bg-red-600"
            >
              <IoClose size={20} />
            </button>

            <form
              onSubmit={handleCreateLoad}
              className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <LocationAutocomplete
                label="Pick Up (Origin)"
                value={origin}
                setValue={setOrigin}
                placeholder="Enter origin"
              />

              <LocationAutocomplete
                label="Deliver (Destination)"
                value={destination}
                setValue={setDestination}
                placeholder="Enter destination"
              />

              <div className="flex flex-col gap-2 col-span-2">
                <label>Miles</label>
                <input
                  type="text"
                  value={distance ? distance.toFixed(2) : ""}
                  className="border p-2 rounded bg-gray-100"
                  disabled
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="">Price Per Mile</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="9.9$"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="">Currency</label>
                <select
                  className="border p-2 rounded"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="" disabled>
                    Select Currency
                  </option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="EGP">EGP</option>
                  <option value="GBP">GBP</option>
                  <option value="SAR">SAR</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="">Load Number</label>
                <input
                  type="number"
                  className="border border-gray-500 p-2 rounded-lg bg-gray-100"
                  disabled
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="">Load Status</label>
                <input
                  type="number"
                  className="border border-gray-500 p-2 rounded-lg bg-gray-100"
                  disabled
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Driver</label>
                <select
                  className="border p-2 rounded"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  required
                >
                  <option>Select Driver</option>
                  {drivers.map((d, i) => (
                    <option key={i} value={d.id}>
                      {d.name} {"->"} {d.driverId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label>Truck</label>
                <select
                  className="border p-2 rounded"
                  value={truckId}
                  onChange={(e) => setTruckId(e.target.value)}
                  required
                >
                  <option>Select Truck</option>
                  {truck.map((t, i) => (
                    <option key={i} value={t.id}>
                      {t.model} - {t.truckId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="">Trailer Name</label>
                <input
                  type="text"
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="Wick"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="">Dispatcher</label>
                <input
                  type="text"
                  className="border border-gray-500 p-2 rounded-lg bg-gray-100"
                  disabled
                />
              </div>

              <button
                type="submit"
                className="w-full col-span-2 py-2 px-5 cursor-pointer text-white bg-green-700 hover:bg-green-800 transition-colors rounded-lg"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Popup For Update Load Status */}
      {popupLoadStatus && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-50">
          <div className="relative rounded-lg shadow-xl border border-gray-300 bg-white/80 backdrop-blur-md p-5 max-w-3xl w-full">
            <button
              onClick={() => setPopupLoadStatus(false)}
              className="cursor-pointer text-white absolute top-3 right-3 p-1 rounded-lg bg-red-600"
            >
              <IoClose size={20} />
            </button>

            <form
              onSubmit={handleUpdateLoadStatus}
              className="mt-10 flex flex-col gap-5"
            >
              {/* Load ID */}
              <div className="flex flex-col gap-2">
                <label>Load ID</label>
                <select
                  className="border p-2 rounded cursor-pointer"
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

              {/* Status */}
              <div className="flex flex-col gap-2">
                <label>Status</label>
                <select
                  className="border p-2 rounded cursor-pointer"
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as TStatusLoad)
                  }
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
                className="w-full col-span-2 py-2 px-5 cursor-pointer text-white bg-orange-500 hover:bg-orange-600 transition-colors rounded-lg"
              >
                Update
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default LoadsPage;
