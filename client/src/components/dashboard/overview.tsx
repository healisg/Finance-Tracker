import { ArrowUp, ArrowDown, Car, Edit2, Trash2, Wallet, ExternalLink, TrendingUp, TrendingDown, PiggyBank, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/hooks/use-currency";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DashboardSummary, Transaction } from "@shared/schema";
import CashFlowChart from "@/components/charts/cash-flow-chart";
import ExpenseCategoriesChart from "@/components/charts/expense-categories-chart";
import ExpenseSummary from "@/components/expense-groups/expense-summary";
import { useState } from "react";

interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  currentMonth: number;
  currentYear: number;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: string;
    description: string;
    date: string;
    category: string;
  }>;
  forecast?: {
    nextMonthIncome: number;
    nextMonthExpenses: number;
    nextMonthNet: number;
  };
}

interface OverviewProps {
  onEditTransaction?: (transaction: Transaction) => void;
  onNavigateToIncome?: () => void;
}

export default function Overview({ onEditTransaction, onNavigateToIncome }: OverviewProps) {
  const [selectedMonth, setSelectedMonth] = useState(10); // October
  const [selectedYear, setSelectedYear] = useState(2025);
  
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary", selectedMonth, selectedYear],
    queryFn: () => apiRequest("GET", `/api/dashboard/summary?month=${selectedMonth}&year=${selectedYear}`),
  });
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleToday = () => {
    setSelectedMonth(10); // October
    setSelectedYear(2025);
  };

  const isCurrentMonth = () => {
    return selectedMonth === 10 && selectedYear === 2025;
  };

  const getMonthName = (month: number) => {
    const date = new Date(2000, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return apiRequest("DELETE", `/api/transactions/${transactionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Transaction deleted",
        description: "Your transaction has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "There was an error deleting your transaction.",
        variant: "destructive",
      });
    },
  });


  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUp className="w-4 h-4 text-green-400" strokeWidth={1.5} />;
      case 'expense':
        return <ArrowDown className="w-4 h-4 text-red-400" strokeWidth={1.5} />;
      case 'transfer':
        return <Car className="w-4 h-4 text-blue-400" strokeWidth={1.5} />;
      default:
        return <ArrowUp className="w-4 h-4 text-gray-400" strokeWidth={1.5} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-400';
      case 'expense':
        return 'text-red-400';
      case 'transfer':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div>
      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 chart-container">
        {/* Total Balance Card */}
        <div className="metric-card metric-card-gradient-blue">
          <div className="relative z-10">
            <div className="flex mb-2 items-center justify-between">
              <p className="text-xs text-white/60 flex items-center gap-1 font-geist">
                <Wallet className="w-4 h-4" strokeWidth={1.5} />
                Net Balance
              </p>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePreviousMonth}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-3 h-3" strokeWidth={2} />
                </button>
                <span className="text-xs text-white/80 font-geist min-w-[80px] text-center">
                  {getMonthName(selectedMonth)} {selectedYear}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-3 h-3" strokeWidth={2} />
                </button>
                {!isCurrentMonth() && (
                  <button 
                    onClick={handleToday}
                    className="ml-1 px-2 h-6 text-[10px] flex items-center justify-center rounded-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors font-geist"
                    title="Go to current month"
                  >
                    Today
                  </button>
                )}
              </div>
            </div>
            <div className={`text-xl sm:text-2xl mb-4 sm:mb-6 font-jakarta font-medium ${
              (summary?.totalBalance || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatCurrency(summary?.totalBalance || 0)}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60 font-geist">Income - Expenses</span>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="metric-card metric-card-gradient-green">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/60 flex items-center gap-1 font-geist">
                <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                Monthly Income
              </p>
              <span className="text-xs text-blue-400 font-geist">+5.2%</span>
            </div>
            <div className="text-xl sm:text-2xl mb-4 sm:mb-6 font-jakarta font-medium">
              {formatCurrency(summary?.monthlyIncome || 0)}
            </div>
            <div className="flex items-center justify-between text-xs">
              <button className="underline underline-offset-2 font-geist">View Details</button>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Expenses Card */}
        <div className="metric-card metric-card-gradient-red">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/60 flex items-center gap-1 font-geist">
                <TrendingDown className="w-4 h-4" strokeWidth={1.5} />
                Monthly Expenses
              </p>
              <span className="text-xs text-red-400 font-geist">+8.1%</span>
            </div>
            <div className="text-xl sm:text-2xl mb-4 sm:mb-6 font-jakarta font-medium">
              {formatCurrency(summary?.monthlyExpenses || 0)}
            </div>
            <div className="flex items-center justify-between text-xs">
              <button className="underline underline-offset-2 font-geist">View Details</button>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Savings Card */}
        <div className="metric-card metric-card-gradient-purple">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/60 flex items-center gap-1 font-geist">
                <PiggyBank className="w-4 h-4" strokeWidth={1.5} />
                Total Savings
              </p>
              <span className="text-xs text-purple-400 font-geist">+15.3%</span>
            </div>
            <div className="text-xl sm:text-2xl mb-4 sm:mb-6 font-jakarta font-medium">
              {formatCurrency(summary?.totalSavings || 0)}
            </div>
            <div className="flex items-center justify-between text-xs">
              <button className="underline underline-offset-2 font-geist">View Details</button>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Next Month Forecast */}
      {summary?.forecast && (summary.forecast.nextMonthIncome > 0 || summary.forecast.nextMonthExpenses > 0) && (
        <div className="px-3 sm:px-4 lg:px-8 mb-4 sm:mb-6 forecast-card">
          <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4 font-geist">
            {isCurrentMonth() ? 'Next Month Forecast' : 'Following Month Forecast'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all duration-300 hover:transform hover:scale-105 hover:bg-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" strokeWidth={1.5} />
                <span className="text-sm text-white/60 font-geist">Expected Income</span>
              </div>
              <div className="text-xl font-medium text-green-400 font-jakarta">
                {formatCurrency(summary.forecast.nextMonthIncome)}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all duration-300 hover:transform hover:scale-105 hover:bg-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-400" strokeWidth={1.5} />
                <span className="text-sm text-white/60 font-geist">Expected Expenses</span>
              </div>
              <div className="text-xl font-medium text-red-400 font-jakarta">
                {formatCurrency(summary.forecast.nextMonthExpenses)}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all duration-300 hover:transform hover:scale-105 hover:bg-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                <span className="text-sm text-white/60 font-geist">Net Forecast</span>
              </div>
              <div className={`text-xl font-medium font-jakarta ${
                summary.forecast.nextMonthNet >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(summary.forecast.nextMonthNet)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-3 sm:px-4 lg:px-8 chart-container">
        <div className="transition-all duration-300 hover:scale-[1.02]">
          <CashFlowChart />
        </div>
        <div className="transition-all duration-300 hover:scale-[1.02]">
          <ExpenseCategoriesChart />
        </div>
      </div>

      {/* Expense Groups Summary */}
      <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <ExpenseSummary onNavigateToIncome={onNavigateToIncome} />
      </div>

      {/* Recent Transactions */}
      <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div className="glass-card p-3 sm:p-4 lg:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm font-medium font-geist">Recent Transactions</h3>
            <button className="text-xs text-blue-400 hover:text-blue-300 font-geist">View All</button>
          </div>

          <div className="space-y-3">
            {summary?.recentTransactions?.length ? (
              summary.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 group transaction-item">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 ${
                      transaction.type === 'income' ? 'bg-green-600/20' : 
                      transaction.type === 'expense' ? 'bg-red-600/20' : 'bg-blue-600/20'
                    } rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium font-geist truncate">{transaction.description}</p>
                      <p className="text-xs text-white/60 font-geist">
                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: window.innerWidth < 640 ? undefined : 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium font-geist ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(parseFloat(transaction.amount)))}
                    </span>
                    {onEditTransaction && (
                      <>
                        <button
                          onClick={() => onEditTransaction({
                            ...transaction,
                            date: new Date(transaction.date),
                            expenseGroup: transaction.expenseGroup || null,
                            isSharedExpense: transaction.isSharedExpense || null,
                            userId: 'alex.johnson',
                            createdAt: null
                          } as Transaction)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-4 h-4 text-white/60 hover:text-white" strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={() => deleteTransactionMutation.mutate(transaction.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md"
                            title="Delete transaction"
                        >
                            <Trash2 className="w-4 h-4 text-white/60 hover:text-white" strokeWidth={1.5} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/60">
                <p className="font-geist">No transactions yet</p>
                <p className="text-xs mt-1 font-geist">Add your first transaction to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}