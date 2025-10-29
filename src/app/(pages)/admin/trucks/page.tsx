"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { TDriver, TTruck } from "@/types/globalTypes";
import Titles from "@/components/ui/Titles";
import Loading from "@/components/ui/Loading";
import toast, { Toaster } from "react-hot-toast";
import {
  IoAdd,
  IoPencil,
  IoTrash,
  IoSearch,
  IoClose,
  IoPerson,
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
  styled,
  Typography,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import { muiTheme } from "@/theme/theme";
import { getErrorMessage } from "@/utils/getErrorMessage";
import Pagination from "@/components/ui/Pagination";
import { useCreateTruckMutation, useDeleteTruckMutation, useGetAllDriversQuery, useGetAllTrucksQuery, useGetTrucksWithSearchQuery, useUpdateTruckMutation } from "@/redux/slices/apiSlice";

// Styled Table Components
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

// StatusChip
const StatusChip = React.memo(({ status }: { status?: string | undefined }) => {
  const getColor = (s?: string) => {
    switch (s?.toLowerCase()) {
      case "available":
        return "success";
      case "busy":
        return "error";
      default:
        return "default";
    }
  };

  return <Chip label={status || "N/A"} color={getColor(status)} size="small" />;
});
StatusChip.displayName = "StatusChip";

type TruckFormProps = {
  open: boolean;
  onClose: () => void;
  formData: Partial<TTruck>;
  onChange: <K extends keyof TTruck>(field: K, value: TTruck[K]) => void;
  onSubmit: () => void;
  editMode: boolean;
  isLoading: boolean;
  allDrivers: TDriver[];
  allTrucks: TTruck[];
};

const TruckForm = React.memo(function TruckFormComp(props: TruckFormProps) {
  const {
    open,
    onClose,
    formData,
    onChange,
    onSubmit,
    editMode,
    isLoading,
    allDrivers,
    allTrucks,
  } = props;

  // assigned driver IDs 
  const assignedDriverIds = useMemo(() => {
    if (!allTrucks || allTrucks.length === 0) return [];
    return allTrucks
      .filter((truck) => truck.assignedDriver && truck.id !== formData.id)
      .map((truck) =>
        typeof truck.assignedDriver === "object" ? truck.assignedDriver.id : truck.assignedDriver
      )
      .filter(Boolean) as string[];
  }, [allTrucks, formData.id]);

  const availableUnassignedDrivers = useMemo(() => {
    if (!allDrivers) return [];
    return allDrivers.filter(
      (driver) => driver.status === "available" && !assignedDriverIds.includes(driver.id)
    );
  }, [allDrivers, assignedDriverIds]);

  const truckTypes = useMemo(() => ["reefer", "van"], []);

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
        <Typography variant="h5" component="span" fontWeight="bold">
          {editMode ? "Edit Truck" : "Add New Truck"}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }} size="small">
          <IoClose />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Basic Information */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom color="primary">
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Model *"
                name="model"
                value={formData.model || ""}
                onChange={(e) => onChange("model", e.target.value)}
                size="medium"
                placeholder="e.g., Volvo FH16"
              />
              <TextField
                fullWidth
                label="Plate Number *"
                name="plateNumber"
                value={formData.plateNumber || ""}
                onChange={(e) => onChange("plateNumber", e.target.value)}
                size="medium"
                placeholder="e.g., ABC-12345"
              />
              <FormControl fullWidth size="medium">
                <InputLabel>Type *</InputLabel>
                <Select
                  label="Type *"
                  name="type"
                  value={formData.type || ""}
                  onChange={(e) => onChange("type", e.target.value)}
                >
                  {truckTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Year *"
                name="year"
                type="number"
                value={formData.year ?? ""}
                onChange={(e) => onChange("year", Number(e.target.value))}
                size="medium"
                inputProps={{
                  min: 1900,
                  max: new Date().getFullYear() + 1,
                }}
              />
            </Box>
          </Box>

          {/* Specifications */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom color="primary">
              Specifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Capacity (kg) *"
                name="capacity"
                type="number"
                value={formData.capacity ?? ""}
                onChange={(e) => onChange("capacity", Number(e.target.value))}
                size="medium"
                inputProps={{ min: 0 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Fuel Per Mile *"
                name="fuelPerMile"
                type="number"
                value={formData.fuelPerMile ?? ""}
                onChange={(e) => onChange("fuelPerMile", Number(e.target.value))}
                size="medium"
                inputProps={{ min: 0, step: 0.1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">L/mile</InputAdornment>,
                }}
              />
            </Box>
          </Box>

          {/* Driver Assignment */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom color="primary">
              Driver Assignment
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControl fullWidth size="medium">
              <InputLabel id="driver-assignment-label">Assigned Driver</InputLabel>
              <Select
                labelId="driver-assignment-label"
                label="Assigned Driver"
                name="assignedDriver"
                value={formData.assignedDriver || ""}
                onChange={(e) => onChange("assignedDriver", e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <IoPerson style={{ color: muiTheme.palette.primary.main }} />
                  </InputAdornment>
                }
                sx={{
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                <MenuItem value="">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: "grey.100",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "grey.500",
                      }}
                    >
                      <IoPerson size={16} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        Unassigned
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>

                {availableUnassignedDrivers.length > 0 ? (
                  availableUnassignedDrivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.875rem",
                          }}
                        >
                          {driver.name?.charAt(0)?.toUpperCase() || "D"}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body1" fontWeight="500" noWrap>
                            {driver.name}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              ID: {driver.driverId || driver.id}
                            </Typography>
                            <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "grey.400" }} />
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {driver.licenseNumber}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip label="Available" color="success" size="small" sx={{ fontSize: "0.625rem", height: 20, "& .MuiChip-label": { px: 1 } }} />
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", py: 1 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center", color: "grey.500" }}>
                        <IoPerson size={20} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          No available drivers
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          All drivers are currently assigned or busy
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                )}
              </Select>

              {availableUnassignedDrivers.length === 0 && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 1, "& .MuiAlert-message": { fontSize: "0.875rem" } }} icon={false}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: "warning.main", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem" }}>
                      ⚠️
                    </Box>
                    <Typography variant="caption">
                      No available unassigned drivers. All drivers are currently assigned to other trucks or busy.
                    </Typography>
                  </Box>
                </Alert>
              )}

              {availableUnassignedDrivers.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, px: 1 }}>
                  <Typography variant="caption" color="success.main" fontWeight="500">
                    {availableUnassignedDrivers.length} available unassigned driver{availableUnassignedDrivers.length !== 1 ? "s" : ""}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total: {allDrivers.length} drivers
                  </Typography>
                </Box>
              )}
            </FormControl>
          </Box>

          {/* Status */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom color="primary">
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
                    <Chip label="Available" color="success" size="small" />
                    <Typography>Available</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="busy">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="Busy" color="error" size="small" />
                    <Typography>Busy</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="inactive">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="Inactive" color="default" size="small" />
                    <Typography>Inactive</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Alert severity="info">Fields marked with * are required</Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined" disabled={isLoading} sx={{ borderRadius: 2, minWidth: 100 }}>
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
          {isLoading ? (editMode ? "Saving..." : "Creating...") : editMode ? "Save Changes" : "Create Truck"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
TruckForm.displayName = "TruckForm";

/* ---------------- TrucksPage (parent) ---------------- */
const TrucksPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [deleteToast, setDeleteToast] = useState({ open: false, message: "" });

  // API queries (one for paginated view, one for all data used in form/filtering)
  const {
    data: trucksData,
    isLoading,
    refetch,
  } = useGetTrucksWithSearchQuery({ page: page + 1 });

  // all trucks (used for selection logic in form) - only fetched when token exists
  const { data: allTrucksData } = useGetAllTrucksQuery({ skip: !token });

  // drivers (used in form)
  const { data: driversData } = useGetAllDriversQuery();

  // Mutations
  const [createTruck, { isLoading: isCreating, error: createError }] = useCreateTruckMutation();
  const [updateTruck, { isLoading: isUpdating, error: updateError }] = useUpdateTruckMutation();
  const [deleteTruck, { isLoading: isDeleting, error: deleteError }] = useDeleteTruckMutation();

  // convenient exposures
  const trucks = useMemo(() => trucksData?.data?.data || [], [trucksData]);
  const allTrucks = useMemo(() => allTrucksData?.data?.data || [], [allTrucksData]);
  const pagination = allTrucksData?.data?.paginationResult || null;
  const allDrivers = driversData?.data || [];

  // Filtered trucks (memoized) - uses search on allTrucks if searching, otherwise uses page data
  const filteredTrucks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trucks;
    return allTrucks.filter((t: TTruck) => {
      return (
        t.truckId?.toString().includes(q) ||
        t.model?.toLowerCase().includes(q) ||
        t.plateNumber?.toLowerCase().includes(q) ||
        (typeof t.assignedDriver === "object"
          ? t.assignedDriver.name?.toLowerCase().includes(q)
          : String(t.assignedDriver || "").toLowerCase().includes(q))
      );
    });
  }, [search, trucks, allTrucks]);

  // Modal states
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TTruck>>({});
  const [editMode, setEditMode] = useState(false);

  // Delete flow state
  const [truckToDelete, setTruckToDelete] = useState<{ id: string; truckId?: number } | null>(null);

  // HANDLE open add
  const handleOpenAdd = useCallback(() => {
    setFormData({});
    setEditMode(false);
    setOpen(true);
  }, []);

  // HANDLE edit click
  const handleEditClick = useCallback((truck: TTruck) => {
    const assignedDriverId =
      typeof truck.assignedDriver === "object" ? truck.assignedDriver.id : truck.assignedDriver;
    setFormData({
      id: truck.id,
      truckId: truck.truckId,
      model: truck.model,
      plateNumber: truck.plateNumber,
      type: truck.type,
      year: truck.year,
      capacity: truck.capacity,
      fuelPerMile: truck.fuelPerMile,
      status: truck.status,
      assignedDriver: assignedDriverId,
    });
    setEditMode(true);
    setOpen(true);
  }, []);

  // form change
  const handleFormChange = useCallback(<K extends keyof TTruck>(field: K, value: TTruck[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Show errors from mutations (centralized)
  useEffect(() => {
    const showError = (err: unknown, fallback: string) => {
      if (!err) return;
      const msg = (err as { data?: { message?: string } })?.data?.message || fallback;
      toast.error(msg);
    };
    showError(createError, "Failed to create truck");
    showError(updateError, "Failed to update truck");
    showError(deleteError, "Failed to delete truck");
  }, [createError, updateError, deleteError]);

  // Create truck
  const handleCreate = useCallback(async () => {
    if (!user?.id) {
      toast.error("User not found!");
      return;
    }
    try {
      await createTruck({
        ...formData,
        createdBy: user.id,
      }).unwrap();

      toast.success("✅ Truck created successfully!");
      setOpen(false);
      // ideally RTK invalidates tags -> updates automatically
      // but keep a fallback refetch in case your slice doesn't have tags
      try {
        refetch();
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Creating truck failed ❌");
    }
  }, [createTruck, formData, user?.id, refetch]);

  // Update truck
  const handleUpdate = useCallback(async () => {
    if (!formData?.id) {
      toast.error("Missing truck ID");
      return;
    }
    if (!user?.id) {
      toast.error("User not found!");
      return;
    }
    try {
      await updateTruck({
        id: formData.id,
        ...formData,
        updatedBy: user.id,
      }).unwrap();

      toast.success("✅ Truck updated successfully!");
      setOpen(false);
      try {
        refetch();
      } catch {}
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Updating truck failed ❌");
    }
  }, [updateTruck, formData, user?.id, refetch]);

  // Delete flow
  const handleDelete = useCallback((id: string, truckId?: number) => {
    setDeleteToast({
      open: true,
      message: `Are you sure you want to delete truck #${truckId}?`,
    });
    setTruckToDelete({ id, truckId });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!truckToDelete) return;
    try {
      await deleteTruck(truckToDelete.id).unwrap();
      toast.success(`✅ Truck #${truckToDelete.truckId} deleted successfully!`);
      try {
        refetch();
      } catch {}
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Deleting truck failed ❌");
    } finally {
      setDeleteToast({ open: false, message: "" });
      setTruckToDelete(null);
    }
  }, [truckToDelete, deleteTruck, refetch]);

  const cancelDelete = useCallback(() => {
    setDeleteToast({ open: false, message: "" });
    setTruckToDelete(null);
  }, []);

  if (isLoading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, [muiTheme.breakpoints.down("md")]: { flexDirection: "column", gap: 2, alignItems: "stretch" } }}>
        <Titles>Truck Management</Titles>
        <Button variant="contained" color="primary" startIcon={<IoAdd />} onClick={handleOpenAdd} sx={{ borderRadius: 2, background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)` }}>
          Add Truck
        </Button>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Search by truck ID, model, plate number, or driver..."
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
            "& fieldset": { borderColor: muiTheme.palette.primary.light },
            "&:hover fieldset": { borderColor: muiTheme.palette.primary.main },
            "&.Mui-focused fieldset": { borderColor: muiTheme.palette.primary.main },
          },
          [muiTheme.breakpoints.down("md")]: { width: "100%" },
        }}
      />

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden", overflowX: "auto", maxWidth: "100%", "&::-webkit-scrollbar": { height: 8 }, "&::-webkit-scrollbar-track": { background: muiTheme.palette.grey[100] }, "&::-webkit-scrollbar-thumb": { background: muiTheme.palette.grey[400], borderRadius: 4 } }}>
        <Table sx={{ minWidth: 650 }} aria-label="trucks table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Truck ID</StyledTableCell>
              <StyledTableCell>Model</StyledTableCell>
              <StyledTableCell>Plate Number</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Year</StyledTableCell>
              <StyledTableCell>Capacity (kg)</StyledTableCell>
              <StyledTableCell>Fuel/Mile</StyledTableCell>
              <StyledTableCell>Driver</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrucks.length === 0 ? (
              <TableRow>
                <StyledTableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  No trucks found
                </StyledTableCell>
              </TableRow>
            ) : (
              filteredTrucks.map((truck: TTruck) => (
                <StyledTableRow key={truck.id}>
                  <StyledTableCell component="th" scope="row">
                    {truck.truckId}
                  </StyledTableCell>
                  <StyledTableCell>{truck.model}</StyledTableCell>
                  <StyledTableCell>{truck.plateNumber}</StyledTableCell>
                  <StyledTableCell>{truck.type}</StyledTableCell>
                  <StyledTableCell>{truck.year}</StyledTableCell>
                  <StyledTableCell>{truck.capacity}</StyledTableCell>
                  <StyledTableCell>{truck.fuelPerMile ?? "N/A"}</StyledTableCell>
                  <StyledTableCell>
                    {typeof truck.assignedDriver === "object" ? truck.assignedDriver.name : truck.assignedDriver || "Unassigned"}
                    {typeof truck.assignedDriver === "object" && truck.assignedDriver.driverId && (
                      <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary", display: "block" }}>
                        ID: {truck.assignedDriver.driverId}
                      </Box>
                    )}
                  </StyledTableCell>
                  <StyledTableCell>
                    <StatusChip status={truck.status} />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                      <Tooltip title="Edit Truck">
                        <IconButton size="small" color="primary" onClick={() => handleEditClick(truck)} disabled={isUpdating}>
                          <IoPencil />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Truck">
                        <IconButton size="small" color="error" onClick={() => handleDelete(truck.id, truck.truckId)} disabled={isDeleting}>
                          {isDeleting ? <CircularProgress size={16} /> : <IoTrash />}
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
      {pagination && allTrucks.length > 0 && (
        <Pagination pagination={pagination} page={page} setPage={setPage} pageSize={10} showInfo={true} />
      )}

      {/* Truck Form*/}
      <TruckForm
        open={open}
        onClose={() => setOpen(false)}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={editMode ? handleUpdate : handleCreate}
        editMode={editMode}
        isLoading={isCreating || isUpdating}
        allDrivers={allDrivers}
        allTrucks={allTrucks}
      />

      {/* Delete Confirmation */}
      {deleteToast.open && <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.1)", backdropFilter: "blur(2px)", zIndex: 1299 }} />}

      <Dialog
        open={deleteToast.open}
        onClose={cancelDelete}
        PaperProps={{
          sx: { borderRadius: 2, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", minWidth: 300, maxWidth: 400, margin: 2 },
        }}
        sx={{ zIndex: 1300, "& .MuiDialog-container": { display: "flex", alignItems: "center", justifyContent: "center" } }}
      >
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.primary" }}>
            Confirm Delete
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            {deleteToast.message}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button variant="outlined" color="inherit" onClick={cancelDelete} sx={{ borderRadius: 1, minWidth: 80, borderColor: "grey.400", "&:hover": { borderColor: "grey.600", backgroundColor: "grey.50" } }}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={confirmDelete} sx={{ borderRadius: 1, minWidth: 80, backgroundColor: "error.main", "&:hover": { backgroundColor: "error.dark" } }}>
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default TrucksPage;
