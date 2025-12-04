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
} from "@/redux/slices/apiSlice";
import { RootState, useAppSelector } from "@/redux/store";
import { TMaintenance, TStatusPerTruck } from "@/types/truckType";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  alpha,
  Box,
  Button,
  Chip,
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
  Checkbox,
  Dialog,
  IconButton,
  DialogTitle,
  DialogContent,
  Card,
  CardContent,
  Divider,
  Avatar,
  ListItemIcon,
  ListItemText,
  Menu,
  DialogActions,
} from "@mui/material";
import {
  ClockAlert,
  Save,
  TriangleAlert,
  TruckElectric,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  Gauge,
  TrendingUp,
  CircleEllipsis,
  Trash2,
  Edit,
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
import { IoMdEye } from "react-icons/io";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

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
    { page, limit: 10 },
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

  // Process trucks data
  const trucks = useMemo(() => {
    if (!trucksData?.data) return [];
    return trucksData.data.map((truck: TTruck) => ({
      id: truck.id || truck.id,
      plateNumber: truck.plateNumber || "--",
    }));
  }, [trucksData]);

  // Process maintenance data - flatten the array
  const maintenance = useMemo(() => {
    let data: TMaintenance[] = [];

    if (isFiltered && filteredData?.data) {
      data = filteredData.data;
    } else if (maintenanceData?.data) {
      data = maintenanceData.data;
    }

    // Filter based on togglePage
    if (togglePage === "Miles") {
      return data.filter((item: TMaintenance) => item.repeatBy === "mile");
    } else {
      return data.filter((item: TMaintenance) => item.repeatBy === "time");
    }
  }, [isFiltered, maintenanceData?.data, filteredData?.data, togglePage]);

  const pagination: TPagination = isFiltered
    ? filteredData?.paginationResult || null
    : maintenanceData?.paginationResult || null;

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTrucks.length === 0) {
      toast.error("Please select at least one truck", {
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
      if (!mileage || !serviceType || !intervalMile || !remindBeforeMile) {
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
      const mileageNum = parseInt(mileage);
      const intervalMileNum = parseInt(intervalMile);
      const remindBeforeMileNum = parseInt(remindBeforeMile);

      if (
        isNaN(mileageNum) ||
        mileageNum < 0 ||
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

      try {
        const statusPerTruck = selectedTrucks.map((truckId) => ({
          truck: truckId,
          lastDoneMile: mileageNum,
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
          `Maintenance record saved for ${selectedTrucks.length} truck(s)!`,
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
        setSelectedTrucks([]);
        setMileage("");
        setServiceType("");
        setIntervalMile("");
        setRemindBeforeMile("");

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
      if (!mileage || !serviceType || !intervalDays || !remindBeforeDays) {
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
      const mileageNum = parseInt(mileage);
      const intervalDaysNum = parseInt(intervalDays);
      const remindBeforeDaysNum = parseInt(remindBeforeDays);

      if (
        isNaN(mileageNum) ||
        mileageNum < 0 ||
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

      try {
        // Create a date string in YYYY-MM-DD format
        const today = new Date();
        const lastDoneAt = today.toISOString().split("T")[0];

        const statusPerTruck = selectedTrucks.map((truckId) => ({
          truck: truckId,
          lastDoneAt: lastDoneAt,
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
          `Maintenance record saved for ${selectedTrucks.length} truck(s)!`,
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
        setSelectedTrucks([]);
        setMileage("");
        setServiceType("");
        setIntervalDays("");
        setRemindBeforeDays("");

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

  // Handle removing a truck from edit form
  const handleRemoveTruck = (index: number) => {
    const newTrucks = [...editForm.trucks];
    newTrucks.splice(index, 1);
    setEditForm({
      ...editForm,
      trucks: newTrucks,
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
          {item.intervalMile || "--"}
        </td>

        {/* remindBeforeMile */}
        <td
          style={{ color: theme.currentPalette.primary }}
          className="p-4 text-right"
        >
          {item.remindBeforeMile || "--"}
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
          {item.intervalDays || "--"}
        </td>

        {/* remindBeforeDays */}
        <td
          style={{ color: theme.currentPalette.primary }}
          className="p-4 text-right"
        >
          {item.remindBeforeDays || "--"}
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
            title="Total Trucks"
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
            <InputLabel id="service-type-label">Service Type *</InputLabel>
            <Select
              labelId="service-type-label"
              value={serviceType}
              label="Service Type *"
              onChange={(e) => setServiceType(e.target.value)}
              disabled={isTrucksLoading || trucks.length === 0}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            >
              {serviceTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {togglePage === "Miles" ? (
            <>
              {/* Current Mileage for mile-based maintenance */}
              <TextField
                fullWidth
                label="Last Done Mileage *"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g., 300"
                type="text"
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

              {/* Interval Mile for mile-based maintenance */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Interval (Miles) *"
                  value={intervalMile}
                  onChange={(e) => setIntervalMile(e.target.value)}
                  placeholder="e.g., 5000"
                  type="text"
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
                  label="Remind Before (Miles) *"
                  value={remindBeforeMile}
                  onChange={(e) => setRemindBeforeMile(e.target.value)}
                  placeholder="e.g., 500"
                  type="text"
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
              {/* Current Mileage for time-based maintenance (optional for time-based) */}
              <TextField
                fullWidth
                label="Current Mileage (Optional)"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g., 65500"
                type="text"
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

              {/* Interval Days for time-based maintenance */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Interval (Days) *"
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(e.target.value)}
                  placeholder="e.g., 30"
                  type="text"
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
                  label="Remind Before (Days) *"
                  value={remindBeforeDays}
                  onChange={(e) => setRemindBeforeDays(e.target.value)}
                  placeholder="e.g., 7"
                  type="text"
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

          {/* Select Truck ID */}
          <FormControl fullWidth size="medium" required>
            <InputLabel id="truck-id-label">Select Truck(s) *</InputLabel>
            <Select
              labelId="truck-id-label"
              multiple
              value={selectedTrucks}
              label="Select Truck(s) *"
              onChange={(e) => setSelectedTrucks(e.target.value as string[])}
              disabled={isTrucksLoading || trucks.length === 0}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const truck = trucks.find((t: TTruck) => t.id === value);
                    return (
                      <Chip
                        key={value}
                        label={truck?.plateNumber || value}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.currentPalette.primary, 0.1),
                          color: theme.currentPalette.primary,
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {trucks.length === 0 ? (
                <MenuItem value="" disabled>
                  No trucks available
                </MenuItem>
              ) : (
                trucks.map((truck: TTruck) => (
                  <MenuItem key={truck.id} value={truck.id}>
                    <Checkbox checked={selectedTrucks.includes(truck.id)} />
                    {truck.plateNumber}
                  </MenuItem>
                ))
              )}
            </Select>
            {trucks.length === 0 && !isTrucksLoading && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                No trucks found. Please add trucks first.
              </Typography>
            )}
          </FormControl>

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
                selectedTrucks.length === 0
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
                : `Save Record (${selectedTrucks.length} truck${
                    selectedTrucks.length !== 1 ? "s" : ""
                  })`}
            </Button>
          </Box>
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
        loading={
          (isFiltered && filteredData) ||
          (isMaintenanceLoading && !maintenanceData)
        }
      />

      {/* Pagination */}
      {pagination && maintenance.length > 0 && (
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

      {/* Trucks Dialog with Cards */}
      <Dialog
        open={openTrucksDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${alpha(theme.currentPalette.text, 0.1)}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <TruckElectric size={24} color={theme.currentPalette.primary} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.currentPalette.primary,
              }}
            >
              Maintenance Trucks
            </Typography>
            {selectedMaintenance && (
              <Chip
                label={`${
                  selectedMaintenance.statusPerTruck?.length || 0
                } trucks`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.currentPalette.primary, 0.1),
                  color: theme.currentPalette.primary,
                  fontWeight: 500,
                }}
              />
            )}
          </Box>

          <IconButton
            onClick={handleCloseDialog}
            sx={{
              color: theme.currentPalette.text,
              "&:hover": {
                bgcolor: alpha(theme.currentPalette.primary, 0.1),
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, my: 5 }}>
          {selectedMaintenance && (
            <>
              {/* Trucks Cards */}
              <Box
                sx={{
                  p: 3,
                  pt: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {selectedMaintenance.statusPerTruck &&
                selectedMaintenance.statusPerTruck.length > 0 ? (
                  selectedMaintenance.statusPerTruck.map(
                    (truck: TStatusPerTruck) => {
                      const statusInfo = getStatusInfo(truck.status);
                      const isMileBased =
                        selectedMaintenance.repeatBy === "mile";

                      return (
                        <Card
                          key={truck.truckId}
                          sx={{
                            borderRadius: 2,
                            border: `1px solid ${alpha(
                              theme.currentPalette.primary,
                              0.3
                            )}`,
                            boxShadow: "none",
                            my: 1,
                          }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: alpha(
                                      theme.currentPalette.primary,
                                      0.1
                                    ),
                                    color: theme.currentPalette.primary,
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {truck.plateNumber.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 600,
                                      color: theme.currentPalette.text,
                                    }}
                                  >
                                    {truck.plateNumber}
                                  </Typography>
                                </Box>
                              </Box>

                              <Chip
                                label={statusInfo.text}
                                icon={statusInfo.icon}
                                size="medium"
                                sx={{
                                  bgcolor: statusInfo.bg,
                                  color: statusInfo.color,
                                  border: `1px solid ${alpha(
                                    theme.currentPalette.text,
                                    0.1
                                  )}`,
                                  fontWeight: 500,
                                  px: 1,
                                  "& .MuiChip-icon": {
                                    color: statusInfo.color,
                                  },
                                }}
                              />
                            </Box>

                            <Divider
                              sx={{
                                my: 2,
                                color: alpha(theme.currentPalette.primary, 0.3),
                              }}
                            />

                            <Box>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <StatsCard
                                  title="Total Mileage"
                                  value={
                                    truck.totalMileage?.toLocaleString() || "--"
                                  }
                                  icon={TrendingUp}
                                  iconColor={theme.currentPalette.primary}
                                />

                                <StatsCard
                                  title={
                                    isMileBased
                                      ? "Last Done Mile"
                                      : "Last Done Date"
                                  }
                                  value={
                                    isMileBased
                                      ? truck.lastDoneMile?.toLocaleString() ||
                                        "--"
                                      : truck.lastDoneAt
                                      ? new Date(
                                          truck.lastDoneAt
                                        ).toLocaleDateString()
                                      : "--"
                                  }
                                  icon={Gauge}
                                  iconColor={theme.currentPalette.primary}
                                />

                                <StatsCard
                                  title={
                                    isMileBased
                                      ? "Next Due Mile"
                                      : "Next Due Date"
                                  }
                                  value={
                                    isMileBased
                                      ? truck.nextDueMile?.toLocaleString() ||
                                        "--"
                                      : truck.nextDueDate
                                      ? new Date(
                                          truck.nextDueDate
                                        ).toLocaleDateString()
                                      : "--"
                                  }
                                  icon={Calendar}
                                  iconColor={theme.currentPalette.primary}
                                />
                              </div>
                            </Box>

                            {/* Additional Info */}
                            {truck.status === "overdue" && (
                              <Box
                                sx={{
                                  mt: 2,
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  bgcolor: alpha("#DC2626", 0.1),
                                  border: `1px solid ${alpha("#DC2626", 0.2)}`,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <AlertCircle size={18} color="#DC2626" />
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#DC2626", fontWeight: 500 }}
                                >
                                  This truck is overdue for maintenance
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      );
                    }
                  )
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      border: `1px dashed ${alpha(
                        theme.currentPalette.primary,
                        0.2
                      )}`,
                      borderRadius: 2,
                      bgcolor: alpha(theme.currentPalette.background, 0.5),
                    }}
                  >
                    <TruckElectric
                      size={48}
                      color={alpha(theme.currentPalette.text, 0.3)}
                    />
                    <Typography
                      sx={{
                        mt: 2,
                        color: alpha(theme.currentPalette.text, 0.6),
                        fontSize: "1.1rem",
                      }}
                    >
                      No trucks assigned to this maintenance
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Menu for Actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            mt: 1,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedMaintenance) handleViewTrucks(selectedMaintenance);
            setAnchorEl(null);
          }}
          sx={{ fontSize: "14px" }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <IoMdEye size={18} color={theme.currentPalette.primary} />
          </ListItemIcon>
          <ListItemText
            primary="View Trucks"
            slotProps={{
              primary: {
                sx: { color: theme.currentPalette.primary },
              },
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedMaintenance) handleEditClick(selectedMaintenance);
          }}
          sx={{ fontSize: "14px" }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Edit size={18} color={theme.currentPalette.primary} />
          </ListItemIcon>
          <ListItemText
            primary="Edit Details"
            slotProps={{
              primary: {
                sx: { color: theme.currentPalette.primary },
              },
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedMaintenance) handleDeleteClick(selectedMaintenance);
          }}
          sx={{ fontSize: "14px", color: "#dc2626" }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Trash2 size={18} color="#dc2626" />
          </ListItemIcon>
          <ListItemText
            primary="Delete"
            slotProps={{
              primary: {
                sx: { color: "#dc2626" },
              },
            }}
          />
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${alpha(theme.currentPalette.text, 0.1)}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Edit size={24} color={theme.currentPalette.primary} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.currentPalette.primary,
              }}
            >
              Edit Maintenance
            </Typography>
          </Box>

          <IconButton
            onClick={handleCloseEditDialog}
            sx={{
              color: theme.currentPalette.text,
              "&:hover": {
                bgcolor: alpha(theme.currentPalette.primary, 0.1),
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit}>
            {/* Service Type */}
            <FormControl fullWidth size="medium" sx={{ my: 3 }}>
              <InputLabel id="edit-service-type-label">Service Type</InputLabel>
              <Select
                labelId="edit-service-type-label"
                value={editForm.type}
                label="Service Type"
                onChange={(e) =>
                  setEditForm({ ...editForm, type: e.target.value })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              >
                {serviceTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedMaintenance?.repeatBy === "mile" ? (
              <>
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Interval (Miles)"
                    value={editForm.intervalMile}
                    onChange={(e) =>
                      setEditForm({ ...editForm, intervalMile: e.target.value })
                    }
                    type="text"
                  />
                  <TextField
                    fullWidth
                    label="Remind Before (Miles)"
                    value={editForm.remindBeforeMile}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        remindBeforeMile: e.target.value,
                      })
                    }
                    type="text"
                  />
                </Stack>
              </>
            ) : (
              <>
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Interval (Days)"
                    value={editForm.intervalDays}
                    onChange={(e) =>
                      setEditForm({ ...editForm, intervalDays: e.target.value })
                    }
                    type="text"
                  />
                  <TextField
                    fullWidth
                    label="Remind Before (Days)"
                    value={editForm.remindBeforeDays}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        remindBeforeDays: e.target.value,
                      })
                    }
                    type="text"
                  />
                </Stack>
              </>
            )}

            {/* Trucks Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Trucks
              </Typography>

              {editForm.trucks.map((truck, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: `1px solid ${alpha(
                      theme.currentPalette.text,
                      0.1
                    )}`,
                    borderRadius: 2,
                    bgcolor: alpha(theme.currentPalette.background, 0.5),
                  }}
                >
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Truck</InputLabel>
                      <Select
                        value={truck.truckId}
                        label="Truck"
                        onChange={(e) =>
                          handleTruckChange(index, e.target.value)
                        }
                      >
                        {getAvailableTrucks(index).map(
                          (availableTruck: TTruck) => (
                            <MenuItem
                              key={availableTruck.id}
                              value={availableTruck.id}
                            >
                              {availableTruck.plateNumber}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>

                    <IconButton
                      onClick={() => handleRemoveTruck(index)}
                      sx={{ color: "#dc2626" }}
                      disabled={editForm.trucks.length === 1}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Stack>

                  {selectedMaintenance?.repeatBy === "mile" ? (
                    <TextField
                      fullWidth
                      label="Last Done Mile"
                      value={truck.lastDoneMile}
                      onChange={(e) =>
                        handleTruckFieldChange(
                          index,
                          "lastDoneMile",
                          e.target.value
                        )
                      }
                      type="number"
                      placeholder="e.g., 300"
                    />
                  ) : (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Last Done Date"
                        value={
                          truck.lastDoneAt ? dayjs(truck.lastDoneAt) : null
                        }
                        onChange={(newValue) =>
                          handleTruckFieldChange(
                            index,
                            "lastDoneAt",
                            newValue ? newValue.format("YYYY-MM-DD") : ""
                          )
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                </Box>
              ))}

              <Button
                onClick={handleAddTruck}
                variant="outlined"
                fullWidth
                sx={{
                  borderStyle: "dashed",
                  borderColor: alpha(theme.currentPalette.primary, 0.3),
                  color: theme.currentPalette.primary,
                  "&:hover": {
                    borderColor: theme.currentPalette.primary,
                    bgcolor: alpha(theme.currentPalette.primary, 0.1),
                  },
                }}
              >
                + Add Truck
              </Button>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            fullWidth
            disabled={isUpdating}
            sx={{
              bgcolor: theme.currentPalette.primary,
              color: theme.currentPalette.background,
              "&:hover": {
                bgcolor: darken(theme.currentPalette.primary, 0.2),
              },
              textTransform: "capitalize",
            }}
          >
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${alpha(theme.currentPalette.text, 0.1)}`,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            py: 2,
            px: 3,
          }}
        >
          <Trash2 size={24} color="#dc2626" />
          <Typography sx={{ fontWeight: 600, color: "#dc2626" }}>
            Delete Maintenance
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ mt: 5 }}>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to delete this maintenance record?
          </Typography>
          {selectedMaintenance && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha("#dc2626", 0.05),
                border: `1px solid ${alpha("#dc2626", 0.1)}`,
              }}
            >
              <Typography sx={{ fontWeight: 500 }}>
                Type: {selectedMaintenance.type}
              </Typography>
              <Typography>Repeat By: {selectedMaintenance.repeatBy}</Typography>
              <Typography>
                Trucks: {selectedMaintenance.statusPerTruck?.length || 0}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            fullWidth
            sx={{
              border: `1px solid #dc2626`,
              color: "#dc2626",
              textTransform: "capitalize",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            fullWidth
            disabled={isDeleting}
            sx={{
              bgcolor: "#dc2626",
              color: "#fff",
              "&:hover": {
                bgcolor: "#b91c1c",
              },
              textTransform: "capitalize",
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TruckMaintenance;
