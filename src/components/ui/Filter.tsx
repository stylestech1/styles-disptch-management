"use client";
import { useState, useEffect } from "react";
import { DateRange, Range, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import dayjs, { Dayjs } from "dayjs";
import { useSearchParams } from "next/navigation";
import { alpha, Button } from "@mui/material";
import { RootState, useAppSelector } from "@/redux/store";

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
  const searchParams = useSearchParams();

  const [showPicker, setShowPicker] = useState(false);
  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: undefined,
      endDate: undefined,
      key: "selection",
    },
  ]);

  const theme = useAppSelector((state: RootState) => state.palette)

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
    if (!dateRange?.[0]?.startDate || !dateRange?.[0]?.endDate) return;

    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;

    onApply?.(dayjs(start), dayjs(end));
    onFilterApplied?.(true);
    setShowPicker(false);
  };

  // ✅ Clear
  const handleClear = () => {
    setDateRange([
      {
        startDate: undefined,
        endDate: undefined,
        key: "selection",
      },
    ]);
    onClear?.();
    onApply?.(null, null);
    onFilterApplied?.(false);
    setShowPicker(false);
  };

  // ✅ Display label
  const from = dateRange?.[0]?.startDate
    ? dayjs(dateRange[0].startDate).format("MMM D, YYYY")
    : "";
  const to = dateRange?.[0]?.endDate
    ? dayjs(dateRange[0].endDate).format("MMM D, YYYY")
    : "";

  const label = from && to ? `${from} → ${to}` : "Date";

  return (
    <div className="relative inline-block">
      <Button
        onClick={() => setShowPicker(!showPicker)}
        sx={{
          width: { xs: 260, md: 320, lg: 250 },
          maxWidth: "100%",
          textAlign: "left",
          cursor: "pointer",
          fontSize: '16px',
          py: 1.6,
          backgroundColor: alpha(theme.primary, 0.1),
          border: `1px solid ${theme.primary}`, 
          borderRadius: "4px",
          color: theme.primary, 
          textTransform: "none", 
          transition: "all 0.2s ease",
          "&:hover": {
            color: '#fff', 
            backgroundColor: theme.primary, 
          },
        }}
      >
        {label}
      </Button>

      {showPicker && (
        <div className="absolute top-12 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-[370px]">
          {dateRange[0].startDate === undefined &&
          dateRange[0].endDate === undefined ? (
            <DateRange
              onChange={handleRangeSelect}
              moveRangeOnFirstSelection={false}
              ranges={[
                {
                  startDate: new Date(),
                  endDate: new Date(),
                  key: "selection",
                },
              ]}
              rangeColors={["#2563eb"]}
              showDateDisplay={false}
              months={1}
              direction="horizontal"
              showMonthAndYearPickers={true}
              editableDateInputs={true}
            />
          ) : (
            <DateRange
              onChange={handleRangeSelect}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              rangeColors={["#2563eb"]}
              showDateDisplay={false}
              months={1}
              direction="horizontal"
              showMonthAndYearPickers={true}
              editableDateInputs={true}
            />
          )}

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
