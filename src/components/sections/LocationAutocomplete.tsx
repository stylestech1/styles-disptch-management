"use client";
import { RootState, useAppSelector } from "@/redux/store";
import { Label } from "@mui/icons-material";
import { alpha, Box, Button, TextField, Typography } from "@mui/material";
import { useState, useEffect, useRef } from "react";

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

type NominatimResult = {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    county?: string;
    postcode?: string;
    suburb?: string;
  };
};

interface Props {
  label: string;
  value: TPlace | null;
  setValue: (place: TPlace | null) => void;
  placeholder?: string;
  showZipCode?: boolean;
}

const LocationAutocomplete = ({
  label,
  value,
  setValue,
  placeholder,
  showZipCode = true,
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

  useEffect(() => {
    if (value?.display_name && value.display_name !== input) {
      setInput(value.display_name);
    }
  }, [value, input]);

  useEffect(() => {
    if (isSelecting || !shouldSearch || input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          input
        )}&countrycodes=US&addressdetails=1&limit=5&dedupe=1`;

        const res = await fetch(url, {
          headers: {
            "User-Agent": "MyApp/1.0 (stylestech1@gmail.com)",
            Referrer: window.location.origin,
          },
        });

        const data: NominatimResult[] = await res.json();

        const filtered: TPlace[] = data
          .map((p): TPlace | null => {
            const { address, display_name } = p;

            const houseNumber = address.house_number || "";
            const road = address.road || "";
            const city =
              address.city ||
              address.town ||
              address.village ||
              address.suburb ||
              "";
            const state = address.state || "";
            const country = address.country || "";
            const postcode = address.postcode || "";

            const streetAddress = [houseNumber, road].filter(Boolean).join(" ");
            const formattedDisplayName = [
              streetAddress,
              city,
              state,
              postcode,
              country,
            ]
              .filter(Boolean)
              .join(", ");

            if (!streetAddress && !city && !state && !postcode) {
              return {
                place_id: p.place_id,
                lat: p.lat,
                lon: p.lon,
                display_name: display_name,
                postcode: postcode || undefined,
              };
            }

            return {
              place_id: p.place_id,
              lat: p.lat,
              lon: p.lon,
              display_name: formattedDisplayName || display_name,
              postcode: postcode || undefined,
            };
          })
          .filter((p): p is TPlace => p !== null);

        const uniqueSuggestions = filtered.filter(
          (place, index, self) =>
            index ===
            self.findIndex((p) => p.display_name === place.display_name)
        );

        setSuggestions(uniqueSuggestions);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error fetching places:", err);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [input, isSelecting, shouldSearch]);

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

  const handleSelectPlace = (place: TPlace) => {
    setIsSelecting(true);
    setShouldSearch(false);

    setValue(place);
    setInput(place.display_name);
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
