"use client";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { alpha, Box, darken, Typography } from "@mui/material";
import { TTruckWithSummary } from "@/types/globalTypes";
import { RootState, useAppSelector } from "@/redux/store";
import { useEffect, useRef, useState } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Props = {
  data: TTruckWithSummary[];
};

const BarChartTruckDashboard = ({ data }: Props) => {
  const theme = useAppSelector((state: RootState) => state.palette);
  const labels = data.map((t) => `${t.plateNumber}`);
  const patternCanvas = useRef<HTMLCanvasElement>(
    document.createElement("canvas")
  );
  const [negativePattern, setNegativePattern] = useState<
    CanvasPattern | string
  >("#00A63E");

  const profitPerMileData = data.map((t) =>
    t.summary?.totalMiles
      ? Number((t.summary?.netProfit / t.summary?.totalMiles).toFixed(2))
      : 0
  );

  useEffect(() => {
    const ctx = patternCanvas.current.getContext("2d");
    if (!ctx) return;

    patternCanvas.current.width = 10;
    patternCanvas.current.height = 10;

    ctx.clearRect(0, 0, 10, 10);

    ctx.strokeStyle = "#00A63E";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(10, 0);
    ctx.stroke();

    const newPattern = ctx.createPattern(patternCanvas.current, "repeat");
    if (newPattern) {
      setNegativePattern(newPattern);
    }
  }, []);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Cost/Mile",
        data: data.map((t) => t.summary?.avgExpensePerMile || 0),
        backgroundColor: darken(theme.currentPalette.primary, 0.2),
        borderRadius: 6,
      },
      {
        label: "Profit/Mile",
        data: profitPerMileData,
        backgroundColor: profitPerMileData.map((value) => {
          if (value < 0) {
            return negativePattern;
          } else {
            return theme.currentPalette.primary;
          }
        }),
        borderRadius: 6,
      },
      {
        label: "Revenue/Mile",
        data: data.map((t) => t.summary?.avgRevenuePerMile || 0),
        backgroundColor: alpha(theme.currentPalette.primary, 0.8),
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 15,
          boxHeight: 15,
          padding: 20,
          font: {
            size: window.innerWidth < 768 ? 5 : 13,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.08)" },
        ticks: {
          callback: function (value: string | number) {
            return `${value}$`;
          },
          stepSize: 0.5,
          autoSkip: true,
          maxTicksLimit: 8,
          font: {
            size: window.innerWidth < 768 ? 5 : 12,
          },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 5 : 12,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  };

  return (
    <Box
      sx={{
        p: 3,
        border: `1px solid ${alpha(theme.currentPalette.primary, 0.3)}`,
        borderRadius: "12px",
        background: theme.currentPalette.background,
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 400, color: theme.currentPalette.primary }}
      >
        Cost per Mile vs Revenue per Mile
      </Typography>

      <Typography
        variant="body2"
        sx={{ mb: 3, color: theme.currentPalette.primary }}
      >
        Per-mile profitability analysis (Red stripes indicate loss)
      </Typography>

      <Bar data={chartData} options={options} />
    </Box>
  );
};

export default BarChartTruckDashboard;
