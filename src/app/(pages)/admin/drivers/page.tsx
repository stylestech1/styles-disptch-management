"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { TDriver } from "@/types/globalTypes";
import Titles from "@/components/ui/Titles";
import Loading from "@/components/ui/Loading";
import toast, { Toaster } from "react-hot-toast";
import {
  IoAdd,
  IoPencil,
  IoTrash,
  IoSearch,
  IoStatsChart,
  IoClose,
} from "react-icons/io5";
import {
  Dialog,
  TextField,
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
  InputAdornment,
  styled,
  Typography,
  CircularProgress,
} from "@mui/material";
import { muiTheme } from "@/theme/theme";
import { getErrorMessage } from "@/utils/getErrorMessage";
import Pagination from "@/components/ui/Pagination";
import { useCreateDriverMutation, useDeleteDriverMutation, useGetAllDriversQuery, useGetDriversWithPaginationQuery, useUpdateDriverMutation } from "@/redux/slices/apiSlice";
import { DriverForm } from "@/components/drivers/DriverForm";
import { useSearch } from "@/hook/useSearch"; 

// ✅ Styled Table Components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${theme.components?.MuiTableCell?.styleOverrides?.root}`]: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '&[class*="MuiTableCell-head"]': {
    backgroundColor: muiTheme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  '&[class*="MuiTableCell-body"]': {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteToast, setDeleteToast] = useState({ open: false, message: "" });

  // 🔹 API Queries 
  const {
    data: driversData,
    isLoading: driversLoading,
    refetch,
  } = useGetDriversWithPaginationQuery(page + 1);

  const { data: allDriversData } = useGetAllDriversQuery();

 const { search, setSearch, searchResults, isSearchLoading, clearSearch } = useSearch("drivers");


  // 🔹 API Mutations
  const [createDriver, { isLoading: isCreating }] = useCreateDriverMutation();
  const [updateDriver, { isLoading: isUpdating }] = useUpdateDriverMutation();
  const [deleteDriver, { isLoading: isDeleting }] = useDeleteDriverMutation();
  const [originalData, setOriginalData] = useState<Partial<TDriver>>({});

  const displayDrivers = search ? searchResults : driversData?.data || [];
  
  const pagination = !search ? driversData?.paginationResult : null;

  const isLoading = driversLoading;

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

  // ✅ Function to display API errors in toast
  const showApiErrors = (error: unknown) => {
    const err = error as {
      data?: { errors?: { path: string; msg: string }[]; message?: string };
    };
    if (err?.data?.errors && Array.isArray(err.data.errors)) {
      err.data.errors.forEach((e) => toast.error(`${e.path}: ${e.msg}`));
    } else if (err?.data?.message) {
      toast.error(err.data.message);
    } else {
      toast.error("An unexpected error occurred");
    }
  };

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
      showApiErrors(err);
      toast.error(errorMessage || "Adding note failed ❌");
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
      showApiErrors(err);
      toast.error(errorMessage || "Driver update failed ❌");
    }
  };

  // ✅ Delete Driver with MUI Toast
  const [driverToDelete, setDriverToDelete] = useState<{
    id: string;
    driverId?: number;
  } | null>(null);

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
      showApiErrors(err);
      toast.error(errorMessage || "Adding note failed ❌");
    } finally {
      setDeleteToast({ open: false, message: "" });
      setDriverToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteToast({ open: false, message: "" });
    setDriverToDelete(null);
  };

  if (isLoading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />

      {/* Header */}
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
        <Titles>Driver Management</Titles>
        <Button
          variant="contained"
          color="primary"
          startIcon={<IoAdd />}
          onClick={handleOpenAdd}
          sx={{
            borderRadius: 2,
            background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
          }}
        >
          Add Driver
        </Button>
      </Box>

      {/* Search Field */}
      <TextField
        placeholder="Search by driver ID, name, email, phone, license..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IoSearch />
            </InputAdornment>
          ),
          endAdornment: search && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={clearSearch}
              >
                <IoClose />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,
          width: '100%',
          borderRadius: 2,
          backgroundColor: "white",
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: "white",
            "& fieldset": {
              borderColor: muiTheme.palette.primary.light,
            },
            "&:hover fieldset": {
              borderColor: muiTheme.palette.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: muiTheme.palette.primary.main,
            },
          },
        }}
      />

      {/* Search Results Info */}
      {search && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
  label={`${searchResults.length} drivers found for "${search}"`} 
            color="primary" 
            variant="outlined" 
          />
          <Button 
            size="small" 
            onClick={clearSearch}
            startIcon={<IoClose/>}
            sx={{ minWidth: 'auto' }}
          >
            Show All Drivers
          </Button>
        </Box>
      )}

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          overflowX: "auto",
          maxWidth: "100%",
          "&::-webkit-scrollbar": {
            height: 8,
          },
          "&::-webkit-scrollbar-track": {
            background: muiTheme.palette.grey[100],
          },
          "&::-webkit-scrollbar-thumb": {
            background: muiTheme.palette.grey[400],
            borderRadius: 4,
          },
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="drivers table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Driver ID</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Phone</StyledTableCell>
              <StyledTableCell>License Number</StyledTableCell>
              <StyledTableCell>Price/Mile</StyledTableCell>
              <StyledTableCell>Hire Date</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayDrivers.length === 0 ? (
              <TableRow>
                <StyledTableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  {search ? 'No drivers found' : 'No drivers available'}
                </StyledTableCell>
              </TableRow>
            ) : (
              displayDrivers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((driver: TDriver) => (
                  <StyledTableRow key={driver.id}>
                    <StyledTableCell component="th" scope="row">
                      {driver.driverId}
                    </StyledTableCell>
                    <StyledTableCell>{driver.name}</StyledTableCell>
                    <StyledTableCell>{driver.email}</StyledTableCell>
                    <StyledTableCell>{driver.phone}</StyledTableCell>
                    <StyledTableCell>{driver.licenseNumber}</StyledTableCell>
                    <StyledTableCell>
                      ${driver.pricePerMile?.toFixed(2)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {driver.hireDate
                        ? new Date(driver.hireDate).toLocaleDateString()
                        : "N/A"}
                    </StyledTableCell>
                    <StyledTableCell>
                      <StatusChip status={driver.status} />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        {/* Statistics Button */}
                        <Tooltip title="View Statistics">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleViewStats(driver.id)}
                            sx={{
                              color: muiTheme.palette.info.main,
                              "&:hover": {
                                backgroundColor: muiTheme.palette.info.light,
                                color: "white",
                              },
                            }}
                          >
                            <IoStatsChart />
                          </IconButton>
                        </Tooltip>

                        {/* Edit Button */}
                        <Tooltip title="Edit Driver">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(driver)}
                            disabled={isUpdating}
                          >
                            <IoPencil />
                          </IconButton>
                        </Tooltip>

                        {/* Delete Button */}
                        <Tooltip title="Delete Driver">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDelete(driver.id, driver.driverId)
                            }
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <CircularProgress size={16} />
                            ) : (
                              <IoTrash />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination - تظهر فقط للبيانات العادية وليس للبحث */}
      {pagination && displayDrivers.length > 0 && !search && (
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