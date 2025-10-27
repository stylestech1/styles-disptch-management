import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import LocationAutocomplete, {
  TPlace,
} from "@/components/sections/LocationAutocomplete";
import Modal from "@/components/ui/Modals";
import {
  IoLocationOutline,
  IoDocumentText,
  IoCar,
  IoArrowBack,
  IoArrowForward,
  IoClose,
  IoAdd,
  IoCheckmark,
  IoCash,
  IoKey,
  IoInformationCircle,
} from "react-icons/io5";
import { RxUpdate } from "react-icons/rx";
import {
  calculateDhoToOriginDistance,
  calculateFullRouteDistance,
} from "@/utils/googleDistanceCalculator";
import { geocodeAddress } from "@/utils/geocoding";
import {
  setDho,
  setOrigin,
  setDestinations,
  addDestination,
  updateDestination,
  removeDestination,
  setPrice,
  setFees,
  setLoadIDInp,
  setPickupAt,
  setCompletedAt,
  setArrivalAtShipper,
  setArrivalAtReceiver,
  setLeftShipper,
  setLeftReceiver,
  setDriverId,
  setTruckId,
  setTruckType,
  setTruckTemp,
  setActiveTab,
  setIsEditing,
  setEditingLoad,
  resetForm,
} from "@/redux/slices/loadsFormSlice";
import {
  useCreateLoadsMutation,
  useGetDriversQuery,
  useGetTrucksQuery,
  useUpdateLoadsMutation,
} from "@/redux/slices/apiSlice";
import { RootState } from "@/redux/store";
import { TDriver, TLoads, TTruck, TTruckType } from "@/types/globalTypes";
import toast from "react-hot-toast";
import { MdError, MdPictureAsPdf } from "react-icons/md";

// Lazy load the map components
const LazyGoogleMapsLoader = lazy(
  () => import("@/components/ui/GoogleMapsLoader")
);
const LazyMapWithRoute = lazy(() => import("@/components/ui/MapWithRoute"));

interface CreateEditLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLoad?: TLoads | null;
}

