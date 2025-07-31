import { useQuery } from "@tanstack/react-query";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ExternalLink, ArrowUp, ArrowDown, Car, Edit2 } from "lucide-react";
import CashFlowChart from "@/components/charts/cash-flow-chart";
import ExpenseCategoriesChart from "@/components/charts/expense-categories-chart";
import ExpenseSummary from "@/components/expense-groups/expense-summary";
import { useCurrency } from "@/hooks/use-currency";
import type { Transaction } from "@shared/schema";

interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
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
}

export default function Overview({ onEditTransaction }: OverviewProps) {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });
  const { formatCurrency } = useCurrency();

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-8 py-4 lg:py-6 chart-container">
        {/* Total Balance Card */}
        <div className="metric-card metric-card-gradient-blue">
          <div className="relative z-10">
            <div className="flex mb-4 items-center justify-between">
              <p className="text-xs text-white/60 flex items-center gap-1 font-geist">
                <Wallet className="w-4 h-4" strokeWidth={1.5} />
                Total Balance
              </p>
              <span className="text-xs text-green-400 font-geist">+12.5%</span>
            </div>
            <div className="text-2xl mb-6 font-jakarta font-medium">
              {formatCurrency(summary?.totalBalance || 0)}
            </div>
            <div className="flex items-center justify-between text-xs">
              <button className="underline underline-offset-2 font-geist">View Details</button>
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
            <div className="text-2xl mb-6 font-jakarta font-medium">
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
            <div className="text-2xl mb-6 font-jakarta font-medium">
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
            <div className="text-2xl mb-6 font-jakarta font-medium">
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
        <div className="px-4 sm:px-8 mb-6 forecast-card">
          <h3 className="text-lg font-medium text-white mb-4 font-geist">Next Month Forecast</h3>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-8 chart-container">
        <div className="transition-all duration-300 hover:scale-[1.02]">
          <CashFlowChart />
        </div>
        <div className="transition-all duration-300 hover:scale-[1.02]">
          <ExpenseCategoriesChart />
        </div>
      </div>

      {/* Expense Groups Summary */}
      <div className="px-4 sm:px-8 py-4">
        <ExpenseSummary />
      </div>

      {/* Recent Transactions */}
      <div className="px-4 sm:px-8 py-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium font-geist">Recent Transactions</h3>
            <button className="text-xs text-blue-400 hover:text-blue-300 font-geist">View All</button>
          </div>
          
          <div className="space-y-3">
            {summary?.recentTransactions?.length ? (
              summary.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 group transaction-item">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${
                      transaction.type === 'income' ? 'bg-green-600/20' : 
                      transaction.type === 'expense' ? 'bg-red-600/20' : 'bg-blue-600/20'
                    } rounded-lg flex items-center justify-center`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium font-geist">{transaction.description}</p>
                      <p className="text-xs text-white/60 font-geist">
                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium font-geist ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(parseFloat(transaction.amount)))}
                    </span>
                    {onEditTransaction && (
                      <button
                        onClick={() => onEditTransaction(transaction as Transaction)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-4 h-4 text-white/60 hover:text-white" strokeWidth={1.5} />
                      </button>
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
