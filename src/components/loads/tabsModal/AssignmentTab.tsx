'use client'

import { useGetDriversQuery, useGetTrucksQuery } from "@/redux/slices/apiSlice";
import { RootState, useAppSelector } from "@/redux/store";
import { AssignmentTabProps, TDriver, TTruck, TTruckType } from "@/types/globalTypes";
import { Alert, alpha, Button, FormControl, InputAdornment, MenuItem, Select, TextField, Typography } from "@mui/material";
import { IoCheckmark } from "react-icons/io5";
import { RxUpdate } from "react-icons/rx";

// Assignment Tab Component
const AssignmentTab: React.FC<AssignmentTabProps> = ({
  isEditing,
  editingLoad,
  driverId,
  truckId,
  truckType,
  truckTemp,
  onDriverIdChange,
  onTruckIdChange,
  onTruckTypeChange,
  onTruckTempChange,
  isTabValid,
  onPrevTab,
  isLoading,
}) => {
  const token = useAppSelector((state: RootState) => state.auth.token);

  const { data: driversData, refetch: driverRefetch } = useGetDriversQuery({
    skip: !token,
  });
  const { data: trucksData, refetch: truckRefetch } = useGetTrucksQuery({
    skip: !token,
  });

  const drivers = driversData?.data || [];
  const trucks = trucksData?.data || [];
  const theme = useAppSelector((state: RootState) => state.palette);

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Driver - Display Only */}
          <div>
            <Typography
              sx={{
                color: theme.currentPalette.primary,
                fontSize: "14px",
                fontWeight: "bold",
                display: "block",
                mb: 1,
              }}
            >
              Driver{" "}
              <Typography variant="subtitle2" sx={{ color: theme.currentPalette.text }}>
                ✓ Assigned
              </Typography>
            </Typography>
            <div className="relative">
              <TextField
                aria-readonly
                type="text"
                value={editingLoad?.driverId?.name || "No driver assigned"}
                sx={{
                  bgcolor: theme.currentPalette.background,
                  width: "100%",
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IoCheckmark className="h-5 w-5 text-green-600" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
            {editingLoad?.driverId?.phone && (
              <p className="text-xs text-slate-500 mt-1">
                Phone: {editingLoad.driverId.phone}
              </p>
            )}
          </div>

          {/* Truck Type - Display Only */}
          <div>
            <Typography
              sx={{
                color: theme.currentPalette.primary,
                fontSize: "14px",
                fontWeight: "bold",
                display: "block",
                mb: 1,
              }}
            >
              Truck Type{" "}
              <Typography variant="subtitle2" sx={{ color: theme.currentPalette.text }}>
                ✓ Assigned
              </Typography>
            </Typography>
            <div className="relative">
              <TextField
                aria-readonly
                type="text"
                value={
                  editingLoad?.truckType
                    ? `${
                        editingLoad.truckType.charAt(0).toUpperCase() +
                        editingLoad.truckType.slice(1)
                      }`
                    : "No type assigned"
                }
                sx={{
                  bgcolor: theme.currentPalette.background,
                  width: "100%",
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IoCheckmark className="h-5 w-5 text-green-600" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
          </div>

          {/* Truck - Display Only */}
          <div>
            <Typography
              sx={{
                color: theme.currentPalette.primary,
                fontSize: "14px",
                fontWeight: "bold",
                display: "block",
                mb: 1,
              }}
            >
              Truck{" "}
              <Typography variant="subtitle2" sx={{ color: theme.currentPalette.text }}>
                ✓ Assigned
              </Typography>
            </Typography>
            <div className="relative">
              <TextField
                aria-readonly
                type="text"
                value={
                  editingLoad?.truckId
                    ? `${editingLoad.truckId.model} (${editingLoad.truckId.plateNumber})`
                    : "No truck assigned"
                }
                sx={{
                  bgcolor: theme.currentPalette.background,
                  width: "100%",
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IoCheckmark className="h-5 w-5 text-green-600" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
            {editingLoad?.truckId && (
              <p className="text-xs text-slate-500 mt-1">
                Truck ID: {editingLoad.truckId.truckId}
              </p>
            )}
          </div>

          {/* Temperature - Display Only */}
          <div>
            <Typography
              sx={{
                color: theme.currentPalette.primary,
                fontSize: "14px",
                fontWeight: "bold",
                display: "block",
                mb: 1,
              }}
            >
              Temperature{" "}
              <Typography variant="subtitle2" sx={{ color: theme.currentPalette.text }}>
                ✓ Set
              </Typography>
            </Typography>
            <div className="relative">
              <TextField
                aria-readonly
                type="text"
                value={
                  editingLoad?.truckTemp
                    ? `${editingLoad.truckTemp}°C`
                    : "Not set"
                }
                sx={{
                  bgcolor: theme.currentPalette.background,
                  width: "100%",
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IoCheckmark className="h-5 w-5 text-green-600" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Information Message */}
        <Alert
          severity="info"
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex flex-col items-start gap-1">
            <h4 className="text-md font-medium">Driver & Truck Information</h4>
            <p className="text-sm">
              Driver and truck assignments cannot be modified for existing
              loads. This ensures consistency in load tracking and driver
              assignments.
            </p>
          </div>
        </Alert>

        <div className="flex justify-between pt-4">
          <Button
            sx={{
              bgcolor: theme.currentPalette.primary,
              color: theme.currentPalette.background,
            }}
            type="button"
            onClick={onPrevTab}
          >
            Back
          </Button>
          <Button
            sx={{
              bgcolor: theme.currentPalette.primary,
              color: theme.currentPalette.background,
            }}
            type="submit"
            disabled={!isTabValid || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <RxUpdate size={18} />
                Update Load
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5">
        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Driver <span className="text-red-600">*</span>
          </Typography>
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              value={driverId}
              displayEmpty
              required
              onOpen={() => {
                driverRefetch();
                truckRefetch();
              }}
              onChange={(e) => onDriverIdChange(e.target.value)}
            >
              <MenuItem value="" disabled>
                Select Driver
              </MenuItem>
              {drivers.map((d: TDriver, i: number) => (
                <MenuItem key={i} value={d.id}>
                  {d.name} ({d.driverId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Truck Type <span className="text-red-600">*</span>
          </Typography>
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              displayEmpty
              required
              value={truckType}
              onChange={(e) => onTruckTypeChange(e.target.value as TTruckType)}
            >
              <MenuItem value="" disabled>
                Select Type
              </MenuItem>
              <MenuItem value={"reefer"}>Reefer</MenuItem>
              <MenuItem value={"van"}>Van</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Truck <span className="text-red-600">*</span>
          </Typography>
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              displayEmpty
              required
              value={truckId}
              onChange={(e) => onTruckIdChange(e.target.value)}
              disabled={!truckType}
            >
              <MenuItem value="" disabled>
                Select Truck
              </MenuItem>
              {Array.isArray(trucks) ? (
                trucks
                  .filter((t: TTruck) => !truckType || t.type === truckType)
                  .map((t: TTruck, i: number) => (
                    <MenuItem key={i} value={t.id}>
                      {t.model} ({t.plateNumber}) - {t.type}
                    </MenuItem>
                  ))
              ) : (
                <MenuItem disabled>No trucks available</MenuItem>
              )}
            </Select>
          </FormControl>
        </div>

        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Temperature
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={truckTemp}
            onChange={(e) => onTruckTempChange(e.target.value)}
            placeholder="-10"
            disabled={
              !truckId ||
              (Array.isArray(trucks.data) &&
                trucks.data
                  .find((t: TTruck) => t.id === String(truckId))
                  ?.type?.toLowerCase() !== "reefer")
            }
            sx={{
              bgcolor: theme.currentPalette.background,
              width: "100%",
              "& .MuiInputBase-root.Mui-disabled": {
                cursor: "not-allowed",
                backgroundColor: alpha(theme.currentPalette.primary, 0.1),
              },
            }}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          sx={{
            bgcolor: theme.currentPalette.primary,
            color: theme.currentPalette.background,
          }}
          type="button"
          onClick={onPrevTab}
        >
          Back
        </Button>
        <Button
          sx={{
            bgcolor: theme.currentPalette.primary,
            color: theme.currentPalette.background,
          }}
          type="submit"
          disabled={!isTabValid || isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>Create Load</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AssignmentTab