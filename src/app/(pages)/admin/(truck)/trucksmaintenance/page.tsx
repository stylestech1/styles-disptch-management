"use client";
import Loading from "@/components/ui/Loading";
import StatsCard from "@/components/ui/StatsCard";
import useError from "@/hook/useError";
import useLoading from "@/hook/useLoading";
import Erros from "@/components/ui/Erros";
import { useFilter } from "@/providers/FilterProvider";
import {
  useGetAllMaintenancesQuery,
  useGetMaintenanceWithFilterQuery,
  useGetAllTrucksQuery,
  useCreateMaintenanceMutation,
  useUpdateMaintenanceMutation,
  useDeleteMaintenanceMutation,
  useLazySearchMaintenancesWithTypeQuery,
  useLazyFilterMaintenancesWithTypeQuery,
} from "@/redux/slices/apiSlice";
import { RootState, useAppSelector } from "@/redux/store";
import { TMaintenance } from "@/types/truckType";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  alpha,
  Box,
  Button,
  darken,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  SxProps,
  TableRow,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  IconButton,
  Autocomplete,
} from "@mui/material";
import {
  ClockAlert,
  Save,
  TriangleAlert,
  TruckElectric,
  CircleEllipsis,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import DataTable from "@/components/ui/DataTable";
import {
  truckMaintenanceMilesColumns,
  truckMaintenanceTimesColumns,
} from "@/data/trucksMaintenanceTable";
import { TPagination, TTruck } from "@/types/globalTypes";
import Pagination from "@/components/ui/Pagination";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Import the separated components
import TrucksDialog from "@/components/truck/truckMaintenance/TrucksDialog";
import ActionsMenu from "@/components/truck/truckMaintenance/ActionsMenu";
import EditDialog from "@/components/truck/truckMaintenance/EditDialog";
import DeleteDialog from "@/components/truck/truckMaintenance/DeleteDialog";
import SearchInput from "@/components/ui/SearchInput";
import { useSearchSubmit } from "@/hook/useSearchSubmit";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const TruckMaintenance = () => {
  const theme = useAppSelector((state: RootState) => state.palette);
  const [page, setPage] = useState(1);
  const { fromDate, toDate, isFiltered } = useFilter();
  const { loading, setLoading } = useLoading();
  const { error, setError } = useError();

  // Quick Log Form State
  const [selectedTrucks, setSelectedTrucks] = useState<string[]>([]);
  const [mileage, setMileage] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [intervalMile, setIntervalMile] = useState("");
  const [remindBeforeMile, setRemindBeforeMile] = useState("");
  const [intervalDays, setIntervalDays] = useState("");
  const [remindBeforeDays, setRemindBeforeDays] = useState("");
  const [togglePage, setTogglePage] = useState<"Miles" | "Times">("Miles");
  const [inputValue, setInputValue] = useState("");

  // Truck Inputs State
  const [truckInputs, setTruckInputs] = useState<
    Array<{
      truckId: string;
      lastDoneMile?: string;
      lastDoneAt?: string;
    }>
  >([]);

  // Dialog State
  const [openTrucksDialog, setOpenTrucksDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<TMaintenance | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    type: "",
    intervalMile: "",
    remindBeforeMile: "",
    intervalDays: "",
    remindBeforeDays: "",
    trucks: [] as {
      truckId: string;
      plateNumber: string;
      lastDoneMile?: string;
      lastDoneAt?: string | null;
    }[],
  });

  // Get all trucks from API
  const {
    data: trucksData,
    isLoading: isTrucksLoading,
    error: trucksError,
  } = useGetAllTrucksQuery({
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false,
  });

  // Create maintenance mutation
  const [createMaintenance, { isLoading: isCreating }] =
    useCreateMaintenanceMutation();
  const [updateMaintenance, { isLoading: isUpdating }] =
    useUpdateMaintenanceMutation();
  const [deleteMaintenance, { isLoading: isDeleting }] =
    useDeleteMaintenanceMutation();

  const serviceTypes = [
    "Oil Change",
    "Tire Rotation",
    "Brake Inspection",
    "Engine Tune-up",
    "Transmission Service",
    "Electrical Check",
    "Preventive Maintenance",
    "Emergency Repair",
  ];

  // API Query for maintenance data
  const {
    data: maintenanceData,
    isLoading: isMaintenanceLoading,
    error: isMaintenanceError,
    refetch: maintenanceFetch,
  } = useGetAllMaintenancesQuery(
    { page, limit: 10, repeatBy: togglePage === "Miles" ? "mile" : "time" },
    {
      refetchOnFocus: false,
      refetchOnReconnect: false,
      refetchOnMountOrArgChange: false,
    }
  );

  const { data: filteredData } = useGetMaintenanceWithFilterQuery(
    {
      from: fromDate ? fromDate.format("YYYY-MM-DD") : undefined,
      to: toDate ? toDate.format("YYYY-MM-DD") : undefined,
      page,
      limit: 10,
    },
    { skip: !isFiltered || !fromDate || !toDate, refetchOnFocus: false }
  );

  useEffect(() => {
    if (isFiltered && fromDate && toDate) {
      setPage(1);
    }
  }, [isFiltered, fromDate, toDate, togglePage]);

  const [
    triggerSearchQuery,
    {
      data: maintenanceType,
      isLoading: maintenanceTypeLoading,
      error: maintenanceTypeError,
      reset: resetSearchQuery,
    },
  ] = useLazySearchMaintenancesWithTypeQuery();

  //

  const [
    triggerSearchByType,
    {
      data: filteredByTypeData,
      isLoading: isFilteringByType,
      error: filterByTypeError,
    },
  ] = useLazyFilterMaintenancesWithTypeQuery();

  // Search Hook
  const searchHook = useSearchSubmit({
    onSearch: (term) => {
      setPage(1);
      if (term.trim()) {
        triggerSearchQuery(term);
      }
    },
    onReset: () => {
      setPage(1);
      resetSearchQuery();
      maintenanceFetch();
    },
  });

  const { searchTerm, isSearching } = searchHook;

  // Process trucks data
  const trucks = useMemo(() => {
    if (!trucksData?.data) return [];
    return trucksData.data.map((truck: TTruck) => ({
      id: truck.id || truck.id,
      plateNumber: truck.plateNumber || "--",
    }));
  }, [trucksData]);

  // Process maintenance data
  const maintenance = useMemo(() => {
    let data: TMaintenance[] = [];

    if (isSearching && maintenanceType?.data) {
      data = maintenanceType.data;
    } else if (isFiltered && filteredData?.data) {
      data = filteredData.data;
    } else if (togglePage && filteredByTypeData?.data) {
      data = filteredByTypeData.data;
    } else if (maintenanceData?.data) {
      data = maintenanceData.data;
    }

    return data;
  }, [
    isSearching,
    maintenanceType?.data,
    isFiltered,
    filteredData?.data,
    togglePage,
    filteredByTypeData?.data,
    maintenanceData?.data,
  ]);

  const pagination: TPagination = useMemo(() => {
    if (isSearching && maintenanceType?.paginationResult) {
      return maintenanceType.paginationResult;
    }
    if (isFiltered && filteredData?.paginationResult) {
      return filteredData.paginationResult;
    }
    if (filteredByTypeData?.paginationResult) {
      return filteredByTypeData.paginationResult;
    }
    if (maintenanceData?.paginationResult) {
      return maintenanceData.paginationResult;
    }
    return null;
  }, [
    isSearching,
    maintenanceType?.paginationResult,
    isFiltered,
    filteredData?.paginationResult,
    filteredByTypeData?.paginationResult,
    maintenanceData?.paginationResult,
  ]);

  // Loading state
  useEffect(() => {
    setLoading(isMaintenanceLoading && !maintenanceData);
  }, [isMaintenanceLoading, maintenanceData, setLoading]);

  // Error handling for maintenance
  useEffect(() => {
    const currentError = isMaintenanceError;
    if (currentError) {
      const errorMessage = getErrorMessage(currentError);
      setError(errorMessage);
      toast.error(errorMessage || "Failed to load maintenance data ❌", {
        style: {
          background: "#dc2626",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "14px",
        },
        duration: 4000,
      });
    }
  }, [isMaintenanceError, setError]);

  // Error handling for trucks
  useEffect(() => {
    if (trucksError) {
      const errorMessage = getErrorMessage(trucksError);
      toast.error(`Failed to load trucks: ${errorMessage}`, {
        style: {
          background: "#dc2626",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "14px",
        },
        duration: 4000,
      });
    }
  }, [trucksError]);

  // Helper function to get available trucks for selection
  const getAvailableTrucksForSelection = (currentTruckId: string) => {
    const otherSelectedTruckIds = truckInputs
      .filter((input) => input.truckId && input.truckId !== currentTruckId)
      .map((input) => input.truckId);

    return trucks.filter(
      (truck: TTruck) => !otherSelectedTruckIds.includes(truck.id)
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate truck inputs
    const validTruckInputs = truckInputs.filter((input) => input.truckId);
    if (validTruckInputs.length === 0) {
      toast.error("Please add at least one truck with details", {
        style: {
          background: "#dc2626",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "14px",
        },
      });
      return;
    }

    // Validate service type
    if (!serviceType) {
      toast.error("Please select service type", {
        style: {
          background: "#dc2626",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "14px",
        },
      });
      return;
    }

    // Validate form based on maintenance type
    if (togglePage === "Miles") {
      if (!intervalMile || !remindBeforeMile) {
        toast.error(
          "Please fill all required fields for Mile-based maintenance",
          {
            style: {
              background: "#dc2626",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
            },
          }
        );
        return;
      }

      // Validate mileage is a number
      const intervalMileNum = parseInt(intervalMile);
      const remindBeforeMileNum = parseInt(remindBeforeMile);

      if (
        isNaN(intervalMileNum) ||
        intervalMileNum <= 0 ||
        isNaN(remindBeforeMileNum) ||
        remindBeforeMileNum < 0
      ) {
        toast.error("Please enter valid mileage values", {
          style: {
            background: "#dc2626",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "14px",
          },
        });
        return;
      }

      // Validate last done mileage for each truck
      for (const input of validTruckInputs) {
        if (!input.lastDoneMile || isNaN(parseInt(input.lastDoneMile))) {
          toast.error(`Please enter valid last done mileage for all trucks`, {
            style: {
              background: "#dc2626",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
            },
          });
          return;
        }
      }

      try {
        const statusPerTruck = validTruckInputs.map((input) => ({
          truck: input.truckId,
          lastDoneMile: parseInt(input.lastDoneMile!),
        }));

        // Prepare request body according to API spec
        const requestBody = {
          type: serviceType,
          repeatBy: "mile" as const,
          intervalMile: intervalMileNum,
          remindBeforeMile: remindBeforeMileNum,
          statusPerTruck: statusPerTruck,
        };

        // Call create maintenance API
        await createMaintenance(requestBody).unwrap();

        // Show success message
        toast.success(
          `Maintenance record saved for ${validTruckInputs.length} truck(s)!`,
          {
            style: {
              background: "#16a34a",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
            },
          }
        );

        // Reset form
        setTruckInputs([]);
        setMileage("");
        setServiceType("");
        setIntervalMile("");
        setRemindBeforeMile("");
        setSelectedTrucks([]);

        // Refresh maintenance data
        maintenanceFetch();
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(`Failed to save record: ${errorMessage}`, {
          style: {
            background: "#dc2626",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "14px",
          },
        });
      }
    } else {
      // Time-based maintenance
      if (!intervalDays || !remindBeforeDays) {
        toast.error(
          "Please fill all required fields for Time-based maintenance",
          {
            style: {
              background: "#dc2626",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
            },
          }
        );
        return;
      }

      // Validate values
      const intervalDaysNum = parseInt(intervalDays);
      const remindBeforeDaysNum = parseInt(remindBeforeDays);

      if (
        isNaN(intervalDaysNum) ||
        intervalDaysNum <= 0 ||
        isNaN(remindBeforeDaysNum) ||
        remindBeforeDaysNum < 0
      ) {
        toast.error("Please enter valid values", {
          style: {
            background: "#dc2626",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "14px",
          },
        });
        return;
      }

      // Validate last done date for each truck
      for (const input of validTruckInputs) {
        if (!input.lastDoneAt) {
          toast.error(`Please select last done date for all trucks`, {
            style: {
              background: "#dc2626",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
            },
          });
          return;
        }
      }

      try {
        const statusPerTruck = validTruckInputs.map((input) => ({
          truck: input.truckId,
          lastDoneAt: input.lastDoneAt!,
        }));

        // Prepare request body according to API spec
        const requestBody = {
          type: serviceType,
          repeatBy: "time" as const,
          intervalDays: intervalDaysNum,
          remindBeforeDays: remindBeforeDaysNum,
          statusPerTruck: statusPerTruck,
        };

        // Call create maintenance API
        await createMaintenance(requestBody).unwrap();

        // Show success message
        toast.success(
          `Maintenance record saved for ${validTruckInputs.length} truck(s)!`,
          {
            style: {
              background: "#16a34a",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
            },
          }
        );

        // Reset form
        setTruckInputs([]);
        setMileage("");
        setServiceType("");
        setIntervalDays("");
        setRemindBeforeDays("");
        setSelectedTrucks([]);

        // Refresh maintenance data
        maintenanceFetch();
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(`Failed to save record: ${errorMessage}`, {
          style: {
            background: "#dc2626",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "14px",
          },
        });
      }
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaintenance) return;

    try {
      const isMileBased = selectedMaintenance.repeatBy === "mile";

      type TMaintenanceUpdate = Pick<TMaintenance, "type"> & {
        intervalMile?: number;
        remindBeforeMile?: number;
        intervalDays?: number;
        remindBeforeDays?: number;
        statusPerTruck: Array<{
          truck: string;
          lastDoneMile?: number;
          lastDoneAt?: string;
        }>;
      };

      const statusPerTruck = editForm.trucks.map((truck) => {
        const truckObj: {
          truck: string;
          lastDoneMile?: number;
          lastDoneAt?: string;
        } = {
          truck: truck.truckId,
        };

        if (isMileBased) {
          if (truck.lastDoneMile) {
            truckObj.lastDoneMile = parseInt(truck.lastDoneMile);
          }
        } else {
          if (truck.lastDoneAt) {
            // Format date to YYYY-MM-DD
            const date = dayjs(truck.lastDoneAt);
            if (date.isValid()) {
              truckObj.lastDoneAt = date.format("YYYY-MM-DD");
            }
          }
        }

        return truckObj;
      });

      const updateData: TMaintenanceUpdate = {
        type: editForm.type,
        statusPerTruck: statusPerTruck,
      };

      if (isMileBased) {
        if (editForm.intervalMile) {
          updateData.intervalMile = parseInt(editForm.intervalMile);
        }
        if (editForm.remindBeforeMile) {
          updateData.remindBeforeMile = parseInt(editForm.remindBeforeMile);
        }
      } else {
        if (editForm.intervalDays) {
          updateData.intervalDays = parseInt(editForm.intervalDays);
        }
        if (editForm.remindBeforeDays) {
          updateData.remindBeforeDays = parseInt(editForm.remindBeforeDays);
        }
      }

      await updateMaintenance({
        id: selectedMaintenance.id,
        ...updateData,
      }).unwrap();

      toast.success("Maintenance record updated successfully!", {
        style: {
          background: "#16a34a",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "14px",
        },
      });

      setOpenEditDialog(false);
      maintenanceFetch();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to update record: ${errorMessage}`, {
        style: {
          background: "#dc2626",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "14px",
        },
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedMaintenance) return;

    try {
      await deleteMaintenance(selectedMaintenance.id!).unwrap();

      toast.success("Maintenance record deleted successfully!", {
        style: {
          background: "#16a34a",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "14px",
        },
      });

      setOpenDeleteDialog(false);
      maintenanceFetch();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to delete record: ${errorMessage}`, {
        style: {
          background: "#dc2626",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "14px",
        },
      });
    }
  };

  // Handle toggle change
  const handleToggleChange = (
    event: React.MouseEvent<HTMLElement>,
    newToggle: "Miles" | "Times"
  ) => {
    if (newToggle !== null) {
      setTogglePage(newToggle);
      setPage(1);
      setTruckInputs([]);
      setSelectedTrucks([]);

      const repeatBy = newToggle === "Miles" ? "mile" : "time";
      triggerSearchByType({ repeatBy, page: 1, limit: 10 });
    }
  };

  // Handle view trucks click
  const handleViewTrucks = (maintenanceItem: TMaintenance) => {
    setSelectedMaintenance(maintenanceItem);
    setOpenTrucksDialog(true);
  };

  // Handle edit click
  const handleEditClick = (maintenanceItem: TMaintenance) => {
    setSelectedMaintenance(maintenanceItem);
    const trucksForEdit = maintenanceItem.statusPerTruck.map((truck) => ({
      truckId: truck.truckId,
      plateNumber: truck.plateNumber,
      lastDoneMile: truck.lastDoneMile?.toString() || "",
      lastDoneAt: truck.lastDoneAt || null,
    }));

    setEditForm({
      type: maintenanceItem.type || "",
      intervalMile: maintenanceItem.intervalMile?.toString() || "",
      remindBeforeMile: maintenanceItem.remindBeforeMile?.toString() || "",
      intervalDays: maintenanceItem.intervalDays?.toString() || "",
      remindBeforeDays: maintenanceItem.remindBeforeDays?.toString() || "",
      trucks: trucksForEdit,
    });

    setOpenEditDialog(true);
    setAnchorEl(null);
  };

  // Handle delete click
  const handleDeleteClick = (maintenanceItem: TMaintenance) => {
    setSelectedMaintenance(maintenanceItem);
    setOpenDeleteDialog(true);
    setAnchorEl(null);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenTrucksDialog(false);
    setSelectedMaintenance(null);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedMaintenance(null);
    setEditForm({
      type: "",
      intervalMile: "",
      remindBeforeMile: "",
      intervalDays: "",
      remindBeforeDays: "",
      trucks: [],
    });
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedMaintenance(null);
  };

  // Helper function to get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case "upcoming":
        return {
          bg: "#FFFBEB",
          color: "#D97706",
          icon: <AlertCircle size={18} />,
          text: "Upcoming",
        };
      case "overdue":
        return {
          bg: "#FEF2F2",
          color: "#DC2626",
          icon: <AlertCircle size={18} />,
          text: "Overdue",
        };
      case "completed":
        return {
          bg: "#F0FDF4",
          color: "#16A34A",
          icon: <CheckCircle size={18} />,
          text: "Completed",
        };
      default:
        return {
          bg: "#F3F4F6",
          color: "#6B7280",
          icon: <AlertCircle size={18} />,
          text: status || "Unknown",
        };
    }
  };

  // Handle adding a new truck to edit form
  const handleAddTruck = () => {
    setEditForm({
      ...editForm,
      trucks: [
        ...editForm.trucks,
        {
          truckId: "",
          plateNumber: "",
          lastDoneMile: "",
          lastDoneAt: null,
        },
      ],
    });
  };

  // Handle truck selection change
  const handleTruckChange = (index: number, truckId: string) => {
    const newTrucks = [...editForm.trucks];
    const selectedTruck = trucks.find((t: TTruck) => t.id === truckId);

    newTrucks[index] = {
      ...newTrucks[index],
      truckId,
      plateNumber: selectedTruck?.plateNumber || "",
    };

    setEditForm({
      ...editForm,
      trucks: newTrucks,
    });
  };

  // Handle truck field change
  const handleTruckFieldChange = (
    index: number,
    field: "lastDoneMile" | "lastDoneAt",
    value: string
  ) => {
    const newTrucks = [...editForm.trucks];
    newTrucks[index] = {
      ...newTrucks[index],
      [field]: value,
    };

    setEditForm({
      ...editForm,
      trucks: newTrucks,
    });
  };

  // Get available trucks (excluding already selected ones)
  const getAvailableTrucks = (currentIndex: number) => {
    const selectedTruckIds = editForm.trucks
      .map((truck, index) => (index === currentIndex ? null : truck.truckId))
      .filter(Boolean);

    return trucks.filter(
      (truck: TTruck) => !selectedTruckIds.includes(truck.id)
    );
  };

  // Stats cards
  const statsData = useMemo(() => {
    const statLoadData = maintenanceData?.stats || {};
    return {
      totalMaintenance: statLoadData.total || 0,
      upcoming: statLoadData.upcoming || 0,
      overdue: statLoadData.overdue || 0,
    };
  }, [maintenanceData?.stats]);

  // Loading state
  const isInitialLoading = isMaintenanceLoading && !maintenanceData;
  if (isInitialLoading || isTrucksLoading) return <Loading />;

  // Table Mile renderer
  const renderMileRow = (item: TMaintenance, index: number) => {
    const tableRowSx: SxProps = {
      bgcolor: theme.currentPalette.background,
      "&:hover": {
        bgcolor: alpha(theme.currentPalette.primary, 0.1),
      },
      transition: "all 0.2s ease-in-out",
    };

    return (
      <TableRow sx={tableRowSx} key={index}>
        {/* type */}
        <td
          style={{ color: theme.currentPalette.primary }}
          className="p-4 text-center"
        >
          <span
            style={{
              backgroundColor: alpha(theme.currentPalette.primary, 0.1),
            }}
            className="py-1 px-2 rounded-md"
          >
            {item.type}
          </span>
        </td>

        {/* repeatBy */}
        <td
          style={{ color: theme.currentPalette.primary }}
          className="p-4 text-center"
        >
          {item.repeatBy || "--"}
        </td>

        {/* intervalMile */}
        <td
          style={{ color: theme.currentPalette.primary }}
          className="p-4 text-right"
        >
          {item.intervalMile || "--"} Miles
        </td>

        {/* remindBeforeMile */}
        <td
          style={{ color: theme.currentPalette.primary }}
          className="p-4 text-right"
        >
          {item.remindBeforeMile || "--"} Miles
        </td>

        {/* Actions */}
        <td
          style={{ color: theme.currentPalette.primary }}
          className="p-4 text-center"
        >
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setAnchorEl(e.currentTarget);
                setSelectedMaintenance(item);
              }}
              sx={{
                color: theme.currentPalette.primary,
                "&:hover": {
                  backgroundColor: alpha(theme.currentPalette.primary, 0.1),
                },
              }}
            >
              <CircleEllipsis fontSize="small" />
            </IconButton>
          </Box>
        </td>
      </TableRow>
    );
  };

  // Table Time renderer
  const renderTimeRow = (item: TMaintenance, index: number) => {
    const tableRowSx: SxProps = {
      bgcolor: theme.currentPalette.background,
      "&:hover": {
        bgcolor: alpha(theme.currentPalette.primary, 0.1),
      },
      transition: "all 0.2s ease-in-out",
    };

    return (
      <TableRow sx={tableRowSx} key={index} className="transition-colors group">
        {/* type */}
        <td
          style={{ color: theme.currentPalette.primary }}
          className="p-4 text-center"
        >
          <span
            style={{
              backgroundColor: alpha(theme.currentPalette.primary, 0.1),
            }}
            className="py-1 px-2 rounded-md"
          >
            {item.type}
          </span>
        </td>

        {/* repeatBy */}
        <td
          style={{ color: theme.currentPalette.primary }}
          className="p-4 text-center"
        >
          {item.repeatBy || "--"}
        </td>

        {/* intervalDays */}
        <td
          style={{ color: theme.currentPalette.primary }}
          className="p-4 text-right"
        >
          {item.intervalDays || "--"} Days
        </td>

        {/* remindBeforeDays */}
        <td
          style={{ color: theme.currentPalette.primary }}
          className="p-4 text-right"
        >
          {item.remindBeforeDays || "--"} Days
        </td>

        {/* Actions */}
        <td
          style={{ color: theme.currentPalette.primary }}
          className="p-4 text-center"
        >
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setAnchorEl(e.currentTarget);
                setSelectedMaintenance(item);
              }}
              sx={{
                color: theme.currentPalette.primary,
                "&:hover": {
                  backgroundColor: alpha(theme.currentPalette.primary, 0.1),
                },
              }}
            >
              <CircleEllipsis fontSize="small" />
            </IconButton>
          </Box>
        </td>
      </TableRow>
    );
  };

  // Container styles
  const containerSx: SxProps = {
    minHeight: "100vh",
    p: 3,
  };
  const searchFilterContainerSx: SxProps = {
    display: "flex",
    flexDirection: { xs: "column", lg: "row" },
    alignItems: { xs: "flex-start", lg: "center" },
    justifyContent: "space-between",
    gap: { xs: 3, lg: 0 },
    p: 2,
    my: 2,
    border: `1px solid ${alpha(theme.currentPalette.primary, 0.3)}`,
    borderRadius: 2,
    backgroundColor: theme.currentPalette.background,
    width: "100%",
  };

  const isLoading =
    isMaintenanceLoading ||
    isFilteringByType ||
    (isSearching && maintenanceTypeLoading);

  return (
    <Box sx={containerSx}>
      <Toaster position="top-center" />

      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <Erros message={error} />
        </Box>
      )}

      {/* Toggle Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <ToggleButtonGroup
          value={togglePage}
          exclusive
          onChange={handleToggleChange}
          aria-label="view type"
          size="medium"
          sx={{
            "& .MuiToggleButton-root": {
              borderColor: theme.currentPalette.primary,
              color: theme.currentPalette.text,
              "&.Mui-selected": {
                backgroundColor: theme.currentPalette.primary,
                color: theme.currentPalette.background,
                "&:hover": {
                  backgroundColor: darken(theme.currentPalette.primary, 0.1),
                },
              },
            },
          }}
        >
          <ToggleButton value="Miles" aria-label="miles" sx={{ px: 5 }}>
            Miles
          </ToggleButton>
          <ToggleButton value="Times" aria-label="times" sx={{ px: 5 }}>
            Time
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Stats Summary */}
      <Box sx={{ mt: 4, mb: 5 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-10">
          <StatsCard
            title="Total Maintenance"
            value={statsData.totalMaintenance}
            icon={TruckElectric}
            iconColor={theme.currentPalette.primary}
          />

          <StatsCard
            title="Trucks Upcoming for Service"
            value={statsData.upcoming}
            icon={TriangleAlert}
            iconColor={theme.currentPalette.primary}
          />

          <StatsCard
            title="Trucks Overdue for Service "
            value={statsData.overdue}
            icon={ClockAlert}
            iconColor={theme.currentPalette.primary}
          />
        </div>
      </Box>

      {/* Quick Log Service */}
      <Box
        sx={{
          mb: 5,
          p: 5,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.currentPalette.primary, 0.3)}`,
          backgroundColor: theme.currentPalette.background,
        }}
      >
        <Typography sx={{ mb: 4 }}>
          <span
            className="text-2xl font-semibold"
            style={{ color: theme.currentPalette.primary }}
          >
            Quickly log a {togglePage === "Miles" ? "mile-based" : "time-based"}{" "}
            maintenance
          </span>{" "}
          <br />
          <span style={{ color: alpha(theme.currentPalette.text, 0.7) }}>
            record for any truck in the fleet
          </span>
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Service Type */}
          <FormControl fullWidth size="medium" required>
            <Autocomplete
              freeSolo
              options={serviceTypes}
              value={serviceType}
              onChange={(event, newValue) => {
                if (newValue) setServiceType(newValue);
              }}
              onInputChange={(event, newInputValue) => {
                setServiceType(newInputValue);
              }}
              disabled={isTrucksLoading || trucks.length === 0}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Service Type"
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              )}
            />
          </FormControl>

          {togglePage === "Miles" ? (
            <>
              {/* Interval Mile for mile-based maintenance */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Interval (Miles)"
                  value={intervalMile}
                  onChange={(e) => setIntervalMile(e.target.value)}
                  placeholder="e.g., 5000"
                  type="number"
                  required
                  disabled={isTrucksLoading || trucks.length === 0}
                  InputProps={{
                    inputProps: { min: 1 },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Remind Before (Miles)"
                  value={remindBeforeMile}
                  onChange={(e) => setRemindBeforeMile(e.target.value)}
                  placeholder="e.g., 500"
                  type="number"
                  required
                  disabled={isTrucksLoading || trucks.length === 0}
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Stack>
            </>
          ) : (
            <>
              {/* Interval Days for time-based maintenance */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Interval (Days)"
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(e.target.value)}
                  placeholder="e.g., 30"
                  type="number"
                  required
                  disabled={isTrucksLoading || trucks.length === 0}
                  InputProps={{
                    inputProps: { min: 1 },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Remind Before (Days)"
                  value={remindBeforeDays}
                  onChange={(e) => setRemindBeforeDays(e.target.value)}
                  placeholder="e.g., 7"
                  type="number"
                  required
                  disabled={isTrucksLoading || trucks.length === 0}
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Stack>
            </>
          )}

          {/* Select Truck(s)*/}
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: theme.currentPalette.primary }}
                >
                  Truck Maintenance Details
                </Typography>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => {
                    setTruckInputs((prev) => [
                      ...prev,
                      {
                        truckId: "",
                        lastDoneMile: togglePage === "Miles" ? "" : undefined,
                        lastDoneAt: togglePage === "Times" ? "" : undefined,
                      },
                    ]);
                  }}
                  disabled={trucks.length === 0 || isTrucksLoading}
                  sx={{
                    borderColor: theme.currentPalette.primary,
                    color: theme.currentPalette.primary,
                    borderRadius: 2,
                    "&:hover": {
                      borderColor: darken(theme.currentPalette.primary, 0.2),
                      backgroundColor: alpha(
                        theme.currentPalette.primary,
                        0.05
                      ),
                    },
                  }}
                >
                  Add Truck
                </Button>
              </Box>

              {/* Dynamic Truck Inputs */}
              {truckInputs.map((input, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 3,
                    p: 2,
                    border: `1px solid ${alpha(
                      theme.currentPalette.primary,
                      0.2
                    )}`,
                    borderRadius: 2,
                    backgroundColor: alpha(
                      theme.currentPalette.background,
                      0.5
                    ),
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: theme.currentPalette.primary }}
                    >
                      Truck #{index + 1}
                    </Typography>
                    {truckInputs.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newInputs = [...truckInputs];
                          newInputs.splice(index, 1);
                          setTruckInputs(newInputs);
                          if (input.truckId) {
                            setSelectedTrucks((prev) =>
                              prev.filter((id) => id !== input.truckId)
                            );
                          }
                        }}
                        sx={{
                          color: theme.currentPalette.primary,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.currentPalette.primary,
                              0.1
                            ),
                          },
                        }}
                      >
                        <X size={16} />
                      </IconButton>
                    )}
                  </Box>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ mb: 2 }}
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel id={`truck-select-${index}`}>
                        Select Truck
                      </InputLabel>
                      <Select
                        labelId={`truck-select-${index}`}
                        value={input.truckId}
                        label="Select Truck"
                        onChange={(e) => {
                          const newInputs = [...truckInputs];
                          newInputs[index].truckId = e.target.value;
                          setTruckInputs(newInputs);
                          const selectedTruckId = e.target.value;
                          if (
                            selectedTruckId &&
                            !selectedTrucks.includes(selectedTruckId)
                          ) {
                            setSelectedTrucks((prev) => [
                              ...prev,
                              selectedTruckId,
                            ]);
                          }
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 4,
                          },
                          py: 1,
                        }}
                      >
                        <MenuItem value="">
                          <em>Select a truck</em>
                        </MenuItem>
                        {getAvailableTrucksForSelection(input.truckId).map(
                          (truck: TTruck) => (
                            <MenuItem key={truck.id} value={truck.id}>
                              {truck.plateNumber}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>

                    {/* Last Done Mileage/Date Input */}
                    {input.truckId &&
                      (togglePage === "Miles" ? (
                        <TextField
                          fullWidth
                          label="Last Done Mileage"
                          value={input.lastDoneMile || ""}
                          onChange={(e) => {
                            const newInputs = [...truckInputs];
                            newInputs[index].lastDoneMile = e.target.value;
                            setTruckInputs(newInputs);
                          }}
                          placeholder="e.g., 30000"
                          type="number"
                          required
                          InputProps={{
                            inputProps: { min: 0 },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      ) : (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="Last Done Date"
                            value={
                              input.lastDoneAt ? dayjs(input.lastDoneAt) : null
                            }
                            onChange={(newValue) => {
                              const newInputs = [...truckInputs];
                              newInputs[index].lastDoneAt = newValue
                                ? newValue.format("YYYY-MM-DD")
                                : "";
                              setTruckInputs(newInputs);
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true,
                                sx: {
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                  },
                                },
                              },
                            }}
                            format="DD/MM/YYYY"
                          />
                        </LocalizationProvider>
                      ))}
                  </Stack>

                  {input.truckId && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        bgcolor: alpha(theme.currentPalette.primary, 0.05),
                        borderRadius: 1,
                      }}
                    >
                      <CheckCircle
                        size={16}
                        style={{ color: theme.currentPalette.primary }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: theme.currentPalette.text }}
                      >
                        {
                          trucks.find((t: TTruck) => t.id === input.truckId)
                            ?.plateNumber
                        }{" "}
                        selected
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Save Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save size={20} />}
              disabled={
                isTrucksLoading ||
                trucks.length === 0 ||
                isCreating ||
                truckInputs.filter((input) => input.truckId).length === 0
              }
              sx={{
                bgcolor: theme.currentPalette.primary,
                color: theme.currentPalette.background,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: darken(theme.currentPalette.primary, 0.2),
                },
                "&.Mui-disabled": {
                  bgcolor: alpha(theme.currentPalette.primary, 0.3),
                  color: alpha(theme.currentPalette.background, 0.5),
                },
              }}
            >
              {isCreating
                ? "Saving..."
                : isTrucksLoading
                ? "Loading Trucks..."
                : `Save Record (${
                    truckInputs.filter((input) => input.truckId).length
                  } truck${
                    truckInputs.filter((input) => input.truckId).length !== 1
                      ? "s"
                      : ""
                  })`}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Search & Filter */}
      <Box sx={searchFilterContainerSx}>
        <Box>
          <Typography
            variant="h6"
            sx={{ color: theme.currentPalette.primary, fontWeight: 500 }}
          >
            Fleet Maintenance Status
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.currentPalette.primary, fontWeight: 400 }}
          >
            Real-time maintenance tracking across all vehicles
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: { xs: "column", lg: "row" },
            gap: 2,
            width: { xs: "100%", lg: "auto" },
          }}
        >
          {/* Search */}
          <SearchInput
            searchHook={searchHook}
            placeholder={"Search By Service Type..."}
            showClearButton
            sx={{ width: { xs: "100%", sm: "350px" } }}
            inputSx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: theme.currentPalette.background,
                py: 0.5,
                "&:hover": {
                  borderColor: theme.currentPalette.primary,
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={
          togglePage === "Miles"
            ? truckMaintenanceMilesColumns
            : truckMaintenanceTimesColumns
        }
        data={maintenance}
        renderRow={togglePage === "Miles" ? renderMileRow : renderTimeRow}
        loading={isLoading}
      />

      {/* Pagination */}
      {!isSearching && pagination && maintenance.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Pagination
            pagination={pagination}
            page={page}
            setPage={setPage}
            pageSize={10}
            showInfo={true}
          />
        </Box>
      )}

      {/* Separated Components */}
      <TrucksDialog
        open={openTrucksDialog}
        onClose={handleCloseDialog}
        selectedMaintenance={selectedMaintenance}
        getStatusInfo={getStatusInfo}
      />

      <ActionsMenu
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        selectedMaintenance={selectedMaintenance}
        onViewTrucks={handleViewTrucks}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <EditDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        selectedMaintenance={selectedMaintenance}
        serviceTypes={serviceTypes}
        initialServiceTypes={serviceTypes}
        editForm={editForm}
        trucks={trucks}
        onEditSubmit={handleEditSubmit}
        onTruckChange={handleTruckChange}
        onTruckFieldChange={handleTruckFieldChange}
        onAddTruck={handleAddTruck}
        getAvailableTrucks={getAvailableTrucks}
        isUpdating={isUpdating}
        setEditForm={setEditForm}
      />

      <DeleteDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onDelete={handleDelete}
        selectedMaintenance={selectedMaintenance}
        isDeleting={isDeleting}
      />
    </Box>
  );
};

export default TruckMaintenance;
