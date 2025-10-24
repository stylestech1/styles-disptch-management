"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import {
  useGetDriversQuery,
  useGetAllDriversQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation,
} from "@/redux/slices/driverApi";
import { TDriver } from "@/types/globalTypes";
import Titles from "@/components/ui/Titles";
import Loading from "@/components/ui/Loading";
import toast, { Toaster } from "react-hot-toast";
import {
  IoAdd,
  IoPencil,
  IoTrash,
  IoSearch,
  IoClose,
  IoAnalytics,
  IoPerson,
  IoCall,
  IoMail,
  IoCard,
  IoCash,
  IoCalendar,
  IoStatsChart,
} from "react-icons/io5";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
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
  TablePagination,
  styled,
  Typography,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import { muiTheme } from "@/theme/theme";
import { getErrorMessage } from "@/utils/getErrorMessage";

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

// ✅ Driver Form Component - Vertical Layout
const DriverForm = ({
  open,
  onClose,
  formData,
  onChange,
  onSubmit,
  editMode,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  formData: Partial<TDriver>;
  onChange: (field: keyof TDriver, value: TDriver[keyof TDriver]) => void;
  onSubmit: () => void;
  editMode: boolean;
  isLoading: boolean;
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
          color: "white",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <Typography variant="h5" component='span' fontWeight="bold">
          {editMode ? "Edit Driver" : "Add New Driver"}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }} size="small">
          <IoClose />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Personal Information Section */}
          <Box>
            <Typography
              variant="h6"
              fontWeight="600"
              gutterBottom
              color="primary"
            >
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Full Name *"
                name="name"
                value={formData.name || ""}
                onChange={(e) => onChange("name", e.target.value)}
                size="medium"
                placeholder="e.g., John Doe"
              />

              <TextField
                fullWidth
                label="Email *"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => onChange("email", e.target.value)}
                size="medium"
                placeholder="e.g., john.doe@example.com"
              />

              <TextField
                fullWidth
                label="Phone *"
                name="phone"
                value={formData.phone || ""}
                onChange={(e) => onChange("phone", e.target.value)}
                size="medium"
                placeholder="e.g., +1234567890"
              />
            </Box>
          </Box>

          {/* Professional Information Section */}
          <Box>
            <Typography
              variant="h6"
              fontWeight="600"
              gutterBottom
              color="primary"
            >
              Professional Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="License Number *"
                name="licenseNumber"
                value={formData.licenseNumber || ""}
                onChange={(e) => onChange("licenseNumber", e.target.value)}
                size="medium"
                placeholder="e.g., DL123456789"
              />

              <TextField
                fullWidth
                label="Price Per Mile *"
                name="pricePerMile"
                type="number"
                value={formData.pricePerMile || ""}
                onChange={(e) =>
                  onChange("pricePerMile", parseFloat(e.target.value) || "")
                }
                size="medium"
                inputProps={{ min: 0, step: 0.1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Hire Date"
                name="hireDate"
                type="date"
                value={formData.hireDate || ""}
                onChange={(e) => onChange("hireDate", e.target.value)}
                size="medium"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>

          {/* Status Section */}
          <Box>
            <Typography
              variant="h6"
              fontWeight="600"
              gutterBottom
              color="primary"
            >
              Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControl fullWidth size="medium">
              <InputLabel>Status *</InputLabel>
              <Select
                label="Status *"
                name="status"
                value={formData.status || ""}
                onChange={(e) => onChange("status", e.target.value)}
              >
                <MenuItem value="available">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="available" color="success" size="small" />
                    <Typography>Available</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="busy">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="Busy" color="error" size="small" />
                    <Typography>Busy</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Helper Text */}
          <Alert severity="info">Fields marked with * are required</Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          disabled={isLoading}
          sx={{ borderRadius: 2, minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
          sx={{
            borderRadius: 2,
            px: 4,
            minWidth: 140,
            background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
          }}
        >
          {isLoading
            ? editMode
              ? "Saving..."
              : "Creating..."
            : editMode
            ? "Save Changes"
            : "Create Driver"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DriversPage = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteToast, setDeleteToast] = useState({ open: false, message: "" });

  // 🔹 API Queries
  const {
    data: driversData,
    isLoading,
    refetch,
  } = useGetDriversQuery(page + 1);
  const { data: allDriversData } = useGetAllDriversQuery();

  // 🔹 API Mutations
  const [createDriver, { isLoading: isCreating }] = useCreateDriverMutation();
  const [updateDriver, { isLoading: isUpdating }] = useUpdateDriverMutation();
  const [deleteDriver, { isLoading: isDeleting }] = useDeleteDriverMutation();
const [originalData, setOriginalData] = useState<Partial<TDriver>>({});

  const drivers = driversData?.data || [];
  const allDrivers = allDriversData?.data || [];

  const filteredDrivers = search
    ? allDrivers.filter(
        (driver: TDriver) =>
          driver.name?.toLowerCase().includes(search.toLowerCase()) ||
          driver.email?.toLowerCase().includes(search.toLowerCase()) ||
          driver.phone?.toLowerCase().includes(search.toLowerCase()) ||
          driver.licenseNumber?.toLowerCase().includes(search.toLowerCase()) ||
          driver.driverId?.toString().includes(search.toLowerCase())
      )
    : drivers;
 
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

  const getChangedFields = (original: Partial<TDriver>, updated: Partial<TDriver>) => {
  const changed: Partial<TDriver> = {};
  Object.keys(updated).forEach((key) => {
    const k = key as keyof TDriver;
    if (updated[k] !== original[k]) {
      changed[k] = updated[k] as TDriver[keyof TDriver];
    }
  });
  return changed;
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
      body: changedFields, // 🟢 فقط التغييرات
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

  // ✅ Handle Pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

      {/* Search */}
      <TextField
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IoSearch />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,
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

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, overflow: "hidden" }}
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
            {filteredDrivers.length === 0 ? (
              <TableRow>
                <StyledTableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  No drivers found
                </StyledTableCell>
              </TableRow>
            ) : (
              filteredDrivers
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

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredDrivers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ mt: 2 }}
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
      {/* Blur Background Overlay */}
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
