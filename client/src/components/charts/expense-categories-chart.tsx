import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart } from "lucide-react";
import { Chart, registerables } from "chart.js";
import type { Transaction } from "@shared/schema";

Chart.register(...registerables);

export default function ExpenseCategoriesChart() {
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

    // Process expense data by category for current month
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = transactions?.filter((t: Transaction) => {
      const transactionDate = new Date(t.date);
      return t.type === 'expense' &&
             transactionDate.getMonth() + 1 === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const categoryTotals: { [key: string]: number } = {};
    monthlyExpenses?.forEach((t: Transaction) => {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = 0;
      }
      categoryTotals[t.category] += parseFloat(t.amount);
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);

    const labels = sortedCategories.map(([category]) => 
      category.charAt(0).toUpperCase() + category.slice(1)
    );
    const data = sortedCategories.map(([, amount]) => amount);
    
    const colors = [
      '#EF4444', // Red
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Amber
      '#8B5CF6', // Purple
      '#EC4899', // Pink
    ];

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          cutout: '60%',
        }],
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
              font: { size: 10 },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15,
            },
          },
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
          <PieChart className="w-5 h-5" strokeWidth={1.5} />
          Expense Categories
        </p>
        <button className="text-xs px-3 py-1 rounded-full bg-stone-600/20 hover:bg-stone-600/30 font-geist">
          This Month
        </button>
      </div>
      <div className="flex-1 min-h-[180px] h-[220px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}
