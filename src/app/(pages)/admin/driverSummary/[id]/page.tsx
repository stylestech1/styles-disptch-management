"use client";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { TDriver, TLoads, TStatusLoad } from "@/types/globalTypes";
import { useState, useEffect } from "react";
import Erros from "@/components/ui/Erros";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

type TPeriod = {
  from: string;
  to: string;
};
type TLoadSummary = {
  id: string;
  totalLoads: number;
  totalMiles: number;
  totalEarnings: number;
  currency: string;
  period: TPeriod;
  loads: TLoads[];
};

const LoadSummary = () => {
  const [loadSummary, setLoadSummary] = useState<TLoadSummary[]>([]);
  const [drivers, setDrivers] = useState<TDriver[]>([]);
  const [profile, setProfile] = useState<TDriver | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const { id } = useParams();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // Get All Drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch(`${apiURL}/api/v1/drivers`, {
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
          setErr(error.message || "Drivers Failed");
        }
      }
    };
    fetchDrivers();
  }, [apiURL, token]);

  // Get Profile of Driver
  useEffect(() => {
    if (!id) return;

    setLoading(true);

    const getProfile = async () => {
      try {
        const res = await fetch(`${apiURL}/api/v1/drivers/${id}`, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        console.log("Profile Result= ", result);
        if (!res.ok) throw new Error(result.message);

        setProfile(result.data);
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
  }, [apiURL, drivers, token, id]);

  // Get Loads Summary
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    const fetchLoadSummary = async () => {
      try {
        const res = await fetch(`${apiURL}/api/v1/loads/summary/${id}`, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        console.log(result.data);
        if (!Array.isArray(result.data)) {
          setLoadSummary([result.data]);
        } else {
          setLoadSummary(result.data);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message || "Loading Failed");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLoadSummary();
  }, [apiURL, token, drivers, id]);

  if (loading) return <Loading />;

  return (
    <section className="container mx-auto">
      {/* Titles */}
      <div className="flex items-start justify-between">
        <Titles>Driver Summary</Titles>

        <div className="flex items-center gap-5">
          <div className="flex flex-wrap gap-5 border border-gray-700 rounded-lg p-5">
            {profile && (
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">Name:</span>
                  <span>{profile.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold">Email:</span>
                  <span>{profile.email}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold">Phone:</span>
                  <span>{profile.phone}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold">License Number:</span>
                  <span>{profile.licenseNumber}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold">Hire Date:</span>
                  <span>{new Date(profile.hireDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold">Status:</span>
                  <span>{profile.status}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-5 border border-gray-700 rounded-lg p-5">
            {loadSummary.length > 0 ? (
              loadSummary.map((sum, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Total Loads</span>
                    <span>{sum.totalLoads}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold">Total Miles</span>
                    <span>{sum.totalMiles}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold">Total Earnings</span>
                    <span>{sum.totalEarnings}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold">Currency</span>
                    <span>{sum.currency}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold">Period From</span>
                    <span>{sum.period.from.split("T")[0]}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold">Period To</span>
                    <span>{sum.period.to.split("T")[0]}</span>
                  </div>
                </div>
              ))
            ) : (
              <div>No data</div>
            )}
          </div>
        </div>
      </div>

      {err && <Erros message={err} />}

      <div className="overflow-x-auto my-10">
        <table className="min-w-full border-collapse border border-gray-200 my-5 text-center">
          <thead>
            <tr className="text-sm">
              <th className="border p-2 capitalize">loadId</th>
              <th className="border p-2 capitalize">origin</th>
              <th className="border p-2 capitalize">destination</th>
              <th className="border p-2 capitalize">distance Miles</th>
              <th className="border p-2 capitalize">price Per Mile</th>
              <th className="border p-2 capitalize">total Price</th>
              <th className="border p-2 capitalize">currency</th>
              <th className="border p-2 capitalize">status</th>
              <th className="border p-2 capitalize">Driver Id</th>
              <th className="border p-2 capitalize">Truck Id</th>
              <th className="border p-2 capitalize">delivered At</th>
              <th className="border p-2 capitalize">cancelled At</th>
              <th className="border p-2 capitalize">created By</th>
              <th className="border p-2 capitalize">updated By</th>
            </tr>
          </thead>
          <tbody>
            {loadSummary.length > 0 ? (
              loadSummary.map((sum) =>
                sum.loads.map((load, i) => (
                  <tr key={i}>
                    <td className="border p-2">{load.loadId}</td>
                    <td className="border p-2">{load.origin.split(',')[0]}</td>
                    <td className="border p-2">{load.destination.split(',')[0]}</td>
                    <td className="border p-2">{load.distanceMiles}</td>
                    <td className="border p-2">{load.pricePerMile}</td>
                    <td className="border p-2">{load.totalPrice}</td>
                    <td className="border p-2">{load.currency}</td>
                    <td className="border p-2">{load.status}</td>
                    <td className="border p-2">{load.driverId.driverId}</td>
                    <td className="border p-2">{load.truckId.truckId}</td>
                    <td className="border p-2">{load.deliveredAt?.split('T')[0]}</td>
                    <td className="border p-2">{load.cancelledAt ? load.cancelledAt?.split('T')[0] : '-'}</td>
                    <td className="border p-2">
                      {load.createdBy === 'undefined' ? "-" : load.createdBy}
                    </td>
                    <td className="border p-2">
                      {load.updatedBy === 'undefined' ? "-" : load.updatedBy}
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan={19} className="px-4 py-8 text-gray-500">
                  No Driver records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default LoadSummary;
