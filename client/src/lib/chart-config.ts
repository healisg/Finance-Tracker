import type { Chart, ChartConfiguration } from 'chart.js';

export const defaultChartOptions: Partial<ChartConfiguration['options']> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255, 255, 255, 0.8)',
        font: { size: 11 },
        usePointStyle: true,
      },
    },
  },
  scales: {
    x: {
      grid: { 
        color: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: { 
        color: 'rgba(255, 255, 255, 0.6)', 
        font: { size: 10 },
      },
    },
    y: {
      grid: { 
        color: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.6)',
        font: { size: 10 },
      },
    },
  },
};

export const chartColors = {
  income: '#10B981',
  expense: '#EF4444',
  transfer: '#3B82F6',
  savings: '#8B5CF6',
  investment: '#F59E0B',
};

export const categoryColors = [
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];
