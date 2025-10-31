"use client";
import { useState, useEffect } from "react";
import { DateRange, Range, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";

type DateRangeFilterProps = {
  onApply?: (from: Dayjs | null, to: Dayjs | null) => void;
  onClear?: () => void;
  onFilterApplied?: (applied: boolean) => void;
};

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onApply,
  onClear,
  onFilterApplied,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPicker, setShowPicker] = useState(false);
  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: undefined,
      endDate: undefined,
      key: "selection",
    },
  ]);

  // ✅ Load initial values from URL if available
  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (from && to) {
      setDateRange([
        {
          startDate: new Date(from),
          endDate: new Date(to),
          key: "selection",
        },
      ]);
    } else {
      // ✅ reset to empty (fully unselected)
      setDateRange([
        {
          startDate: undefined,
          endDate: undefined,
          key: "selection",
        },
      ]);
    }
  }, [searchParams]);

  // ✅ when selecting range
  const handleRangeSelect = (ranges: RangeKeyDict) => {
    setDateRange([ranges.selection]);
  };

  // ✅ Apply
  const handleApply = () => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;

    if (!start || !end) return;

    const fromStr = dayjs(start).format("YYYY-MM-DD");
    const toStr = dayjs(end).format("YYYY-MM-DD");

    const params = new URLSearchParams(searchParams);
    params.set("from", fromStr);
    params.set("to", toStr);

    router.push(`?${params.toString()}`, { scroll: false });

    onApply?.(dayjs(start), dayjs(end));
    onFilterApplied?.(true);
    setShowPicker(false);
  };

  // ✅ Clear
  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("from");
    params.delete("to");
    router.push(`?${params.toString()}`, { scroll: false });

    setDateRange([
      {
        startDate: undefined,
        endDate: undefined,
        key: "selection",
      },
    ]);

    if (onClear) {
      onClear();
    }

    // 🧠 Notify parent to reset filter
    onApply?.(null, null);
    onFilterApplied?.(false);
    setShowPicker(false);
  };

  // ✅ Display label
  const from = dateRange[0].startDate
    ? dayjs(dateRange[0].startDate).format("MMM D, YYYY")
    : "";
  const to = dateRange[0].endDate
    ? dayjs(dateRange[0].endDate).format("MMM D, YYYY")
    : "";

  const label = from && to ? `${from} → ${to}` : "Date";

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-[250px] max-w-full text-left cursor-pointer px-4 py-2 bg-[#eff6ff] border border-slate-200 rounded-md text-slate-800 hover:border-blue-500 hover:text-blue-600 transition-all"
      >
        {label}
      </button>

      {showPicker && (
        <div className="absolute top-12 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-[370px]">
          <DateRange
            onChange={handleRangeSelect}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            rangeColors={["#2563eb"]}
            months={1}
            direction="horizontal"
            showMonthAndYearPickers={true}
            showDateDisplay={false}
            editableDateInputs={true}
            minDate={undefined}
          />

          <div className="flex justify-between mt-3">
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md text-sm"
            >
              Clear
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPicker(false)}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
