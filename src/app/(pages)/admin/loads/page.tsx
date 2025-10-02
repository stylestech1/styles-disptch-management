"use client";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
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

const LoadsPage = () => {
  const [load, setLoad] = useState<TLoads[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const token = useAppSelector((state: RootState) => state.auth.token);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setLoading(true);

    const fetchLoads = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiURL}/api/v1/loads`, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (!res.ok) throw new Error(result.message);

        setLoad(result.data);
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
  }, [apiURL]);

  // set loading
  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <Titles>All Loads</Titles>

        <button className="p-2 cursor-pointer text-white bg-green-700 hover:bg-green-800 transition-colors rounded-lg">
          Create New Load
        </button>
      </div>

      <table className="table-auto w-full my-10">
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
            <th className="border border-gray-500 p-2 capitalize">driver ID</th>
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
        <tbody>
          {load.length > 0 ? (
            load.map((load, i) => (
              <tr key={i}>
                <td className="border p-2">{load.loadId}</td>
                <td className="border p-2">{load.origin}</td>
                <td className="border p-2">{load.destination}</td>
                <td className="border p-2">{load.distanceMiles}</td>
                <td className="border p-2">{load.pricePerMileCents}</td>
                <td className="border p-2">{load.totalPriceCents}</td>
                <td className="border p-2">{load.status}</td>
                <td className="border p-2">{load.driverId.name}</td>
                <td className="border p-2">{load.driverId.driverId}</td>
                <td className="border p-2">{load.driverId.phone}</td>
                <td className="border p-2">{load.truckId.model}</td>
                <td className="border p-2">{load.truckId.truckId}</td>
                <td className="border p-2">{load.truckId.plateNumber}</td>
                <td className="border p-2">{load.deliveredAt}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={14} className="px-4 py-8 text-center text-gray-500">
                No Load records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LoadsPage;
