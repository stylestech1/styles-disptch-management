import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { alpha, Box, Typography } from "@mui/material";
import { TTruckWithSummary } from "@/types/globalTypes";
import { RootState, useAppSelector } from "@/redux/store";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Props = {
  data: TTruckWithSummary[];
};

const BarChartTruckDashboard = ({ data }: Props) => {
  const theme = useAppSelector((state: RootState) => state.palette);
  const labels = data.map((t) => `${t.plateNumber}`);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Cost/Mile",
        data: data.map((t) => t.summary?.avgExpensePerMile),
        backgroundColor: "#DC3545",
        borderRadius: 6,
      },
      {
        label: "Profit/Mile",
        data: data.map((t) =>
          t.summary?.totalMiles
            ? Number((t.summary?.netProfit / t.summary?.totalMiles).toFixed(2))
            : 0
        ),
        backgroundColor: "#28A745",
        borderRadius: 6,
      },
      {
        label: "Revenue/Mile",
        data: data.map((t) => t.summary?.avgRevenuePerMile),
        backgroundColor: theme.currentPalette.primary,
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
        background: "white",
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
        Per-mile profitability analysis
      </Typography>

      <Bar data={chartData} options={options} />
    </Box>
  );
};

export default BarChartTruckDashboard;
