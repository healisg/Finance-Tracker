import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { Chart, registerables } from "chart.js";
import type { Transaction } from "@shared/schema";

Chart.register(...registerables);

export default function CashFlowChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  useEffect(() => {
    if (!chartRef.current || !transactions) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Process data for the last 12 months
    const months = [];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      months.push(monthName);
      
      const monthTransactions = transactions?.filter((t: Transaction) => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      });
      
      const monthIncome = monthTransactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0);
      
      const monthExpenses = monthTransactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0);
      
      incomeData.push(monthIncome);
      expenseData.push(monthExpenses);
    }

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#10B981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
          },
          {
            label: 'Expenses',
            data: expenseData,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#EF4444',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.8)',
              font: { size: 11 },
              usePointStyle: true,
              padding: 20,
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
              callback: function(value: any) { 
                return '$' + (value as number).toLocaleString(); 
              },
            },
          },
        },
        interaction: { 
          intersect: false, 
          mode: 'index' as const,
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [transactions]);

  return (
    <div className="glass-card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium flex items-center gap-2 font-geist">
          <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
          Monthly Cash Flow
        </p>
        <button className="text-xs px-3 py-1 rounded-full bg-stone-600/20 hover:bg-stone-600/30 font-geist">
          12M
        </button>
      </div>
      <div className="flex-1 min-h-[180px] h-[220px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}
