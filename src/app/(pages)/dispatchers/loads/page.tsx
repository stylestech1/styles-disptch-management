"use client";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

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
    <section>
      <div className="flex items-center justify-between">
        <Titles>All Loads</Titles>

        <button className="py-2 px-5 cursor-pointer text-white bg-green-700 hover:bg-green-800 transition-colors rounded-lg">
          Create New Load
        </button>
      </div>

      {err && <Erros message={err} />}

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
    </section>
  );
};

export default LoadsPage;
