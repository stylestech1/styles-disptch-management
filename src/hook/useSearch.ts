"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  useSearchLoadsQuery,
  useSearchDriversQuery, 
  useSearchTrucksQuery 
} from "@/redux/slices/apiSlice";

export const useSearch = (entity: "drivers" | "trucks" | "loads") => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const searchParams = useMemo(() => {
    const term = debouncedSearch;
    if (!term) return undefined;

    switch (entity) {
      case "drivers":
        if (/^\d+$/.test(term)) return { driverId: term };
        if (/^\d{10,}$/.test(term)) return { phone: term };
        return { name: term };

      case "trucks":
        if (/^\d+$/.test(term)) return { truckId: term };
        return { model: term, licensePlate: term };

      case "loads":
        if (/^\d+$/.test(term)) return { loadId: term };
        if (term.includes("→") || term.includes("-")) {
          const [origin, destination] = term.split(/→|-/).map(s => s.trim());
          return { origin, destination };
        }
        return { 
          search: term,
          origin: term,
          destination: term,
          customerName: term
        };

      default:
        return undefined;
    }
  }, [debouncedSearch, entity]);

  const shouldSkip = !searchParams;

  // 🔍 API Queries
  const driversQuery = useSearchDriversQuery(searchParams!, {
    skip: shouldSkip || entity !== "drivers",
  });

  const trucksQuery = useSearchTrucksQuery(searchParams!, {
    skip: shouldSkip || entity !== "trucks",
  });

  const loadsQuery = useSearchLoadsQuery(searchParams!, {
    skip: shouldSkip || entity !== "loads",
  });

  const query = entity === "drivers" ? driversQuery :
                entity === "trucks" ? trucksQuery :
                loadsQuery;

  return {
    search,
    setSearch,
    searchResults: query.data?.data ?? [],
    isSearchLoading: query.isFetching,
    clearSearch: () => {
      setSearch("");
      setDebouncedSearch("");
    },
    hasSearched: !!debouncedSearch,
  };
};