"use client";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

// type
type TStatus = "pending" | "in_transit" | "delivered" | "cancelled";
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
  status: TStatus;
  driverId: TDriverID;
  truckId: TTruckId;
  deliveredAt: string;
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
              <div className="flex flex-col gap-2">
                <label htmlFor="">Pick Up</label>
                <select className="border border-gray-500 p-2 rounded-lg cursor-pointer">
                  <option value="newYork">New York</option>
                  <option value="california">California</option>
                  <option value="Sydni">Sydni</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="">Deliver</label>
                <select className="border border-gray-500 p-2 rounded-lg cursor-pointer">
                  <option value="newYork">New York</option>
                  <option value="california">California</option>
                  <option value="Sydni">Sydni</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 col-span-2">
                <label htmlFor="">Miles</label>
                <input
                  type="text"
                  className="border border-gray-500 p-2 rounded-lg bg-gray-100"
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
                <input
                  type="text"
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="John"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="">Truck Number</label>
                <input
                  type="number"
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="abc-111"
                />
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
                <select className="border border-gray-500 p-2 rounded-lg cursor-pointer">
                  <option value="dispatcher1">Dispatcher 1</option>
                  <option value="dispatcher2">Dispatcher 2</option>
                  <option value="dispatcher3">Dispatcher 3</option>
                  <option value="dispatcher4">Dispatcher 4</option>
                </select>
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
