import { muiTheme } from "@/theme/theme";
import { TDriver, TTruck } from "@/types/globalTypes";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { IoClose, IoPerson } from "react-icons/io5";

export type TruckFormProps = {
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
export const TruckForm = React.memo(function TruckFormComp(props: TruckFormProps) {
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
        typeof truck.assignedDriver === "object"
          ? truck.assignedDriver.id
          : truck.assignedDriver
      )
      .filter(Boolean) as string[];
  }, [allTrucks, formData.id]);

  const availableUnassignedDrivers = useMemo(() => {
    if (!allDrivers) return [];
    return allDrivers.filter(
      (driver) =>
        driver.status === "available" && !assignedDriverIds.includes(driver.id)
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
            <Typography
              variant="h6"
              fontWeight="600"
              gutterBottom
              color="primary"
            >
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
            <Typography
              variant="h6"
              fontWeight="600"
              gutterBottom
              color="primary"
            >
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
                  endAdornment: (
                    <InputAdornment position="end">kg</InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Fuel Per Mile *"
                name="fuelPerMile"
                type="number"
                value={formData.fuelPerMile ?? ""}
                onChange={(e) =>
                  onChange("fuelPerMile", Number(e.target.value))
                }
                size="medium"
                inputProps={{ min: 0, step: 0.1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">L/mile</InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {/* Driver Assignment */}
          <Box>
            <Typography
              variant="h6"
              fontWeight="600"
              gutterBottom
              color="primary"
            >
              Driver Assignment
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControl fullWidth size="medium">
              <InputLabel id="driver-assignment-label">
                Assigned Driver
              </InputLabel>
              <Select
                labelId="driver-assignment-label"
                label="Assigned Driver"
                name="assignedDriver"
                value={formData.assignedDriver || ""}
                onChange={(e) => onChange("assignedDriver", e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <IoPerson
                      style={{ color: muiTheme.palette.primary.main }}
                    />
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
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontStyle="italic"
                      >
                        Unassigned
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>

                {availableUnassignedDrivers.length > 0 ? (
                  availableUnassignedDrivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          width: "100%",
                        }}
                      >
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
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mt: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ID: {driver.driverId || driver.id}
                            </Typography>
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                bgcolor: "grey.400",
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {driver.licenseNumber}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label="Available"
                          color="success"
                          size="small"
                          sx={{
                            fontSize: "0.625rem",
                            height: 20,
                            "& .MuiChip-label": { px: 1 },
                          }}
                        />
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                        py: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "grey.100",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "grey.500",
                        }}
                      >
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
                <Alert
                  severity="warning"
                  sx={{
                    mt: 2,
                    borderRadius: 1,
                    "& .MuiAlert-message": { fontSize: "0.875rem" },
                  }}
                  icon={false}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "warning.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.75rem",
                      }}
                    >
                      ⚠️
                    </Box>
                    <Typography variant="caption">
                      No available unassigned drivers. All drivers are currently
                      assigned to other trucks or busy.
                    </Typography>
                  </Box>
                </Alert>
              )}

              {availableUnassignedDrivers.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                    px: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="success.main"
                    fontWeight="500"
                  >
                    {availableUnassignedDrivers.length} available unassigned
                    driver{availableUnassignedDrivers.length !== 1 ? "s" : ""}
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
            : "Create Truck"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
TruckForm.displayName = "TruckForm"; 