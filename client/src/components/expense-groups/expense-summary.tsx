import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Gamepad2, Target, Users, User } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import type { Transaction } from "@shared/schema";
import { useToast } from "@/components/ui/use-toast";

interface ExpenseSummaryProps {
  onNavigateToIncome?: () => void;
}

// Define a simplified transaction interface for the dashboard summary
interface RecentTransaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  date: string;
  category: string;
  expenseGroup?: string | null;
  isSharedExpense?: boolean | null;
}

interface ExpenseGroupSummary {
  fundamentals: {
    shared: number;
    individual: number;
    total: number;
  };
  fun: {
    total: number;
  };
  futureYou: {
    total: number;
  };
  totalExpenses: number;
}

export default function ExpenseSummary({ onNavigateToIncome }: ExpenseSummaryProps) {
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete transaction');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  // Calculate expense group totals
  const expenseGroupSummary: ExpenseGroupSummary = {
    fundamentals: { shared: 0, individual: 0, total: 0 },
    fun: { total: 0 },
    futureYou: { total: 0 },
    totalExpenses: 0
  };

  if (transactions) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const transactionDate = new Date(transaction.date);
        const isCurrentMonth = transactionDate.getMonth() === currentMonth &&
                               transactionDate.getFullYear() === currentYear;

        if (isCurrentMonth) {
          const amount = parseFloat(transaction.amount);
          expenseGroupSummary.totalExpenses += amount;

          switch (transaction.expenseGroup) {
            case 'fundamentals':
              expenseGroupSummary.fundamentals.total += amount;
              if (transaction.isSharedExpense) {
                expenseGroupSummary.fundamentals.shared += amount;
              } else {
                expenseGroupSummary.fundamentals.individual += amount;
              }
              break;
            case 'fun':
              expenseGroupSummary.fun.total += amount;
              break;
            case 'future-you':
              expenseGroupSummary.futureYou.total += amount;
              break;
          }
        }
      }
    });
  }



  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white font-geist">Monthly Expense Groups</h3>
        <div className="text-sm text-white/60 font-geist">
          Total: {formatCurrency(expenseGroupSummary.totalExpenses)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fundamentals Card */}
        <div className="glass-card p-5 metric-card-gradient-red cursor-pointer hover:scale-105 transition-transform duration-200"
             onClick={onNavigateToIncome}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-400" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-sm font-medium font-geist">Fundamentals</h4>
              <p className="text-xs text-white/60 font-geist">Essential expenses</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-2xl font-jakarta font-medium">
              {formatCurrency(expenseGroupSummary.fundamentals.total)}
            </div>

            {/* Breakdown of shared vs individual */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                  <span className="font-geist text-white/80">Shared</span>
                </div>
                <span className="font-geist text-blue-400">
                  {formatCurrency(expenseGroupSummary.fundamentals.shared)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-400" strokeWidth={1.5} />
                  <span className="font-geist text-white/80">Individual</span>
                </div>
                <span className="font-geist text-green-400">
                  {formatCurrency(expenseGroupSummary.fundamentals.individual)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Card */}
        <div className="glass-card p-5 metric-card-gradient-purple cursor-pointer hover:scale-105 transition-transform duration-200"
             onClick={onNavigateToIncome}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-sm font-medium font-geist">Fun</h4>
              <p className="text-xs text-white/60 font-geist">Entertainment & leisure</p>
            </div>
          </div>

          <div className="text-2xl font-jakarta font-medium">
            {formatCurrency(expenseGroupSummary.fun.total)}
          </div>
        </div>

        {/* Future You Card */}
        <div className="glass-card p-5 metric-card-gradient-green cursor-pointer hover:scale-105 transition-transform duration-200"
             onClick={onNavigateToIncome}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-400" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-sm font-medium font-geist">Future You</h4>
              <p className="text-xs text-white/60 font-geist">Investments & savings</p>
            </div>
          </div>

          <div className="text-2xl font-jakarta font-medium">
            {formatCurrency(expenseGroupSummary.futureYou.total)}
          </div>
        </div>
      </div>

      {/* Progress bars showing distribution */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-white/80 mb-3 font-geist">Monthly Distribution</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-20 text-xs text-white/60 font-geist">Fundamentals</div>
            <div className="flex-1 bg-white/10 rounded-full h-2">
              <div
                className="bg-red-400 h-2 rounded-full transition-all duration-300"
                style={{
                  width: expenseGroupSummary.totalExpenses > 0
                    ? `${(expenseGroupSummary.fundamentals.total / expenseGroupSummary.totalExpenses) * 100}%`
                    : '0%'
                }}
              />
            </div>
            <div className="text-xs text-white/60 font-geist">
              {expenseGroupSummary.totalExpenses > 0
                ? Math.round((expenseGroupSummary.fundamentals.total / expenseGroupSummary.totalExpenses) * 100)
                : 0}%
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 text-xs text-white/60 font-geist">Fun</div>
            <div className="flex-1 bg-white/10 rounded-full h-2">
              <div
                className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                style={{
                  width: expenseGroupSummary.totalExpenses > 0
                    ? `${(expenseGroupSummary.fun.total / expenseGroupSummary.totalExpenses) * 100}%`
                    : '0%'
                }}
              />
            </div>
            <div className="text-xs text-white/60 font-geist">
              {expenseGroupSummary.totalExpenses > 0
                ? Math.round((expenseGroupSummary.fun.total / expenseGroupSummary.totalExpenses) * 100)
                : 0}%
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 text-xs text-white/60 font-geist">Future You</div>
            <div className="flex-1 bg-white/10 rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{
                  width: expenseGroupSummary.totalExpenses > 0
                    ? `${(expenseGroupSummary.futureYou.total / expenseGroupSummary.totalExpenses) * 100}%`
                    : '0%'
                }}
              />
            </div>
            <div className="text-xs text-white/60 font-geist">
              {expenseGroupSummary.totalExpenses > 0
                ? Math.round((expenseGroupSummary.futureYou.total / expenseGroupSummary.totalExpenses) * 100)
                : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}