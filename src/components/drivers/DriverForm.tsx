import { muiTheme } from "@/theme/theme";
import { TDriver } from "@/types/globalTypes";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { IoClose } from "react-icons/io5";

export const DriverForm = ({
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
        <Typography variant="h5" component="span" fontWeight="bold">
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