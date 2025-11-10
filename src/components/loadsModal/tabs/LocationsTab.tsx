import React, { lazy, Suspense, useEffect, useState } from "react";
import { Alert, Button, TextField } from "@mui/material";
import { IoArrowForward, IoAdd, IoClose } from "react-icons/io5";
import LocationAutocomplete, { TPlace } from "@/components/sections/LocationAutocomplete";

// Lazy load map components
const LazyGoogleMapsLoader = lazy(() => import("@/components/ui/GoogleMapsLoader"));
const LazyMapWithRoute = lazy(() => import("@/components/ui/MapWithRoute"));

interface LocationsTabProps {
  dho: TPlace | null;
  origin: TPlace | null;
  destinations: (TPlace | null)[];
  dhoToOriginDistance: number | null;
  averageTime: number | null;
  allDistance: string;
  formatTime: (hours: number) => string;
  dispatchFunctions: {
    setDho: (place: TPlace | null) => void;
    setOrigin: (place: TPlace | null) => void;
    addDestination: () => void;
    updateDestination: (index: number, place: TPlace | null) => void;
    removeDestination: (index: number) => void;
  };
  onNextTab: () => void;
  isTabValid: boolean;
}

const LocationsTab: React.FC<LocationsTabProps> = ({
  dho,
  origin,
  destinations,
  dhoToOriginDistance,
  averageTime,
  allDistance,
  formatTime,
  dispatchFunctions,
  onNextTab,
  isTabValid,
}) => {
  const [showMaps, setShowMaps] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    // Load maps when component mounts
    setShowMaps(true);
  }, []);

  const MapFallback = () => (
    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border border-gray-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading Maps...</p>
      </div>
    </div>
  );

  const handleMapsLoad = () => {
    setMapsLoaded(true);
    console.log("Maps loaded successfully");
  };

  const handleMapsError = (error: unknown) => {
    console.error("Failed to load maps:", error);
  };

  return (
    <div>
      {/* Information Message */}
      {allDistance && (
        <Alert severity="success" className="mb-5 p-3 border border-green-600">
          <div>
            <h4 className="text-md font-medium text-green-800">
              Route Distance Information
            </h4>
            <p className="text-sm text-green-700 mt-1">
              Total distance calculated from {dho ? "DHO" : "Origin"} through all destinations:{" "}
              <strong>{allDistance} miles</strong>
            </p>
            {dho && origin && (
              <p className="text-sm text-green-600 mt-1">
                • DHO to Origin: {dhoToOriginDistance?.toFixed(2) || "0"} miles
              </p>
            )}
            {destinations.filter((d) => d !== null).length > 0 && (
              <p className="text-sm text-green-600">
                • Including {destinations.filter((d) => d !== null).length} destination(s)
              </p>
            )}
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Direction */}
        <div className="space-y-6">
          <LocationAutocomplete
            label="DHO (Driver Home Origin)"
            value={dho}
            setValue={dispatchFunctions.setDho}
            placeholder="Enter driver's starting location"
          />

          <LocationAutocomplete
            label="Pick Up (Origin)"
            value={origin}
            setValue={dispatchFunctions.setOrigin}
            placeholder="Enter origin address"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                DHO to Origin Distance
              </label>
              <TextField
                fullWidth
                type="text"
                value={dhoToOriginDistance ? `${dhoToOriginDistance.toFixed(2)} miles` : ""}
                className="bg-slate-50"
                placeholder="Distance will auto-calculate"
                InputProps={{ readOnly: true }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Average Time To Pickup
              </label>
              <TextField
                fullWidth
                type="text"
                value={averageTime ? `${formatTime(averageTime)}` : ""}
                className="bg-slate-50"
                placeholder="Time will auto-calculate"
                InputProps={{ readOnly: true }}
              />
            </div>
          </div>

          {/* Destinations Section */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <label className="block text-sm font-medium text-slate-700 mb-2 md:mb-0">
                Destinations <span className="text-red-500">*</span>
              </label>
              <Button
                variant="contained"
                type="button"
                onClick={dispatchFunctions.addDestination}
                className="flex items-center w-full md:w-fit gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <IoAdd size={16} />
                Add Destination
              </Button>
            </div>

            {destinations.map((destination, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <LocationAutocomplete
                    label={`Destination ${index + 1}`}
                    value={destination}
                    setValue={(place) => dispatchFunctions.updateDestination(index, place)}
                    placeholder={`Enter destination ${index + 1} address`}
                  />
                </div>

                {destinations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => dispatchFunctions.removeDestination(index)}
                    className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <IoClose size={20} />
                  </button>
                )}
              </div>
            ))}

            {destinations.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-lg bg-gray-50">
                <p className="text-gray-500 font-medium">
                  No destinations added yet
                </p>
                <p className="text-gray-400 text-sm px-3 mt-1">
                  You must add at least one destination to continue
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Maps - Load only when needed */}
        <div className="grid grid-cols-1 gap-6">
          {showMaps ? (
            <Suspense fallback={<MapFallback />}>
              <LazyGoogleMapsLoader
                onLoad={handleMapsLoad}
                onError={handleMapsError}
              >
                <LazyMapWithRoute
                  dho={dho}
                  origin={origin}
                  destinations={destinations}
                  height="350px"
                />
              </LazyGoogleMapsLoader>
            </Suspense>
          ) : (
            <MapFallback />
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNextTab}
          disabled={!isTabValid}
          className={`uppercase flex items-center gap-2 py-2 px-6 rounded-lg font-medium transition-colors ${
            isTabValid
              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          Next
          <IoArrowForward size={16} />
        </button>
      </div>
    </div>
  );
};

export default LocationsTab;