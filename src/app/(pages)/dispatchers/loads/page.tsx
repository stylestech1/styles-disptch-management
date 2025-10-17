// app/admin/loads/page.tsx
"use client";
import LocationAutocomplete, {
  TPlace,
} from "@/components/sections/LocationAutocomplete";
import { DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
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
  IoArrowBack,
  IoArrowForward,
  IoDocumentText,
  IoLocationOutline,
  IoInformationCircle,
  IoLocationSharp,
} from "react-icons/io5";
import { LiaShippingFastSolid } from "react-icons/lia";
import { RxUpdate } from "react-icons/rx";
import { MdEdit } from "react-icons/md";
import { geocodeAddress } from "@/utils/geocoding";
import GoogleMapsLoader from "@/components/ui/GoogleMapsLoader";
import MapWithRoute from "@/components/ui/MapWithRoute";
import {
  calculateRouteDistance,
  calculateDhoToOriginDistance,
  calculateFullRouteDistance,
} from "@/utils/googleDistanceCalculator";

const LoadsPage = () => {
  const [pagination, setPagination] = useState<TPagination | null>(null);
  const [page, setPage] = useState(1);
  const [popup, setPopup] = useState(false);
  const [popupLoadStatus, setPopupLoadStatus] = useState(false);
  const [popupNote, setPopupNote] = useState(false);
  const [popupAllNote, setPopupAllNote] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [load, setLoad] = useState<TLoads[]>([]);
  const [drivers, setDrivers] = useState<TDriver[]>([]);
  const [truck, setTruck] = useState<TTruck[]>([]);
  const [origin, setOrigin] = useState<TPlace | null>(null);
  const [destinations, setDestinations] = useState<(TPlace | null)[]>([]);
  const [dho, setDho] = useState<TPlace | null>(null);
  const [dhoToOriginDistance, setDhoToOriginDistance] = useState<number | null>(
    null
  );
  const [allDistance, setAllDistance] = useState<string>("");
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [price, setPrice] = useState<string>("");
  const [fees, setFees] = useState<string>("");
  const [pricePerMile, setPricePerMile] = useState<number | null>(null);
  const [driverId, setDriverId] = useState<string>("");
  const [truckId, setTruckId] = useState<string>("");
  const [deliveredAt, setDeliveredAt] = useState<string>("");
  const [showDeliveredAt, setShowDeliveredAt] = useState(false);
  const [cancelledAt, setCancelledAt] = useState<string>("");
  const [pickupAt, setPickupAt] = useState<Dayjs | null>(null);
  const [completedAt, setCompletedAt] = useState<Dayjs | null>(null);
  const [arrivalAtShipper, setArrivalAtShipper] = useState<Dayjs | null>(null);
  const [arrivalAtReceiver, setarrivalAtReceiver] = useState<Dayjs | null>(
    null
  );
  const [leftShipper, setLeftShipper] = useState<Dayjs | null>(null);
  const [leftReceiver, setleftReceiver] = useState<Dayjs | null>(null);
  const [truckType, setTruckType] = useState<string>("reefer");
  const [truckTemp, setTruckTemp] = useState<string>("");
  const [selectedLoadId, setSelectedLoadId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TStatusLoad>("pending");
  const [addingNote, setAddingNote] = useState<string>("");
  const [selectedLoadIdForNote, setSelectedLoadIdForNote] = useState("");
  const [allNotes, setAllNotes] = useState<TComments[]>([]);
  const [selectedLoadForNotes, setSelectedLoadForNotes] =
    useState<TLoads | null>(null);
  const [popupAllAppointments, setPopupAllAppointments] = useState(false);
  const [selectedLoadForAppointments, setSelectedLoadForAppointments] =
    useState<TLoads | null>(null);
  const [loadIDInp, setLoadIDInp] = useState<string>("");
  const [noteType, setNoteType] = useState<"dispatcher" | "driver">(
    "dispatcher"
  );
  const [allLoads, setAllLoads] = useState<TLoads[]>([]);
  const [search, setSearch] = useState("");
  const [editingLoad, setEditingLoad] = useState<TLoads | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const { loading, setLoading } = useLoading();
  const { error, setError } = useError();

  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  const GOOGLE_MAPS_API_KEY =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "your-api-key-here";

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

  // TODO: Get Distance between DHO and Origin (Miles) - باستخدام Google Maps
  useEffect(() => {
    const calculateDhoToOrigin = async () => {
      if (!dho || !origin) {
        setDhoToOriginDistance(null);
        setAverageTime(null);
        return;
      }

      try {
        const result = await calculateDhoToOriginDistance(
          { lat: parseFloat(dho.lat), lng: parseFloat(dho.lon) },
          { lat: parseFloat(origin.lat), lng: parseFloat(origin.lon) }
        );
        setDhoToOriginDistance(result.distance);
        setAverageTime(result.duration);
      } catch (error) {
        console.error("Error calculating DHO to Origin distance:", error);
        setDhoToOriginDistance(null);
        setAverageTime(null);
      }
    };

    calculateDhoToOrigin();
  }, [dho, origin]);

  // في LoadsPage - استبدال useEffect الخاص بالمسافة الكاملة
  // TODO: Get All Distance (Miles) - باستخدام Google Maps
  useEffect(() => {
    const calculateTotalDistance = async () => {
      // Type guard function
      const isValidPlace = (place: TPlace | null): place is TPlace => {
        return place !== null;
      };

      // Filter out null destinations
      const validDestinations = destinations.filter(isValidPlace);

      if (
        (dho && origin && validDestinations.length > 0) ||
        (origin && validDestinations.length > 0)
      ) {
        try {
          const destinationsCoords = validDestinations.map((dest) => ({
            lat: parseFloat(dest.lat),
            lng: parseFloat(dest.lon),
          }));

          const result = await calculateFullRouteDistance(
            dho ? { lat: parseFloat(dho.lat), lng: parseFloat(dho.lon) } : null,
            origin
              ? { lat: parseFloat(origin.lat), lng: parseFloat(origin.lon) }
              : null,
            destinationsCoords
          );

          setDistance(result.distance);
          setAllDistance(result.distance.toFixed(2));

          if (price && Number(price) > 0) {
            const perMile = Number(price) / result.distance;
            setPricePerMile(perMile);
          }
        } catch (error) {
          console.error("Error calculating total distance:", error);
          setDistance(null);
          setAllDistance("");
        }
      } else {
        setDistance(null);
        setAllDistance("");
      }
    };

    calculateTotalDistance();
  }, [origin, destinations, dho, price]);

  // TODO: Handle Price Change - حساب تلقائي لـ Price Per Mile
  const handlePriceChange = (value: string) => {
    setPrice(value);

    if (allDistance && Number(allDistance) > 0 && Number(value) > 0) {
      const perMile = Number(value) / Number(allDistance);
      setPricePerMile(perMile);
    } else {
      setPricePerMile(null);
    }
  };

  // TODO: Handle All Distance Change - إذا احتجت لتعديلها يدوياً (لكن ستكون readOnly)
  const handleAllDistanceChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    setAllDistance(numericValue);

    if (price && Number(price) > 0 && Number(numericValue) > 0) {
      const perMile = Number(price) / Number(numericValue);
      setPricePerMile(perMile);
    }
  };

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

  // TODO: Open Edit Load
  const openEditLoadPopup = async (loadItem: TLoads) => {
    if (!loadItem?.id) return;
    setLoading(true);
    setEditingLoad(loadItem);
    setIsEditing(true);

    try {
      // DHO
      if (loadItem.DHO) {
        const dhoCoords = await geocodeAddress(loadItem.DHO);
        setDho(
          dhoCoords ||
            ({
              display_name: loadItem.DHO,
              lat: "0",
              lon: "0",
            } as TPlace)
        );
      } else {
        setDho(null);
      }

      // Origin
      if (loadItem.origin) {
        const originCoords = await geocodeAddress(loadItem.origin);
        setOrigin(
          originCoords ||
            ({
              display_name: loadItem.origin,
              lat: "0",
              lon: "0",
            } as TPlace)
        );
      } else {
        setOrigin(null);
      }

      // Destinations
      if (loadItem.destination) {
        const destArray = Array.isArray(loadItem.destination)
          ? loadItem.destination
          : [loadItem.destination];

        const destinationPlaces = await Promise.all(
          destArray.map(async (dest) => {
            const coords = await geocodeAddress(dest);
            return (
              coords ||
              ({
                display_name: dest,
                lat: "0",
                lon: "0",
              } as TPlace)
            );
          })
        );

        setDestinations(destinationPlaces);
      } else {
        setDestinations([]);
      }
    } catch (error) {
      console.error("Error geocoding addresses:", error);
      setDho(
        loadItem.DHO
          ? ({
              display_name: loadItem.DHO,
              lat: "0",
              lon: "0",
            } as TPlace)
          : null
      );

      setOrigin(
        loadItem.origin
          ? ({
              display_name: loadItem.origin,
              lat: "0",
              lon: "0",
            } as TPlace)
          : null
      );

      if (loadItem.destination) {
        const destArray = Array.isArray(loadItem.destination)
          ? loadItem.destination
          : [loadItem.destination];

        const destinationPlaces = destArray.map(
          (dest) =>
            ({
              display_name: dest,
              lat: "0",
              lon: "0",
            } as TPlace)
        );
        setDestinations(destinationPlaces);
      } else {
        setDestinations([]);
      }
    }

    // Load Details
    setLoadIDInp(loadItem.loadId || "");
    setPrice(loadItem.totalPrice?.toString() || "");
    setFees(loadItem.feesNumber?.toString() || "");
    setAllDistance(loadItem.distanceMiles?.toString() || "");

    // Dates
    if (loadItem.pickupAt) {
      setPickupAt(dayjs(loadItem.pickupAt));
    } else {
      setPickupAt(null);
    }
    if (loadItem.completedAt) {
      setCompletedAt(dayjs(loadItem.completedAt));
    } else {
      setCompletedAt(null);
    }
    if (loadItem.arrivalAtShipper) {
      setArrivalAtShipper(dayjs(loadItem.arrivalAtShipper));
    } else {
      setArrivalAtShipper(null);
    }
    if (loadItem.arrivalAtReceiver) {
      setarrivalAtReceiver(dayjs(loadItem.arrivalAtReceiver));
    } else {
      setarrivalAtReceiver(null);
    }
    if (loadItem.leftShipper) {
      setLeftShipper(dayjs(loadItem.leftShipper));
    } else {
      setLeftShipper(null);
    }
    if (loadItem.leftReceiver) {
      setleftReceiver(dayjs(loadItem.leftReceiver));
    } else {
      setleftReceiver(null);
    }

    setDriverId(loadItem.driverId?.id || "");
    setTruckType(loadItem.truckType || "reefer");
    setTruckId(loadItem.truckId?.truckId?.toString() || "");
    setTruckTemp(loadItem.truckTemp?.toString() || "");

    // Open the popup
    setPopup(true);
    setLoading(false);
  };

  // TODO: Reset Load Form
  const resetForm = () => {
    setDho(null);
    setOrigin(null);
    setDestinations([]);
    setDistance(null);
    setDhoToOriginDistance(null);
    setAverageTime(null);
    setAllDistance("");
    setPrice("");
    setPricePerMile(null);
    setFees("");
    setDriverId("");
    setTruckId("");
    setTruckType("reefer");
    setTruckTemp("");
    setPickupAt(null);
    setCompletedAt(null);
    setArrivalAtShipper(null);
    setarrivalAtReceiver(null);
    setLeftShipper(null);
    setleftReceiver(null);
    setDeliveredAt("");
    setCancelledAt("");
    setLoadIDInp("");
    setActiveTab(1);
    setIsEditing(false);
    setEditingLoad(null);
  };

  // FIXME: Create Or Update Load
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

    if (!isEditing && (!driverId || !truckId))
      return toast.error("Please select driver and truck", {
        style: { background: "#dc2626", color: "#fff" },
      });

    if (!total || total <= 0)
      return toast.error("Please enter a valid total price", {
        style: { background: "#dc2626", color: "#fff" },
      });

    // استخدم allDistance سواء كانت فارغة أو فيها قيمة
    const finalDistance = allDistance
      ? parseInt(allDistance)
      : Math.round(distance || 0);

    if (!finalDistance || finalDistance <= 0)
      return toast.error("Invalid distance calculated", {
        style: { background: "#dc2626", color: "#fff" },
      });

    const bodyData = {
      origin: { address: origin.display_name },
      destination: validDestinations.map((dest) => ({
        address: dest.display_name,
      })),
      DHO: dho ? { address: dho.display_name } : null,
      driverId: isEditing ? editingLoad?.driverId?.id : driverId,
      truckId: isEditing ? editingLoad?.truckId?.truckId?.toString() : truckId,
      deliveredAt,
      cancelledAt,
      pickupAt: pickupAt ? pickupAt.toISOString() : null,
      completedAt: completedAt ? completedAt.toISOString() : null,
      truckTemp,
      truckType,
      distanceMiles: finalDistance,
      totalPrice: total,
      pricePerMile: total / finalDistance,
      feesNumber: fees,
      loadId: loadIDInp,
    };

    const updateBody = {
      origin: { address: origin.display_name },
      destination: validDestinations.map((dest) => ({
        address: dest.display_name,
      })),
      DHO: dho ? { address: dho.display_name } : null,
      pickupAt: pickupAt ? pickupAt.toISOString() : null,
      completedAt: completedAt ? completedAt.toISOString() : null,
      ...(arrivalAtShipper && {
        arrivalAtShipper: arrivalAtShipper.toISOString(),
      }),
      ...(arrivalAtReceiver && {
        arrivalAtReceiver: arrivalAtReceiver.toISOString(),
      }),
      ...(leftShipper && {
        leftShipper: leftShipper.toISOString(),
      }),
      ...(leftReceiver && {
        leftReceiver: leftReceiver.toISOString(),
      }),
      truckTemp,
      truckType,
      distanceMiles: finalDistance,
      totalPrice: total,
      pricePerMile: total / finalDistance,
      feesNumber: fees,
      loadId: loadIDInp,
    };

    try {
      let result;

      if (isEditing && editingLoad) {
        // Update existing load
        result = await apiClient(
          `${apiURL}/api/v1/loads/update/${editingLoad.id}`,
          token,
          {
            method: "PATCH",
            body: JSON.stringify(updateBody),
          }
        );

        toast.success(result.message || "Load updated ✅", {
          style: { background: "#16a34a", color: "#fff" },
        });
      } else {
        // Create new load
        result = await apiClient(`${apiURL}/api/v1/loads`, token, {
          method: "POST",
          body: JSON.stringify(bodyData),
        });

        toast.success(result.message || "Load created ✅", {
          style: { background: "#16a34a", color: "#fff" },
        });
      }

      await fetchLoads();
      resetForm();
      setPopup(false);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(
          err.message || `Load ${isEditing ? "update" : "creation"} failed ❌`,
          {
            style: { background: "#dc2626", color: "#fff" },
          }
        );
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

    // Validate delivery date if status is delivered
    if (selectedStatus === "delivered" && !deliveredAt) {
      return toast.error("Please select delivery date and time", {
        style: { background: "#dc2626", color: "#fff" },
      });
    }

    try {
      const requestBody: { status: TStatusLoad; deliveredAt?: string } = {
        status: selectedStatus,
      };
      // Add deliveredAt only if status is delivered
      if (selectedStatus === "delivered" && deliveredAt) {
        requestBody.deliveredAt = deliveredAt;
      }

      const result = await apiClient(
        `${apiURL}/api/v1/loads/status/${selectedLoadId}`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify(requestBody),
        }
      );

      toast.success(result.message || "Load updated ✅", {
        style: { background: "#16a34a", color: "#fff" },
      });

      await fetchLoads();
      setPopupLoadStatus(false);
      // Reset form
      setSelectedLoadId("");
      setSelectedStatus("pending");
      setDeliveredAt("");
      setShowDeliveredAt(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "Update failed");
        toast.error(error.message || "Update failed ❌", {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  };

  // TODO: Handle status change to show/hide delivery date
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TStatusLoad;
    setSelectedStatus(newStatus);
    setShowDeliveredAt(newStatus === "delivered");

    // Clear delivery date if status is not delivered
    if (newStatus !== "delivered") {
      setDeliveredAt("");
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

      const result = (await apiClient(
        `${apiURL}/api/v1/loads/${loadId}/comments`,
        token
      )) as { comments: TComments[] };

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

  // TODO: Open Appointments for Selected Load
  const openAllAppointmentsPopup = async (loadItem: TLoads) => {
    if (!loadItem?.id) return;
    setSelectedLoadForAppointments(loadItem);
    setPopupAllAppointments(true);
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
            <IoLocationSharp size={14} className="text-slate-400" />
            <span
              className="text-sm max-w-[120px] truncate"
              title={loadItem.DHO}
            >
              {loadItem.DHO || "-"}
            </span>
          </div>
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

      {/* Appointments */}
      <td className="p-4 text-center text-slate-600 text-xs">
        <button
          onClick={() => openAllAppointmentsPopup(loadItem)}
          className="cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-800 hover:text-purple-200 transition-colors"
        >
          <LiaShippingFastSolid />
          <span>Appointments</span>
        </button>
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

      {/* LoadEdit */}
      <td className="p-4 text-center text-slate-600 text-xs">
        <button
          onClick={() => openEditLoadPopup(loadItem)}
          className="cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-800 hover:text-yellow-200 transition-colors"
        >
          <RxUpdate />
          <span>Update</span>
        </button>
      </td>
    </tr>
  );

  // TODO: Checking from unempty data in (LOAD POPUP)
  const isTab1Valid = () => {
    return (
      dho &&
      origin &&
      destinations.length > 0 &&
      destinations.every((dest) => dest !== null && dest !== undefined)
    );
  };
  const isTab2Valid = () => {
    return price && loadIDInp && pickupAt && completedAt;
  };
  const isTab3Valid = () => {
    if (isEditing) {
      return (
        editingLoad?.driverId && editingLoad?.truckId && editingLoad?.truckType
      );
    } else {
      return driverId && truckType && truckId;
    }
  };

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
              placeholder="Search loads by ID..."
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
            onClick={() => {
              resetForm();
              setPopup(true);
            }}
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

      {/* Popup For Update Load Status */}
      <Modal
        isOpen={popupLoadStatus}
        onClose={() => {
          setPopupLoadStatus(false);
          // Reset form when closing
          setSelectedLoadId("");
          setSelectedStatus("pending");
          setDeliveredAt("");
          setShowDeliveredAt(false);
        }}
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
              onChange={handleStatusChange}
              required
            >
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Delivery Date Picker - Only shown when status is delivered */}
          {showDeliveredAt && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-slate-700 mb-2">
                <IoTime className="text-emerald-600" size={18} />
                <label className="block text-sm font-medium text-slate-700">
                  Delivery Date & Time <span className="text-red-500">*</span>
                </label>
              </div>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={deliveredAt ? dayjs(deliveredAt) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setDeliveredAt(newValue.toISOString());
                    } else {
                      setDeliveredAt("");
                    }
                  }}
                  disableFuture={false}
                  views={["year", "month", "day", "hours", "minutes"]}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      className: "bg-white",
                      placeholder: "Select delivery date and time",
                    },
                  }}
                />
              </LocalizationProvider>

              {deliveredAt && (
                <div className="text-xs text-slate-500 mt-2">
                  Selected: {new Date(deliveredAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

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

      {/* Popup For Preview Appointment Modal */}
      <Modal
        isOpen={popupAllAppointments}
        onClose={() => setPopupAllAppointments(false)}
        title={`All Appointments - (${
          selectedLoadForAppointments?.loadId || "N/A"
        })`}
        size="xl"
      >
        <div className="overflow-y-auto">
          {selectedLoadForAppointments ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-5">
                <h2 className="font-bold text-gray-500">Appointment</h2>
                <div className="w-full h-px bg-gray-200"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Pickup Appointment */}
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <IoLocationOutline className="text-blue-600" size={18} />
                    <h4 className="font-semibold text-blue-800">
                      Pickup Appointment
                    </h4>
                  </div>
                  <p className="text-blue-700">
                    {selectedLoadForAppointments.pickupAt
                      ? new Date(
                          selectedLoadForAppointments.pickupAt
                        ).toLocaleString()
                      : "Not scheduled"}
                  </p>
                </div>

                {/* Delivery Appointment */}
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <IoCheckmark className="text-green-600" size={18} />
                    <h4 className="font-semibold text-green-800">
                      Delivery Appointment
                    </h4>
                  </div>
                  <p className="text-green-700">
                    {selectedLoadForAppointments.completedAt
                      ? new Date(
                          selectedLoadForAppointments.completedAt
                        ).toLocaleString()
                      : "Not scheduled"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <h2 className="font-bold text-gray-500">Arrivals</h2>
                <div className="w-full h-px bg-gray-200"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Arrival at Shipper */}
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <IoTime className="text-amber-600" size={18} />
                    <h4 className="font-semibold text-amber-800">
                      Arrival at Shipper
                    </h4>
                  </div>
                  <p className="text-amber-700">
                    {selectedLoadForAppointments.arrivalAtShipper
                      ? new Date(
                          selectedLoadForAppointments.arrivalAtShipper
                        ).toLocaleString()
                      : "Not recorded"}
                  </p>
                </div>

                {/* Arrival at Receiver */}
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <IoTime className="text-purple-600" size={18} />
                    <h4 className="font-semibold text-purple-800">
                      Arrival at Receiver
                    </h4>
                  </div>
                  <p className="text-purple-700">
                    {selectedLoadForAppointments.arrivalAtReceiver
                      ? new Date(
                          selectedLoadForAppointments.arrivalAtReceiver
                        ).toLocaleString()
                      : "Not recorded"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <h2 className="font-bold text-gray-500">Lefts</h2>
                <div className="w-full h-px bg-gray-200"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Shipper */}
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <IoCar className="text-orange-600" size={18} />
                    <h4 className="font-semibold text-orange-800">
                      Left Shipper
                    </h4>
                  </div>
                  <p className="text-orange-700">
                    {selectedLoadForAppointments.leftShipper
                      ? new Date(
                          selectedLoadForAppointments.leftShipper
                        ).toLocaleString()
                      : "Not recorded"}
                  </p>
                </div>

                {/* Left Receiver */}
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <IoCar className="text-red-600" size={18} />
                    <h4 className="font-semibold text-red-800">
                      Left Receiver
                    </h4>
                  </div>
                  <p className="text-red-700">
                    {selectedLoadForAppointments.leftReceiver
                      ? new Date(
                          selectedLoadForAppointments.leftReceiver
                        ).toLocaleString()
                      : "Not recorded"}
                  </p>
                </div>
              </div>

              {/* Delivered At */}
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <IoCheckmark className="text-emerald-600" size={18} />
                  <h4 className="font-semibold text-emerald-800">
                    Completed By Dispatcher At
                  </h4>
                </div>
                <p className="text-emerald-700">
                  {selectedLoadForAppointments.deliveredAt
                    ? `${new Date(
                        selectedLoadForAppointments.deliveredAt
                      ).toLocaleString()} ---> (${selectedLoadForAppointments.updatedBy})`
                    : "Not delivered"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-300">
                <LiaShippingFastSolid size={32} className="text-slate-400" />
              </div>
              <h4 className="text-lg font-semibold text-slate-700 mb-2">
                No Load Selected
              </h4>
              <p className="text-slate-500 text-sm max-w-xs">
                Please select a load to view its appointments.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Popup For Create/Edit Load */}
      <Modal
        isOpen={popup}
        onClose={() => {
          setPopup(false);
          resetForm();
        }}
        title={
          isEditing && editingLoad
            ? `Edit Load - ${editingLoad.loadId}`
            : "Create New Load"
        }
        size="xl"
      >
        <div className="flex flex-col h-full">
          {/* Tabs Navigation */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8">
              <button
                type="button"
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 1
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => setActiveTab(1)}
              >
                <span className="flex items-center">
                  <IoLocationOutline className="mr-2" />
                  Locations
                </span>
              </button>
              <button
                type="button"
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 2
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => setActiveTab(2)}
              >
                <span className="flex items-center">
                  <IoDocumentText className="mr-2" />
                  Load Details
                </span>
              </button>
              <button
                type="button"
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 3
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => setActiveTab(3)}
              >
                <span className="flex items-center">
                  <IoCar className="mr-2" />
                  Ride
                </span>
              </button>
            </nav>
          </div>

          <form
            onSubmit={handleCreateLoad}
            className="flex-1 overflow-auto p-4"
          >
            {/* Tab 1: Locations */}
            {activeTab === 1 && (
              <div className="space-y-6">
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
                          Destinations <span className="text-red-500">*</span>
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
                              placeholder={`Enter destination ${
                                index + 1
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
                        <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-lg bg-gray-50">
                          <p className="text-gray-500 font-medium">
                            No destinations added yet
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            You must add at least one destination to continue
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Maps */}
                  <div className="grid grid-cols-1 gap-6">
                    <GoogleMapsLoader apiKey={GOOGLE_MAPS_API_KEY}>
                      <MapWithRoute
                        dho={dho}
                        origin={origin}
                        destinations={destinations}
                      />
                    </GoogleMapsLoader>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab(2)}
                    disabled={!isTab1Valid()}
                    className={`flex items-center gap-2 py-2 px-6 rounded-lg font-medium transition-colors ${
                      isTab1Valid()
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        : "bg-slate-300 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Next
                    <IoArrowForward size={16} />
                  </button>
                </div>

                {/* إضافة رسالة معلومات تحت Calculated All Distance */}
                {allDistance && (
                  <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <IoInformationCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">
                          Route Distance Information
                        </h4>
                        <p className="text-xs text-blue-700 mt-1">
                          Total distance calculated from{" "}
                          {dho ? "DHO" : "Origin"} through all destinations:{" "}
                          <strong>{allDistance} miles</strong>
                        </p>
                        {dho && origin && (
                          <p className="text-xs text-blue-600 mt-1">
                            • DHO to Origin:{" "}
                            {dhoToOriginDistance?.toFixed(2) || "0"} miles
                          </p>
                        )}
                        {destinations.filter((d) => d !== null).length > 0 && (
                          <p className="text-xs text-blue-600">
                            • Including{" "}
                            {destinations.filter((d) => d !== null).length}{" "}
                            destination(s)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Load Details */}
            {activeTab === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Calculated All Distance - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Calculated All Distance
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={
                          allDistance
                            ? `${allDistance} miles`
                            : "Calculating..."
                        }
                        className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium cursor-not-allowed"
                        readOnly
                        placeholder="Auto-calculating total distance..."
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <IoCheckmark className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    {allDistance && (
                      <p className="text-xs text-slate-500 mt-1">
                        Total route: DHO → Origin →{" "}
                        {destinations.filter((d) => d !== null).length}{" "}
                        destination(s)
                      </p>
                    )}
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
                        onChange={(e) => handlePriceChange(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Price Per Mile
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={
                          pricePerMile !== null &&
                          !isNaN(pricePerMile) &&
                          isFinite(pricePerMile)
                            ? `$${pricePerMile.toFixed(3)}`
                            : "$0.000"
                        }
                        className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium cursor-not-allowed"
                        readOnly
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <IoCash className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                    {pricePerMile !== null &&
                      !isNaN(pricePerMile) &&
                      isFinite(pricePerMile) && (
                        <p className="text-xs text-slate-500 mt-1">
                          Calculated automatically: ${price} ÷ {allDistance}{" "}
                          miles
                        </p>
                      )}
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
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pickup DateTime */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Pickup <span className="text-red-500">*</span>
                          </label>
                          <DateTimePicker
                            value={pickupAt}
                            onChange={(newValue) => setPickupAt(newValue)}
                            disablePast
                            views={["year", "month", "day", "hours", "minutes"]}
                            slotProps={{
                              textField: {
                                required: true,
                                fullWidth: true,
                                className: "bg-white",
                              },
                            }}
                          />
                        </div>

                        {/* Completed DateTime */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Delivery <span className="text-red-500">*</span>
                          </label>
                          <DateTimePicker
                            value={completedAt}
                            onChange={(newValue) => setCompletedAt(newValue)}
                            disablePast
                            views={["year", "month", "day", "hours", "minutes"]}
                            slotProps={{
                              textField: {
                                required: true,
                                fullWidth: true,
                                className: "bg-white",
                              },
                            }}
                          />
                        </div>

                        {isEditing && (
                          <>
                            {/* ArrivalAtShipper */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Arrival At Shipper{" "}
                              </label>
                              <DateTimePicker
                                value={arrivalAtShipper}
                                onChange={(newValue) =>
                                  setArrivalAtShipper(newValue)
                                }
                                views={[
                                  "year",
                                  "month",
                                  "day",
                                  "hours",
                                  "minutes",
                                ]}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    className: "bg-white",
                                  },
                                }}
                              />
                            </div>

                            {/* arrivalAtReceiver */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Arrival At Reciever{" "}
                              </label>
                              <DateTimePicker
                                value={arrivalAtReceiver}
                                onChange={(newValue) =>
                                  setarrivalAtReceiver(newValue)
                                }
                                views={[
                                  "year",
                                  "month",
                                  "day",
                                  "hours",
                                  "minutes",
                                ]}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    className: "bg-white",
                                  },
                                }}
                              />
                            </div>

                            {/* leftShipper */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Left Shipper{" "}
                              </label>
                              <DateTimePicker
                                value={leftShipper}
                                onChange={(newValue) =>
                                  setLeftShipper(newValue)
                                }
                                views={[
                                  "year",
                                  "month",
                                  "day",
                                  "hours",
                                  "minutes",
                                ]}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    className: "bg-white",
                                  },
                                }}
                              />
                            </div>

                            {/* leftReceiver */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Left Reciever{" "}
                              </label>
                              <DateTimePicker
                                value={leftReceiver}
                                onChange={(newValue) =>
                                  setleftReceiver(newValue)
                                }
                                views={[
                                  "year",
                                  "month",
                                  "day",
                                  "hours",
                                  "minutes",
                                ]}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    className: "bg-white",
                                  },
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </LocalizationProvider>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab(1)}
                    className="flex items-center gap-2 py-2 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                  >
                    <IoArrowBack size={16} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab(3)}
                    disabled={!isTab2Valid()}
                    className={`flex items-center gap-2 py-2 px-6 rounded-lg font-medium transition-colors ${
                      isTab2Valid()
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        : "bg-slate-300 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Next
                    <IoArrowForward size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Assignment */}
            {isEditing
              ? activeTab === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Driver - Display Only */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Driver{" "}
                          <span className="text-green-600">✓ Assigned</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={
                              editingLoad?.driverId?.name ||
                              "No driver assigned"
                            }
                            className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 font-medium cursor-not-allowed"
                            readOnly
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <IoCheckmark className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        {editingLoad?.driverId?.phone && (
                          <p className="text-xs text-slate-500 mt-1">
                            Phone: {editingLoad.driverId.phone}
                          </p>
                        )}
                      </div>

                      {/* Truck Type - Display Only */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Truck Type{" "}
                          <span className="text-green-600">✓ Assigned</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={
                              editingLoad?.truckType
                                ? `${
                                    editingLoad.truckType
                                      .charAt(0)
                                      .toUpperCase() +
                                    editingLoad.truckType.slice(1)
                                  }`
                                : "No type assigned"
                            }
                            className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 font-medium cursor-not-allowed"
                            readOnly
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <IoCheckmark className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                      </div>

                      {/* Truck - Display Only */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Truck{" "}
                          <span className="text-green-600">✓ Assigned</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={
                              editingLoad?.truckId
                                ? `${editingLoad.truckId.model} (${editingLoad.truckId.plateNumber})`
                                : "No truck assigned"
                            }
                            className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 font-medium cursor-not-allowed"
                            readOnly
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <IoCheckmark className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        {editingLoad?.truckId && (
                          <p className="text-xs text-slate-500 mt-1">
                            Truck ID: {editingLoad.truckId.truckId}
                          </p>
                        )}
                      </div>

                      {/* Temperature - Display Only */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Temperature{" "}
                          <span className="text-green-600">✓ Set</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={
                              editingLoad?.truckTemp
                                ? `${editingLoad.truckTemp}°C`
                                : "Not set"
                            }
                            className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 font-medium cursor-not-allowed"
                            readOnly
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <IoCheckmark className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Information Message */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <IoInformationCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">
                            Driver & Truck Information
                          </h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Driver and truck assignments cannot be modified for
                            existing loads. This ensures consistency in load
                            tracking and driver assignments.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab(2)}
                        className="flex items-center gap-2 py-2 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                      >
                        <IoArrowBack size={16} />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={!isTab3Valid()}
                        className={`flex items-center gap-2 py-2 px-6 rounded-lg font-medium transition-colors ${
                          isTab3Valid()
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            : "bg-slate-300 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        {isEditing ? (
                          <>
                            <RxUpdate size={18} />
                            Update Load
                          </>
                        ) : (
                          <>
                            <IoAdd size={18} />
                            Create Load
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              : activeTab === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          Truck <span className="text-red-500">*</span>
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
                          Temperature{" "}
                          {truckType === "Reefer" && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <input
                          type="number"
                          value={truckTemp}
                          onChange={(e) => setTruckTemp(e.target.value)}
                          className={`${
                            truck.find((t) => t.id === truckId)?.type !==
                            "reefer"
                              ? "cursor-not-allowed"
                              : ""
                          } block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors`}
                          placeholder="-10"
                          disabled={
                            !truckId ||
                            truck.find((t) => t.id === truckId)?.type !==
                              "reefer"
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab(2)}
                        className="flex items-center gap-2 py-2 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                      >
                        <IoArrowBack size={16} />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={!isTab3Valid()}
                        className={`flex items-center gap-2 py-2 px-6 rounded-lg font-medium transition-colors ${
                          isTab3Valid()
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            : "bg-slate-300 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        <IoAdd size={18} />
                        Create Load
                      </button>
                    </div>
                  </div>
                )}
          </form>
        </div>
      </Modal>
    </section>
  );
};

export default LoadsPage;
