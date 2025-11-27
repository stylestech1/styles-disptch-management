"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RootState, useAppSelector } from "@/redux/store";
import { TDriver } from "@/types/globalTypes";
import Loading from "@/components/ui/Loading";
import toast, { Toaster } from "react-hot-toast";
import Erros from "@/components/ui/Erros";
import { IoAdd, IoPencil, IoTrash, IoPerson } from "react-icons/io5";
import { FaUserCheck, FaUserLargeSlash } from "react-icons/fa6";
import {
  Dialog,
  Button,
  TableRow,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  alpha,
  SxProps,
} from "@mui/material";
import { getErrorMessage } from "@/utils/getErrorMessage";
import Pagination from "@/components/ui/Pagination";
import {
  useCreateDriverMutation,
  useDeleteDriverMutation,
  useGetDriversWithPaginationQuery,
  useGetDriverWithFilterQuery,
  useLazyGetDriverByDriverIdQuery,
  useUpdateDriverMutation,
} from "@/redux/slices/apiSlice";
import { DriverForm } from "@/components/drivers/DriverForm";
import useError from "@/hook/useError";
import StatsCard from "@/components/ui/StatsCard";
import { FaUserMinus } from "react-icons/fa";
import { Dayjs } from "dayjs";
import DataTable from "@/components/ui/DataTable";
import { driverColumns } from "@/data/driverTables";
import { StatusChip } from "@/components/ui/TablesMUI";
import { useSearchSubmit } from "@/hook/useSearchSubmit";
import { setLoading } from "@/redux/slices/uiSlice";
import SearchInput from "@/components/ui/SearchInput";
import { IoMdEye } from "react-icons/io";

