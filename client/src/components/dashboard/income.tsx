import { useQuery } from "@tanstack/react-query";
import { Banknote, Calendar, Target, Briefcase, Laptop, TrendingUp } from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function Income() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
    <div className="px-4 sm:px-8 py-4 lg:py-6">
      {/* Income Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Banknote className="w-5 h-5 text-green-400" strokeWidth={1.5} />
            <span className="text-sm font-medium font-geist">This Month</span>
          </div>
          <div className="text-2xl font-jakarta font-medium mb-1">{formatCurrency(thisMonthIncome)}</div>
          <span className="text-xs text-green-400 font-geist">+5.2% from last month</span>
        </div>
        
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
            <span className="text-sm font-medium font-geist">This Year</span>
          </div>
          <div className="text-2xl font-jakarta font-medium mb-1">{formatCurrency(thisYearIncome)}</div>
          <span className="text-xs text-blue-400 font-geist">+12.3% from last year</span>
        </div>
        
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
            <span className="text-sm font-medium font-geist">Target</span>
          </div>
          <div className="text-2xl font-jakarta font-medium mb-1">{formatCurrency(7000)}</div>
          <span className="text-xs text-purple-400 font-geist">
            {((thisMonthIncome / 7000) * 100).toFixed(1)}% achieved
          </span>
        </div>
      </div>

      {/* Income Sources */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-lg font-jakarta font-medium mb-4">Income Sources</h3>
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
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                    {getIconForCategory(transaction.category)}
                  </div>
                  <div>
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
                <span className="text-sm font-medium text-green-400 font-geist">
                  +{formatCurrency(parseFloat(transaction.amount))}
                </span>
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
    </div>
  );
}
