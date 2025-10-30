"use client";
import { useState, useEffect, useMemo } from "react";
import {
  useSearchDriversQuery,
  useSearchTrucksQuery,
} from "@/redux/slices/apiSlice";

export const useSearch = (entity: "drivers" | "trucks") => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      // الشرط الجديد: لازم يكون أكتر من حرفين علشان يبدأ البحث
      if (searchTerm.trim().length >= 1) {
        setDebouncedTerm(searchTerm.trim());
        setHasSearched(true);
      } else {
        setDebouncedTerm(""); // يمنع البحث نهائيًا
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // ✅ تحديد نوع البحث الذكي
  const searchParams = useMemo(() => {
    const value = debouncedTerm;
    if (!value) return undefined;

    if (/^\d+$/.test(value)) {
      return entity === "drivers" ? { driverId: value } : { truckId: value };
    } else if (/\S+@\S+\.\S+/.test(value)) {
      return { email: value };
    } else if (/^\d{10,}$/.test(value)) {
      return { phone: value };
    } else {
      return entity === "drivers" ? { name: value } : { model: value };
    }
  }, [debouncedTerm, entity]);

  // ✅ شرط يمنع أي call في البداية تمامًا
  const shouldSkip = !searchParams || Object.keys(searchParams).length === 0;

  // ✅ Queries
  const driverQuery = useSearchDriversQuery(searchParams!, {
    skip: shouldSkip || entity !== "drivers", // 🚫 يمنع أول call
    refetchOnMountOrArgChange: false,
    selectFromResult: ({ data, isFetching }) => ({
      data: data?.data ?? [],
      isFetching,
    }),
  });

  const truckQuery = useSearchTrucksQuery(searchParams!, {
    skip: shouldSkip || entity !== "trucks", // 🚫 يمنع أول call
    refetchOnMountOrArgChange: false,
    selectFromResult: ({ data, isFetching }) => ({
      data: data?.data ?? [],
      isFetching,
    }),
  });

  const query = entity === "drivers" ? driverQuery : truckQuery;

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedTerm("");
    setHasSearched(false);
  };

  // ✅ ما يظهرش تحميل إلا لو فعلاً بي fetch أول مرة
const isTableLoading = false; // 🚫 مفيش لود خالص

return {
  searchTerm,
  setSearchTerm,
  searchResults: query.data,
  isSearchLoading: false, // 🚫 مفيش أي تحميل
  isSearching: !!debouncedTerm,
  totalResults: query.data?.length || 0,
  clearSearch,
};

};
