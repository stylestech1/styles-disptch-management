"use client";

import { TTruck, TDriver } from "@/types/globalTypes";
import { Alert, Box, Button, Chip, CircularProgress, Divider, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { IoClose, IoPerson, IoAdd } from "react-icons/io5";

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

  // Handle number input change
  const handleNumberChange = (field: keyof TTruck, value: string) => {
    if (value === '' || value === null || value === undefined) {
      onChange(field, '');
    } else {
      const numValue = Number(value);
      onChange(field, numValue);
    }
  };

  // Handle year input change
  const handleYearChange = (value: string) => {
    if (value === '' || value === null || value === undefined) {
      onChange('year', 0);
    } else {
      const numValue = Number(value);
      onChange('year', numValue);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
      <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {!editMode && (
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <IoAdd className="text-emerald-600" size={18} />
              </div>
            )}
            <h3 className="text-xl font-semibold text-slate-800">
              {editMode ? "Edit Truck" : "Add New Truck"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-slate-800">Basic Information</h4>
            </div>
            <Divider sx={{ mb: 3 }} />
            <div className="space-y-4">
              <TextField
                fullWidth
                label="Model *"
                name="model"
                value={formData.model || ""}
                onChange={(e) => onChange("model", e.target.value)}
                size="medium"
                placeholder="e.g., Volvo FH16"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                  marginBottom: '16px',
                }}
              />
              <TextField
                fullWidth
                label="Plate Number *"
                name="plateNumber"
                value={formData.plateNumber || ""}
                onChange={(e) => onChange("plateNumber", e.target.value)}
                size="medium"
                placeholder="e.g., ABC-12345"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                  marginBottom: '16px',
                }}
              />
              <FormControl 
                fullWidth 
                size="medium"
                sx={{ marginBottom: '16px' }}
              >
                <InputLabel>Type *</InputLabel>
                <Select
                  label="Type *"
                  name="type"
                  value={formData.type || ""}
                  onChange={(e) => onChange("type", e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#10b981',
                      },
                    },
                  }}
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
                onChange={(e) => handleYearChange(e.target.value)}
                size="medium"
                inputProps={{
                  min: 1900,
                  max: new Date().getFullYear() + 1,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Specifications Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-slate-800">Specifications</h4>
            </div>
            <Divider sx={{ mb: 3 }} />
            <div className="space-y-4">
              <TextField
                fullWidth
                label="Capacity (kg) *"
                name="capacity"
                type="number"
                value={formData.capacity ?? ""}
                onChange={(e) => handleNumberChange("capacity", e.target.value)}
                size="medium"
                inputProps={{ min: 0 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">kg</InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                  marginBottom: '16px',
                }}
              />
              <TextField
                fullWidth
                label="Fuel Per Mile *"
                name="fuelPerMile"
                type="number"
                value={formData.fuelPerMile ?? ""}
                onChange={(e) => handleNumberChange("fuelPerMile", e.target.value)}
                size="medium"
                inputProps={{ min: 0, step: 0.1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">L/mile</InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Driver Assignment Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-slate-800">Driver Assignment</h4>
            </div>
            <Divider sx={{ mb: 3 }} />
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
                    <IoPerson className="text-emerald-600" />
                  </InputAdornment>
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                  },
                  marginBottom: '8px',
                }}
              >
                <MenuItem value="">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <IoPerson size={16} className="text-slate-500" />
                    </div>
                    <span className="text-slate-500 italic">Unassigned</span>
                  </Box>
                </MenuItem>

                {availableUnassignedDrivers.length > 0 ? (
                  availableUnassignedDrivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {driver.name?.charAt(0)?.toUpperCase() || "D"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {driver.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              ID: {driver.driverId || driver.id}
                            </span>
                            <span className="w-1 h-1 bg-slate-400 rounded-full" />
                            <span className="text-xs text-slate-500 truncate">
                              {driver.licenseNumber}
                            </span>
                          </div>
                        </div>
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
                      </div>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <div className="flex items-center gap-3 w-full py-1">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <IoPerson size={20} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">No available drivers</p>
                        <p className="text-xs text-slate-500">
                          All drivers are currently assigned or busy
                        </p>
                      </div>
                    </div>
                  </MenuItem>
                )}
              </Select>

              {availableUnassignedDrivers.length === 0 && (
                <Alert
                  severity="warning"
                  sx={{
                    mt: 2,
                    mb: 2,
                    borderRadius: 1,
                    "& .MuiAlert-message": { fontSize: "0.875rem" },
                  }}
                  icon={false}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">
                      ⚠️
                    </div>
                    <span className="text-sm">
                      No available unassigned drivers. All drivers are currently assigned to other trucks or busy.
                    </span>
                  </div>
                </Alert>
              )}

              {availableUnassignedDrivers.length > 0 && (
                <div className="flex justify-between mt-2 px-1 mb-2">
                  <span className="text-xs text-emerald-600 font-medium">
                    {availableUnassignedDrivers.length} available unassigned
                    driver{availableUnassignedDrivers.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-slate-500">
                    Total: {allDrivers.length} drivers
                  </span>
                </div>
              )}
            </FormControl>
          </div>

          {/* Status Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-slate-800">Status</h4>
            </div>
            <Divider sx={{ mb: 3 }} />
            <FormControl fullWidth size="medium">
              <InputLabel>Status *</InputLabel>
              <Select
                label="Status *"
                name="status"
                value={formData.status || ""}
                onChange={(e) => onChange("status", e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                }}
              >
                <MenuItem value="available">
                  <div className="flex items-center gap-2">
                    <Chip label="Available" color="success" size="small" />
                    <span>Available</span>
                  </div>
                </MenuItem>
                <MenuItem value="busy">
                  <div className="flex items-center gap-2">
                    <Chip label="Busy" color="error" size="small" />
                    <span>Busy</span>
                  </div>
                </MenuItem>
                <MenuItem value="inactive">
                  <div className="flex items-center gap-2">
                    <Chip label="Inactive" color="default" size="small" />
                    <span>Inactive</span>
                  </div>
                </MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Helper Text */}
          <Alert severity="info" className="rounded-lg mt-4">
            Fields marked with * are required
          </Alert>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
          <Button
            onClick={onClose}
            color="inherit"
            variant="outlined"
            disabled={isLoading}
            className="flex-1 rounded-xl border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium"
          >
            {isLoading
              ? editMode
                ? "Saving..."
                : "Creating..."
              : editMode
              ? "Save Changes"
              : "Create Truck"}
          </Button>
        </div>
      </div>
    </div>
  );
});

TruckForm.displayName = "TruckForm";