const CreateEditLoadModal: React.FC<CreateEditLoadModalProps> = ({
  isOpen,
  onClose,
  editingLoad = null,
}) => {
  const dispatch = useDispatch();
  const {
    dho,
    origin,
    destinations,
    price,
    fees,
    loadIDInp,
    pickupAt,
    completedAt,
    arrivalAtShipper,
    arrivalAtReceiver,
    leftShipper,
    leftReceiver,
    driverId,
    truckId,
    truckType,
    truckTemp,
    activeTab,
    isEditing,
  } = useSelector((state: RootState) => state.loadsForm);

  // For Documents
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // تحويل التواريخ من strings إلى Dayjs objects للاستخدام في UI
  const pickupAtDayjs = pickupAt ? dayjs(pickupAt) : null;
  const completedAtDayjs = completedAt ? dayjs(completedAt) : null;
  const arrivalAtShipperDayjs = arrivalAtShipper
    ? dayjs(arrivalAtShipper)
    : null;
  const arrivalAtReceiverDayjs = arrivalAtReceiver
    ? dayjs(arrivalAtReceiver)
    : null;
  const leftShipperDayjs = leftShipper ? dayjs(leftShipper) : null;
  const leftReceiverDayjs = leftReceiver ? dayjs(leftReceiver) : null;

  const [createLoad, { isLoading: creatingLoad }] = useCreateLoadsMutation();
  const [updateLoad, { isLoading: updatingLoad }] = useUpdateLoadsMutation();

  const [dhoToOriginDistance, setDhoToOriginDistance] = useState<number | null>(
    null
  );
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [allDistance, setAllDistance] = useState<string>("");
  const [pricePerMile, setPricePerMile] = useState<number | null>(null);
  const [showMaps, setShowMaps] = useState(false);

  // Drag and Drop Handlers
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging]
  );

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    processFiles(Array.from(files));
  }, []);

  // Process Files (used by both drag & drop and file input)
  const processFiles = (files: File[]) => {
    setUploadError("");

    // Check documents limit
    const totalFiles = selectedDocuments.length + files.length;
    if (totalFiles > 2) {
      setUploadError("You can only upload maximum 2 files 😢");
      return;
    }

    // Validate PDF files
    const invalidFiles = files.filter((file) => {
      const fileExtension = file.name.toLowerCase().split(".").pop();
      return fileExtension !== "pdf" && file.type !== "application/pdf";
    });

    if (invalidFiles.length > 0) {
      setUploadError("Only PDF files are allowed 😒");
      return;
    }

    // Add files
    setSelectedDocuments((prev) => [...prev, ...files]);
  };

  // Handle File Selection (for file input)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    processFiles(Array.from(files));
    e.target.value = ""; // Reset input
  };

  // Remove a file
  const handleRemoveFile = (index: number) => {
    setSelectedDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // تحميل بيانات التحميل عند فتح المودال للتعديل
  useEffect(() => {
    if (isOpen && editingLoad) {
      loadEditData(editingLoad);
      setSelectedDocuments([]);
      setUploadError("");
    }
  }, [isOpen, editingLoad]);

  // تحميل الخرائط فقط عند فتح التبويب الأول
  useEffect(() => {
    if (isOpen && activeTab === 1) {
      setShowMaps(true);
    } else {
      setShowMaps(false);
    }
  }, [isOpen, activeTab]);

  // دالة لتحميل بيانات التحميل للتعديل
  const loadEditData = async (loadItem: TLoads) => {
    if (!loadItem?.id) return;

    // تحديث حالة التحرير
    dispatch(setIsEditing(true));
    dispatch(setEditingLoad(loadItem));

    try {
      // DHO
      if (loadItem.DHO) {
        const dhoCoords = await geocodeAddress(loadItem.DHO);
        dispatch(
          setDho(
            dhoCoords ||
              ({
                display_name: loadItem.DHO,
                lat: "0",
                lon: "0",
              } as TPlace)
          )
        );
      } else {
        dispatch(setDho(null));
      }

      // Origin
      if (loadItem.origin) {
        const originCoords = await geocodeAddress(loadItem.origin);
        dispatch(
          setOrigin(
            originCoords ||
              ({
                display_name: loadItem.origin,
                lat: "0",
                lon: "0",
              } as TPlace)
          )
        );
      } else {
        dispatch(setOrigin(null));
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

        dispatch(setDestinations(destinationPlaces));
      } else {
        dispatch(setDestinations([]));
      }
    } catch (error) {
      console.error("Error geocoding addresses:", error);
      // التعامل مع الأخطاء هنا
    }

    // Load Details
    dispatch(setLoadIDInp(loadItem.loadId || ""));
    dispatch(setPrice(loadItem.totalPrice?.toString() || ""));
    dispatch(setFees(loadItem.feesNumber?.toString() || ""));

    // Dates
    dispatch(setPickupAt(loadItem.pickupAt || null));
    dispatch(setCompletedAt(loadItem.completedAt || null));
    dispatch(setArrivalAtShipper(loadItem.arrivalAtShipper || null));
    dispatch(setArrivalAtReceiver(loadItem.arrivalAtReceiver || null));
    dispatch(setLeftShipper(loadItem.leftShipper || null));
    dispatch(setLeftReceiver(loadItem.leftReceiver || null));

    dispatch(setDriverId(loadItem.driverId?.id || ""));
    dispatch(setTruckType((loadItem.truckType as TTruckType) || "reefer"));
    dispatch(setTruckId(loadItem.truckId?.truckId?.toString() || ""));
    dispatch(setTruckTemp(loadItem.truckTemp?.toString() || ""));

    // حساب المسافة
    if (loadItem.distanceMiles) {
      setAllDistance(loadItem.distanceMiles.toString());
    }
  };

  // Calculate distances
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

  useEffect(() => {
    const calculateTotalDistance = async () => {
      const isValidPlace = (place: TPlace | null): place is TPlace => {
        return place !== null;
      };

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

  // Handle form submission
  const handleCreateLoad = async (e: React.FormEvent) => {
    e.preventDefault();

    const total = Number(price);
    const validDestinations = destinations.filter((dest) => dest !== null);

    if (!origin || validDestinations.length === 0) {
      toast.error("Please select origin and at least one destination");
      return;
    }

    if (!isEditing && (!driverId || !truckId)) {
      toast.error("Please select driver and truck");
      return;
    }

    if (!total || total <= 0) {
      toast.error("Please enter a valid total price");
      return;
    }

    const finalDistance = allDistance
      ? parseInt(allDistance)
      : Math.round(distance || 0);

    if (!finalDistance || finalDistance <= 0) {
      toast.error("Invalid distance calculated");
      return;
    }

    const formData = new FormData();

    // 🔹 التأكد من إضافة origin
    if (origin && origin.display_name) {
      formData.append("origin[address]", origin.display_name);
    } else {
      console.error("❌ Origin is missing or invalid");
    }

    // 🔹 التأكد من إضافة destinations
    if (validDestinations.length > 0) {
      validDestinations.forEach((dest, index) => {
        if (dest && dest.display_name) {
          formData.append(`destination[${index}][address]`, dest.display_name);
        } else {
          console.error(`❌ Destination ${index} is missing or invalid`);
        }
      });
    } else {
      console.error("❌ No valid destinations found");
    }

    // 🔹 التأكد من إضافة DHO
    if (dho && dho.display_name) {
      formData.append("DHO[address]", dho.display_name);
    } else {
      console.log("ℹ️ DHO is optional, not added");
    }

    // 🔹 الحقول الخاصة بالإنشاء فقط
    if (!isEditing) {
      if (driverId) {
        formData.append("driverId", driverId);
      }
      if (truckId) {
        formData.append("truckId", truckId);
      }
    }

    // 🔹 الحقول المشتركة
    const commonFields = {
      pickupAt,
      completedAt,
      arrivalAtShipper,
      arrivalAtReceiver,
      leftShipper,
      leftReceiver,
      truckTemp,
      truckType,
      distanceMiles: finalDistance.toString(),
      totalPrice: total.toString(),
      pricePerMile: (total / finalDistance).toString(),
      feesNumber: fees,
      loadId: loadIDInp,
    };

    Object.entries(commonFields).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, value.toString());
      }
    });

    // 🔹 إضافة الملفات
    if (selectedDocuments.length > 0) {
      selectedDocuments.forEach((file) => {
        formData.append("documents", file);
      });
    } else {
      console.log("ℹ️ No documents to add");
    }

    try {
      let createdLoadId: string | undefined;

      if (isEditing && editingLoad) {
        console.log("🔄 Sending UPDATE request...");
        await updateLoad({
          id: editingLoad.id,
          formData,
        }).unwrap();
        toast.success("Load updated ✅");
        createdLoadId = editingLoad.id;
      } else {
        console.log("🆕 Sending CREATE request...");
        const result = await createLoad(formData).unwrap();
        toast.success("Load created ✅");
        createdLoadId = result?.data?.id || result?.id;
      }

      handleClose();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      console.error("❌ Request failed:", err);
      toast.error(
        errorMessage || `Load ${isEditing ? "update" : "creation"} failed ❌`
      );
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "object" && error !== null && "data" in error) {
      const rtkError = error as { data?: { message?: string } };
      if (rtkError.data?.message) {
        return rtkError.data.message;
      }
    }

    if (typeof error === "object" && error !== null && "message" in error) {
      return (error as { message: string }).message;
    }

    return "An unknown error occurred";
  };

  const handleClose = () => {
    dispatch(resetForm());
    setSelectedDocuments([]);
    setUploadError("");
    setIsDragging(false);
    setShowMaps(false);
    onClose();
  };

  const handlePriceChange = (value: string) => {
    dispatch(setPrice(value));

    if (allDistance && Number(allDistance) > 0 && Number(value) > 0) {
      const perMile = Number(value) / Number(allDistance);
      setPricePerMile(perMile);
    } else {
      setPricePerMile(null);
    }
  };

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

  const isTab1Valid = (): boolean => {
    const hasValidDho = dho !== null && dho !== undefined;
    const hasValidOrigin = origin !== null && origin !== undefined;
    const hasValidDestinations =
      destinations.length > 0 &&
      destinations.every((dest) => dest !== null && dest !== undefined);

    return hasValidDho && hasValidOrigin && hasValidDestinations;
  };

  const isTab2Valid = (): boolean => {
    const hasValidPrice = price.trim() !== "";
    const hasValidLoadID = loadIDInp.trim() !== "";
    const hasValidPickupAt = pickupAt !== null;
    const hasValidCompletedAt = completedAt !== null;

    return (
      hasValidPrice && hasValidLoadID && hasValidPickupAt && hasValidCompletedAt
    );
  };

  const isTab3Valid = (): boolean => {
    if (isEditing) {
      return !!(
        editingLoad?.driverId &&
        editingLoad?.truckId &&
        editingLoad?.truckType
      );
    } else {
      const hasValidDriverId = driverId.trim() !== "";
      const hasValidTruckType = truckType.trim() !== "";
      const hasValidTruckId = truckId.trim() !== "";

      return hasValidDriverId && hasValidTruckType && hasValidTruckId;
    }
  };

  const handleAddDestination = () => {
    dispatch(addDestination());
  };

  const handleUpdateDestination = (index: number, place: TPlace | null) => {
    dispatch(updateDestination({ index, place }));
  };

  const handleRemoveDestination = (index: number) => {
    dispatch(removeDestination(index));
  };

  // Map fallback component
  const MapFallback = () => (
    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border border-gray-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading Maps...</p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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
              onClick={() => dispatch(setActiveTab(1))}
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
              onClick={() => dispatch(setActiveTab(2))}
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
              onClick={() => dispatch(setActiveTab(3))}
            >
              <span className="flex items-center">
                <IoCar className="mr-2" />
                Ride
              </span>
            </button>
          </nav>
        </div>

        <form onSubmit={handleCreateLoad} className="flex-1 overflow-auto p-4">
          {/* Tab 1: Locations */}
          {activeTab === 1 && (
            <div>
              {/* Information Message */}
              {allDistance && (
                <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <IoInformationCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-md font-medium text-blue-800">
                        Route Distance Information
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Total distance calculated from {dho ? "DHO" : "Origin"}{" "}
                        through all destinations:{" "}
                        <strong>{allDistance} miles</strong>
                      </p>
                      {dho && origin && (
                        <p className="text-sm text-blue-600 mt-1">
                          • DHO to Origin:{" "}
                          {dhoToOriginDistance?.toFixed(2) || "0"} miles
                        </p>
                      )}
                      {destinations.filter((d) => d !== null).length > 0 && (
                        <p className="text-sm text-blue-600">
                          • Including{" "}
                          {destinations.filter((d) => d !== null).length}{" "}
                          destination(s)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Direction */}
                <div className="space-y-6">
                  <LocationAutocomplete
                    label="DHO (Driver Home Origin)"
                    value={dho}
                    setValue={(place) => dispatch(setDho(place))}
                    placeholder="Enter driver's starting location"
                  />

                  <LocationAutocomplete
                    label="Pick Up (Origin)"
                    value={origin}
                    setValue={(place) => dispatch(setOrigin(place))}
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
                        onClick={handleAddDestination}
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
                              handleUpdateDestination(index, place)
                            }
                            placeholder={`Enter destination ${
                              index + 1
                            } address`}
                          />
                        </div>

                        {destinations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDestination(index)}
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

                {/* Maps - Load only when needed */}
                <div className="grid grid-cols-1 gap-6">
                  {showMaps ? (
                    <Suspense fallback={<MapFallback />}>
                      <LazyGoogleMapsLoader
                        onLoad={() => console.log("Maps loaded successfully")}
                        onError={(error) =>
                          console.error("Failed to load maps:", error)
                        }
                      >
                        <LazyMapWithRoute
                          dho={dho}
                          origin={origin}
                          destinations={destinations}
                          height="350px"
                        />
                      </LazyGoogleMapsLoader>
                    </Suspense>
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border border-gray-200">
                      <div className="text-center text-gray-500">
                        <p>Map will load when needed</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => dispatch(setActiveTab(2))}
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
            </div>
          )}

          {/* Tab 2: Load Details */}
          {activeTab === 2 && (
            <LoadDetailsTab
              allDistance={allDistance}
              price={price}
              fees={fees}
              loadIDInp={loadIDInp}
              pickupAt={pickupAtDayjs}
              completedAt={completedAtDayjs}
              arrivalAtShipper={arrivalAtShipperDayjs}
              arrivalAtReceiver={arrivalAtReceiverDayjs}
              leftShipper={leftShipperDayjs}
              leftReceiver={leftReceiverDayjs}
              pricePerMile={pricePerMile}
              isEditing={isEditing}
              destinations={destinations}
              selectedDocuments={selectedDocuments}
              uploadError={uploadError}
              isDragging={isDragging}
              onPriceChange={handlePriceChange}
              onFeesChange={(value) => dispatch(setFees(value))}
              onLoadIDChange={(value) => dispatch(setLoadIDInp(value))}
              onPickupAtChange={(value) =>
                dispatch(setPickupAt(value ? value.toISOString() : null))
              }
              onCompletedAtChange={(value) =>
                dispatch(setCompletedAt(value ? value.toISOString() : null))
              }
              onArrivalAtShipperChange={(value) =>
                dispatch(
                  setArrivalAtShipper(value ? value.toISOString() : null)
                )
              }
              onArrivalAtReceiverChange={(value) =>
                dispatch(
                  setArrivalAtReceiver(value ? value.toISOString() : null)
                )
              }
              onLeftShipperChange={(value) =>
                dispatch(setLeftShipper(value ? value.toISOString() : null))
              }
              onLeftReceiverChange={(value) =>
                dispatch(setLeftReceiver(value ? value.toISOString() : null))
              }
              onFileSelect={handleFileSelect}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onRemoveFile={handleRemoveFile}
              isTabValid={isTab2Valid()}
              onPrevTab={() => dispatch(setActiveTab(1))}
              onNextTab={() => dispatch(setActiveTab(3))}
            />
          )}

          {/* Tab 3: Assignment */}
          {activeTab === 3 && (
            <AssignmentTab
              isEditing={isEditing}
              editingLoad={editingLoad}
              driverId={driverId}
              truckId={truckId}
              truckType={truckType}
              truckTemp={truckTemp}
              onDriverIdChange={(value) => dispatch(setDriverId(value))}
              onTruckIdChange={(value) => dispatch(setTruckId(value))}
              onTruckTypeChange={(value) =>
                dispatch(setTruckType(value as TTruckType))
              }
              onTruckTempChange={(value) => dispatch(setTruckTemp(value))}
              isTabValid={isTab3Valid()}
              onPrevTab={() => dispatch(setActiveTab(2))}
              onSubmit={handleCreateLoad}
              isLoading={creatingLoad || updatingLoad}
            />
          )}
        </form>
      </div>
    </Modal>
  );
};

export default CreateEditLoadModal;

// Load Details Tab Component
interface LoadDetailsTabProps {
  allDistance: string;
  price: string;
  fees: string;
  loadIDInp: string;
  pickupAt: Dayjs | null;
  completedAt: Dayjs | null;
  arrivalAtShipper: Dayjs | null;
  arrivalAtReceiver: Dayjs | null;
  leftShipper: Dayjs | null;
  leftReceiver: Dayjs | null;
  pricePerMile: number | null;
  isEditing: boolean;
  destinations: (TPlace | null)[];
  selectedDocuments: File[];
  uploadError: string;
  isDragging: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemoveFile: (index: number) => void;
  onPriceChange: (value: string) => void;
  onFeesChange: (value: string) => void;
  onLoadIDChange: (value: string) => void;
  onPickupAtChange: (value: Dayjs | null) => void;
  onCompletedAtChange: (value: Dayjs | null) => void;
  onArrivalAtShipperChange: (value: Dayjs | null) => void;
  onArrivalAtReceiverChange: (value: Dayjs | null) => void;
  onLeftShipperChange: (value: Dayjs | null) => void;
  onLeftReceiverChange: (value: Dayjs | null) => void;
  isTabValid: boolean;
  onPrevTab: () => void;
  onNextTab: () => void;
}

const LoadDetailsTab: React.FC<LoadDetailsTabProps> = ({
  allDistance,
  price,
  fees,
  loadIDInp,
  pickupAt,
  completedAt,
  arrivalAtShipper,
  arrivalAtReceiver,
  leftShipper,
  leftReceiver,
  pricePerMile,
  isEditing,
  destinations,
  selectedDocuments,
  uploadError,
  isDragging,
  onFileSelect,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onRemoveFile,
  onPriceChange,
  onFeesChange,
  onLoadIDChange,
  onPickupAtChange,
  onCompletedAtChange,
  onArrivalAtShipperChange,
  onArrivalAtReceiverChange,
  onLeftShipperChange,
  onLeftReceiverChange,
  isTabValid,
  onPrevTab,
  onNextTab,
}) => {
  const canAddMoreFiles = selectedDocuments.length < 2;

  return (
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
              value={allDistance ? `${allDistance} miles` : "Calculating..."}
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
              Total route: → {destinations.filter((d) => d !== null).length}{" "}
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
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
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
                Calculated automatically: ${price} ÷ {allDistance} miles
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
              value={fees}
              onChange={(e) => onFeesChange(e.target.value)}
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
              <IoKey className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={loadIDInp}
              onChange={(e) => onLoadIDChange(e.target.value)}
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
                  onChange={onPickupAtChange}
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
                  onChange={onCompletedAtChange}
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
                      Arrival At Shipper
                    </label>
                    <DateTimePicker
                      value={arrivalAtShipper}
                      onChange={onArrivalAtShipperChange}
                      views={["year", "month", "day", "hours", "minutes"]}
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
                      Arrival At Receiver
                    </label>
                    <DateTimePicker
                      value={arrivalAtReceiver}
                      onChange={onArrivalAtReceiverChange}
                      views={["year", "month", "day", "hours", "minutes"]}
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
                      Left Shipper
                    </label>
                    <DateTimePicker
                      value={leftShipper}
                      onChange={onLeftShipperChange}
                      views={["year", "month", "day", "hours", "minutes"]}
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
                      Left Receiver
                    </label>
                    <DateTimePicker
                      value={leftReceiver}
                      onChange={onLeftReceiverChange}
                      views={["year", "month", "day", "hours", "minutes"]}
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

        {/* Documents - Drag & Drop Area */}
        <div className="md:col-span-2">
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-slate-50"
            }`}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <MdPictureAsPdf
                  className={`transition-colors ${
                    isDragging ? "text-blue-500" : "text-red-500"
                  }`}
                  size={32}
                />
              </div>
              <h5 className="text-sm font-semibold text-slate-700 mb-1">
                Add PDF Documents (Optional)
              </h5>
              <p className="text-xs text-slate-500 mb-4">
                Maximum 2 PDF files allowed - You can add documents later
              </p>

              <input
                type="file"
                id="pdf-upload-create"
                accept=".pdf,application/pdf"
                multiple
                onChange={onFileSelect}
                disabled={!canAddMoreFiles}
                className="hidden"
              />
              <label
                htmlFor="pdf-upload-create"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  canAddMoreFiles
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                <IoAdd size={16} />
                Select PDF Files
              </label>

              <p className="text-xs text-slate-500 mt-3">
                or <strong>drag and drop</strong> PDF files here
              </p>

              {uploadError && (
                <div className="mt-3 flex items-center justify-center gap-2 text-red-600 text-sm">
                  <MdError size={16} />
                  {uploadError}
                </div>
              )}

              {/* Selected Files Preview */}
              {selectedDocuments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    Selected Files ({selectedDocuments.length}/2):
                  </p>
                  {selectedDocuments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <MdPictureAsPdf className="text-red-500" size={18} />
                        <div className="text-left">
                          <p className="text-sm font-medium text-slate-800">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveFile(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrevTab}
          className="flex items-center gap-2 py-2 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
        >
          <IoArrowBack size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={onNextTab}
          disabled={!isTabValid}
          className={`flex items-center gap-2 py-2 px-6 rounded-lg font-medium transition-colors ${
            isTabValid
              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          Next
          <IoArrowForward size={16} />
        </button>
      </div>
    </div>
  );
};

// Assignment Tab Component (يجب إضافة هذا الجزء أيضًا)
interface AssignmentTabProps {
  isEditing: boolean;
  editingLoad: TLoads | null;
  driverId: string;
  truckId: string;
  truckType: string;
  truckTemp: string;
  onDriverIdChange: (value: string) => void;
  onTruckIdChange: (value: string) => void;
  onTruckTypeChange: (value: string) => void;
  onTruckTempChange: (value: string) => void;
  isTabValid: boolean;
  onPrevTab: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const AssignmentTab: React.FC<AssignmentTabProps> = ({
  isEditing,
  editingLoad,
  driverId,
  truckId,
  truckType,
  truckTemp,
  onDriverIdChange,
  onTruckIdChange,
  onTruckTypeChange,
  onTruckTempChange,
  isTabValid,
  onPrevTab,
  isLoading,
}) => {
  const { data: driversData } = useGetDriversQuery();
  const { data: trucksData } = useGetTrucksQuery();

  const drivers = driversData?.data || [];
  const trucks = trucksData?.data || [];

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Driver - Display Only */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Driver <span className="text-green-600">✓ Assigned</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={editingLoad?.driverId?.name || "No driver assigned"}
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
              Truck Type <span className="text-green-600">✓ Assigned</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={
                  editingLoad?.truckType
                    ? `${
                        editingLoad.truckType.charAt(0).toUpperCase() +
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
              Truck <span className="text-green-600">✓ Assigned</span>
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
              Temperature <span className="text-green-600">✓ Set</span>
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
                Driver and truck assignments cannot be modified for existing
                loads. This ensures consistency in load tracking and driver
                assignments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onPrevTab}
            className="flex items-center gap-2 py-2 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            <IoArrowBack size={16} />
            Back
          </button>
          <button
            type="submit"
            disabled={!isTabValid || isLoading}
            className={`flex items-center gap-2 py-2 px-6 rounded-lg font-medium transition-colors ${
              isTabValid && !isLoading
                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <RxUpdate size={18} />
                Update Load
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Driver <span className="text-red-500">*</span>
          </label>
          <select
            className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            value={driverId}
            onChange={(e) => onDriverIdChange(e.target.value)}
            required
          >
            <option value="">Select Driver</option>
            {drivers.map((d: TDriver, i: number) => (
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
            onChange={(e) => onTruckTypeChange(e.target.value as TTruckType)}
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
            onChange={(e) => onTruckIdChange(e.target.value)}
            required
            disabled={!truckType}
          >
            <option value="">Select Truck</option>
            {Array.isArray(trucks?.data) ? (
              trucks.data
                .filter((t: TTruck) => !truckType || t.type === truckType)
                .map((t: TTruck, i: number) => (
                  <option key={i} value={t.id}>
                    {t.model} ({t.plateNumber}) - {t.type}
                  </option>
                ))
            ) : (
              <option disabled>No trucks available</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Temperature{" "}
            {truckType === "reefer" && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={truckTemp}
            onChange={(e) => onTruckTempChange(e.target.value)}
            className={`${
              Array.isArray(trucks) &&
              trucks.find((t: TTruck) => t.id === truckId)?.type !== "reefer"
                ? "cursor-not-allowed"
                : ""
            } block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors`}
            placeholder="-10"
            disabled={
              !truckId ||
              (Array.isArray(trucks) &&
                trucks.find((t: TTruck) => t.id === truckId)?.type !== "reefer")
            }
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrevTab}
          className="flex items-center gap-2 py-2 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
        >
          <IoArrowBack size={16} />
          Back
        </button>
        <button
          type="submit"
          disabled={!isTabValid || isLoading}
          className={`flex items-center gap-2 py-2 px-6 rounded-lg font-medium transition-colors ${
            isTabValid && !isLoading
              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
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
  );
};
