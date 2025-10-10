"use client";
import LocationAutocomplete, {
  TPlace,
} from "@/components/sections/LocationAutocomplete";
import MapView from "@/components/sections/MapView";
import DataTable from "@/components/ui/DataTable";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Modal from "@/components/ui/Modals";
import Pagination from "@/components/ui/Pagination";
import StatsCard from "@/components/ui/StatsCard";
import StatusBadge from "@/components/ui/StatusBadge";
import Titles from "@/components/ui/Titles";
import { loadColumns } from "@/data/loadTables";
import useError from "@/hook/useError";
import useLoading from "@/hook/useLoading";
import { RootState, useAppSelector } from "@/redux/store";
import {
  TDriver,
  TLoads,
  TPagination,
  TTruck,
  TStatusLoad,
  TTruckType,
  TComments,
  TruckApiResponse,
} from "@/types/globalTypes";
import { apiClient } from "@/utils/apiClient";
import { haversineDistance } from "@/utils/haversineDistance";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CiStickyNote } from "react-icons/ci";
import { IoMdKey } from "react-icons/io";
import {
  IoClose,
  IoAdd,
  IoRefresh,
  IoCheckmark,
  IoTime,
  IoCar,
  IoNavigate,
  IoCash,
  IoSearch,
} from "react-icons/io5";
import { MdEdit } from "react-icons/md";

