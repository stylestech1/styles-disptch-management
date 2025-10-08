"use client";
import LocationAutocomplete, {
  TPlace,
} from "@/components/sections/LocationAutocomplete";
import MapView from "@/components/sections/MapView";
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
  TTruckType,
  TComments,
  TErrors,
} from "@/types/globalTypes";
import { apiFetcher } from "@/utils/APIFetcher";
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
} from "react-icons/io5";
import { MdEdit } from "react-icons/md";

const LoadsPage = () => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
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
  const [truckType, setTruckType] = useState<string>("reefer");
  const [truckTemp, setTruckTemp] = useState<number>(0);
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

        if (!res.ok) {
          if (Array.isArray(result.errors)) {
            result.errors.forEach((err: TErrors) => {
              toast.error(err.msg || "Create user failed", {
                style: { background: "#dc2626", color: "#fff" },
              });
            });
          }
          return;
        }

        setLoad(result.data);
        setPagination(result.paginationResult);
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message || "Loading Failed");
          toast.error(error.message || "Loading Failed ❌", {
            style: { background: "#dc2626", color: "#fff" },
          });
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
        if (!res.ok) {
          if (Array.isArray(result.errors)) {
            result.errors.forEach((err: TErrors) => {
              toast.error(err.msg || "Create user failed", {
                style: { background: "#dc2626", color: "#fff" },
              });
            });
          }
          return;
        }
        setDrivers(result.data);
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message || "Loading Failed");
          toast.error(error.message || "Loading failed ❌", {
            style: { background: "#dc2626", color: "#fff" },
          });
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
        if (!res.ok) {
          if (Array.isArray(result.errors)) {
            result.errors.forEach((err: TErrors) => {
              toast.error(err.msg || "Create user failed", {
                style: { background: "#dc2626", color: "#fff" },
              });
            });
          }
          return;
        }
        setTruck(result.data.data);
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message || "Loading Failed");
          toast.error(error.message || "Loading failed ❌", {
            style: { background: "#dc2626", color: "#fff" },
          });
        }
      } finally {
        setLoading(false);
      }
    };

    getDrivers();
  }, [apiURL, token]);

  // Multiple Destinations Functions
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

  // Get Distance between DHO and Origin (Miles)
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

  // Calc Average time between DHO and Origin
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

  // Formating Time of (Average time between DHO and Origin)
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

  // Get All Distance (Miles)
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
        toast.error(error.message || "Loading failed ❌", {
          style: { background: "#dc2626", color: "#fff" },
        });
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

  // Send PickupAt as Date formate to Backend
  const formatPickupAt = (timeString: string): string | null => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(":");
    const pickupDate = new Date();
    pickupDate.setHours(Number(hours), Number(minutes), 0, 0);

    return pickupDate.toISOString();
  };
  const pickupAtISO = formatPickupAt(pickupAt);

  // Create Load
  const handleCreateLoad = async (e: React.FormEvent) => {
    e.preventDefault();

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
      destination: validDestinations.map((dest) => dest.display_name),
      dho: dho ? { address: dho.display_name } : null,
      driverId,
      truckId,
      deliveredAt,
      cancelledAt,
      pickupAt: pickupAtISO,
      truckTemp,
      truckType,
      distanceMiles: Math.round(distance),
      totalPrice: total,
      pricePerMile: total / distance,
      feesNumber: fees,
      loadId: loadIDInp,
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
      setDestinations([]);
      setDho(null);
      setOrigin(null);
      setPrice("");
      setFees("");
      setLoadIDInp("");
      setPickupAt("");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || "Load creation failed ❌", {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  };

  // Update Load Status
  const handleUpdateLoadStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoadId)
      return toast.error("Please select a load", {
        style: { background: "#dc2626", color: "#fff" },
      });

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
        toast.error(error.message || "Update failed ❌", {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  };

  // Add Notes
  const handleNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoadIdForNote)
      return toast.error("Please select a load", {
        style: { background: "#dc2626", color: "#fff" },
      });

    if (!addingNote.trim())
      return toast.error("Please enter a note", {
        style: { background: "#dc2626", color: "#fff" },
      });

    try {
      const res = await fetch(
        `${apiURL}/api/v1/loads/${selectedLoadIdForNote}/comments`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({ text: addingNote, type: noteType }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        if (Array.isArray(result.errors)) {
          result.errors.forEach((err: TErrors) => {
            toast.error(err.msg || "Add note failed", {
              style: { background: "#dc2626", color: "#fff" },
            });
          });
        }
        return;
      }

      toast.success(result.message || "Note was Added ✅", {
        style: { background: "#16a34a", color: "#fff" },
      });

      // Reset form
      setAddingNote("");
      setSelectedLoadIdForNote("");
      setPopupNote(false);
    } catch (error) {
      if (error instanceof Error) {
        setErr(error.message || "Adding note failed");
        toast.error(error.message || "Adding note failed ❌", {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  };

  // Get All Notes
  const fetchAllNotes = async (loadId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${apiURL}/api/v1/loads/${loadId}/comments`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (!res.ok) {
        if (Array.isArray(result.errors)) {
          result.errors.forEach((err: TErrors) => {
            toast.error(err.msg || "Create user failed", {
              style: { background: "#dc2626", color: "#fff" },
            });
          });
        }
        return;
      }

      setAllNotes(result.comments || []);
    } catch (error) {
      if (error instanceof Error) {
        setErr(error.message || "Failed to fetch notes");
        toast.error(error.message || "Failed to fetch notes ❌", {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const openAllNotesPopup = async (loadItem: TLoads) => {
    if (!loadItem?.id) return;
    setSelectedLoadForNotes(loadItem);
    await fetchAllNotes(loadItem?.id);
    setPopupAllNote(true);
  };

  // Status Badge
  const StatusBadge = ({ status }: { status: TStatusLoad }) => {
    const statusConfig = {
      pending: {
        color: "bg-amber-100 text-amber-800 border-amber-300",
        icon: <IoTime size={14} className="mr-1" />,
      },
      in_transit: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: <IoNavigate size={14} className="mr-1" />,
      },
      delivered: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: <IoCheckmark size={14} className="mr-1" />,
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: <IoClose size={14} className="mr-1" />,
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

  // set loading
  if (loading) return <Loading />;

  return (
    <section className="relative p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <Titles>Load Management</Titles>
          <p className="text-slate-600 mt-2 text-sm">
            Manage and track all your shipments and deliveries
          </p>
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
      {err && (
        <div className="mb-6">
          <Erros message={err} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Loads</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {pagination?.totalPages || 0}
              </p>
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
                {load.filter((l) => l.status === "pending").length}
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
                {load.filter((l) => l.status === "in_transit").length}
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
                {load.filter((l) => l.status === "delivered").length}
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
                <th className="text-left p-4 font-medium text-slate-600">
                  Load ID
                </th>
                <th className="text-left p-4 font-medium text-slate-600">
                  Route
                </th>
                <th className="text-right p-4 font-medium text-slate-600">
                  Distance
                </th>
                <th className="text-right p-4 font-medium text-slate-600">
                  Price/Mile
                </th>
                <th className="text-right p-4 font-medium text-slate-600">
                  Total
                </th>
                <th className="text-center p-4 font-medium text-slate-600">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-slate-600">
                  Driver
                </th>
                <th className="text-left p-4 font-medium text-slate-600">
                  Truck
                </th>
                <th className="text-center p-4 font-medium text-slate-600">
                  Pickup Time
                </th>
                <th className="text-center p-4 font-medium text-slate-600">
                  Pickup Date
                </th>
                <th className="text-center p-4 font-medium text-slate-600">
                  Delivered Time
                </th>
                <th className="text-center p-4 font-medium text-slate-600">
                  Delivered Date
                </th>
                <th className="text-center p-4 font-medium text-slate-600">
                  Notes
                </th>
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
                    <td className="p-4 text-right text-slate-700 font-medium">
                      {loadItem.distanceMiles
                        ? `${loadItem.distanceMiles} mi`
                        : "-"}
                    </td>
                    <td className="p-4 text-right text-slate-700">
                      {loadItem.pricePerMile
                        ? `${loadItem.currency} ${loadItem.pricePerMile.toFixed(
                          2
                        )}`
                        : "-"}
                    </td>
                    <td className="p-4 text-right font-semibold text-emerald-700">
                      {loadItem.totalPrice
                        ? `${loadItem.currency} ${loadItem.totalPrice}`
                        : "-"}
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
                      {loadItem.pickupAt
                        ? new Date(loadItem.pickupAt).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td className="p-4 text-center text-slate-600 text-xs">
                      {loadItem.pickupAt
                        ? new Date(loadItem.pickupAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-4 text-center text-slate-600 text-xs">
                      {loadItem.deliveredAt
                        ? new Date(loadItem.deliveredAt).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td className="p-4 text-center text-slate-600 text-xs">
                      {loadItem.deliveredAt
                        ? new Date(loadItem.deliveredAt).toLocaleDateString()
                        : "-"}
                    </td>

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
                ))
              ) : (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-3xl mb-3">📦</div>
                      <div className="text-slate-600">
                        No load records found
                      </div>
                      <div className="text-slate-400 text-sm mt-1">
                        Get started by creating your first load
                      </div>
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
            Showing {(page - 1) * 10 + 1} to{" "}
            {Math.min(page * 10, pagination.totalPages)} of{" "}
            {pagination.totalPages} entries
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
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
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
              <h3 className="text-xl font-semibold text-slate-800">
                Create New Load
              </h3>
              <button
                onClick={() => setPopup(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <IoClose size={24} />
              </button>
            </div>

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
                          value={
                            averageTime ? `${formatTime(averageTime)}` : ""
                          }
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
                            setValue={(place) =>
                              updateDestination(index, place)
                            }
                            placeholder={`Enter destination ${index + 1
                              } address`}
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
                        <p className="text-slate-500">
                          No destinations added yet
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          {'Click "Add Destination" to start adding stops'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Maps */}
                <div className="grid grid-cols-1 gap-6">
                  <MapView
                    origin={origin}
                    destinations={destinations}
                    dho={dho}
                  />
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
                      type="number"
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
                      type="number"
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
                    onChange={(e) => setTruckTemp(Number(e.target.value))}
                    className={`${truck.find((t) => t.id === truckId)?.type !== "reefer"
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
          </div>
        </div>
      )}

      {/* Popup For Update Load Status */}
      {popupLoadStatus && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">
                Update Load Status
              </h3>
              <button
                onClick={() => setPopupLoadStatus(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <IoClose size={24} />
              </button>
            </div>

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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
              >
                <IoRefresh size={18} />
                Update Status
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Popup For Adding Note */}
      {popupNote && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">
                {noteType === "driver"
                  ? "Add Driver Note"
                  : "Add Load Note"}
              </h3>
              <button
                onClick={() => {
                  setPopupNote(false);
                  setAddingNote("");
                  setSelectedLoadIdForNote("");
                }}
                className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Form */}
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
          </div>
        </div>
      )}

      {popupAllNote && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">
                All Notes - ({selectedLoadForNotes?.loadId})
              </h3>
              <button
                onClick={() => {
                  setPopupAllNote(false);
                }}
                className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <IoClose size={24} />
              </button>
            </div>

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
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${note.type === "dispatcher"
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
                      <div className="mt-3 text-right text-xs text-slate-600">
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
          </div>
        </div>
      )}
    </section>
  );
};

export default LoadsPage;
