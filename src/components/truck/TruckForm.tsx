"use client";

import { TTruck, TDriver } from "@/types/globalTypes";
import {
  Alert,
  Box,
  Chip,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useMemo, useEffect } from "react";
import { IoClose, IoPerson, IoAdd } from "react-icons/io5";
import { useForm, Controller } from "react-hook-form";

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

interface TruckFormData {
  model: string;
  plateNumber: string;
  type: string;
  year: number;
  capacity: number;
  fuelPerMile: number;
  assignedDriver: string;
  status: string;
}

export const TruckForm = React.memo(function TruckFormComp(
  props: TruckFormProps
) {
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

  // react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
  } = useForm<TruckFormData>({
    defaultValues: {
      model: "",
      plateNumber: "",
      type: "",
      year: 2019,
      capacity: 0,
      fuelPerMile: 0,
      assignedDriver: "",
      status: "",
    },
    mode: "onSubmit",
  });

  // when updating data
  useEffect(() => {
    if (formData && open) {
      Object.keys(formData).forEach((key) => {
        const fieldName = key as keyof TruckFormData;
        const value = formData[key as keyof TTruck];
        if (value !== undefined) {
          setValue(fieldName, value as never);
        }
      });
    }
  }, [formData, open, setValue]);

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

  // Handle form submission
  const onSubmitForm = (data: TruckFormData) => {
    Object.keys(data).forEach((key) => {
      const field = key as keyof TTruck;
      const value = data[key as keyof TruckFormData];
      onChange(field, value as TTruck[keyof TTruck]);
    });
    onSubmit();
  };

  // Handle field change with validation
  const handleFieldChange = async (
    field: keyof TruckFormData,
    value: string | number
  ) => {
    setValue(field, value as never);
    await trigger(field);
    onChange(field as keyof TTruck, value as TTruck[keyof TTruck]);
  };

  // Handle number input change
  const handleNumberChange = async (
    field: keyof TruckFormData,
    value: string
  ) => {
    const numValue = value === "" ? 0 : Number(value);
    setValue(field, numValue as never);
    await trigger(field);
    onChange(field as keyof TTruck, numValue as TTruck[keyof TTruck]);
  };

  // Handle year input change
  const handleYearChange = async (value: string) => {
  const numValue = value === "" ? 0 : Number(value); 
  setValue("year", numValue);
  await trigger("year");
  onChange("year", numValue);
};


  // Reset form when closing
  const handleClose = () => {
    reset();
    onClose();
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
            onClick={handleClose}
            className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-slate-800">
                  Basic Information
                </h4>
              </div>
              <Divider sx={{ mb: 3 }} />
              <div className="space-y-4">
                {/* Model Field */}
                <Controller
                  name="model"
                  control={control}
                  rules={{
                    required: "Model is required",
                    minLength: {
                      value: 2,
                      message: "Model must be at least 2 characters",
                    },
                    maxLength: {
                      value: 50,
                      message: "Model must be less than 50 characters",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Model *"
                      error={!!errors.model}
                      helperText={errors.model?.message}
                      size="medium"
                      placeholder="e.g., Volvo FH16"
                      onChange={(e) =>
                        handleFieldChange("model", e.target.value)
                      }
                      sx={{
                        marginBottom: "16px",
                      }}
                    />
                  )}
                />

                {/* Plate Number Field */}
                <Controller
                  name="plateNumber"
                  control={control}
                  rules={{
                    required: "Plate number is required",
                    pattern: {
                      value: /^[A-Z0-9-]+$/,
                      message:
                        "Plate number can only contain letters, numbers, and hyphens",
                    },
                    minLength: {
                      value: 3,
                      message: "Plate number must be at least 3 characters",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Plate Number *"
                      error={!!errors.plateNumber}
                      helperText={errors.plateNumber?.message}
                      size="medium"
                      placeholder="e.g., ABC-12345"
                      onChange={(e) =>
                        handleFieldChange("plateNumber", e.target.value)
                      }
                      sx={{
                        marginBottom: "16px",
                      }}
                    />
                  )}
                />

                {/* Type Field */}
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: "Type is required" }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      size="medium"
                      error={!!errors.type}
                      sx={{ marginBottom: "16px" }}
                    >
                      <InputLabel>Type *</InputLabel>
                      <Select
                        {...field}
                        label="Type *"
                        error={!!errors.type}
                        onChange={(e) =>
                          handleFieldChange("type", e.target.value)
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": {
                              borderColor: "#10b981",
                            },
                          },
                        }}
                      >
                        {truckTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.type && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 1, display: "block" }}
                        >
                          {errors.type.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />

                {/* Year Field */}
                <Controller
                  name="year"
                  control={control}
                  rules={{
                    required: "Year is required",
                    min: {
                      value: 1900,
                      message: "Year must be 1900 or later",
                    },
                    max: {
                      value: new Date().getFullYear() + 1,
                      message: `Year cannot be later than ${
                        new Date().getFullYear() + 1
                      }`,
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Year *"
                      type="number"
                      error={!!errors.year}
                      helperText={errors.year?.message}
                      size="medium"
                      inputProps={{
                        min: 1900,
                        max: new Date().getFullYear() + 1,
                      }}
                      onChange={(e) => handleYearChange(e.target.value)}
                      sx={{}}
                    />
                  )}
                />
              </div>
            </div>

            {/* Specifications Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-slate-800">
                  Specifications
                </h4>
              </div>
              <Divider sx={{ mb: 3 }} />
              <div className="space-y-4">
                {/* Capacity Field */}
                <Controller
                  name="capacity"
                  control={control}
                  rules={{
                    required: "Capacity is required",
                    min: {
                      value: 1,
                      message: "Capacity must be at least 1 kg",
                    },
                    max: {
                      value: 100000,
                      message: "Capacity seems too high",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Capacity (kg) *"
                      type="number"
                      error={!!errors.capacity}
                      helperText={errors.capacity?.message}
                      size="medium"
                      inputProps={{ min: 0 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">kg</InputAdornment>
                        ),
                      }}
                      onChange={(e) =>
                        handleNumberChange("capacity", e.target.value)
                      }
                      sx={{
                        marginBottom: "16px",
                      }}
                    />
                  )}
                />

                {/* Fuel Per Mile Field */}
                <Controller
                  name="fuelPerMile"
                  control={control}
                  rules={{
                    required: "Fuel per mile is required",
                    min: {
                      value: 0.1,
                      message: "Fuel per mile must be at least 0.1",
                    },
                    max: {
                      value: 100,
                      message: "Fuel consumption seems too high",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Fuel Per Mile *"
                      type="number"
                      error={!!errors.fuelPerMile}
                      helperText={errors.fuelPerMile?.message}
                      size="medium"
                      inputProps={{ min: 0, step: 0.1 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">L/mile</InputAdornment>
                        ),
                      }}
                      onChange={(e) =>
                        handleNumberChange("fuelPerMile", e.target.value)
                      }
                      sx={{}}
                    />
                  )}
                />
              </div>
            </div>

            {/* Driver Assignment Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-slate-800">
                  Driver Assignment
                </h4>
              </div>
              <Divider sx={{ mb: 3 }} />
              <Controller
                name="assignedDriver"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="medium">
                    <InputLabel id="driver-assignment-label">
                      Assigned Driver
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="driver-assignment-label"
                      label="Assigned Driver"
                      onChange={(e) =>
                        handleFieldChange("assignedDriver", e.target.value)
                      }
                      startAdornment={
                        <InputAdornment position="start">
                          <IoPerson className="text-emerald-600" />
                        </InputAdornment>
                      }
                      sx={{
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                        },
                        marginBottom: "8px",
                      }}
                    >
                      <MenuItem value="">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                            <IoPerson size={16} className="text-slate-500" />
                          </div>
                          <span className="text-slate-500 italic">
                            Unassigned
                          </span>
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
                              <p className="text-sm text-slate-600">
                                No available drivers
                              </p>
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
                            No available unassigned drivers. All drivers are
                            currently assigned to other trucks or busy.
                          </span>
                        </div>
                      </Alert>
                    )}

                    {availableUnassignedDrivers.length > 0 && (
                      <div className="flex justify-between mt-2 px-1 mb-2">
                        <span className="text-xs text-emerald-600 font-medium">
                          {availableUnassignedDrivers.length} available
                          unassigned driver
                          {availableUnassignedDrivers.length !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-slate-500">
                          Total: {allDrivers.length} drivers
                        </span>
                      </div>
                    )}
                  </FormControl>
                )}
              />
            </div>

            {/* Status Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-slate-800">Status</h4>
              </div>
              <Divider sx={{ mb: 3 }} />
              <Controller
                name="status"
                control={control}
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <FormControl fullWidth size="medium" error={!!errors.status}>
                    <InputLabel>Status *</InputLabel>
                    <Select
                      {...field}
                      label="Status *"
                      error={!!errors.status}
                      onChange={(e) =>
                        handleFieldChange("status", e.target.value)
                      }
                      sx={{}}
                    >
                      <MenuItem value="available">
                        <div className="flex items-center gap-2">
                          <Chip
                            label="Available"
                            color="success"
                            size="small"
                          />
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
                    {errors.status && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 1, display: "block" }}
                      >
                        {errors.status.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-5 cursor-pointer rounded-md bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium"
          >
            {isLoading
              ? editMode
                ? "Saving..."
                : "Creating..."
              : editMode
              ? "Save Changes"
              : "Create Truck"}
          </button>
        </form>
      </div>
    </div>
  );
});

TruckForm.displayName = "TruckForm";
