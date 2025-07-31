import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Chart, registerables } from "chart.js";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/use-currency";
import type { Transaction } from "@shared/schema";

Chart.register(...registerables);

export default function CashFlowChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [viewMode, setViewMode] = useState<'past' | 'forecast'>('forecast');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { formatCurrency } = useCurrency();

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

    // Process data based on view mode
    const months = [];
    const incomeData = [];
    const expenseData = [];
    
    const startOffset = viewMode === 'past' ? 11 : 5; // Show 6 months back + 6 months forward for forecast
    const endOffset = viewMode === 'past' ? 0 : -6;
    
    for (let i = startOffset; i >= endOffset; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
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
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${formatCurrency(value)}`;
              }
            }
          }
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
                return formatCurrency(value as number); 
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
  }, [transactions, viewMode, currentDate]);

  const navigateTime = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <div className="glass-card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium flex items-center gap-2 font-geist">
          <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
          Monthly Cash Flow
        </p>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('past')}
              className={`px-3 py-1 text-xs rounded-md ${
                viewMode === 'past' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Past Year
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('forecast')}
              className={`px-3 py-1 text-xs rounded-md ${
                viewMode === 'forecast' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Forecast
            </Button>
          </div>
          
          {viewMode === 'forecast' && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTime('prev')}
                className="w-8 h-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-white/60 min-w-16 text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTime('next')}
                className="w-8 h-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-h-[180px] h-[220px]">
        <canvas ref={chartRef} />
      </div>
      
      {viewMode === 'forecast' && (
        <div className="mt-2 text-xs text-white/60 text-center">
          Showing 6 months back and 6 months forward including future transactions
        </div>
      )}
    </div>
  );
}
