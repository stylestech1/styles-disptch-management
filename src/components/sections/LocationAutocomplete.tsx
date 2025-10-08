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
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    county?: string;
    postcode?: string;
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

  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          input
        )}&countrycodes=US&format=json&addressdetails=1&limit=5`;

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
            const city = address.city || address.town || address.village || "";
            const state = address.state || "";
            const country = address.country || "";
            const postcode = address.postcode || "";

            if (!city && !state && !postcode) {
              return null;
            }

            const formattedDisplayName = [city, state, postcode, country]
              .filter(Boolean)
              .join(", ");

            return {
              place_id: p.place_id,
              lat: p.lat,
              lon: p.lon,
              display_name: formattedDisplayName || display_name,
              postcode: postcode || undefined,
            };
          })
          .filter((p): p is TPlace => p !== null); 

        setSuggestions(filtered);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error fetching places:", err);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
  };

  const handleSelectPlace = (place: TPlace) => {
    setValue(place);
    setInput(place.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (e.target.value.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && input.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const formatSuggestionDisplay = (place: TPlace) => {
    if (!showZipCode) {
      return place.display_name;
    }

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
          placeholder={placeholder || "Type a state or city"}
          className="border p-2 rounded w-full pr-10"
        />

        {input && (
          <button
            type="button"
            onClick={clearValue}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute top-full left-0 bg-white border p-2 w-full z-50 shadow-lg rounded-b">
          Loading...
        </div>
      )}

      {!loading && showSuggestions && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 bg-white border w-full max-h-40 overflow-auto z-50 shadow-lg rounded-b">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              className="p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
              onClick={() => handleSelectPlace(s)}
            >
              <div className="text-sm">
                {formatSuggestionDisplay(s)}
              </div>
              {showZipCode && s.postcode && (
                <div className="text-xs text-green-600 mt-1 font-medium">
                  ZIP: {s.postcode}
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
          <div className="absolute top-full left-0 bg-white border p-2 w-full z-50 shadow-lg rounded-b text-gray-500">
            No results found
          </div>
        )}
    </div>
  );
};

export default LocationAutocomplete;