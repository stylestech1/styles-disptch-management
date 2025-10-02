"use client";
import LocationAutocomplete, {
  TPlace,
} from "@/components/sections/LocationAutocomplete";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

// type
type TStatusLoad = "pending" | "in_transit" | "delivered" | "cancelled";
type TStatusDriver = "inactive" | "available" | "busy";
type TDriverID = {
  name: string;
  driverId: number;
  phone: string;
};
type TTruckId = {
  model: string;
  truckId: number;
  plateNumber: string;
};
type TLoads = {
  id?: string;
  loadId: number;
  origin: string;
  destination: string;
  distanceMiles: number;
  pricePerMileCents: number;
  totalPriceCents: number;
  status: TStatusLoad;
  driverId: TDriverID;
  truckId: TTruckId;
  deliveredAt: string;
};
type TDriver = {
  id: string;
  driverId: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: TStatusDriver;
  hireDate: string;
  createdBy: string;
};
type TTruck = {
  id: string;
  truckId: number;
  plateNumber: string;
  model: string;
  year: number;
  capacity: number;
  status: TStatusDriver;
  createdBy: string;
  updatedBy: string;
};
type TPagination = {
  currentPage: number;
  limit: number;
  totalPages: number;
  next?: number;
  prev?: number;
};

const LoadsPage = () => {
  const [load, setLoad] = useState<TLoads[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [pagination, setPagination] = useState<TPagination | null>(null);
  const [page, setPage] = useState(1);
  const [popup, setPopup] = useState(false);
  const [drivers, setDrivers] = useState<TDriver[]>([]);
  const [truck, setTruck] = useState<TTruck[]>([]);
  const [origin, setOrigin] = useState<TPlace | null>(null);
  const [destination, setDestination] = useState<TPlace | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

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
        const res = await fetch(`${apiURL}/api/v1/trucks`, {
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

  // set loading
  if (loading) return <Loading />;

  return (
    <section className="relative">
      {/* Titles */}
      <div className="flex items-center justify-between">
        <Titles>All Loads</Titles>

        <button
          onClick={() => setPopup(true)}
          className="py-2 px-5 cursor-pointer text-white bg-green-700 hover:bg-green-800 transition-colors rounded-lg"
        >
          Create New Load
        </button>
      </div>

      {/* Errors */}
      {err && <Erros message={err} />}

      {/* Table For Loads */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200 my-10 text-center">
          <thead>
            <tr className="text-sm">
              <th className="border border-gray-500 p-2 capitalize">#</th>
              <th className="bg-gray-100 border border-gray-500 p-2 capitalize">
                Origin
              </th>
              <th className="border border-gray-500 p-2 capitalize">
                destination
              </th>
              <th className="bg-gray-100 border border-gray-500 p-2 capitalize">
                distanceMiles
              </th>
              <th className="border border-gray-500 p-2 capitalize">
                pricePerMileCents
              </th>
              <th className="bg-gray-100 border border-gray-500 p-2 capitalize">
                totalPriceCents
              </th>
              <th className="border border-gray-500 p-2 capitalize">status</th>
              <th className="bg-gray-100 border border-gray-500 p-2 capitalize">
                driver name
              </th>
              <th className="border border-gray-500 p-2 capitalize">
                driver ID
              </th>
              <th className="bg-gray-100 border border-gray-500 p-2 capitalize">
                driver phone
              </th>
              <th className="border border-gray-500 p-2 capitalize">
                turck model
              </th>
              <th className="bg-gray-100 border border-gray-500 p-2 capitalize">
                truck ID
              </th>
              <th className="border border-gray-500 p-2 capitalize">
                plate Number
              </th>
              <th className="bg-gray-100 border border-gray-500 p-2 capitalize">
                delivered At
              </th>
            </tr>
          </thead>
          <tbody className="overflow-x-auto">
            {load.length > 0 ? (
              load.map((load, i) => (
                <tr key={i}>
                  <td className="border p-2">{load.loadId}</td>
                  <td className="border p-2">
                    {load.origin ? load.origin : "-"}
                  </td>
                  <td className="border p-2">
                    {load.destination ? load.destination : "-"}
                  </td>
                  <td className="border p-2">
                    {load.distanceMiles ? load.distanceMiles : "-"}
                  </td>
                  <td className="border p-2">
                    {load.pricePerMileCents
                      ? load.pricePerMileCents + "¢"
                      : "-"}
                  </td>
                  <td className="border p-2">
                    {load.totalPriceCents ? load.totalPriceCents + "¢" : "-"}
                  </td>
                  <td className="border p-2">
                    {load.status ? load.status : "-"}
                  </td>
                  <td className="border p-2">
                    {load.driverId.name ? load.driverId.name : "-"}
                  </td>
                  <td className="border p-2">
                    {load.driverId.driverId ? load.driverId.driverId : "-"}
                  </td>
                  <td className="border p-2">
                    {load.driverId.phone ? load.driverId.phone : "-"}
                  </td>
                  <td className="border p-2">
                    {load.truckId.model ? load.truckId.model : "-"}
                  </td>
                  <td className="border p-2">
                    {load.truckId.truckId ? load.truckId.truckId : "-"}
                  </td>
                  <td className="border p-2">
                    {load.truckId.plateNumber ? load.truckId.plateNumber : "-"}
                  </td>
                  <td className="border p-2">
                    {load.deliveredAt ? load.deliveredAt.split("T")[0] : "-"}
                  </td>
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

      {/* Popup | Modal */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-50">
          <div className="relative rounded-lg shadow-xl border border-gray-300 bg-white/80 backdrop-blur-md p-5 max-w-3xl w-full">
            <button
              onClick={() => setPopup(false)}
              className="cursor-pointer text-red-600 absolute top-2 right-2"
            >
              <IoClose size={25} />
            </button>

            <form className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-5">
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
                <label htmlFor="">Price</label>
                <input
                  type="number"
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="9.9$"
                />
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
                <select className="border border-gray-500 p-2 rounded-lg cursor-pointer">
                  <option value="pickedUp">Picked Up</option>
                  <option value="in-transit">In-Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="">Driver Name</label>
                <select className="border border-gray-500 p-2 rounded-lg cursor-pointer">
                  {drivers.map((drv, i) => (
                    <option key={i} value={drv.name}>
                      {drv.name} - {drv.driverId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="">Truck Number</label>
                <select className="border border-gray-500 p-2 rounded-lg cursor-pointer">
                  {truck.map((trk, i) => (
                    <option key={i} value={trk.truckId}>
                      {trk.truckId}
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

              <div className="flex flex-col gap-2 col-span-2">
                <label htmlFor="">Load Status</label>
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
    </section>
  );
};

export default LoadsPage;