const DriversPage = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { error, setError } = useError();
  const theme = useAppSelector((state: RootState) => state.palette);

  // ✅ Search And Filter
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteToast, setDeleteToast] = useState({ open: false, message: "" });

  // 🔹 API Queries
  const {
    data: driversData,
    isLoading: driversLoading,
    error: driverError,
    refetch: refetchDrivers,
  } = useGetDriversWithPaginationQuery(
    { page, limit: 10 },
    {
      refetchOnFocus: false,
      refetchOnReconnect: false,
      refetchOnMountOrArgChange: false,
    }
  );

  const { data: filteredData } = useGetDriverWithFilterQuery(
    {
      from: fromDate ? fromDate.format("YYYY-MM-DD") : undefined,
      to: toDate ? toDate.format("YYYY-MM-DD") : undefined,
      page,
      limit: 10,
    },
    { skip: !isFiltered }
  );
  const [
    triggerSearchQuery,
    {
      data: driverByIdData,
      isLoading: driverByIdLoading,
      error: driverByIdError,
      reset: resetSearchQuery,
    },
  ] = useLazyGetDriverByDriverIdQuery();

  // Search Hook
  const searchHook = useSearchSubmit({
    onSearch: (term) => {
      setPage(1);
      if (term.trim()) {
        triggerSearchQuery(encodeURIComponent(term));
      }
    },
    onReset: () => {
      setPage(1);
      resetSearchQuery();
      refetchDrivers();
    },
  });

  const { searchTerm, isSearching } = searchHook;

  // 🔹 API Mutations
  const [createDriver, { isLoading: isCreating }] = useCreateDriverMutation();
  const [updateDriver, { isLoading: isUpdating }] = useUpdateDriverMutation();
  const [deleteDriver] = useDeleteDriverMutation();
  const [originalData, setOriginalData] = useState<Partial<TDriver>>({});

  const driver = useMemo(() => {
    if (isSearching && Array.isArray(driverByIdData?.data)) {
      return driverByIdData.data.flat();
    }
    if (isFiltered && filteredData?.data) {
      return filteredData.data;
    }
    return driversData?.data || [];
  }, [isSearching, isFiltered, driverByIdData, filteredData, driversData]);

  const pagination = isFiltered
    ? filteredData?.paginationResult || null
    : driversData?.paginationResult || null;

  // Loading state
  useEffect(() => {
    setLoading(driversLoading && !driversData);
  }, [driversLoading, driversData]);

  // Stats cards
  const statsData = useMemo(() => {
    const statsDriverData = driversData?.stats || [];
    if (!statsDriverData || statsDriverData.length === 0)
      return { totalDrivers: 0, available: 0, busy: 0, inactive: 0 };
    return {
      totalDrivers: statsDriverData.total,
      available: statsDriverData.available,
      busy: statsDriverData.busy,
      inactive: statsDriverData.inactive,
    };
  }, [driversData?.stats]);

  // ✅ Modal States
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TDriver>>({});
  const [editMode, setEditMode] = useState(false);

  // ✅ Handle Open (Add / Edit)
  const handleOpenAdd = () => {
    setFormData({});
    setEditMode(false);
    setOpen(true);
  };

  // ✅ Handle Edit
  const handleEditClick = (driver: TDriver) => {
    setOriginalData(driver);
    setFormData({
      id: driver.id,
      driverId: driver.driverId,
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      status: driver.status,
      hireDate: driver.hireDate,
      pricePerMile: driver.pricePerMile,
      createdBy: driver.createdBy,
    });
    setEditMode(true);
    setOpen(true);
  };

  // ✅ Handle Form Change
  const handleFormChange = <K extends keyof TDriver>(
    field: K,
    value: TDriver[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getChangedFields = (
    original: Partial<TDriver>,
    updated: Partial<TDriver>
  ): Partial<TDriver> => {
    const changedFields: Record<string, unknown> = {};

    Object.entries(updated).forEach(([key, value]) => {
      const k = key as keyof TDriver;
      if (value !== original[k] && value !== undefined) {
        changedFields[key] = value;
      }
    });

    return changedFields as Partial<TDriver>;
  };

  // handling Errors
  useEffect(() => {
    const currentError = driverError || driverByIdError;
    if (currentError) {
      const errorMessage = getErrorMessage(currentError);
      setError(errorMessage);
      toast.error(errorMessage || "Failed to load data ❌", {
        style: {
          background: "#dc2626",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "14px",
        },
        duration: 4000,
      });
    }
  }, [driverError, driverByIdError, setError]);

  // ✅ Navigate to Driver Summary
  const handleViewStats = (id: string) => {
    router.push(`/admin/driverSummary/${id}`);
  };

  // ✅ Create Driver
  const handleCreate = async () => {
    if (!user?.id) {
      toast.error("User not found!");
      return;
    }

    try {
      await createDriver({
        ...formData,
        createdBy: user.id,
      }).unwrap();
      toast.success("✅ Driver created successfully!");
      setOpen(false);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Creating driver failed ❌");
      throw err;
    }
  };

  // ✅ Update Driver
  const handleUpdate = async () => {
    if (!formData?.id) {
      toast.error("Missing driver ID");
      return;
    }

    const changedFields = getChangedFields(originalData, formData);

    if (Object.keys(changedFields).length === 0) {
      toast("⚠️ No changes detected.");
      return;
    }

    try {
      await updateDriver({
        id: formData.id,
        body: changedFields,
      }).unwrap();
      toast.success("✅ Driver updated successfully!");
      setOpen(false);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Updating driver failed ❌");
      throw err;
    }
  };

  // ✅ Delete Driver with MUI Toast
  const [driverToDelete, setDriverToDelete] = useState<{
    id: string;
    driverId?: number;
  } | null>(null);

  // ✅ Delete Driver handler
  const handleDelete = async (id: string, driverId?: number) => {
    setDeleteToast({
      open: true,
      message: `Are you sure you want to delete driver #${driverId}?`,
    });
    setDriverToDelete({ id, driverId });
  };

  // ✅ Confirm Delete
  const confirmDelete = async () => {
    if (!driverToDelete) return;

    try {
      await deleteDriver(driverToDelete.id).unwrap();
      toast.success(
        `✅ Driver #${driverToDelete.driverId} deleted successfully!`
      );
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Deleting driver failed ❌");
      throw err;
    } finally {
      setDeleteToast({ open: false, message: "" });
      setDriverToDelete(null);
    }
  };

  // ✅ Cancel Delete
  const cancelDelete = () => {
    setDeleteToast({ open: false, message: "" });
    setDriverToDelete(null);
  };

  // ✅ Render Table Row - Similar to LoadsPage
  const renderDriverRow = (driver: TDriver) => {
    // Styles
    const tableRowSx: SxProps = {
      bgcolor: theme.currentPalette.background,
      "&:hover": {
        bgcolor: alpha(theme.currentPalette.primary, 0.1),
        cursor: "pointer",
      },
      transition: "all 0.2s ease-in-out",
    };

    return (
      <TableRow
        sx={tableRowSx}
        key={driver.id || driver.driverId}
        className="transition-colors group"
      >
        {/* Driver ID */}
        <td className="p-4 text-center">
          <span className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium">
            {driver.driverId}
          </span>
        </td>

        {/* Name */}
        <td className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
              <IoPerson size={12} className="text-slate-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900 text-sm">
                {driver.name || "-"}
              </div>
              <div className="text-xs text-slate-500">
                {driver.email || "-"}
              </div>
            </div>
          </div>
        </td>

        {/* Phone */}
        <td className="p-4 text-center text-slate-700 font-medium">
          {driver.phone || "-"}
        </td>

        {/* License Number */}
        <td className="p-4 text-center text-slate-700">
          {driver.licenseNumber || "-"}
        </td>

        {/* Price Per Mile */}
        <td className="p-4 text-center font-semibold text-emerald-700">
          {driver.pricePerMile ? `${driver.pricePerMile} $` : "-"}
        </td>

        {/* Hire Date */}
        <td className="p-4 text-center">
          <Chip
            label={driver.hireDate.split("T")[0]}
            variant="outlined"
            size="small"
          />
        </td>

        {/* Status */}
        <td className="p-4 text-center">
          <StatusChip status={driver.status} />
        </td>

        {/* Actions */}
        <td className="p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Tooltip title="View Statistics">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewStats(driver.id);
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: alpha(theme.currentPalette.primary, 0.1),
                  },
                }}
              >
                <IoMdEye size={16} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit Driver">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(driver);
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: alpha(theme.currentPalette.primary, 0.1),
                  },
                }}
              >
                <IoPencil size={16} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Driver">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(driver.id, driver.driverId);
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: alpha("#dc2626", 0.1),
                  },
                }}
              >
                <IoTrash size={16} />
              </IconButton>
            </Tooltip>
          </div>
        </td>
      </TableRow>
    );
  };

  // Loading state
  const isInitialLoading = driverByIdLoading && !driversData;
  if (isInitialLoading) return <Loading />;

  // Container styles
  const containerSx: SxProps = {
    minHeight: "100vh",
    p: 3,
  };
  const searchFilterContainerSx: SxProps = {
    display: "flex",
    flexDirection: { xs: "column", lg: 'row' },
    alignItems: "flex-start",
    justifyContent: 'space-between',
    p: 2,
    my: 2,
    border: `1px solid ${alpha(theme.currentPalette.primary, 0.3)}`,
    borderRadius: 2,
    backgroundColor: theme.currentPalette.background,
  };
  const newLoadButtonSx: SxProps = {
    py: 1.5,
    px: 4,
    fontWeight: "bold",
    fontSize: "1rem",
    borderRadius: 2,
    textTransform: "none",
    width: { xs: "100%", lg: "auto" },
    background: `linear-gradient(135deg, ${theme.currentPalette.primary}, ${theme.currentPalette.secondary})`,
    color: "#fff",
    "&:hover": {
      background: `linear-gradient(135deg, ${theme.currentPalette.secondary}, ${theme.currentPalette.primary})`,
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
    transition: "all 0.3s ease",
  };
  return (
    <Box sx={containerSx}>
      <Toaster position="top-center" />

      {/* Stats Summary */}
      <Box sx={{ mt: 4, mb: 5 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-10">
          <StatsCard
            title="Total Drivers"
            value={statsData.totalDrivers}
            icon={IoPerson}
            iconColor={theme.currentPalette.primary}
          />

          <StatsCard
            title="Available"
            value={statsData.available}
            icon={FaUserCheck}
            iconColor={theme.currentPalette.primary}
          />

          <StatsCard
            title="Busy"
            value={statsData.busy}
            icon={FaUserMinus}
            iconColor={theme.currentPalette.primary}
          />

          <StatsCard
            title="Inactive"
            value={statsData.inactive}
            icon={FaUserLargeSlash}
            iconColor={theme.currentPalette.primary}
          />
        </div>
      </Box>

      {/* Add Button */}
      <Box display="flex" justifyContent="end" sx={{ mt: 3 }}>
        <Button
          onClick={handleOpenAdd}
          variant="contained"
          startIcon={<IoAdd size={22} />}
          sx={newLoadButtonSx}
        >
          Add Driver
        </Button>
      </Box>

      {/* Search & Filter */}
      <Box sx={searchFilterContainerSx}>
        <Box>
          <Typography
            variant="h6"
            sx={{ color: theme.currentPalette.primary, fontWeight: 500 }}
          >
            Driver Details
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.currentPalette.primary, fontWeight: 400 }}
          >
            Ckeck list of all drivers
          </Typography>
        </Box>

        {/* Search */}
        <SearchInput
          searchHook={searchHook}
          placeholder="Search drivers by ID...."
          showClearButton
          sx={{width: 350}}
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

      {error && (
        <Box sx={{ mb: 3 }}>
          <Erros message={error} />
        </Box>
      )}

      {/* Table For Drivers - Using DataTable Component */}
      <DataTable
        columns={driverColumns}
        data={driver}
        renderRow={renderDriverRow}
        loading={
          (isSearching && driverByIdLoading) ||
          (isFiltered && filteredData) ||
          (driversLoading && !driversData)
        }
      />

      {/* Pagination */}
      {!isFiltered && !isSearching && pagination && driver.length > 0 && (
        <Pagination
          pagination={pagination}
          page={page}
          setPage={setPage}
          pageSize={10}
          showInfo={false}
        />
      )}

      {/* Driver Form Modal */}
      <DriverForm
        open={open}
        onClose={() => setOpen(false)}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={editMode ? handleUpdate : handleCreate}
        editMode={editMode}
        isLoading={isCreating || isUpdating}
      />

      {/* MUI Delete Confirmation Toast */}
      {deleteToast.open && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(2px)",
            zIndex: 1299,
          }}
        />
      )}

      {/* Delete Confirmation Dialog - Centered */}
      <Dialog
        open={deleteToast.open}
        onClose={cancelDelete}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            minWidth: 300,
            maxWidth: 400,
            margin: 2,
          },
        }}
        sx={{
          zIndex: 1300,
          "& .MuiDialog-container": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Confirm Delete
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            {deleteToast.message}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={cancelDelete}
              sx={{
                borderRadius: 1,
                minWidth: 80,
                borderColor: "grey.400",
                "&:hover": {
                  borderColor: "grey.600",
                  backgroundColor: "grey.50",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDelete}
              sx={{
                borderRadius: 1,
                minWidth: 80,
                backgroundColor: "error.main",
                "&:hover": {
                  backgroundColor: "error.dark",
                },
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default DriversPage;
