"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartSectionProps {
  chartData: {
    labels: string[];
    milesData: number[];
    profitData: number[];
  };
} 

const ChartSection: React.FC<ChartSectionProps> = ({ chartData }) => {
  const colors = [
    "#36A2EB",
    "#FF6384",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#8DD17E",
  ];

  const milesChart = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Total Miles",
        data: chartData.milesData,
        backgroundColor: colors,
      },
    ],
  };

  const profitChart = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Net Profit ($)",
        data: chartData.profitData,
        backgroundColor: colors,
      },
    ],
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 6,
        mb: 10,
      }}
    >
      <Box sx={{ p: 5 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Total Miles
        </Typography>
        <Pie data={milesChart} />
      </Box>
      <Box sx={{ p: 5 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Net Profit
        </Typography>
        <Pie data={profitChart} />
      </Box>
    </Box>
  );
};

export default ChartSection;
