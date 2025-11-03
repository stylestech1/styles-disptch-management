import { TDriver, TUser } from "@/types/globalTypes";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import {
  IoAdd,
  IoCalendar,
  IoCall,
  IoCash,
  IoClose,
  IoMail,
  IoPerson,
} from "react-icons/io5";
import { useGetAllUsersQuery } from "@/redux/slices/apiSlice";
import { useForm, Controller } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface DriverFormData {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  pricePerMile: string;
  hireDate: string;
  status: string;
  user: string;
}

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
  // Use RTK Query to fetch users with driver role
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch,
  } = useGetAllUsersQuery({
    role: "driver",
    driver: "true",
  });

  //  react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
  } = useForm<DriverFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      licenseNumber: "",
      pricePerMile: "",
      hireDate: "",
      status: "",
      user: "",
    },
    mode: "onChange",
  });

  // when updating data
  useEffect(() => {
    if (formData) {
      Object.keys(formData).forEach((key) => {
        const fieldName = key as keyof DriverFormData;
        const value = formData[key as keyof TDriver];
        setValue(fieldName, value as never);
      });
    }
  }, [formData, setValue]);

  // Refetch users when component opens
  useEffect(() => {
    if (open) {
      refetch();
      if (!editMode) {
        reset();
      }
    }
  }, [open, refetch, editMode, reset]);

  // Extract users from response
  const users = usersData?.data || [];

  // Handle form submission
  const onSubmitForm = (data: DriverFormData) => {
    Object.keys(data).forEach((key) => {
      const field = key as keyof TDriver;
      const value = data[key as keyof DriverFormData];
      onChange(field, value as TDriver[keyof TDriver]);
    });
    onSubmit();
  };

  // Handle field change with validation
  const handleFieldChange = async (
    field: keyof DriverFormData,
    value: string | number
  ) => {
    setValue(field, value as never);
    await trigger(field);
    onChange(field as keyof TDriver, value as TDriver[keyof TDriver]);
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
              {editMode ? "Edit Driver" : "Add New Driver"}
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
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-slate-800">
                  Personal Information
                </h4>
              </div>
              <Divider sx={{ mb: 3 }} />
              <div className="space-y-4">
                {/* Name Field */}
                <div className="mb-5">
                  <Controller
                    name="name"
                    control={control}
                    rules={{
                      required: "Full name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                      maxLength: {
                        value: 50,
                        message: "Name must be less than 50 characters",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Full Name *"
                        error={!!errors.name}
                        helperText={errors.name?.message as string}
                        size="medium"
                        placeholder="John Doe"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IoPerson className="text-slate-400" />
                            </InputAdornment>
                          ),
                        }}
                        onChange={(e) =>
                          handleFieldChange("name", e.target.value)
                        }
                      />
                    )}
                  />
                </div>

                {/* Email Field */}
                <div className="mb-5">
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email *"
                        type="email"
                        error={!!errors.email}
                        helperText={errors.email?.message as string}
                        size="medium"
                        placeholder="john.doe@example.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IoMail className="text-slate-400" />
                            </InputAdornment>
                          ),
                        }}
                        onChange={(e) =>
                          handleFieldChange("email", e.target.value)
                        }
                      />
                    )}
                  />
                </div>

                {/* Phone Field */}
                <div className="mb-5">
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: "Invalid phone number format",
                      },
                      minLength: {
                        value: 8,
                        message: "Phone number must be at least 8 digits",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Phone *"
                        error={!!errors.phone}
                        helperText={errors.phone?.message as string}
                        size="medium"
                        placeholder="+1234567890"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IoCall className="text-slate-400" />
                            </InputAdornment>
                          ),
                        }}
                        onChange={(e) =>
                          handleFieldChange("phone", e.target.value)
                        }
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-slate-800">
                  Professional Information
                </h4>
              </div>
              <Divider sx={{ mb: 3 }} />
              <div className="space-y-4">
                {/* License Number Field */}
                <div className="mb-5">
                  <Controller
                    name="licenseNumber"
                    control={control}
                    rules={{
                      required: "License number is required",
                      minLength: {
                        value: 5,
                        message: "License number must be at least 5 characters",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="License Number *"
                        error={!!errors.licenseNumber}
                        helperText={errors.licenseNumber?.message as string}
                        size="medium"
                        placeholder="DL123456789"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IoCash className="text-slate-400" />
                            </InputAdornment>
                          ),
                        }}
                        onChange={(e) =>
                          handleFieldChange("licenseNumber", e.target.value)
                        }
                      />
                    )}
                  />
                </div>

                {/* Price Per Mile Field */}
                <div className="mb-5">
                  <Controller
                    name="pricePerMile"
                    control={control}
                    rules={{
                      required: "Price per mile is required",
                      min: {
                        value: 0,
                        message: "Price cannot be negative",
                      },
                      max: {
                        value: 1000,
                        message: "Price seems too high",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Price Per Mile *"
                        type="number"
                        placeholder="0.75"
                        error={!!errors.pricePerMile}
                        helperText={errors.pricePerMile?.message as string}
                        size="medium"
                        inputProps={{ min: 0, step: 0.1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IoCash className="text-slate-400" />
                            </InputAdornment>
                          ),
                        }}
                        onChange={(e) =>
                          handleFieldChange(
                            "pricePerMile",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    )}
                  />
                </div>

                {/* Hire Date Field */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="hireDate"
                    control={control}
                    rules={{
                      required: "Hire date is required",
                    }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Hire Date *"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) =>
                          handleFieldChange("hireDate", date ? date.toISOString() : "")
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.hireDate,
                            helperText: errors.hireDate?.message as string,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <IoCalendar className="text-slate-400" />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </div>
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
                      startAdornment={
                        <InputAdornment position="start">
                          <IoPerson className="text-slate-400" />
                        </InputAdornment>
                      }
                      onChange={(e) =>
                        handleFieldChange("status", e.target.value)
                      }
                    >
                      <MenuItem value="available">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label="Available"
                            color="success"
                            size="small"
                          />
                          <Typography>Available</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="busy">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip label="Busy" color="error" size="small" />
                          <Typography>Busy</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                    {errors.status && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ display: "block" }}
                      >
                        {errors.status.message as string}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </div>

            {/* Assign to users Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-slate-800">
                  Assign to User
                </h4>
              </div>
              <Divider sx={{ mb: 3 }} />
              <Controller
                name="user"
                control={control}
                rules={{ required: "User selection is required" }}
                render={({ field }) => (
                  <FormControl fullWidth size="medium" error={!!errors.user}>
                    <InputLabel>Select User *</InputLabel>
                    <Select
                      {...field}
                      label="Select User *"
                      error={!!errors.user}
                      disabled={usersLoading}
                      startAdornment={
                        <InputAdornment position="start">
                          <IoPerson className="text-slate-400" />
                        </InputAdornment>
                      }
                      onChange={(e) =>
                        handleFieldChange("user", e.target.value)
                      }
                    >
                      {usersLoading ? (
                        <MenuItem disabled>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CircularProgress size={16} />
                            <Typography>Loading users...</Typography>
                          </Box>
                        </MenuItem>
                      ) : usersError ? (
                        <MenuItem disabled>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography color="error">
                              {usersError
                                ? "Error loading users"
                                : "No users found"}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ) : users.length === 0 ? (
                        <MenuItem disabled>
                          <Typography>No drivers found</Typography>
                        </MenuItem>
                      ) : (
                        users.map((user: TUser) => (
                          <MenuItem key={user.id} value={user.id}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Chip
                                label={user.active ? "Active" : "Inactive"}
                                color={user.active ? "success" : "default"}
                                size="small"
                              />
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {user.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {user.email} • {user.jobId}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.user && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ display: "block" }}
                      >
                        {errors.user.message as string}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
              {!usersLoading && !usersError && users.length > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Found {users.length} driver(s)
                </Typography>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || usersLoading}
            className="w-full py-3 mt-5 cursor-pointer rounded-md bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium"
          >
            {isLoading
              ? editMode
                ? "Saving..."
                : "Creating..."
              : editMode
              ? "Save Changes"
              : "Create Driver"}
          </button>
        </form>
      </div>
    </div>
  );
};
