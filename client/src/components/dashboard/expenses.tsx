import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Calendar, AlertTriangle, Utensils, Car, ShoppingBag, Coffee, Heart, Gamepad2, Target, ChevronDown, ChevronUp, Tag, Users, User, Edit2, Trash2 } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Transaction } from "@shared/schema";
import RecurringExpenseList from "@/components/recurring-expenses/recurring-expense-list";
import TransactionModal from "@/components/modals/transaction-modal";

interface ExpenseGroupData {
  fundamentals: {
    shared: Transaction[];
    individual: Transaction[];
    total: number;
  };
  fun: {
    transactions: Transaction[];
    total: number;
  };
  futureYou: {
    transactions: Transaction[];
    total: number;
  };
}

interface ExpensesProps {
  expandedGroup?: string | null;
}

export default function Expenses({ expandedGroup }: ExpensesProps) {
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({
    fundamentals: expandedGroup === 'fundamentals',
    fun: expandedGroup === 'fun',
    futureYou: expandedGroup === 'futureYou'
  });
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Scroll to Monthly Expense Groups section when expandedGroup is set
  useEffect(() => {
    if (expandedGroup) {
      setTimeout(() => {
        const section = document.getElementById('monthly-expense-groups');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [expandedGroup]);

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

  const expenseTransactions = transactions?.filter((t: any) => t.type === 'expense') || [];
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const thisMonthExpenses = expenseTransactions
    .filter((t: any) => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() + 1 === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    })
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  const dailyAverage = thisMonthExpenses / new Date().getDate();
  const budgetLeft = Math.max(0, 5000 - thisMonthExpenses); // Assuming £5000 budget

  // Process transactions into expense groups
  const expenseGroups: ExpenseGroupData = {
    fundamentals: { shared: [], individual: [], total: 0 },
    fun: { transactions: [], total: 0 },
    futureYou: { transactions: [], total: 0 }
  };

  if (transactions) {
    const currentMonthNum = new Date().getMonth();
    const currentYearNum = new Date().getFullYear();

    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const transactionDate = new Date(transaction.date);
        const isCurrentMonth = transactionDate.getMonth() === currentMonthNum && 
                               transactionDate.getFullYear() === currentYearNum;
        
        if (isCurrentMonth) {
          const amount = parseFloat(transaction.amount);

          switch (transaction.expenseGroup) {
            case 'fundamentals':
              expenseGroups.fundamentals.total += amount;
              if (transaction.isSharedExpense === true) {
                expenseGroups.fundamentals.shared.push(transaction);
              } else {
                expenseGroups.fundamentals.individual.push(transaction);
              }
              break;
            case 'fun':
              expenseGroups.fun.total += amount;
              expenseGroups.fun.transactions.push(transaction);
              break;
            case 'future-you':
              expenseGroups.futureYou.total += amount;
              expenseGroups.futureYou.transactions.push(transaction);
              break;
          }
        }
      }
    });
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const formatTransactionDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  // Group expenses by category
  const expensesByCategory = expenseTransactions.reduce((acc: any, t: any) => {
    if (!acc[t.category]) {
      acc[t.category] = 0;
    }
    acc[t.category] += parseFloat(t.amount);
    return acc;
  }, {});

  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food':
      case 'food & dining':
        return <Utensils className="w-4 h-4 text-red-400" strokeWidth={1.5} />;
      case 'transport':
      case 'transportation':
        return <Car className="w-4 h-4 text-blue-400" strokeWidth={1.5} />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-green-400" strokeWidth={1.5} />;
      default:
        return <Coffee className="w-4 h-4 text-red-400" strokeWidth={1.5} />;
    }
  };

  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <div className="px-4 sm:px-8 py-4 lg:py-6">
      {/* Expense Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="w-5 h-5 text-red-400" strokeWidth={1.5} />
            <span className="text-sm font-medium font-geist">This Month</span>
          </div>
          <div className="text-2xl font-jakarta font-medium mb-1">{formatCurrency(thisMonthExpenses)}</div>
          <span className="text-xs text-red-400 font-geist">+8.1% from last month</span>
        </div>
        
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-orange-400" strokeWidth={1.5} />
            <span className="text-sm font-medium font-geist">Daily Average</span>
          </div>
          <div className="text-2xl font-jakarta font-medium mb-1">{formatCurrency(dailyAverage)}</div>
          <span className="text-xs text-orange-400 font-geist">Based on {new Date().getDate()} days</span>
        </div>
        
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" strokeWidth={1.5} />
            <span className="text-sm font-medium font-geist">Budget Left</span>
          </div>
          <div className="text-2xl font-jakarta font-medium mb-1">{formatCurrency(budgetLeft)}</div>
          <span className="text-xs text-yellow-400 font-geist">
            {((budgetLeft / 5000) * 100).toFixed(1)}% remaining
          </span>
        </div>
      </div>

      {/* Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="glass-card p-5">
          <h3 className="text-lg font-jakarta font-medium mb-4">Top Categories</h3>
          <div className="space-y-3">
            {sortedCategories.length > 0 ? (
              sortedCategories.map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center">
                      {getIconForCategory(category)}
                    </div>
                    <span className="text-sm font-geist capitalize">{category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium font-geist">{formatCurrency(amount as number)}</div>
                    <div className="text-xs text-white/60">
                      {((amount as number / thisMonthExpenses) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/60">
                <p className="font-geist">No expense categories yet</p>
                <p className="text-xs mt-1 font-geist">Add your first expense to get started</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-lg font-jakarta font-medium mb-4">Monthly Budget Progress</h3>
          <div className="space-y-4">
            {sortedCategories.slice(0, 3).map(([category, amount]) => {
              const categoryBudget = 1500; // Sample budget per category
              const percentage = Math.min(((amount as number) / categoryBudget) * 100, 100);
              
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-geist capitalize">{category}</span>
                    <span className="text-white/60 font-geist">
                      {formatCurrency(amount as number)} / {formatCurrency(categoryBudget)}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        percentage > 90 ? 'bg-red-400' : 
                        percentage > 75 ? 'bg-yellow-400' : 'bg-green-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-jakarta font-medium">Recent Expenses</h3>
          <button className="text-xs text-blue-400 hover:text-blue-300 font-geist">View All</button>
        </div>
        
        <div className="space-y-3">
          {expenseTransactions.length > 0 ? (
            expenseTransactions.slice(0, 8).map((expense: any) => (
              <div key={expense.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center">
                    {getIconForCategory(expense.category)}
                  </div>
                  <div>
                    <p className="text-sm font-medium font-geist">{expense.description}</p>
                    <p className="text-xs text-white/60 font-geist">
                      {new Date(expense.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })} • {expense.category}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-red-400 font-geist">
                  -{formatCurrency(parseFloat(expense.amount))}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/60">
              <p className="font-geist">No expenses yet</p>
              <p className="text-xs mt-1 font-geist">Add your first expense to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Recurring Expenses Section */}
      <div className="mt-6">
        <RecurringExpenseList />
      </div>

      {/* Expense Groups Section */}
      <div className="mt-8" id="monthly-expense-groups">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 font-jakarta">Monthly Expense Groups</h2>
          <p className="text-white/60 font-geist">
            Detailed breakdown of your expenses by category for financial review
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Fundamentals */}
          <div className="glass-card p-4 sm:p-5 lg:p-6 metric-card-gradient-red">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleGroup('fundamentals')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-medium font-geist">Fundamentals</h3>
                  <p className="text-sm text-white/60 font-geist">Essential household expenses and bills</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-jakarta font-medium">
                    {formatCurrency(expenseGroups.fundamentals.total)}
                  </div>
                  <div className="text-sm text-white/60">
                    {expenseGroups.fundamentals.shared.length + expenseGroups.fundamentals.individual.length} transactions
                  </div>
                </div>
                {expandedGroups.fundamentals ? 
                  <ChevronUp className="w-5 h-5 text-white/60" /> : 
                  <ChevronDown className="w-5 h-5 text-white/60" />
                }
              </div>
            </div>

            {expandedGroups.fundamentals && (
              <div className="mt-6 space-y-4">
                {expenseGroups.fundamentals.shared.length > 0 && (
                  <TransactionList transactions={expenseGroups.fundamentals.shared} type="shared" />
                )}
                {expenseGroups.fundamentals.individual.length > 0 && (
                  <TransactionList transactions={expenseGroups.fundamentals.individual} type="individual" />
                )}
                {expenseGroups.fundamentals.shared.length === 0 && expenseGroups.fundamentals.individual.length === 0 && (
                  <div className="text-center py-8 text-white/40">
                    No fundamental expenses recorded this month
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fun */}
          <div className="glass-card p-4 sm:p-5 lg:p-6 metric-card-gradient-purple">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleGroup('fun')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-purple-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-medium font-geist">Fun</h3>
                  <p className="text-sm text-white/60 font-geist">Entertainment and discretionary spending</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-jakarta font-medium">
                    {formatCurrency(expenseGroups.fun.total)}
                  </div>
                  <div className="text-sm text-white/60">
                    {expenseGroups.fun.transactions.length} transactions
                  </div>
                </div>
                {expandedGroups.fun ? 
                  <ChevronUp className="w-5 h-5 text-white/60" /> : 
                  <ChevronDown className="w-5 h-5 text-white/60" />
                }
              </div>
            </div>

            {expandedGroups.fun && (
              <div className="mt-6">
                <TransactionList transactions={expenseGroups.fun.transactions} />
              </div>
            )}
          </div>

          {/* Future You */}
          <div className="glass-card p-4 sm:p-5 lg:p-6 metric-card-gradient-green">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleGroup('futureYou')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-medium font-geist">Future You</h3>
                  <p className="text-sm text-white/60 font-geist">Investments and savings for future goals</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-jakarta font-medium">
                    {formatCurrency(expenseGroups.futureYou.total)}
                  </div>
                  <div className="text-sm text-white/60">
                    {expenseGroups.futureYou.transactions.length} transactions
                  </div>
                </div>
                {expandedGroups.futureYou ? 
                  <ChevronUp className="w-5 h-5 text-white/60" /> : 
                  <ChevronDown className="w-5 h-5 text-white/60" />
                }
              </div>
            </div>

            {expandedGroups.futureYou && (
              <div className="mt-6">
                <TransactionList transactions={expenseGroups.futureYou.transactions} />
              </div>
            )}
          </div>
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

  function TransactionList({ transactions, type }: { transactions: Transaction[], type?: 'shared' | 'individual' }) {
    return (
      <div className="space-y-2 mt-3">
        {type && (
          <div className="text-xs font-medium text-white/80 uppercase tracking-wide flex items-center gap-1 mb-2">
            {type === 'shared' ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
            {type === 'shared' ? 'Shared Expenses' : 'Individual Expenses'}
          </div>
        )}
        {transactions.map(transaction => (
          <div key={transaction.id} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{transaction.description}</span>
                  <div className="flex items-center gap-1 text-xs text-white/60">
                    <Tag className="w-3 h-3" />
                    <span>{transaction.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <Calendar className="w-3 h-3" />
                  <span>{formatTransactionDate(transaction.date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-red-400">
                    -{formatCurrency(parseFloat(transaction.amount))}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditTransaction({
                      ...transaction,
                      date: new Date(transaction.date),
                      expenseGroup: transaction.expenseGroup || null,
                      isSharedExpense: transaction.isSharedExpense || null,
                      userId: transaction.userId || 'alex.johnson',
                      createdAt: transaction.createdAt || null
                    } as Transaction)}
                    className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                    title="Edit transaction"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-red-400 transition-colors"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="text-center py-4 text-white/40 text-sm">
            No {type || ''} transactions this month
          </div>
        )}
      </div>
    );
  }
}
