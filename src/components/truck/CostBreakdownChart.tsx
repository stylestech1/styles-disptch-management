"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { alpha, Box, Typography } from "@mui/material";
import { RootState, useAppSelector } from "@/redux/store";

type CostBreakdownProps = {
  costs: {
    fuel?: number;
    driverPay?: number;
    maintenance?: number;
    insurance?: number;
  };
};

ChartJS.register(ArcElement, Tooltip, Legend);

const CostBreakdownChart: React.FC<CostBreakdownProps> = ({ costs }) => {
  const theme = useAppSelector((state: RootState) => state.palette);

  const totalCost =
    (costs?.fuel || 0) +
    (costs?.driverPay || 0) +
    (costs?.maintenance || 0) +
    (costs?.insurance || 0);

  const data = {
    labels: ["Fuel", "Driver Pay", "Maintenance", "Insurance"],
    datasets: [
      {
        data: [
          costs?.fuel || 0,
          costs?.driverPay || 0,
          costs?.maintenance || 0,
          costs?.insurance || 0,
        ],
        backgroundColor: [
          theme.currentPalette.primary,
          alpha(theme.currentPalette.primary, 0.8),
          alpha(theme.currentPalette.primary, 0.6),
          alpha(theme.currentPalette.primary, 0.4),
        ],
        borderWidth: 3,
        cutout: "65%",
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <Box
      sx={{
        border: `1px solid ${alpha(theme.currentPalette.primary, 0.3)}`,
        borderRadius: 2,
        p: 3,
      }}
    >
      <Typography
        sx={{ fontSize: "20px", mb: 2, color: theme.currentPalette.primary }}
      >
        Cost Breakdown
      </Typography>

      <div className="w-40 mx-auto">
        <Doughnut data={data} options={options} />
      </div>

      {/* Labels */}
      <Box className="grid grid-cols-2 gap-2 mt-4">
        <Box display="flex" alignItems="center" gap={1}>
          <span
            className="w-3 h-3 block rounded"
            style={{ background: theme.currentPalette.primary }}
          />
          Fuel: ${costs?.fuel}
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <span
            className="w-3 h-3 block rounded"
            style={{ background: alpha(theme.currentPalette.primary, 0.8) }}
          />
          Driver Pay: ${costs?.driverPay}
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <span
            className="w-3 h-3 block rounded"
            style={{ background: alpha(theme.currentPalette.primary, 0.6) }}
          />
          Maintenance: ${costs?.maintenance}
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <span
            className="w-3 h-3 block rounded"
            style={{ background: alpha(theme.currentPalette.primary, 0.4) }}
          />
          Insurance: ${costs?.insurance}
        </Box>
      </Box>

      {/* TOTAL */}
      <Typography
        sx={{
          borderTop: "1px solid #d0e3ff",
          color: theme.currentPalette.primary,
          mt: 3,
          pt: 2,
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "18px",
        }}
      >
        Total Costs
        <span>${totalCost.toLocaleString()}</span>
      </Typography>
    </Box>
  );
};

export default CostBreakdownChart;
