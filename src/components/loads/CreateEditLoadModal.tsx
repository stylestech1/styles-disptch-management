import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
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
import { RootState, useAppSelector } from "@/redux/store";
import {
  AssignmentTabProps,
  CreateEditLoadModalProps,
  LoadDetailsTabProps,
  TDriver,
  TLoads,
  TTruck,
  TTruckType,
} from "@/types/globalTypes";
import toast from "react-hot-toast";
import { MdError, MdPictureAsPdf } from "react-icons/md";
import {
  Alert,
  alpha,
  Box,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

// Lazy load the map components
const LazyGoogleMapsLoader = lazy(
  () => import("@/components/ui/GoogleMapsLoader")
);
const LazyMapWithRoute = lazy(() => import("@/components/ui/MapWithRoute"));

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

  const theme = useAppSelector((state: RootState) => state.palette);

  // For Documents
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Days.js
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

  // Loading when open modal
  useEffect(() => {
    if (isOpen && editingLoad) {
      loadEditData(editingLoad);
      setSelectedDocuments([]);
      setUploadError("");
    }
  }, [isOpen, editingLoad]);

  // loading Maps on mounting
  useEffect(() => {
    if (isOpen && activeTab === 1) {
      setShowMaps(true);
    } else {
      setShowMaps(false);
    }
  }, [isOpen, activeTab]);

  // loading when edit
  const loadEditData = async (loadItem: TLoads) => {
    if (!loadItem?.id) return;

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

    if (origin && origin.display_name) {
      formData.append("origin[address]", origin.display_name);
    } else {
      console.error("❌ Origin is missing or invalid");
    }

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

    if (dho && dho.display_name) {
      formData.append("DHO[address]", dho.display_name);
    } else {
      console.log("ℹ️ DHO is optional, not added");
    }

    if (!isEditing) {
      if (driverId) {
        formData.append("driverId", driverId);
      }
      if (truckId) {
        formData.append("truckId", truckId);
      }
    }

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
      closeOnOutsideClick={false}
    >
      <div className="flex flex-col h-full">
        {/* MUI Tabs Navigation */}
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => dispatch(setActiveTab(newValue))}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              minHeight: "64px",
            },
          }}
        >
          <Tab
            value={1}
            label={
              <span className="flex items-center">
                <IoLocationOutline className="mr-2" />
                Locations
              </span>
            }
            sx={{
              color:
                activeTab === 1
                  ? theme.currentPalette.primary
                  : theme.currentPalette.text,
              "&.Mui-selected": {
                color: theme.currentPalette.primary,
              },
            }}
          />
          <Tab
            value={2}
            label={
              <span className="flex items-center">
                <IoDocumentText className="mr-2" />
                Load Details
              </span>
            }
            sx={{
              color:
                activeTab === 2
                  ? theme.currentPalette.primary
                  : theme.currentPalette.text,
              "&.Mui-selected": {
                color: theme.currentPalette.primary,
              },
            }}
          />
          <Tab
            value={3}
            label={
              <span className="flex items-center">
                <IoCar className="mr-2" />
                Ride
              </span>
            }
            sx={{
              color:
                activeTab === 3
                  ? theme.currentPalette.primary
                  : theme.currentPalette.text,
              "&.Mui-selected": {
                color: theme.currentPalette.primary,
              },
            }}
          />
        </Tabs>

        <form onSubmit={handleCreateLoad} className="flex-1 overflow-auto p-4">
          {/* Tab 1: Locations */}
          {activeTab === 1 && (
            <div>
              {/* Information Message */}
              {allDistance && (
                <Alert
                  severity="success"
                  className="mb-5 p-3 border border-green-600"
                >
                  <div>
                    <h4 className="text-md font-medium text-green-800">
                      Route Distance Information
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      Total distance calculated from {dho ? "DHO" : "Origin"}{" "}
                      through all destinations:{" "}
                      <strong>{allDistance} miles</strong>
                    </p>
                    {dho && origin && (
                      <p className="text-sm text-green-600 mt-1">
                        • DHO to Origin:{" "}
                        {dhoToOriginDistance?.toFixed(2) || "0"} miles
                      </p>
                    )}
                    {destinations.filter((d) => d !== null).length > 0 && (
                      <p className="text-sm text-green-600">
                        • Including{" "}
                        {destinations.filter((d) => d !== null).length}{" "}
                        destination(s)
                      </p>
                    )}
                  </div>
                </Alert>
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
                      <Typography
                        sx={{
                          color: theme.currentPalette.primary,
                          fontSize: "14px",
                          fontWeight: "bold",
                          display: "block",
                          mb: 1,
                        }}
                      >
                        DHO to Origin Distance
                      </Typography>
                      <div className="relative">
                        <TextField
                          type="text"
                          value={
                            dhoToOriginDistance
                              ? `${dhoToOriginDistance.toFixed(2)} miles`
                              : ""
                          }
                          sx={{
                            bgcolor: theme.currentPalette.background,
                            color: theme.currentPalette.primary,
                          }}
                          className="block w-full px-3 py-3 border border-slate-300 rounded-lg font-medium"
                          aria-readonly
                          placeholder="Distance will auto-calculate"
                        />
                      </div>
                    </div>

                    <div>
                      <Typography
                        sx={{
                          color: theme.currentPalette.primary,
                          fontSize: "14px",
                          fontWeight: "bold",
                          display: "block",
                          mb: 1,
                        }}
                      >
                        Average Time To Pickup
                      </Typography>
                      <div className="relative">
                        <TextField
                          type="text"
                          value={
                            averageTime ? `${formatTime(averageTime)}` : ""
                          }
                          sx={{
                            bgcolor: theme.currentPalette.background,
                            color: theme.currentPalette.primary,
                          }}
                          className="block w-full px-3 py-3 border border-slate-300 rounded-lg font-medium"
                          aria-readonly
                          placeholder="Time will auto-calculate"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Destinations Section */}
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                      <Typography
                        sx={{
                          color: theme.currentPalette.primary,
                          fontSize: "14px",
                          fontWeight: "bold",
                          display: "block",
                          mb: 1,
                        }}
                      >
                        Destinations
                      </Typography>
                      <Button
                        variant="contained"
                        type="button"
                        onClick={handleAddDestination}
                        className="flex items-center w-full md:w-fit gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <IoAdd size={16} />
                        Add Destination
                      </Button>
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
                      <Box
                        sx={{
                          bgcolor: theme.currentPalette.background,
                          color: theme.currentPalette.primary,
                        }}
                        className="text-center py-6 border-2 border-dashed rounded-lg"
                      >
                        <p className="font-medium">No destinations added yet</p>
                        <p className="text-sm px-3 mt-1">
                          You must add at least one destination to continue
                        </p>
                      </Box>
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
                <Button
                  sx={{
                    bgcolor: theme.currentPalette.primary,
                    color: theme.currentPalette.background,
                  }}
                  type="button"
                  onClick={() => dispatch(setActiveTab(2))}
                  disabled={!isTab1Valid()}
                >
                  Next
                </Button>
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
  const theme = useAppSelector((state: RootState) => state.palette);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calculated All Distance - Read Only */}
        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Calculated All Distance
          </Typography>
          <div className="relative">
            <TextField
              aria-readonly
              type="text"
              value={allDistance ? `${allDistance} miles` : "Calculating..."}
              sx={{
                bgcolor: theme.currentPalette.background,
                width: "100%",
              }}
              placeholder="Auto-calculating total distance..."
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IoCheckmark className="h-5 w-5 text-green-600" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>
          {allDistance && (
            <p className="text-xs text-slate-500 mt-1">
              Total route: → {destinations.filter((d) => d !== null).length}{" "}
              destination(s)
            </p>
          )}
        </div>

        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Total Price
          </Typography>
          <div>
            <TextField
              type="text"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              sx={{
                bgcolor: theme.currentPalette.background,
                width: "100%",
              }}
              placeholder="0.00"
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IoCash className="h-5 w-5 text-slate-400" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>
        </div>

        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Price Per Mile
          </Typography>
          <div className="relative">
            <TextField
              aria-readonly
              type="text"
              value={
                pricePerMile !== null &&
                !isNaN(pricePerMile) &&
                isFinite(pricePerMile)
                  ? `$${pricePerMile.toFixed(3)}`
                  : "$0.000"
              }
              sx={{
                bgcolor: theme.currentPalette.background,
                width: "100%",
              }}
              placeholder="Auto-calculating total distance..."
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IoCash className="h-5 w-5 text-slate-400" />
                    </InputAdornment>
                  ),
                },
              }}
            />
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
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Fees Number
          </Typography>
          <div className="relative">
            <TextField
              type="text"
              value={fees}
              onChange={(e) => onFeesChange(e.target.value)}
              sx={{
                bgcolor: theme.currentPalette.background,
                width: "100%",
              }}
              placeholder="0.00"
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IoCash className="h-5 w-5 text-slate-400" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>
        </div>

        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Load Id
          </Typography>
          <div className="relative">
            <TextField
              type="text"
              value={loadIDInp}
              onChange={(e) => onLoadIDChange(e.target.value)}
              sx={{
                bgcolor: theme.currentPalette.background,
                width: "100%",
              }}
              placeholder="0.00"
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IoKey className="h-5 w-5 text-slate-400" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup DateTime */}
              <div>
                <Typography
                  sx={{
                    color: theme.currentPalette.primary,
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "block",
                    mb: 1,
                  }}
                >
                  Pickup
                </Typography>
                <DateTimePicker
                  value={pickupAt}
                  onChange={onPickupAtChange}
                  views={["year", "month", "day", "hours", "minutes"]}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      sx: {
                        bgcolor: theme.currentPalette.background,
                        "& .MuiInputBase-root": {
                          bgcolor: theme.currentPalette.background,
                        },
                      },
                    },
                    popper: {
                      sx: {
                        "& .MuiPaper-root": {
                          bgcolor: theme.currentPalette.background,
                        },
                      },
                    },
                  }}
                />
              </div>

              {/* Completed DateTime */}
              <div>
                <Typography
                  sx={{
                    color: theme.currentPalette.primary,
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "block",
                    mb: 1,
                  }}
                >
                  Delivery
                </Typography>
                <DateTimePicker
                  value={completedAt}
                  onChange={onCompletedAtChange}
                  views={["year", "month", "day", "hours", "minutes"]}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      sx: {
                        bgcolor: theme.currentPalette.background,
                        "& .MuiInputBase-root": {
                          bgcolor: theme.currentPalette.background,
                        },
                      },
                    },
                    popper: {
                      sx: {
                        "& .MuiPaper-root": {
                          bgcolor: theme.currentPalette.background,
                        },
                      },
                    },
                  }}
                />
              </div>

              {isEditing && (
                <>
                  {/* ArrivalAtShipper */}
                  <div>
                    <Typography
                      sx={{
                        color: theme.currentPalette.primary,
                        fontSize: "14px",
                        fontWeight: "bold",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Arrival At Shipper
                    </Typography>
                    <DateTimePicker
                      value={arrivalAtShipper}
                      onChange={onArrivalAtShipperChange}
                      views={["year", "month", "day", "hours", "minutes"]}
                      slotProps={{
                        textField: {
                          required: true,
                          fullWidth: true,
                          sx: {
                            bgcolor: theme.currentPalette.background,
                            "& .MuiInputBase-root": {
                              bgcolor: theme.currentPalette.background,
                            },
                          },
                        },
                        popper: {
                          sx: {
                            "& .MuiPaper-root": {
                              bgcolor: theme.currentPalette.background,
                            },
                          },
                        },
                      }}
                    />
                  </div>

                  {/* arrivalAtReceiver */}
                  <div>
                    <Typography
                      sx={{
                        color: theme.currentPalette.primary,
                        fontSize: "14px",
                        fontWeight: "bold",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Arrival At Receiver
                    </Typography>
                    <DateTimePicker
                      value={arrivalAtReceiver}
                      onChange={onArrivalAtReceiverChange}
                      views={["year", "month", "day", "hours", "minutes"]}
                      slotProps={{
                        textField: {
                          required: true,
                          fullWidth: true,
                          sx: {
                            bgcolor: theme.currentPalette.background,
                            "& .MuiInputBase-root": {
                              bgcolor: theme.currentPalette.background,
                            },
                          },
                        },
                        popper: {
                          sx: {
                            "& .MuiPaper-root": {
                              bgcolor: theme.currentPalette.background,
                            },
                          },
                        },
                      }}
                    />
                  </div>

                  {/* leftShipper */}
                  <div>
                    <Typography
                      sx={{
                        color: theme.currentPalette.primary,
                        fontSize: "14px",
                        fontWeight: "bold",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Left Shipper
                    </Typography>
                    <DateTimePicker
                      value={leftShipper}
                      onChange={onLeftShipperChange}
                      views={["year", "month", "day", "hours", "minutes"]}
                      slotProps={{
                        textField: {
                          required: true,
                          fullWidth: true,
                          sx: {
                            bgcolor: theme.currentPalette.background,
                            "& .MuiInputBase-root": {
                              bgcolor: theme.currentPalette.background,
                            },
                          },
                        },
                        popper: {
                          sx: {
                            "& .MuiPaper-root": {
                              bgcolor: theme.currentPalette.background,
                            },
                          },
                        },
                      }}
                    />
                  </div>

                  {/* leftReceiver */}
                  <div>
                    <Typography
                      sx={{
                        color: theme.currentPalette.primary,
                        fontSize: "14px",
                        fontWeight: "bold",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Left Receiver
                    </Typography>
                    <DateTimePicker
                      value={leftReceiver}
                      onChange={onLeftReceiverChange}
                      views={["year", "month", "day", "hours", "minutes"]}
                      slotProps={{
                        textField: {
                          required: true,
                          fullWidth: true,
                          sx: {
                            bgcolor: theme.currentPalette.background,
                            "& .MuiInputBase-root": {
                              bgcolor: theme.currentPalette.background,
                            },
                          },
                        },
                        popper: {
                          sx: {
                            "& .MuiPaper-root": {
                              bgcolor: theme.currentPalette.background,
                            },
                          },
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
            className={`
    border-2 border-dashed rounded-lg p-6 transition-all duration-200
    ${isDragging ? "ring-2 ring-offset-1" : ""}
  `}
            style={{
              borderColor: isDragging
                ? theme.currentPalette.primary
                : theme.currentPalette.text,
              backgroundColor: isDragging
                ? `${theme.currentPalette.primary}20`
                : theme.currentPalette.background,
            }}
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
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium 
                  transition-all duration-200 cursor-pointer
                  ${canAddMoreFiles ? "" : "cursor-not-allowed opacity-60"}
                `}
                style={{
                  backgroundColor: canAddMoreFiles
                    ? theme.currentPalette.primary
                    : theme.currentPalette.background,
                  color: canAddMoreFiles
                    ? theme.currentPalette.background
                    : theme.currentPalette.text,
                  border: `1px solid ${
                    canAddMoreFiles
                      ? theme.currentPalette.primary
                      : theme.currentPalette.text
                  }`,
                }}
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
                      <Button
                        variant="contained"
                        type="button"
                        onClick={() => onRemoveFile(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <IoClose size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          sx={{
            bgcolor: theme.currentPalette.primary,
            color: theme.currentPalette.background,
          }}
          type="button"
          onClick={onPrevTab}
        >
          Back
        </Button>
        <Button
          sx={{
            bgcolor: theme.currentPalette.primary,
            color: theme.currentPalette.background,
          }}
          type="button"
          onClick={onNextTab}
          disabled={!isTabValid}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// Assignment Tab Component
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
  const token = useAppSelector((state: RootState) => state.auth.token);

  const { data: driversData, refetch: driverRefetch } = useGetDriversQuery({
    skip: !token,
  });
  const { data: trucksData, refetch: truckRefetch } = useGetTrucksQuery({
    skip: !token,
  });

  const drivers = driversData?.data || [];
  const trucks = trucksData?.data || [];
  const theme = useAppSelector((state: RootState) => state.palette);

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Driver - Display Only */}
          <div>
            <Typography
              sx={{
                color: theme.currentPalette.primary,
                fontSize: "14px",
                fontWeight: "bold",
                display: "block",
                mb: 1,
              }}
            >
              Driver{" "}
              <Typography sx={{ color: theme.currentPalette.text }}>
                ✓ Assigned
              </Typography>
            </Typography>
            <div className="relative">
              <TextField
                aria-readonly
                type="text"
                value={editingLoad?.driverId?.name || "No driver assigned"}
                sx={{
                  bgcolor: theme.currentPalette.background,
                  width: "100%",
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IoCheckmark className="h-5 w-5 text-green-600" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
            {editingLoad?.driverId?.phone && (
              <p className="text-xs text-slate-500 mt-1">
                Phone: {editingLoad.driverId.phone}
              </p>
            )}
          </div>

          {/* Truck Type - Display Only */}
          <div>
            <Typography
              sx={{
                color: theme.currentPalette.primary,
                fontSize: "14px",
                fontWeight: "bold",
                display: "block",
                mb: 1,
              }}
            >
              Truck Type{" "}
              <Typography sx={{ color: theme.currentPalette.text }}>
                ✓ Assigned
              </Typography>
            </Typography>
            <div className="relative">
              <TextField
                aria-readonly
                type="text"
                value={
                  editingLoad?.truckType
                    ? `${
                        editingLoad.truckType.charAt(0).toUpperCase() +
                        editingLoad.truckType.slice(1)
                      }`
                    : "No type assigned"
                }
                sx={{
                  bgcolor: theme.currentPalette.background,
                  width: "100%",
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IoCheckmark className="h-5 w-5 text-green-600" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
          </div>

          {/* Truck - Display Only */}
          <div>
            <Typography
              sx={{
                color: theme.currentPalette.primary,
                fontSize: "14px",
                fontWeight: "bold",
                display: "block",
                mb: 1,
              }}
            >
              Truck{" "}
              <Typography sx={{ color: theme.currentPalette.text }}>
                ✓ Assigned
              </Typography>
            </Typography>
            <div className="relative">
              <TextField
                aria-readonly
                type="text"
                value={
                  editingLoad?.truckId
                    ? `${editingLoad.truckId.model} (${editingLoad.truckId.plateNumber})`
                    : "No truck assigned"
                }
                sx={{
                  bgcolor: theme.currentPalette.background,
                  width: "100%",
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IoCheckmark className="h-5 w-5 text-green-600" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
            {editingLoad?.truckId && (
              <p className="text-xs text-slate-500 mt-1">
                Truck ID: {editingLoad.truckId.truckId}
              </p>
            )}
          </div>

          {/* Temperature - Display Only */}
          <div>
            <Typography
              sx={{
                color: theme.currentPalette.primary,
                fontSize: "14px",
                fontWeight: "bold",
                display: "block",
                mb: 1,
              }}
            >
              Temperature{" "}
              <Typography sx={{ color: theme.currentPalette.text }}>
                ✓ Set
              </Typography>
            </Typography>
            <div className="relative">
              <TextField
                aria-readonly
                type="text"
                value={
                  editingLoad?.truckTemp
                    ? `${editingLoad.truckTemp}°C`
                    : "Not set"
                }
                sx={{
                  bgcolor: theme.currentPalette.background,
                  width: "100%",
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IoCheckmark className="h-5 w-5 text-green-600" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Information Message */}
        <Alert
          severity="info"
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex flex-col items-start gap-1">
            <h4 className="text-md font-medium">Driver & Truck Information</h4>
            <p className="text-sm">
              Driver and truck assignments cannot be modified for existing
              loads. This ensures consistency in load tracking and driver
              assignments.
            </p>
          </div>
        </Alert>

        <div className="flex justify-between pt-4">
          <Button
            sx={{
              bgcolor: theme.currentPalette.primary,
              color: theme.currentPalette.background,
            }}
            type="button"
            onClick={onPrevTab}
          >
            Back
          </Button>
          <Button
            sx={{
              bgcolor: theme.currentPalette.primary,
              color: theme.currentPalette.background,
            }}
            type="submit"
            disabled={!isTabValid || isLoading}
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
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Driver
          </Typography>
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              value={driverId}
              displayEmpty
              required
              onOpen={() => {
                driverRefetch();
                truckRefetch();
              }}
              onChange={(e) => onDriverIdChange(e.target.value)}
            >
              <MenuItem value="" disabled>
                Select Driver
              </MenuItem>
              {drivers.map((d: TDriver, i: number) => (
                <MenuItem key={i} value={d.id}>
                  {d.name} ({d.driverId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Truck Type
          </Typography>
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              displayEmpty
              required
              value={truckType}
              onChange={(e) => onTruckTypeChange(e.target.value as TTruckType)}
            >
              <MenuItem value="" disabled>
                Select Type
              </MenuItem>
              <MenuItem value={"reefer"}>Reefer</MenuItem>
              <MenuItem value={"van"}>Van</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Truck
          </Typography>
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              displayEmpty
              required
              value={truckId}
              onChange={(e) => onTruckIdChange(e.target.value)}
              disabled={!truckType}
            >
              <MenuItem value="" disabled>
                Select Truck
              </MenuItem>
              {Array.isArray(trucks) ? (
                trucks
                  .filter((t: TTruck) => !truckType || t.type === truckType)
                  .map((t: TTruck, i: number) => (
                    <MenuItem key={i} value={t.id}>
                      {t.model} ({t.plateNumber}) - {t.type}
                    </MenuItem>
                  ))
              ) : (
                <MenuItem disabled>No trucks available</MenuItem>
              )}
            </Select>
          </FormControl>
        </div>

        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Temperature
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={truckTemp}
            onChange={(e) => onTruckTempChange(e.target.value)}
            placeholder="-10"
            disabled={
              !truckId ||
              (Array.isArray(trucks.data) &&
                trucks.data
                  .find((t: TTruck) => t.id === String(truckId))
                  ?.type?.toLowerCase() !== "reefer")
            }
            sx={{
              bgcolor: theme.currentPalette.background,
              width: "100%",
              "& .MuiInputBase-root.Mui-disabled": {
                cursor: "not-allowed",
                backgroundColor: alpha(theme.currentPalette.primary, 0.1),
              },
            }}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          sx={{
            bgcolor: theme.currentPalette.primary,
            color: theme.currentPalette.background,
          }}
          type="button"
          onClick={onPrevTab}
        >
          Back
        </Button>
        <Button
          sx={{
            bgcolor: theme.currentPalette.primary,
            color: theme.currentPalette.background,
          }}
          type="submit"
          disabled={!isTabValid || isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>Create Load</>
          )}
        </Button>
      </div>
    </div>
  );
};
