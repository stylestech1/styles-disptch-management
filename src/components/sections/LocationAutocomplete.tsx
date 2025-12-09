"use client";
import { RootState, useAppSelector } from "@/redux/store";
import { alpha, Box, Button, TextField, Typography } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export type TPlace = {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  postcode?: string;
  address?: {
    [key: string]: string;
  };
};

interface Props {
  label: string;
  value: TPlace | null;
  setValue: (place: TPlace | null) => void;
  placeholder?: string;
  showZipCode?: boolean;
  googleMapsApiKey: string; // Add this prop for Google API key
}

const LocationAutocomplete = ({
  label,
  value,
  setValue,
  placeholder,
  showZipCode = true,
  googleMapsApiKey, // Receive API key as prop
}: Props) => {
  const [input, setInput] = useState(value?.display_name || "");
  const [suggestions, setSuggestions] = useState<TPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [shouldSearch, setShouldSearch] = useState(true);
  const theme = useAppSelector((state: RootState) => state.palette);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize Google Maps services
  useEffect(() => {
    const initGoogleMaps = async () => {
      if (!googleMapsApiKey) {
        console.error('Google Maps API key is required');
        return;
      }

      try {
        const loader = new Loader({
          apiKey: googleMapsApiKey,
          version: "weekly",
          libraries: ["places"]
        });

        await loader.load();
        
        // Initialize services
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        
        // Create a dummy div for PlacesService
        const dummyDiv = document.createElement('div');
        placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initGoogleMaps();
  }, [googleMapsApiKey]);

  useEffect(() => {
    if (value?.display_name && value.display_name !== input) {
      setInput(value.display_name);
    }
  }, [value, input]);

  // Fetch suggestions using Google Places API
  useEffect(() => {
    if (isSelecting || !shouldSearch || input.length < 2 || !autocompleteServiceRef.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        // Request autocomplete predictions
        const request: google.maps.places.AutocompletionRequest = {
          input,
          componentRestrictions: { country: 'us' },
          types: ['address'], // You can change this to ['geocode'] for more general results
        };

        autocompleteServiceRef.current!.getPlacePredictions(
          request,
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              const formattedPredictions: TPlace[] = predictions.map(prediction => ({
                place_id: prediction.place_id,
                display_name: prediction.description,
                lat: '',
                lon: '',
                postcode: undefined,
                address: {}
              }));

              setSuggestions(formattedPredictions);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error fetching places:", err);
        setShowSuggestions(false);
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [input, isSelecting, shouldSearch]);

  // Get place details when a suggestion is selected
  const getPlaceDetails = (placeId: string): Promise<TPlace | null> => {
    return new Promise((resolve) => {
      if (!placesServiceRef.current) {
        resolve(null);
        return;
      }

      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: [
          'formatted_address',
          'geometry',
          'place_id',
          'address_components',
          'name'
        ]
      };

      placesServiceRef.current.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          // Extract postal code from address components
          let postcode: string | undefined;
          const postalCodeComponent = place.address_components?.find(
            component => component.types.includes('postal_code')
          );
          if (postalCodeComponent) {
            postcode = postalCodeComponent.long_name;
          }

          // Extract address components
          const address: { [key: string]: string } = {};
          place.address_components?.forEach(component => {
            component.types.forEach(type => {
              address[type] = component.long_name;
            });
          });

          const result: TPlace = {
            place_id: place.place_id!,
            lat: place.geometry?.location?.lat().toString() || '',
            lon: place.geometry?.location?.lng().toString() || '',
            display_name: place.formatted_address || place.name || '',
            postcode,
            address
          };
          resolve(result);
        } else {
          resolve(null);
        }
      });
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clearValue = () => {
    setValue(null);
    setInput("");
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSelecting(false);
    setShouldSearch(true);
  };

  const handleSelectPlace = async (place: TPlace) => {
    setIsSelecting(true);
    setShouldSearch(false);

    // Get full place details including coordinates
    const placeDetails = await getPlaceDetails(place.place_id);
    
    if (placeDetails) {
      setValue(placeDetails);
      setInput(placeDetails.display_name);
    } else {
      // Fallback to the basic info if details fetch fails
      setValue(place);
      setInput(place.display_name);
    }
    
    setSuggestions([]);
    setShowSuggestions(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }

    setTimeout(() => {
      setIsSelecting(false);
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    setShouldSearch(true);

    if (newValue.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && input.length >= 2 && !isSelecting) {
      setShowSuggestions(true);
    } else if (input.length >= 2 && shouldSearch) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!isSelecting) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" || e.key === "Tab") {
      setShowSuggestions(false);
    }
  };

  const formatSuggestionDisplay = (place: TPlace) => {
    return place.display_name;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Typography
        sx={{
          color: theme.currentPalette.primary,
          fontSize: "16px",
          fontWeight: "bold",
          display: "block",
          mb: 1,
        }}
      >
        {label} <span className="text-red-500">*</span>
      </Typography>
      <div className="flex items-end gap-5">
        <div className="relative flex items-end gap-4 w-full">
          <TextField
            inputRef={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder || "Enter address, city, state or ZIP"}
            variant="outlined"
            fullWidth
            size="small"
            sx={{
              bgcolor: theme.currentPalette.background,
            }}
            slotProps={{
              input: {
                endAdornment: input && (
                  <Button
                    onClick={clearValue}
                    type="button"
                    variant="text"
                    size="small"
                    sx={{
                      minWidth: 0,
                      padding: 0.5,
                      color: "red",
                    }}
                  >
                    ✕
                  </Button>
                ),
              },
            }}
          />
        </div>
      </div>

      {loading && (
        <Box
          sx={{ bgcolor: theme.currentPalette.background }}
          className="absolute top-17 left-0 border p-2 w-full z-50 shadow-lg rounded-b"
        >
          <div className="flex items-center justify-center">
            <Box className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2" sx={{borderColor: theme.currentPalette.primary}}></Box>
            <Typography sx={{color: theme.currentPalette.primary}}>Searching...</Typography>
          </div>
        </Box>
      )}

      {!loading && showSuggestions && suggestions.length > 0 && (
        <Box component={'ul'} sx={{bgcolor: theme.currentPalette.background}} className="absolute top-17 left-0 border w-full max-h-60 overflow-auto z-50 shadow-lg rounded-b">
          {suggestions.map((s) => (
            <Box component={'li'}
              sx={{'&:hover': {bgcolor: alpha(theme.currentPalette.primary, 0.1)}}}
              key={s.place_id}
              className="p-3 cursor-pointer border-b last:border-b-0 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectPlace(s);
              }}
            >
              <div className="text-sm font-medium text-gray-800">
                {formatSuggestionDisplay(s)}
              </div>
              {showZipCode && s.postcode && (
                <div className="text-xs text-green-600 mt-1 font-semibold">
                  📮 ZIP: {s.postcode}
                </div>
              )}
            </Box>
          ))}
        </Box>
      )}

      {!loading &&
        showSuggestions &&
        suggestions.length === 0 &&
        input.length >= 2 && (
          <Box
          sx={{ bgcolor: theme.currentPalette.background }}
          className="absolute top-17 left-0 border p-2 w-full z-50 shadow-lg rounded-b"
        >
            <Typography sx={{color: theme.currentPalette.primary}}>No locations found. Try a different search term.</Typography>
          </Box>
        )}
    </div>
  );
};

export default LocationAutocomplete;