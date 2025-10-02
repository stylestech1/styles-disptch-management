"use client";
import { useState, useEffect } from "react";

export type TPlace = {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
};

interface Props {
  label: string;
  value: TPlace | null;
  setValue: (place: TPlace) => void;
  placeholder?: string;
}

const LocationAutocomplete = ({
  label,
  value,
  setValue,
  placeholder,
}: Props) => {
  const [input, setInput] = useState(value?.display_name || "");
  const [suggestions, setSuggestions] = useState<TPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]);
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

        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [input]);

  return (
    <div className="relative w-full">
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder || "Type a state, city or district"}
        className="border p-2 rounded w-full"
      />
      {loading && (
        <div className="absolute top-full left-0 bg-white border p-2 w-full z-50">
          Loading...
        </div>
      )}
      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 bg-white border w-full max-h-40 overflow-auto z-50">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setValue(s);
                setInput(s.display_name);
                setSuggestions([]);
              }}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
