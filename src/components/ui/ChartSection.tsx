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
  ChartData,
  Plugin
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TruckChartsProps {
  chartData: {
    milesChart: ChartData<'pie'>;
    profitChart: ChartData<'pie'>;
  }| null;
}

const centerLabelPlugin: Plugin<"pie"> = {
  id: 'centerLabel',
  afterDraw: (chart) => {
    const { ctx } = chart;
    const { width, height } = chart;
    
    ctx.save();
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const total = chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
    const label = chart.data.datasets[0].label;
    
    ctx.fillText(`${label}`, width / 2, height / 2 - 15);
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#1976d2';
    ctx.fillText(`${total.toLocaleString()}`, width / 2, height / 2 + 10);
    ctx.restore();
  }
};

const chartOptions: ChartOptions<"pie"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, 
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || "";
          const value = context.parsed;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
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

  const milesChartWithPlugin = {
    ...chartData.milesChart,
    plugins: [centerLabelPlugin],
  };

  const profitChartWithPlugin = {
    ...chartData.profitChart,
    plugins: [centerLabelPlugin],
  };

  return (
    <div className="flex sm:flex-row md:flex-col lg:flex-row">
      {/* Miles Chart */}
      <div className="w-[150px] md:w-[200px]">
        <Typography
          variant="h6"
          fontWeight={600}
          className="mb-5 text-slate-800 text-center"
        >
          Total Miles
        </Typography>
        <div className="relative w-[100%] xl:w-full sm:h-[150px] md:h-[100px] lg:h-[200px] xl:h-[200px]">
          <Pie 
            data={milesChartWithPlugin} 
            options={chartOptions}
            redraw={false} 
          />
        </div>
      </div>

      {/* Profit Chart */}
      <div className="w-[150px] md:w-[200px]">
        <Typography
          variant="h6"
          fontWeight={600}
          className="mb-5 text-slate-800 text-center"
        >
          Net Profit
        </Typography>
        <div className="relative w-[100%] xl:w-full sm:h-[150px] md:h-[100px] lg:h-[200px] xl:h-[200px]">
          <Pie 
            data={profitChartWithPlugin} 
            options={chartOptions}
            redraw={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartSection;