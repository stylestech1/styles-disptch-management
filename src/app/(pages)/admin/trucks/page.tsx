"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import {
  useGetTrucksQuery,
  useGetAllTrucksQuery,
  useCreateTruckMutation,
  useUpdateTruckMutation,
  useDeleteTruckMutation,
} from "@/redux/slices/truckApi";
import { TDriver, TTruck } from "@/types/globalTypes";
import Titles from "@/components/ui/Titles";
import Loading from "@/components/ui/Loading";
import toast, { Toaster } from "react-hot-toast";
import { IoAdd, IoPencil, IoTrash, IoSearch, IoClose, IoAnalytics } from "react-icons/io5";
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
  Snackbar,
} from "@mui/material";
import { muiTheme } from "@/theme/theme";

// ✅ Styled Table Components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${theme.components?.MuiTableCell?.styleOverrides?.root}`]: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '&[class*="MuiTableCell-head"]': {
    backgroundColor: muiTheme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  '&[class*="MuiTableCell-body"]': {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
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

// ✅ Truck Form Component - Vertical Layout
const TruckForm = ({ 
  open, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  editMode,
  isLoading 
}: {
  open: boolean;
  onClose: () => void;
  formData: Partial<TTruck>;
  onChange: <K extends keyof TTruck>(field: K, value: TTruck[K]) => void;
  onSubmit: () => void;
  editMode: boolean;
  isLoading: boolean;
}) => {

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Truck types options
  const truckTypes = [
    "reefer",
    "van",

  ];

  // ✅ Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.model?.trim()) {
      newErrors.model = "Model is required";
    }
    if (!formData.plateNumber?.trim()) {
      newErrors.plateNumber = "Plate number is required";
    }
    if (!formData.type?.trim()) {
      newErrors.type = "Type is required";
    }
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = "Please enter a valid year";
    }
    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = "Capacity must be greater than 0";
    }
    if (!formData.fuelPerMile || formData.fuelPerMile <= 0) {
      newErrors.fuelPerMile = "Fuel per mile must be greater than 0";
    }
    if (!formData.status?.trim()) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle submit
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  // ✅ Clear errors when field changes
const handleFieldChange = <K extends keyof TTruck>(field: K, value: TTruck[K]) => {
  onChange(field, value);
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: "" }));
  }
};



  // ✅ Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setErrors({});
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { 
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          maxHeight: '90vh',
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        <Typography variant="h5" fontWeight="bold">
          {editMode ? "Edit Truck" : "Add New Truck"}
        </Typography>
        <IconButton 
          onClick={onClose} 
          sx={{ color: 'white' }}
          size="small"
        >
          <IoClose />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Basic Information Section */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom color="primary">
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Model *"
                name="model"
                value={formData.model || ""}
                onChange={(e) => handleFieldChange("model", e.target.value)}
                error={!!errors.model}
                helperText={errors.model}
                size="medium"
                placeholder="e.g., Volvo FH16"
              />
              
              <TextField
                fullWidth
                label="Plate Number *"
                name="plateNumber"
                value={formData.plateNumber || ""}
                onChange={(e) => handleFieldChange("plateNumber", e.target.value)}
                error={!!errors.plateNumber}
                helperText={errors.plateNumber}
                size="medium"
                placeholder="e.g., ABC-12345"
              />
              
              {/* Type as Selector */}
              <FormControl fullWidth size="medium" error={!!errors.type}>
                <InputLabel>Type *</InputLabel>
                <Select
                  label="Type *"
                  name="type"
                  value={formData.type || ""}
                  onChange={(e) => handleFieldChange("type", e.target.value)}
                >
                  {truckTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.type}
                  </Typography>
                )}
              </FormControl>
              
              {/* Year as Normal TextField */}
              <TextField
                fullWidth
                label="Year *"
                name="year"
                type="number"
                value={formData.year || ""}
                onChange={(e) => handleFieldChange("year", Number(e.target.value))}
                error={!!errors.year}
                helperText={errors.year}
                size="medium"
                inputProps={{ 
                  min: 1900, 
                  max: new Date().getFullYear() + 1 
                }}
              />
            </Box>
          </Box>

          {/* Specifications Section */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom color="primary">
              Specifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Capacity (kg) *"
                name="capacity"
                type="number"
                value={formData.capacity || ""}
                onChange={(e) => handleFieldChange("capacity", Number(e.target.value))}
                error={!!errors.capacity}
                helperText={errors.capacity}
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
                value={formData.fuelPerMile || ""}
                onChange={(e) => handleFieldChange("fuelPerMile", Number(e.target.value))}
                error={!!errors.fuelPerMile}
                helperText={errors.fuelPerMile}
                size="medium"
                inputProps={{ min: 0, step: 0.1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">L/mile</InputAdornment>,
                }}
              />
            </Box>
          </Box>

          {/* Status Section */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom color="primary">
              Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <FormControl fullWidth size="medium" error={!!errors.status}>
              <InputLabel>Status *</InputLabel>
              <Select
                label="Status *"
                name="status"
                value={formData.status || ""}
                onChange={(e) => handleFieldChange("status", e.target.value)}
              >
                <MenuItem value="available">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="Available" color="success" size="small" />
                    <Typography>Available</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="busy">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="Busy" color="error" size="small" />
                    <Typography>Busy</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="maintenance">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="Maintenance" color="warning" size="small" />
                    <Typography>Maintenance</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="inactive">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="Inactive" color="default" size="small" />
                    <Typography>Inactive</Typography>
                  </Box>
                </MenuItem>
              </Select>
              {errors.status && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.status}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* Helper Text */}
          <Alert severity="info">
            Fields marked with * are required
          </Alert>
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
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
          sx={{ 
            borderRadius: 2,
            px: 4,
            minWidth: 140,
            background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`
          }}
        >
          {isLoading 
            ? (editMode ? "Saving..." : "Creating...") 
            : (editMode ? "Save Changes" : "Create Truck")
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TrucksPage = () => {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteToast, setDeleteToast] = useState({ open: false, message: "" });

  // 🔹 API Queries
const { data: trucksData, isLoading, refetch } = useGetTrucksQuery({ page: page + 1 });
  const { data: allTrucksData } = useGetAllTrucksQuery();

  // 🔹 API Mutations
  const [createTruck, { isLoading: isCreating }] = useCreateTruckMutation();
  const [updateTruck, { isLoading: isUpdating }] = useUpdateTruckMutation();
  const [deleteTruck, { isLoading: isDeleting }] = useDeleteTruckMutation();

  const trucks = trucksData?.data?.data || [];
  const allTrucks = allTrucksData?.data?.data || [];

  const filteredTrucks = search
    ? allTrucks.filter(
        (t) =>
          t.truckId?.toString().includes(search.toLowerCase()) ||
          t.model?.toLowerCase().includes(search.toLowerCase()) ||
          t.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
          t.assignedDriver?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : trucks;

  // ✅ Modal States
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TTruck>>({});
  const [editMode, setEditMode] = useState(false);

  // ✅ Handle Open (Add / Edit)
  const handleOpenAdd = () => {
    setFormData({});
    setEditMode(false);
    setOpen(true);
  };

  const handleEditClick = (truck: TTruck) => {
    // ✅ إصلاح: تأكد من تعيين جميع القيم بما فيها type
    setFormData({
      id: truck.id,
      truckId: truck.truckId,
      model: truck.model,
      plateNumber: truck.plateNumber,
      type: truck.type, // ✅ هذه كانت المشكلة
      year: truck.year,
      capacity: truck.capacity,
      fuelPerMile: truck.fuelPerMile,
      status: truck.status,
      assignedDriver: truck.assignedDriver,
      createdBy: truck.createdBy,
      updatedBy: truck.updatedBy
    });
    setEditMode(true);
    setOpen(true);
  };

  // ✅ Handle Truck Dashboard Navigation
  const handleTruckDashboard = () => {
    router.push("/admin/truckDashboard");
  };

  // ✅ Handle Form Change
 const handleFormChange = <K extends keyof TTruck>(field: K, value: TTruck[K]) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};


  // ✅ Create Truck
  const handleCreate = async () => {
    if (!user?.id) {
      toast.error("User not found!");
      return;
    }

    const { assignedDriver, ...truckData } = formData;

    try {
      await createTruck({
        ...truckData,
        createdBy: user.id,
      }).unwrap();

      toast.success("✅ Truck created successfully!");
      setOpen(false);
      refetch();
  } catch (err: unknown) {
  const error = err as { data?: { message?: string } };
  toast.error(error?.data?.message || "Create failed");
}

  };

  // ✅ Update Truck
  const handleUpdate = async () => {
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
        createdBy: user.id,
        assignedDriver:
          typeof formData.assignedDriver === "object"
            ? (formData.assignedDriver)?.driverId
            : formData.assignedDriver,
      }).unwrap();

      toast.success("✅ Truck updated successfully!");
      setOpen(false);
      refetch();
  } catch (err: unknown) {
  const error = err as { data?: { message?: string } };
  toast.error(error?.data?.message || "Create failed");
}
  
  };

  // ✅ Delete Truck with MUI Toast
  const handleDelete = async (id: string, truckId?: number) => {
    setDeleteToast({
      open: true,
      message: `Are you sure you want to delete truck #${truckId}?`
    });

    const truckToDelete = { id, truckId };
    
    setTruckToDelete(truckToDelete);
  };

  // ✅ Confirm Delete
  const [truckToDelete, setTruckToDelete] = useState<{id: string, truckId?: number} | null>(null);

  const confirmDelete = async () => {
    if (!truckToDelete) return;

    try {
      await deleteTruck(truckToDelete.id).unwrap();
      toast.success(`✅ Truck #${truckToDelete.truckId} deleted successfully!`);
      refetch();
   } catch (err: unknown) {
  const error = err as { data?: { message?: string } };
  toast.error(error?.data?.message || "Deleted failed");
}
 finally {
      setDeleteToast({ open: false, message: "" });
      setTruckToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteToast({ open: false, message: "" });
    setTruckToDelete(null);
  };

  // ✅ Handle Pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Titles>Truck Management</Titles>
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Truck Dashboard Button */}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<IoAnalytics />}
            onClick={handleTruckDashboard}
            sx={{ 
              borderRadius: 2,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}15 0%, ${muiTheme.palette.primary.dark}15 100%)`
              }
            }}
          >
            Truck Dashboard
          </Button>
          
          {/* Add Truck Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<IoAdd />}
            onClick={handleOpenAdd}
            sx={{ 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`
            }}
          >
            Add Truck
          </Button>
        </Box>
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
          backgroundColor: 'white',
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'white',
            '& fieldset': {
              borderColor: muiTheme.palette.primary.light,
            },
            '&:hover fieldset': {
              borderColor: muiTheme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: muiTheme.palette.primary.main,
            },
          }
        }}
      />

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
                  <StyledTableCell>{truck.fuelPerMile || 'N/A'}</StyledTableCell>
                  <StyledTableCell>
                    {truck.assignedDriver?.name || 'Unassigned'}
                    {truck.assignedDriver?.driverId && (
                      <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block' }}>
                        ID: {truck.assignedDriver.driverId}
                      </Box>
                    )}
                  </StyledTableCell>
                  <StyledTableCell>
                    <StatusChip status={truck.status} />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Edit Truck">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(truck)}
                          disabled={isUpdating}
                        >
                          <IoPencil />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Truck">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(truck.id, truck.truckId)}
                          disabled={isDeleting}
                        >
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredTrucks.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ mt: 2 }}
      />

      {/* Truck Form Modal */}
      <TruckForm
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
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(2px)',
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
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      minWidth: 300,
      maxWidth: 400,
      margin: 2,
    }
  }}
  sx={{
    zIndex: 1300,
    '& .MuiDialog-container': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  }}
>
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
      Confirm Delete
    </Typography>
    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
      {deleteToast.message}
    </Typography>
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
      <Button 
        variant="outlined" 
        color="inherit" 
        onClick={cancelDelete}
        sx={{ 
          borderRadius: 1,
          minWidth: 80,
          borderColor: 'grey.400',
          '&:hover': {
            borderColor: 'grey.600',
            backgroundColor: 'grey.50'
          }
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
          backgroundColor: 'error.main',
          '&:hover': {
            backgroundColor: 'error.dark'
          }
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

export default TrucksPage;