"use client";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { TDriver, TErrors, TLoads, TStatusLoad } from "@/types/globalTypes";
import { useState, useEffect } from "react";
import Erros from "@/components/ui/Erros";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import {
  IoPersonCircleOutline,
  IoMailOutline, 
  IoCallOutline,
  IoIdCardOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoStatsChart,
  IoNavigate,
  IoCashOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { FaMoneyBillWave } from "react-icons/fa";
import useLoading from "@/hook/useLoading";
import useError from "@/hook/useError";
import { apiClient } from "@/utils/apiClient";
import DataTable from "@/components/ui/DataTable";
import { driverSummaryColumns } from "@/data/driverSummaryTable";

type TPeriod = {
  from: string;
  to: string;
};
type TLoadSummary = {
  id: string;
  totalLoads: number;
  totalMiles: number;
  totalEarnings: number;
  pricePerMile: number;
  currency: string;
  period: TPeriod;
  loads: TLoads[];
};

const LoadSummary = () => {
  const [loadSummary, setLoadSummary] = useState<TLoadSummary[]>([]);
  const [drivers, setDrivers] = useState<TDriver[]>([]);
  const [profile, setProfile] = useState<TDriver | null>(null);

  const { id } = useParams();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const { loading, setLoading } = useLoading();
  const { error, setError } = useError();
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // FIXME: Get All Drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      if (!token) {
        console.log("No token found, redirecting to login");
        router.replace("/");
        return;
      }
      try {
        const result = await apiClient(`${apiURL}/api/v1/drivers`, token);
        setDrivers(result.data as TDriver[]);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message || "Drivers Failed");
        }
      }
    };
    fetchDrivers();
  }, [apiURL, token, router, setError]);

  // FIXME: Get Profile of Driver
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
        const result = await apiClient(`${apiURL}/api/v1/drivers/${id}`, token);
        setProfile(result.data as TDriver);
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
  }, [apiURL, drivers, token, id, router, setLoading]);

  // FIXME: Get Loads Summary
  useEffect(() => {
    if (!id) return;
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }

    const fetchLoadSummary = async () => {
      setLoading(true);
      try {
        const result = await apiClient(
          `${apiURL}/api/v1/loads/summary/${id}`,
          token
        );
        if (!Array.isArray(result.data)) {
          setLoadSummary([result.data] as TLoadSummary[]);
        } else {
          setLoadSummary(result.data);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message || "Loading Failed");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLoadSummary();
  }, [apiURL, token, drivers, id, router, setError, setLoading]);

  // Status badge component
  const StatusBadge = ({ status }: { status: TStatusLoad }) => {
    const statusConfig = {
      pending: {
        color: "bg-amber-100 text-amber-800 border-amber-300",
        icon: <IoTimeOutline size={14} className="mr-1" />,
      },
      in_transit: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: <IoNavigate size={14} className="mr-1" />,
      },
      delivered: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: <IoCheckmarkCircleOutline size={14} className="mr-1" />,
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: <IoTimeOutline size={14} className="mr-1" />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.icon}
        {status.replace("_", " ")}
      </span>
    );
  };

  // TODO: Table
  const renderDriverSummaryRow = (load: TLoads, index: number) => (
    <tr key={index} className="hover:bg-slate-50 transition-colors group">
      {/* Load ID */}
      <td className="p-4 font-medium text-slate-900">
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
          {load.loadId}
        </span>
      </td>

      {/* Origin */}
      <td className="p-4 text-slate-700 max-w-[140px]">
        <div className="truncate" title={load.origin}>
          {load.origin}
        </div>
      </td>

      {/* Destination */}
      <td className="p-4 text-slate-700 max-w-[140px]">
        <div className="truncate" title={load.destination}>
          {load.destination}
        </div>
      </td>

      {/* Miles */}
      <td className="p-4 text-right text-slate-700 font-medium">
        {load.distanceMiles?.toLocaleString()}
      </td>

      {/* Price/Mile */}
      <td className="p-4 text-right text-slate-700">
        {load.currency} {load.pricePerMile?.toFixed(2)}
      </td>

      {/* Total */}
      <td className="p-4 text-right font-semibold text-emerald-700">
        {load.currency} {load.totalPrice?.toLocaleString()}
      </td>

      {/* Status */}
      <td className="p-4 text-center">
        <StatusBadge status={load.status} />
      </td>

      {/* Truck */}
      <td className="p-4 text-slate-700 font-mono text-xs">
        {load.truckId?.truckId || "-"}
      </td>

      {/* Delivered */}
      <td className="p-4 text-center text-slate-600 text-xs">
        {load.deliveredAt ? load.deliveredAt.split("T")[0] : "-"}
      </td>
    </tr>
  );
  const flattenedLoads = loadSummary.flatMap((sum) => sum.loads);

  if (loading) return <Loading />;

  return (
    <section className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Titles>Driver Summary</Titles>
        <p className="text-slate-600 mt-2 text-sm">
          Detailed overview of driver performance and loads
        </p>
      </div>

      {/* Errors */}
      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Profile and Summary Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Driver Profile Card */}
        {profile && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-slate-100 rounded-xl">
                <IoPersonCircleOutline size={28} className="text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {profile.name}
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  {profile.driverId}
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-sm">
                <IoMailOutline
                  className="text-slate-400 flex-shrink-0"
                  size={16}
                />
                <span className="text-slate-600 truncate">{profile.email}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <IoCallOutline
                  className="text-slate-400 flex-shrink-0"
                  size={16}
                />
                <span className="text-slate-600">{profile.phone}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <IoIdCardOutline
                  className="text-slate-400 flex-shrink-0"
                  size={16}
                />
                <span className="text-slate-600 font-mono text-xs">
                  {profile.licenseNumber}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <IoCalendarOutline
                  className="text-slate-400 flex-shrink-0"
                  size={16}
                />
                <span className="text-slate-600">
                  {new Date(profile.hireDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <IoCheckmarkCircleOutline
                  className="text-slate-400 flex-shrink-0"
                  size={16}
                />
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium`}
                >
                  {profile.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {loadSummary.length > 0 &&
          loadSummary.map((sum, i) => (
            <div key={i} className="xl:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Total Loads Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium mb-1">
                        Total Loads
                      </p>
                      <p className="text-2xl font-bold text-slate-800">
                        {sum.totalLoads}
                      </p>
                    </div>
                    <div className="p-2.5 bg-blue-50 rounded-lg">
                      <IoStatsChart size={20} className="text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Total Miles Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium mb-1">
                        Total Miles
                      </p>
                      <p className="text-2xl font-bold text-slate-800">
                        {sum.totalMiles.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-lg">
                      <IoNavigate size={20} className="text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Total Earnings Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium mb-1">
                        Total Earnings
                      </p>
                      <p className="text-2xl font-bold text-slate-800">
                        {sum.currency} {sum.totalEarnings.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-lg">
                      <IoCashOutline size={20} className="text-amber-600" />
                    </div>
                  </div>
                </div>

                {/* Total Price/Mile Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium mb-1">
                        Price Per Mile
                      </p>
                      <p className="text-2xl font-bold text-slate-800">
                        {sum.currency} {sum.pricePerMile.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2.5 bg-red-50 rounded-lg">
                      <FaMoneyBillWave size={20} className="text-red-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Period Info */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <IoCalendarOutline size={14} className="flex-shrink-0" />
                    <span>Period: </span>
                    <span className="font-medium text-slate-700">
                      {sum.period.from.split("T")[0]} to{" "}
                      {sum.period.to.split("T")[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Currency: </span>
                    <span className="font-medium text-slate-700">
                      {sum.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Loads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            Load Details
          </h3>
          <p className="text-slate-500 text-sm">
            Detailed breakdown of all loads
          </p>
        </div>

        {/* Table For Driver Summary */}
        {flattenedLoads.length > 0 ? (
          <DataTable
            columns={driverSummaryColumns}
            data={flattenedLoads}
            renderRow={renderDriverSummaryRow}
            loading={loading}
          />
        ) : (
          <div className="px-4 py-12 text-center text-slate-500">
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl mb-3">📦</div>
              <div className="text-slate-600">
                No load records found for this period
              </div>
              <div className="text-slate-400 text-sm mt-1">
                Please check the selected time range
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {loadSummary.length > 0 && (
        <div className="mt-6 flex justify-end">
          <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
            <p className="text-sm text-slate-600">
              Showing{" "}
              {loadSummary.reduce((total, sum) => total + sum.loads.length, 0)}{" "}
              loads
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default LoadSummary;
