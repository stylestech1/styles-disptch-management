"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RootState, useAppSelector } from "@/redux/store";
import { TDriver } from "@/types/globalTypes";
import Titles from "@/components/ui/Titles";
import Loading from "@/components/ui/Loading";
import toast, { Toaster } from "react-hot-toast";
import Erros from "@/components/ui/Erros";
import {
  IoAdd,
  IoPencil,
  IoTrash,
  IoSearch,
  IoStatsChart,
  IoPerson,
} from "react-icons/io5";
import { FaUserCheck, FaUserLargeSlash } from "react-icons/fa6";
import {
  Dialog,
  Button,
  TableRow,
  Paper,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  TextField,
  InputAdornment,
  alpha,
} from "@mui/material";

import { muiTheme } from "@/theme/theme";
import { getErrorMessage } from "@/utils/getErrorMessage";
import Pagination from "@/components/ui/Pagination";
import {
  useCreateDriverMutation,
  useDeleteDriverMutation,
  useGetDriversWithPaginationQuery,
  useGetDriverWithFilterQuery,
  useUpdateDriverMutation,
} from "@/redux/slices/apiSlice";
import { DriverForm } from "@/components/drivers/DriverForm";
import useError from "@/hook/useError";
import StatsCard from "@/components/ui/StatsCard";
import { FaUserMinus } from "react-icons/fa";
import { Dayjs } from "dayjs";
import { useSearch } from "@/hook/useSearch";
import DataTable from "@/components/ui/DataTable";
import { driverColumns } from "@/data/driverTables";
import { StatusChip } from "@/components/ui/TablesMUI";

const DriversPage = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { error, setError } = useError();
  const theme = useAppSelector((state: RootState) => state.palette);

  // ✅ Search And Filter
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [deleteToast, setDeleteToast] = useState({ open: false, message: "" });

  // 🔹 API Queries
  const {
    data: driversData,
    isLoading: driversLoading,
    error: driverError,
    refetch,
  } = useGetDriversWithPaginationQuery();
  const { data: filteredData } = useGetDriverWithFilterQuery(
    {
      from: fromDate ? fromDate.format("YYYY-MM-DD") : undefined,
      to: toDate ? toDate.format("YYYY-MM-DD") : undefined,
    },
    { skip: !isFiltered }
  );

  // 🔹 API Mutations
  const [createDriver, { isLoading: isCreating }] = useCreateDriverMutation();
  const [updateDriver, { isLoading: isUpdating }] = useUpdateDriverMutation();
  const [deleteDriver] = useDeleteDriverMutation();
  const [originalData, setOriginalData] = useState<Partial<TDriver>>({});

  const displayDrivers = isFiltered
    ? filteredData?.driversData?.data || []
    : driversData?.data || [];
  const pagination = driversData?.paginationResult || null;

  const isLoading = driversLoading;

  // Filter and Search loads
  const { filteredData: searchedDrivers } = useSearch({
    data: displayDrivers,
    searchFields: ["driverId", "name", "phone", "email", "licenseNumber"],
    initialSearch: searchInput,
  });
  const tableData = searchInput ? searchedDrivers : displayDrivers;

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
    if (driverError) {
      const errorMessage = getErrorMessage(driverError);
      if (error !== errorMessage) {
        setError(errorMessage);
        toast.error(errorMessage || "Loading failed ❌", {
          id: "driverError",
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  }, [driverError, setError, error]);

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
      refetch();
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
      refetch();
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
      refetch();
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
  const renderDriverRow = (driver: TDriver, index: number) => {
    return (
      <TableRow
        sx={{
          "&:hover": {
            backgroundColor: alpha(theme.currentPalette.primary, 0.05),
          },
        }}
        key={index}
        className="transition-colors group"
      >
        {/* Driver ID */}
        <td className="p-4 text-center">
          <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium">
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
                  '&:hover': { 
                    backgroundColor: alpha(theme.currentPalette.primary, 0.1) 
                  } 
                }}
              >
                <IoStatsChart size={16} />
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
                  '&:hover': { 
                    backgroundColor: alpha(theme.currentPalette.primary, 0.1) 
                  } 
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
                  '&:hover': { 
                    backgroundColor: alpha('#dc2626', 0.1) 
                  } 
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

  if (isLoading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />

      {/* Title */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          [muiTheme.breakpoints.down("md")]: {
            flexDirection: "column",
            gap: 2,
            alignItems: "stretch",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Titles>Driver Management</Titles>
          <p className="text-slate-600 text-md">
            Manage your driver team members and their access
          </p>
        </Box>
      </Box>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-10">
        <StatsCard
          title="Total Drivers"
          value={tableData.length || 0}
          icon={IoPerson}
          iconColor={theme.currentPalette.primary}
          loading={isLoading}
        />

        <StatsCard
          title="Available"
          value={
            tableData.filter((d: TDriver) => d.status === "available").length
          }
          icon={FaUserCheck}
          iconColor={theme.currentPalette.primary}
          loading={isLoading}
        />

        <StatsCard
          title="Busy"
          value={tableData.filter((d: TDriver) => d.status === "busy").length}
          icon={FaUserMinus}
          iconColor={theme.currentPalette.primary}
          loading={isLoading}
        />

        <StatsCard
          title="Inactive"
          value={
            tableData.filter((d: TDriver) => d.status === "inactive").length
          }
          icon={FaUserLargeSlash}
          iconColor={theme.currentPalette.primary}
          loading={isLoading}
        />
      </div>

      {/* Add Button */}
      <Box display="flex" justifyContent="end" sx={{ mt: 2 }}>
        <Button
          onClick={handleOpenAdd}
          disabled={isLoading}
          variant="contained"
          startIcon={<IoAdd size={22} />}
          sx={{
            py: 1.5,
            px: 4,
            fontWeight: "bold",
            fontSize: "1rem",
            borderRadius: 2,
            textTransform: "none",
            width: { xs: "100%", lg: "auto" },
            background: `linear-gradient(to right, ${theme.currentPalette.primary}, ${theme.currentPalette.secondary})`,
            color: "#fff",
            "&:hover": {
              background: `linear-gradient(to right, ${theme.currentPalette.secondary}, ${theme.currentPalette.primary})`,
            },
            transition: "all 0.3s ease",
          }}
        >
          Add Driver
        </Button>
      </Box>

      {/* Search & Filter */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          alignItems: "end",
          gap: 2,
          p: 2,
          my: 5,
          border: `1px solid ${theme.currentPalette.primary}33`,
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          backgroundColor: theme.currentPalette.background,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search drivers by ID, name, phone, email, or license number"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IoSearch size={20} color="#9ca3af" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              backgroundColor: "#fff",
              "& fieldset": { borderColor: "#e5e7eb" },
              "&:hover fieldset": { borderColor: theme.currentPalette.primary },
              "&.Mui-focused fieldset": { borderColor: theme.currentPalette.primary },
            },
            "& input": {
              color: theme.currentPalette.text,
            },
          }}
        />
      </Box>

      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Table For Drivers - Using DataTable Component */}
      <DataTable
        columns={driverColumns}
        data={tableData}
        renderRow={renderDriverRow}
        loading={isLoading}
      />

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        page={page}
        setPage={setPage}
        pageSize={10}
        showInfo={true}
      />

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