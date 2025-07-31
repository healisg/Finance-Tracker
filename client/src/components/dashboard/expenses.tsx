import { useQuery } from "@tanstack/react-query";
import { CreditCard, Calendar, AlertTriangle, Utensils, Car, ShoppingBag, Coffee } from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function Expenses() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

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
  const budgetLeft = Math.max(0, 5000 - thisMonthExpenses); // Assuming $5000 budget

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
    </div>
  );
}