const LoadsPage = () => {
  const [pagination, setPagination] = useState<TPagination | null>(null);
  const [page, setPage] = useState(1);
  const [popup, setPopup] = useState(false);
  const [popupLoadStatus, setPopupLoadStatus] = useState(false);
  const [popupNote, setPopupNote] = useState(false);
  const [popupAllNote, setPopupAllNote] = useState(false);

  const [load, setLoad] = useState<TLoads[]>([]);
  const [drivers, setDrivers] = useState<TDriver[]>([]);
  const [truck, setTruck] = useState<TTruck[]>([]);
  const [origin, setOrigin] = useState<TPlace | null>(null);
  const [destinations, setDestinations] = useState<(TPlace | null)[]>([]);
  const [dho, setDho] = useState<TPlace | null>(null);
  const [dhoToOriginDistance, setDhoToOriginDistance] = useState<number | null>(
    null
  );
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [price, setPrice] = useState<string>("");
  const [fees, setFees] = useState<string>("");
  const [pricePerMile, setPricePerMile] = useState<number | null>(null);
  const [driverId, setDriverId] = useState<string>("");
  const [truckId, setTruckId] = useState<string>("");
  const [deliveredAt, setDeliveredAt] = useState<string>("");
  const [cancelledAt, setCancelledAt] = useState<string>("");
  const [pickupAt, setPickupAt] = useState<string>("");
  const [completedAt, setCompletedAt] = useState<string>("");
  const [truckType, setTruckType] = useState<string>("reefer");
  const [truckTemp, setTruckTemp] = useState<string>("");
  const [selectedLoadId, setSelectedLoadId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TStatusLoad>("pending");
  const [addingNote, setAddingNote] = useState<string>("");
  const [selectedLoadIdForNote, setSelectedLoadIdForNote] = useState("");
  const [allNotes, setAllNotes] = useState<TComments[]>([]);
  const [selectedLoadForNotes, setSelectedLoadForNotes] =
    useState<TLoads | null>(null);
  const [loadIDInp, setLoadIDInp] = useState<string>("");
  const [noteType, setNoteType] = useState<"dispatcher" | "driver">(
    "dispatcher"
  );
  const [allLoads, setAllLoads] = useState<TLoads[]>([]);
  const [search, setSearch] = useState("");

  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const { loading, setLoading } = useLoading();
  const { error, setError } = useError();

  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // FIXME: Fetching All Loads
  const fetchLoads = async () => {
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }
    try {
      setLoading(true);
      const result = await apiClient(
        `${apiURL}/api/v1/loads?page=${page}&limit=10`,
        token
      );

      setLoad((result.data as TLoads[]) || []);
      setPagination((result.paginationResult as TPagination) || {});
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "Loading Failed");
        toast.error(error.message || "Loading failed ❌", {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // FIXME: Get all Loads
  useEffect(() => {
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }
    fetchLoads();
  }, [apiURL, token, router, page]);

  // FIXME: Get all driver
  useEffect(() => {
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }
    const getDrivers = async () => {
      try {
        setLoading(true);
        const result = await apiClient(
          `${apiURL}/api/v1/drivers?status=available`,
          token
        );
        setDrivers((result.data as TDriver[]) || []);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message || "Loading Failed");
          toast.error(error.message || "Loading failed ❌", {
            style: { background: "#dc2626", color: "#fff" },
          });
        }
      } finally {
        setLoading(false);
      }
    };

    getDrivers();
  }, [apiURL, token, router]);

  // FIXME: Get all trucks
  useEffect(() => {
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }
    const getTrucks = async () => {
      try {
        setLoading(true);
        const result = await apiClient(
          `${apiURL}/api/v1/trucks?status=available`,
          token
        );
        const truckData = result.data as TruckApiResponse;
        setTruck(truckData.data as TTruck[]);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message || "Loading Failed");
          toast.error(error.message || "Loading failed ❌", {
            style: { background: "#dc2626", color: "#fff" },
          });
        }
      } finally {
        setLoading(false);
      }
    };

    getTrucks();
  }, [apiURL, token, router]);

  // TODO: Multiple Destinations Functions
  const addDestination = () => {
    setDestinations([...destinations, null]);
  };
  const updateDestination = (index: number, place: TPlace | null) => {
    const newDestinations = [...destinations];
    newDestinations[index] = place;
    setDestinations(newDestinations);
  };
  const removeDestination = (index: number) => {
    const newDestinations = destinations.filter((_, i) => i !== index);
    setDestinations(newDestinations);
  };

  // TODO: Get Distance between DHO and Origin (Miles)
  useEffect(() => {
    const calculateDhoToOriginDistance = () => {
      if (dho && origin) {
        const distance = haversineDistance(
          { lat: parseFloat(dho.lat), lon: parseFloat(dho.lon) },
          { lat: parseFloat(origin.lat), lon: parseFloat(origin.lon) }
        );
        setDhoToOriginDistance(distance);
      } else {
        setDhoToOriginDistance(null);
      }
    };
    calculateDhoToOriginDistance();
  }, [dho, origin]);

  // TODO: Calc Average time between DHO and Origin
  useEffect(() => {
    const calculateAverageTime = () => {
      if (dhoToOriginDistance) {
        const timeInHours = dhoToOriginDistance / 55;
        setAverageTime(timeInHours);
      } else {
        setAverageTime(null);
      }
    };
    calculateAverageTime();
  }, [dhoToOriginDistance]);

  // TODO: Formating Time of (Average time between DHO and Origin)
  const formatTime = (hours: number): string => {
    const totalMinutes = hours * 60;
    const hoursPart = Math.floor(totalMinutes / 60);
    const minutesPart = Math.round(totalMinutes % 60);

    if (hoursPart === 0) {
      return `${minutesPart} minutes`;
    } else if (minutesPart === 0) {
      return `${hoursPart} hours`;
    } else {
      return `${hoursPart}h ${minutesPart}m`;
    }
  };

  // TODO: Get All Distance (Miles)
  useEffect(() => {
    const calculateTotalDistance = () => {
      // Type guard function
      const isValidPlace = (place: TPlace | null): place is TPlace => {
        return place !== null;
      };

      // Filter out null destinations
      const validDestinations = destinations.filter(isValidPlace);

      if (dho && origin && validDestinations.length > 0) {
        let totalDistance = 0;

        // DHO to Origin
        const dhoToOrigin = haversineDistance(
          { lat: parseFloat(dho.lat), lon: parseFloat(dho.lon) },
          { lat: parseFloat(origin.lat), lon: parseFloat(origin.lon) }
        );
        totalDistance += dhoToOrigin;

        // Origin to first destination
        const originToFirstDest = haversineDistance(
          { lat: parseFloat(origin.lat), lon: parseFloat(origin.lon) },
          {
            lat: parseFloat(validDestinations[0].lat),
            lon: parseFloat(validDestinations[0].lon),
          }
        );
        totalDistance += originToFirstDest;

        // Between destinations
        for (let i = 0; i < validDestinations.length - 1; i++) {
          const segmentDistance = haversineDistance(
            {
              lat: parseFloat(validDestinations[i].lat),
              lon: parseFloat(validDestinations[i].lon),
            },
            {
              lat: parseFloat(validDestinations[i + 1].lat),
              lon: parseFloat(validDestinations[i + 1].lon),
            }
          );
          totalDistance += segmentDistance;
        }

        setDistance(totalDistance);
      } else if (origin && validDestinations.length > 0) {
        let totalDistance = 0;

        // Origin to first destination
        const originToFirstDest = haversineDistance(
          { lat: parseFloat(origin.lat), lon: parseFloat(origin.lon) },
          {
            lat: parseFloat(validDestinations[0].lat),
            lon: parseFloat(validDestinations[0].lon),
          }
        );
        totalDistance += originToFirstDest;

        // Between destinations
        for (let i = 0; i < validDestinations.length - 1; i++) {
          const segmentDistance = haversineDistance(
            {
              lat: parseFloat(validDestinations[i].lat),
              lon: parseFloat(validDestinations[i].lon),
            },
            {
              lat: parseFloat(validDestinations[i + 1].lat),
              lon: parseFloat(validDestinations[i + 1].lon),
            }
          );
          totalDistance += segmentDistance;
        }

        setDistance(totalDistance);
      } else {
        setDistance(null);
      }
    };

    calculateTotalDistance();
  }, [origin, destinations, dho]);

  // TODO: Send PickupAt as Date formate to Backend
  const formatPickupAt = (timeString: string): string | null => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(":");
    const pickupDate = new Date();
    pickupDate.setHours(Number(hours), Number(minutes), 0, 0);

    return pickupDate.toISOString();
  };
  const pickupAtISO = formatPickupAt(pickupAt);
  const completedAtISO = formatPickupAt(completedAt);

  // FIXME: Create Load
  const handleCreateLoad = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }

    const total = Number(price);

    const validDestinations = destinations.filter((dest) => dest !== null);
    if (!origin || validDestinations.length === 0)
      return toast.error("Please select origin and at least one destination", {
        style: { background: "#dc2626", color: "#fff" },
      });
    if (!driverId || !truckId)
      return toast.error("Please select driver and truck", {
        style: { background: "#dc2626", color: "#fff" },
      });
    if (!total || total <= 0)
      return toast.error("Please enter a valid total price", {
        style: { background: "#dc2626", color: "#fff" },
      });
    if (!distance || distance <= 0)
      return toast.error("Invalid distance calculated", {
        style: { background: "#dc2626", color: "#fff" },
      });

    const body = {
      origin: { address: origin.display_name },
      destination: validDestinations.map((dest) => ({
        address: dest.display_name,
      })),
      DHO: dho ? { address: dho.display_name } : null,
      driverId,
      truckId,
      deliveredAt,
      cancelledAt,
      pickupAt: pickupAtISO,
      completedAt: completedAtISO,
      truckTemp,
      truckType,
      distanceMiles: Math.round(distance),
      totalPrice: total,
      pricePerMile: total / distance,
      feesNumber: fees,
      loadId: loadIDInp,
    };

    try {
      const result = await apiClient(`${apiURL}/api/v1/loads`, token, {
        method: "POST",
        body: JSON.stringify(body),
      });

      toast.success(result.message || "Load created ✅", {
        style: { background: "#16a34a", color: "#fff" },
      });

      await fetchLoads();
      setDho(null);
      setOrigin(null);
      setDestinations([]);
      setPopup(false);

      // Distance and price fields
      setDistance(null);
      setDhoToOriginDistance(null);
      setAverageTime(null);
      setPrice("");
      setPricePerMile(null);
      setFees("");

      // Driver and truck fields
      setDriverId("");
      setTruckId("");
      setTruckType("reefer");
      setTruckTemp("");

      // Time fields
      setPickupAt("");
      setCompletedAt("");
      setDeliveredAt("");
      setCancelledAt("");

      // Load ID
      setLoadIDInp("");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || "Load creation failed ❌", {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  };

  // FIXME: Update Load Status
  const handleUpdateLoadStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }

    if (!selectedLoadId)
      return toast.error("Please select a load", {
        style: { background: "#dc2626", color: "#fff" },
      });

    try {
      const result = await apiClient(
        `${apiURL}/api/v1/loads/status/${selectedLoadId}`,
        token,
        {
          method: "PATCH",
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
        setError(error.message || "Update failed");
        toast.error(error.message || "Update failed ❌", {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  };

  // FIXME: Add Notes
  const handleNotes = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }

    if (!selectedLoadIdForNote)
      return toast.error("Please select a load", {
        style: { background: "#dc2626", color: "#fff" },
      });

    if (!addingNote.trim())
      return toast.error("Please enter a note", {
        style: { background: "#dc2626", color: "#fff" },
      });

    try {
      const result = await apiClient(
        `${apiURL}/api/v1/loads/${selectedLoadIdForNote}/comments`,
        token,
        {
          method: "POST",
          body: JSON.stringify({ text: addingNote, type: noteType }),
        }
      );

      toast.success(result.message || "Note was Added ✅", {
        style: { background: "#16a34a", color: "#fff" },
      });

      // Reset form
      setAddingNote("");
      setSelectedLoadIdForNote("");
      setPopupNote(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "Adding note failed");
        toast.error(error.message || "Adding note failed ❌", {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  };

  // FIXME: Get All Notes
  const fetchAllNotes = async (loadId: string) => {
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }

    try {
      setLoading(true);

      const result = await apiClient(
        `${apiURL}/api/v1/loads/${loadId}/comments`,
        token
      ) as { comments: TComments[] };

      setAllNotes(result.comments || []);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "Failed to fetch notes");
        toast.error(error.message || "Failed to fetch notes ❌", {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // TODO: Open Note for Selected Load
  const openAllNotesPopup = async (loadItem: TLoads) => {
    if (!loadItem?.id) return;
    setSelectedLoadForNotes(loadItem);
    await fetchAllNotes(loadItem?.id);
    setPopupAllNote(true);
  };

  // FIXME: Filter loadId
  const fetchAllLoads = async () => {
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }

    try {
      const result = await apiClient(
        `${apiURL}/api/v1/loads?limit=1000`,
        token
      );

      setAllLoads((result.data as TLoads[]) || []);
    } catch (error) {
      console.error("Error fetching all loads:", error);
    }
  };
  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }
    fetchLoads();
    fetchAllLoads();
  }, [apiURL, token, router, page]);
  const filteredLoads = search
    ? allLoads.filter((l) =>
        l.loadId.toLowerCase().includes(search.toLowerCase())
      )
    : load;

  // TODO: set loading
  if (loading) return <Loading />;

  // TODO: Table
  const renderLoadRow = (loadItem: TLoads, index: number) => (
    <tr key={index} className="hover:bg-slate-50 transition-colors group">
      {/* Load ID */}
      <td className="p-4 text-center">
        <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium">
          {loadItem.loadId}
        </span>
      </td>

      {/* Route */}
      <td className="p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-700">
            <IoNavigate size={14} className="text-slate-400" />
            <span
              className="text-sm max-w-[120px] truncate"
              title={loadItem.origin}
            >
              {loadItem.origin || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <IoCheckmark size={14} className="text-slate-400" />
            <span
              className="text-sm max-w-[120px] truncate"
              title={
                Array.isArray(loadItem.destination)
                  ? loadItem.destination.join(", ")
                  : loadItem.destination
              }
            >
              {Array.isArray(loadItem.destination)
                ? loadItem.destination.join(", ")
                : loadItem.destination || "-"}
            </span>
          </div>
        </div>
      </td>

      {/* Distance */}
      <td className="p-4 text-center text-slate-700 font-medium">
        {loadItem.distanceMiles ? `${loadItem.distanceMiles} mi` : "-"}
      </td>

      {/* Price Per Mile */}
      <td className="p-4 text-center text-slate-700">
        {loadItem.pricePerMile ? `${loadItem.pricePerMile.toFixed(2)} $` : "-"}
      </td>

      {/* Total */}
      <td className="p-4 text-center font-semibold text-emerald-700">
        {loadItem.totalPrice ? `${loadItem.totalPrice} $` : "-"}
      </td>

      {/* Status */}
      <td className="p-4 text-center">
        <StatusBadge status={loadItem.status} size="md" />
      </td>

      {/* Driver */}
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

      {/* Pickup Appointment */}
      <td className="p-4">
        <div className="text-center space-y-1">
          {loadItem.pickupAt ? (
            <>
              <div className="text-sm font-medium text-slate-800">
                {new Date(loadItem.pickupAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-slate-500">
                {new Date(loadItem.pickupAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </>
          ) : (
            <span className="text-sm text-slate-400">-</span>
          )}
        </div>
      </td>

      {/* Delivery Appointment */}
      <td className="p-4">
        <div className="text-center space-y-1">
          {loadItem.deliveredAt ? (
            <>
              <div className="text-sm font-medium text-green-700">
                {new Date(loadItem.deliveredAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-green-500">
                {new Date(loadItem.deliveredAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </>
          ) : (
            <span className="text-sm text-slate-400">-</span>
          )}
        </div>
      </td>

      {/* Completed */}
      <td className="p-4">
        <div className="text-center space-y-1">
          {loadItem.completedAt ? (
            <>
              <div className="text-sm font-medium text-slate-800">
                {new Date(loadItem.completedAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-slate-500">
                {new Date(loadItem.completedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </>
          ) : (
            <span className="text-sm text-slate-400">-</span>
          )}
        </div>
      </td>

      {/* Notes */}
      <td className="p-4 text-center text-slate-600 text-xs">
        <button
          onClick={() => openAllNotesPopup(loadItem)}
          className="cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-800 hover:text-blue-200 transition-colors"
        >
          <CiStickyNote />
          <span>view</span>
        </button>
      </td>
    </tr>
  );

  return (
    <section className="relative p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row md:items-center lg:justify-between mb-10">
        <div className="mb-4 lg:mb-0">
          <Titles>Load Management</Titles>
          <p className="text-slate-600 mt-2 text-sm">
            Manage and track all your shipments and deliveries
          </p>
        </div>

        {/* Search */}
        <div>
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearch className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search drivers by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPopupNote(true)}
            className="flex items-center gap-2 py-3 px-5 cursor-pointer text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm font-medium"
          >
            <MdEdit size={18} />
            Add Note
          </button>

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
      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Loads"
          value={allLoads.length || 0}
          icon={IoCar}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />

        <StatsCard
          title="Pending"
          value={load.filter((l) => l.status === "pending").length}
          icon={IoTime}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />

        <StatsCard
          title="In Transit"
          value={load.filter((l) => l.status === "in_transit").length}
          icon={IoNavigate}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />

        <StatsCard
          title="Delivered"
          value={load.filter((l) => l.status === "delivered").length}
          icon={IoCheckmark}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
        />
      </div>

      {/* Table For Loads */}
      <DataTable
        columns={loadColumns}
        data={filteredLoads}
        renderRow={renderLoadRow}
        loading={loading}
      />

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        page={page}
        setPage={setPage}
        pageSize={10}
        showInfo={true}
      />

      {/* Popup For Create Load */}
      <Modal
        isOpen={popup}
        onClose={() => setPopup(false)}
        title="Create New Load"
        size="xl"
      >
        <form onSubmit={handleCreateLoad} className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Direction */}
            <div className="space-y-6">
              <LocationAutocomplete
                label="DHO (Driver Home Origin)"
                value={dho}
                setValue={setDho}
                placeholder="Enter driver's starting location"
              />

              <LocationAutocomplete
                label="Pick Up (Origin)"
                value={origin}
                setValue={setOrigin}
                placeholder="Enter origin address"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    DHO to Origin Distance
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        dhoToOriginDistance
                          ? `${dhoToOriginDistance.toFixed(2)} miles`
                          : ""
                      }
                      className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium"
                      readOnly
                      placeholder="Distance will auto-calculate"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Average Time To Pickup
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={averageTime ? `${formatTime(averageTime)}` : ""}
                      className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium"
                      readOnly
                      placeholder="Time will auto-calculate"
                    />
                  </div>
                </div>
              </div>

              {/* Destinations Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Destinations
                  </label>
                  <button
                    type="button"
                    onClick={addDestination}
                    className="flex items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <IoAdd size={16} />
                    Add Destination
                  </button>
                </div>

                {destinations.map((destination, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <LocationAutocomplete
                        label={`Destination ${index + 1}`}
                        value={destination}
                        setValue={(place) => updateDestination(index, place)}
                        placeholder={`Enter destination ${index + 1} address`}
                      />
                    </div>

                    {destinations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDestination(index)}
                        className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <IoClose size={20} />
                      </button>
                    )}
                  </div>
                ))}

                {destinations.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-lg">
                    <p className="text-slate-500">No destinations added yet</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {'Click "Add Destination" to start adding stops'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Maps */}
            <div className="grid grid-cols-1 gap-6">
              <MapView origin={origin} destinations={destinations} dho={dho} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Calculated All Distance
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={distance ? `${distance.toFixed(2)} miles` : ""}
                  className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoCash className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  step="0.01"
                  value={price}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPrice(value);
                    if (distance && Number(distance) > 0) {
                      const perMile = Number(value) / Number(distance);
                      setPricePerMile(perMile);
                    } else {
                      setPricePerMile(null);
                    }
                  }}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price Per Mile
              </label>
              <div>
                <input
                  type="text"
                  value={
                    price &&
                    distance &&
                    Number(price) > 0 &&
                    Number(distance) > 0
                      ? `$${(Number(price) / Number(distance)).toFixed(3)}`
                      : "$0.000"
                  }
                  className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fees Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoCash className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  step="0.01"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="115"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Load Id <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoMdKey className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={loadIDInp}
                  onChange={(e) => setLoadIDInp(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="A101"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pickup At <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoTime className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="time"
                  value={pickupAt}
                  onChange={(e) => setPickupAt(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Complete At <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoTime className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="time"
                  value={completedAt}
                  onChange={(e) => setCompletedAt(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Driver <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Truck Type <span className="text-red-500">*</span>
              </label>
              <select
                className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                value={truckType}
                onChange={(e) => {
                  setTruckType(e.target.value as TTruckType);
                  setTruckId("");
                }}
                required
              >
                <option value="">Select Type</option>
                <option value="reefer">Reefer</option>
                <option value="van">Van</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Truck
              </label>
              <select
                className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                value={truckId}
                onChange={(e) => setTruckId(e.target.value)}
                required
                disabled={!truckType}
              >
                <option value="">Select Truck</option>
                {truck
                  .filter((t) => !truckType || t.type === truckType)
                  .map((t, i) => (
                    <option key={i} value={t.id}>
                      {t.model} ({t.truckId}) ({t.type})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Temperature
              </label>
              <input
                type="number"
                value={truckTemp}
                onChange={(e) => setTruckTemp(e.target.value)}
                className={`${
                  truck.find((t) => t.id === truckId)?.type !== "reefer"
                    ? "cursor-not-allowed"
                    : ""
                } block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors`}
                placeholder="-10"
                disabled={
                  !truckId ||
                  truck.find((t) => t.id === truckId)?.type !== "reefer"
                }
              />
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
      </Modal>

      {/* Popup For Update Load Status */}
      <Modal
        isOpen={popupLoadStatus}
        onClose={() => setPopupLoadStatus(false)}
        title="Update Load Status"
        size="md"
      >
        <form onSubmit={handleUpdateLoadStatus} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Load ID
            </label>
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
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
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
      </Modal>

      {/* Popup For Adding Note */}
      <Modal
        isOpen={popupNote}
        onClose={() => {
          setPopupNote(false);
          setAddingNote("");
          setSelectedLoadIdForNote("");
        }}
        title={noteType === "driver" ? "Add Driver Note" : "Add Load Note"}
        size="md"
      >
        <form onSubmit={handleNotes} className="space-y-4">
          {/* Load ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Load ID
            </label>
            <select
              className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors cursor-pointer"
              value={selectedLoadIdForNote}
              onChange={(e) => setSelectedLoadIdForNote(e.target.value)}
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

          {/* Note Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Note Type
            </label>
            <select
              className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors cursor-pointer"
              value={noteType}
              onChange={(e) =>
                setNoteType(e.target.value as "dispatcher" | "driver")
              }
              required
            >
              <option value="dispatcher">Load Note</option>
              <option value="driver">Driver Note</option>
            </select>
          </div>

          {/* Note Text */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Note
            </label>
            <textarea
              value={addingNote}
              onChange={(e) => setAddingNote(e.target.value)}
              cols={30}
              rows={5}
              className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
              placeholder="Enter your note here..."
              required
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            Add Note
          </button>
        </form>
      </Modal>

      {/* Popup For Preview Notes Modal */}
      <Modal
        isOpen={popupAllNote}
        onClose={() => setPopupAllNote(false)}
        title={`All Notes - (${selectedLoadForNotes?.loadId})`}
        size="md"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto relative">
          {allNotes.length > 0 ? (
            allNotes.map((note, i) => (
              <div
                key={note._id || i}
                className="relative p-4 rounded-lg bg-slate-100 border border-slate-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Note {i + 1}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(note.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    - {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mb-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      note.type === "dispatcher"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {note.type === "dispatcher" ? "Load Note" : "Driver Note"}
                  </span>
                </div>

                <div className="my-4 p-4 rounded-lg bg-slate-200">
                  <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {note.text}
                  </p>
                </div>

                {note.addedBy && (
                  <div className="mt-3 text-center text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">
                      Added by: {note.addedBy.name}
                    </span>
                    <span className="text-slate-500 ml-2">
                      (ID: {note.addedBy.jobId})
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-300">
                <CiStickyNote size={32} className="text-slate-400" />
              </div>
              <h4 className="text-lg font-semibold text-slate-700 mb-2">
                No Notes Found
              </h4>
              <p className="text-slate-500 text-sm max-w-xs">
                There are no notes for this load yet. Add the first note to
                track important information.
              </p>
              <button
                onClick={() => {
                  setPopupAllNote(false);
                  setPopupNote(true);
                }}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <MdEdit size={16} />
                Add First Note
              </button>
            </div>
          )}
        </div>

        {allNotes.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setPopupAllNote(false);
                setPopupNote(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <IoAdd size={18} />
              Add New Note
            </button>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default LoadsPage;
