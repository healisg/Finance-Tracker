import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Banknote, Calendar, Target, Briefcase, Laptop, TrendingUp, Edit2, Trash2 } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Transaction } from "@shared/schema";
import TransactionModal from "@/components/modals/transaction-modal";

export default function Income() {
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const incomeTransactions = transactions?.filter((t: any) => t.type === 'income') || [];
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const thisMonthIncome = incomeTransactions
    .filter((t: any) => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() + 1 === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    })
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  const thisYearIncome = incomeTransactions
    .filter((t: any) => new Date(t.date).getFullYear() === currentYear)
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  // Group income by category
  const incomeByCategory = incomeTransactions.reduce((acc: any, t: any) => {
    if (!acc[t.category]) {
      acc[t.category] = 0;
    }
    acc[t.category] += parseFloat(t.amount);
    return acc;
  }, {});

  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'salary':
        return <Briefcase className="w-5 h-5 text-green-400" strokeWidth={1.5} />;
      case 'freelance':
        return <Laptop className="w-5 h-5 text-blue-400" strokeWidth={1.5} />;
      case 'investment':
        return <TrendingUp className="w-5 h-5 text-purple-400" strokeWidth={1.5} />;
      default:
        return <Banknote className="w-5 h-5 text-green-400" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
      {/* Income Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <div className="glass-card p-3 sm:p-4 lg:p-5">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Banknote className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" strokeWidth={1.5} />
            <span className="text-xs sm:text-sm font-medium font-geist">This Month</span>
          </div>
          <div className="text-xl sm:text-2xl font-jakarta font-medium mb-1">{formatCurrency(thisMonthIncome)}</div>
          <span className="text-xs text-green-400 font-geist">+5.2% from last month</span>
        </div>
        
        <div className="glass-card p-3 sm:p-4 lg:p-5">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" strokeWidth={1.5} />
            <span className="text-xs sm:text-sm font-medium font-geist">This Year</span>
          </div>
          <div className="text-xl sm:text-2xl font-jakarta font-medium mb-1">{formatCurrency(thisYearIncome)}</div>
          <span className="text-xs text-blue-400 font-geist">+12.3% from last year</span>
        </div>
        
        <div className="glass-card p-3 sm:p-4 lg:p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Target className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" strokeWidth={1.5} />
            <span className="text-xs sm:text-sm font-medium font-geist">Target</span>
          </div>
          <div className="text-xl sm:text-2xl font-jakarta font-medium mb-1">{formatCurrency(7000)}</div>
          <span className="text-xs text-purple-400 font-geist">
            {((thisMonthIncome / 7000) * 100).toFixed(1)}% achieved
          </span>
        </div>
      </div>

      {/* Income Sources */}
      <div className="glass-card p-3 sm:p-4 lg:p-5 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-jakarta font-medium mb-3 sm:mb-4">Income Sources</h3>
        <div className="space-y-4">
          {Object.entries(incomeByCategory).length > 0 ? (
            Object.entries(incomeByCategory).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                    {getIconForCategory(category)}
                  </div>
                  <div>
                    <p className="font-medium font-geist capitalize">{category}</p>
                    <p className="text-sm text-white/60 font-geist">Total earnings</p>
                  </div>
                </div>
                <span className="text-lg font-medium text-green-400 font-geist">
                  {formatCurrency(amount as number)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/60">
              <p className="font-geist">No income sources yet</p>
              <p className="text-xs mt-1 font-geist">Add your first income transaction to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Income Transactions */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-jakarta font-medium">Recent Income</h3>
          <button className="text-xs text-blue-400 hover:text-blue-300 font-geist">View All</button>
        </div>
        
        <div className="space-y-3">
          {incomeTransactions.length > 0 ? (
            incomeTransactions.slice(0, 5).map((transaction: any) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0 group">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                    {getIconForCategory(transaction.category)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium font-geist">{transaction.description}</p>
                    <p className="text-xs text-white/60 font-geist">
                      {new Date(transaction.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })} • {transaction.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-green-400 font-geist">
                    +{formatCurrency(parseFloat(transaction.amount))}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Edit transaction"
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/60">
              <p className="font-geist">No income transactions yet</p>
              <p className="text-xs mt-1 font-geist">Add your first income to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseModal}
        editTransaction={editingTransaction}
      />
    </div>
  );
}
