import React from "react";
import {
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Alert,
  Button,
} from "@mui/material";
import { IoArrowBack, IoAdd, IoCheckmark } from "react-icons/io5";
import { useGetDriversQuery, useGetTrucksQuery } from "@/redux/slices/apiSlice";
import { TDriver, TLoads, TTruck, TTruckType } from "@/types/globalTypes";
import { RxUpdate } from "react-icons/rx";

interface AssignmentTabProps {
  driverId: string;
  truckId: string;
  truckType: TTruckType;
  truckTemp: string;
  isEditing: boolean;
  editingLoad: TLoads | null;
  dispatchFunctions: {
    setDriverId: (value: string) => void;
    setTruckId: (value: string) => void;
    setTruckType: (value: TTruckType) => void;
    setTruckTemp: (value: string) => void;
  };

  onPrevTab: () => void;
  isTabValid: boolean;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const AssignmentTab: React.FC<AssignmentTabProps> = ({
  driverId,
  truckId,
  truckType,
  truckTemp,
  isEditing,
  editingLoad,
  dispatchFunctions,
  onPrevTab,
  isTabValid,
  isLoading,
  onSubmit,
}) => {
  const { data: driversData } = useGetDriversQuery();
  const { data: trucksData } = useGetTrucksQuery();

  const drivers = driversData?.data || [];
  const trucks = trucksData?.data?.data || [];

  // Handlers
  const handleDriverIdChange = (value: string) => {
    dispatchFunctions.setDriverId(value);
  };

  const handleTruckIdChange = (value: string) => {
    dispatchFunctions.setTruckId(value);
  };

  const handleTruckTypeChange = (value: TTruckType) => {
    dispatchFunctions.setTruckType(value);
  };

  const handleTruckTempChange = (value: string) => {
    dispatchFunctions.setTruckTemp(value);
  };

  if (isEditing && editingLoad) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Driver - Display Only */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Driver <span className="text-green-600">✓ Assigned</span>
            </label>
            <TextField
              fullWidth
              type="text"
              value={editingLoad?.driverId?.name || "No driver assigned"}
              className="bg-slate-50"
              placeholder="Driver information"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IoCheckmark className="h-5 w-5 text-green-600" />
                  </InputAdornment>
                ),
              }}
            />
            {editingLoad?.driverId?.phone && (
              <p className="text-xs text-slate-500 mt-1">
                Phone: {editingLoad.driverId.phone}
              </p>
            )}
          </div>

          {/* Truck Type - Display Only */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Truck Type <span className="text-green-600">✓ Assigned</span>
            </label>
            <TextField
              fullWidth
              type="text"
              value={
                editingLoad?.truckType
                  ? `${
                      editingLoad.truckType.charAt(0).toUpperCase() +
                      editingLoad.truckType.slice(1)
                    }`
                  : "No type assigned"
              }
              className="bg-slate-50"
              placeholder="Truck type information"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IoCheckmark className="h-5 w-5 text-green-600" />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {/* Truck - Display Only */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Truck <span className="text-green-600">✓ Assigned</span>
            </label>
            <TextField
              fullWidth
              type="text"
              value={
                editingLoad?.truckId
                  ? `${editingLoad.truckId.model} (${editingLoad.truckId.plateNumber})`
                  : "No truck assigned"
              }
              className="bg-slate-50"
              placeholder="Truck information"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IoCheckmark className="h-5 w-5 text-green-600" />
                  </InputAdornment>
                ),
              }}
            />
            {editingLoad?.truckId && (
              <p className="text-xs text-slate-500 mt-1">
                Truck ID: {editingLoad.truckId.truckId}
              </p>
            )}
          </div>

          {/* Temperature - Display Only */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Temperature <span className="text-green-600">✓ Set</span>
            </label>
            <TextField
              fullWidth
              type="text"
              value={
                editingLoad?.truckTemp
                  ? `${editingLoad.truckTemp}°C`
                  : "Not set"
              }
              className="bg-slate-50"
              placeholder="Temperature information"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IoCheckmark className="h-5 w-5 text-green-600" />
                  </InputAdornment>
                ),
              }}
            />
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
          <button
            type="button"
            onClick={onPrevTab}
            className="uppercase cursor-pointer flex items-center gap-2 py-2 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            <IoArrowBack size={16} />
            Back
          </button>
          <button
            type="submit"
            onClick={onSubmit}
            disabled={isLoading}
            className={`uppercase flex items-center gap-2 py-2 px-6 rounded-lg font-medium transition-colors ${
              !isLoading
                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              <>
                <RxUpdate size={18} />
                Update Load
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Driver <span className="text-red-500">*</span>
          </label>
          <FormControl fullWidth>
            <Select
              value={driverId}
              displayEmpty
              required
              onChange={(e) => handleDriverIdChange(e.target.value)}
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
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Truck Type <span className="text-red-500">*</span>
          </label>
          <FormControl fullWidth>
            <Select
              displayEmpty
              required
              value={truckType}
              onChange={(e) => handleTruckTypeChange(e.target.value as TTruckType)}

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
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Truck <span className="text-red-500">*</span>
          </label>
          <FormControl fullWidth>
            <Select
              displayEmpty
              required
              value={truckId}
              onChange={(e) => handleTruckIdChange(e.target.value)}

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
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Temperature{" "}
            {truckType === "reefer" && <span className="text-red-500">*</span>}
          </label>
          <TextField
            fullWidth
            type="number"
            value={truckTemp}
            onChange={(e) => handleTruckTempChange(e.target.value)}

            placeholder="-10"
            disabled={
              !truckId ||
              (Array.isArray(trucks) &&
                trucks
                  .find((t: TTruck) => t.id === String(truckId))
                  ?.type?.toLowerCase() !== "reefer")
            }
            sx={{
              "& .MuiInputBase-root.Mui-disabled": {
                cursor: "not-allowed",
                backgroundColor: "#f5f5f5",
              },
            }}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrevTab}
          className="uppercase cursor-pointer flex items-center gap-2 py-2 px-6 text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
        >
          <IoArrowBack size={16} />
          Back
        </button>
        <button
          type="submit"
          onClick={onSubmit}
          disabled={!isTabValid || isLoading}
          className={`uppercase flex items-center gap-2 py-2 px-6 text-sm rounded-lg font-medium transition-colors ${
            isTabValid && !isLoading
              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>
              <IoAdd size={18} />
              Create Load
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AssignmentTab;
