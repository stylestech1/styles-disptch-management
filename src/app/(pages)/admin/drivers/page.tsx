"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Tooltip,
  Chip,
  styled,
  Typography,
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

// ✅ Styled Table Components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${theme.components?.MuiTableCell?.styleOverrides?.root}`]: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '&[class*="MuiTableCell-head"]': {
    backgroundColor: "#f8fafc",
    color: "#56677a",
    fontSize: 14,
  },
  '&[class*="MuiTableCell-body"]': {
    fontSize: 14,
  },
}));
const StyledTableRow = styled(TableRow)(() => ({
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "&:hover": {
    backgroundColor: "#fcf9fa",
  },
}));
const StatusChip = ({ status }: { status: string }) => {
  const getColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "success";
      case "busy":
        return "error";
      default:
        return "default";
    }
  };

  return <Chip label={status} color={getColor(status)} size="small" />;
};

const DriversPage = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { error, setError } = useError();
  // ✅ Search And Filter
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [deleteToast, setDeleteToast] = useState({ open: false, message: "" });

  // 🔹 API Queries
  const {
    data: driversData,
    isLoading: driversLoading,
    error: driverError,
    refetch,
  } = useGetDriversWithPaginationQuery(page + 1);
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
    searchFields: ["driverId", "name", "phone", "email", 'licenseNumber'],
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
          title="Total Dispatchers"
          value={tableData.length || 0}
          icon={IoPerson}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          loading={isLoading}
        />

        <StatsCard
          title="Available"
          value={
            tableData.filter((d: TDriver) => d.status === "available")
              .length
          }
          icon={FaUserCheck}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          loading={isLoading}
        />

        <StatsCard
          title="Busy"
          value={
            tableData.filter((d: TDriver) => d.status === "busy").length
          }
          icon={FaUserMinus}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          loading={isLoading}
        />

        <StatsCard
          title="Inactive"
          value={
            tableData.filter((d: TDriver) => d.status === "inactive")
              .length
          }
          icon={FaUserLargeSlash}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          loading={isLoading}
        />
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleOpenAdd}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 py-3 px-8 cursor-pointer text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-colors duration-200 rounded-lg font-bold text-lg whitespace-nowrap w-full lg:w-auto"
        >
          <IoAdd size={25} />
          {isLoading ? "Loading..." : "Add Driver"}
        </button>
      </div>

      {/* Search */}
      <div className="w-full flex items-end gap-2 p-4 border border-gray-200 rounded-lg shadow-sm my-10">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearch className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Name, Phone, Email, License Number or Driver ID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <Loading />
      ) : tableData.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{ mt: 3, boxShadow: 1, borderRadius: 3 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Driver ID</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Email</StyledTableCell>
                <StyledTableCell>Phone</StyledTableCell>
                <StyledTableCell>License Number</StyledTableCell>
                <StyledTableCell>Price/Mile</StyledTableCell>
                <StyledTableCell>Hire Date</StyledTableCell>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="center">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((driver: TDriver) => (
                <StyledTableRow key={driver.id}>
                  <StyledTableCell>{driver.driverId}</StyledTableCell>

                  <StyledTableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IoPerson />
                      {driver.name}
                    </Box>
                  </StyledTableCell>

                  <StyledTableCell>{driver.email}</StyledTableCell>

                  <StyledTableCell>{driver.phone}</StyledTableCell>

                  <StyledTableCell>{driver.licenseNumber}</StyledTableCell>

                  <StyledTableCell>{driver.pricePerMile}</StyledTableCell>

                  <StyledTableCell>
                    <Chip
                      label={driver.hireDate.split("T")[0]}
                      variant="outlined"
                      size="small"
                    />
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    <StatusChip status={driver.status} />
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    <Box
                      sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                    >
                      <Tooltip title="View Statistics">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewStats(driver.id)}
                        >
                          <IoStatsChart />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit Driver">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(driver)}
                        >
                          <IoPencil />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Driver">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleDelete(driver.id, driver.driverId)
                          }
                        >
                          <IoTrash />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "grey.300",
            borderRadius: 2,
            mt: 3,
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Drivers Found
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {pagination && tableData.length > 0 && (
        <Pagination
          pagination={pagination}
          page={page}
          setPage={setPage}
          pageSize={10}
          showInfo={true}
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
