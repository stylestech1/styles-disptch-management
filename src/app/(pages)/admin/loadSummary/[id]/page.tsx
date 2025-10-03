"use client";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { TLoads } from "@/types/globalTypes";
import { useState, useEffect } from "react";
import Erros from "@/components/ui/Erros";

// type
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
  const [loadSumamry, setLoadSumamry] = useState<TLoadSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const userID = useAppSelector((state: RootState) => state.auth.user?.id);
  const token = useAppSelector((state: RootState) => state.auth.token);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // Get Loads Summary
  useEffect(() => {
    setLoading(true);
    const fetchLoadSummary = async () => {
      try {
        const res = await fetch(`${apiURL}/api/v1/loads/summary/${userID}`, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        setLoadSumamry(result.data);
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message || "Loading Failed");
          alert(error.message || "Loading Failed");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLoadSummary();
  }, [apiURL, token, userID]);

  // set loading
  if (loading) return <Loading />;

  return (
    <section className="container mx-auto">
      {/* Titles */}
      <Titles>All Loads</Titles>

      {/* Errors */}
      {err && <Erros message={err} />}

      {/* Tables */}
      <table className="min-w-[1200px] w-full border-collapse border border-gray-200 my-10 text-center">
        <thead>
          <tr className="text-sm">
            <th className="border border-gray-500 p-2 capitalize">#</th>
            <th className="bg-gray-100 border border-gray-500 p-2 capitalize">
              totalLoads
            </th>
            <th className="border border-gray-500 p-2 capitalize">
              totalMiles
            </th>
            <th className="bg-gray-100 border border-gray-500 p-2 capitalize">
              totalEarnings
            </th>
            <th className="border border-gray-500 p-2 capitalize">currency</th>
            <th className="bg-gray-100 border border-gray-500 p-2 capitalize">
              period from
            </th>
            <th className="border border-gray-500 p-2 capitalize">period to</th>
          </tr>
        </thead>
        <tbody>
          {loadSumamry.length > 0 ? (
            loadSumamry.map((sum, i) => (
              <tr key={i}>
                <td className="border p-2">{sum.id}</td>
                <td className="border p-2">{sum.totalLoads}</td>
                <td className="border p-2">{sum.totalMiles}</td>
                <td className="border p-2">{sum.totalEarnings}</td>
                <td className="border p-2">{sum.currency}</td>
                <td className="border p-2">{sum.period.from}</td>
                <td className="border p-2">{sum.period.to}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No Load records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};

export default LoadSummary;
