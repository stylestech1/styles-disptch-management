"use client";
import { useState, useEffect, useRef } from "react";

export type TPlace = {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  postcode?: string;
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

  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (isSelecting) return;

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
  }, [input, isSelecting]);

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
  };

  const handleSelectPlace = (place: TPlace) => {
    setIsSelecting(true);

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
    setInput(e.target.value);
    if (e.target.value.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && input.length >= 2 && !isSelecting) {
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

  const formatSuggestionDisplay = (place: TPlace) => {
    return place.display_name;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block mb-1 font-medium">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder || "Enter address, city, state or ZIP"}
          className="border p-2 rounded w-full pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {input && (
          <button
            type="button"
            onClick={clearValue}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            ✕
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute top-full left-0 bg-white border p-2 w-full z-50 shadow-lg rounded-b">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Searching...
          </div>
        </div>
      )}

      {!loading && showSuggestions && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 bg-white border w-full max-h-60 overflow-auto z-50 shadow-lg rounded-b">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              className="p-3 cursor-pointer hover:bg-blue-50 border-b last:border-b-0 transition-colors"
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
            </li>
          ))}
        </ul>
      )}

      {!loading &&
        showSuggestions &&
        suggestions.length === 0 &&
        input.length >= 2 && (
          <div className="absolute top-full left-0 bg-white border p-3 w-full z-50 shadow-lg rounded-b text-gray-500">
            No locations found. Try a different search term.
          </div>
        )}
    </div>
  );
};

export default LocationAutocomplete;
