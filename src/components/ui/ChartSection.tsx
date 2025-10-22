"use client";
import React from "react";
import { Pie } from "react-chartjs-2";
import { Typography } from "@mui/material";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TruckChartsProps {
  chartData: {
    milesChart: any;
    profitChart: any;
  }| null;
}

const chartOptions: ChartOptions<"pie"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        boxWidth: 14,
        boxHeight: 14,
        padding: 10,
        font: { size: 13 },
        color: "#333",
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || "";
          const value = context.parsed;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value.toLocaleString()} (${percentage}%)`;
        },
      },
    },
  },
  layout: {
    padding: {
      bottom: 20,
      top: 10,
    },
  },
};

const ChartSection: React.FC<TruckChartsProps> = ({ chartData }) => {
  if (!chartData) return null;

  return (
    <div className="flex flex-wrap justify-center gap-8 mb-8">
      {/* Miles Chart */}
      <div className="p-5 w-full md:w-[45%]">
        <Typography
          variant="h6"
          fontWeight={600}
          className="mb-5 text-slate-800 text-center"
        >
          Total Miles
        </Typography>
        <div style={{ height: "400px", width: "100%", position: "relative" }}>
          <Pie data={chartData.milesChart} options={chartOptions} />
        </div>
      </div>

      {/* Profit Chart */}
      <div className="p-5 w-full md:w-[45%]">
        <Typography
          variant="h6"
          fontWeight={600}
          className="mb-5 text-slate-800 text-center"
        >
          Net Profit
        </Typography>
        <div style={{ height: "400px", width: "100%", position: "relative" }}>
          <Pie data={chartData.profitChart} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
