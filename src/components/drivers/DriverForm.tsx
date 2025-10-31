// Add this import at the top
import { TDriver, TUser } from "@/types/globalTypes";
import { Alert, Box, Button, Chip, CircularProgress, Divider, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useEffect } from "react";
import { IoAdd, IoCalendar, IoCall, IoCash, IoClose, IoMail, IoPerson } from "react-icons/io5";
import { useGetAllUsersQuery } from "@/redux/slices/apiSlice"; 

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
    refetch 
  } = useGetAllUsersQuery({ 
    role: "driver",
    driver: "true" // Add this parameter if needed based on your API
  });

  // Refetch users when component opens
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  // Extract users from response
  const users = usersData?.data || [];

  // Handle number input change for pricePerMile
  const handleNumberChange = (value: string) => {
    if (value === '' || value === null || value === undefined) {
      onChange("pricePerMile", 0);
    } else {
      const numValue = parseFloat(value);
      onChange("pricePerMile", numValue);
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
        <div className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-slate-800">Personal Information</h4>
            </div>
            <Divider sx={{ mb: 3 }} />
            <div className="space-y-4">
              <TextField
                fullWidth
                label="Full Name *"
                name="name"
                value={formData.name || ""}
                onChange={(e) => onChange("name", e.target.value)}
                size="medium"
                placeholder="e.g., John Doe"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IoPerson className="text-slate-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981',
                  },
                  marginBottom: '16px',
                }}
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IoMail className="text-slate-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981',
                  },
                  marginBottom: '16px',
                }}
              />

              <TextField 
                fullWidth
                label="Phone *"
                name="phone"
                value={formData.phone || ""}
                onChange={(e) => onChange("phone", e.target.value)}
                size="medium"
                placeholder="e.g., +1234567890"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IoCall className="text-slate-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981',
                  },
                }}
              />
            </div>
          </div>

          {/* Professional Information Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-slate-800">Professional Information</h4>
            </div>
            <Divider sx={{ mb: 3 }} />
            <div className="space-y-4">
              <TextField
                fullWidth
                label="License Number *"
                name="licenseNumber"
                value={formData.licenseNumber || ""}
                onChange={(e) => onChange("licenseNumber", e.target.value)}
                size="medium"
                placeholder="e.g., DL123456789"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IoCash className="text-slate-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981',
                  },
                  marginBottom: '16px',
                }}
              />

              <TextField
                fullWidth
                label="Price Per Mile *"
                name="pricePerMile"
                type="number"
                value={formData.pricePerMile ?? ""}
                onChange={(e) => handleNumberChange(e.target.value)}
                size="medium"
                inputProps={{ min: 0, step: 0.1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IoCash className="text-slate-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981',
                  },
                  marginBottom: '16px',
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IoCalendar className="text-slate-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981',
                  },
                }}
              />
            </div>
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
                startAdornment={
                  <InputAdornment position="start">
                    <IoPerson className="text-slate-400" />
                  </InputAdornment>
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981',
                  },
                }}
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
              </Select>
            </FormControl>
          </div>

          {/* Assign to users Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-slate-800">Assign to User</h4>
            </div>
            <Divider sx={{ mb: 3 }} />
            <FormControl fullWidth size="medium">
              <InputLabel>Select User *</InputLabel>
              <Select
                label="Select User *"
                name="user"
                value={formData.user || ""}
                onChange={(e) => onChange("user", e.target.value)}
                disabled={usersLoading}
                startAdornment={
                  <InputAdornment position="start">
                    <IoPerson className="text-slate-400" />
                  </InputAdornment>
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981',
                  },
                }}
              >
                {usersLoading ? (
                  <MenuItem disabled>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography>Loading users...</Typography>
                    </Box>
                  </MenuItem>
                ) : usersError ? (
                  <MenuItem disabled>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography color="error">
                        {usersError ? "Error loading users" : "No users found"}
                      </Typography>
                    </Box>
                  </MenuItem>
                ) : users.length === 0 ? (
                  <MenuItem disabled>
                    <Typography>No drivers found</Typography>
                  </MenuItem>
                ) : (
                  users.map((user : TUser) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip 
                          label={user.active ? "Active" : "Inactive"} 
                          color={user.active ? "success" : "default"} 
                          size="small" 
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email} • {user.jobId}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {!usersLoading && !usersError && users.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Found {users.length} driver(s)
              </Typography>
            )}
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
            disabled={isLoading || usersLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium"
          >
            {isLoading
              ? editMode
                ? "Saving..."
                : "Creating..."
              : editMode
              ? "Save Changes"
              : "Create Driver"}
          </Button>
        </div>
      </div>
    </div>
  );
};