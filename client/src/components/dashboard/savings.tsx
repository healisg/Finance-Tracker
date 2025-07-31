import { useQuery } from "@tanstack/react-query";
import { PiggyBank, Target, Calendar, Home, Plane, Car, Plus } from "lucide-react";
import type { SavingsPot } from "@shared/schema";

export default function Savings() {
  const { data: savingsPots, isLoading } = useQuery<SavingsPot[]>({
    queryKey: ["/api/savings-pots"],
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const totalSavings = savingsPots?.reduce((sum: number, pot: any) => sum + parseFloat(pot.currentAmount || 0), 0) || 0;
  const totalTargets = savingsPots?.reduce((sum: number, pot: any) => sum + parseFloat(pot.targetAmount || 0), 0) || 0;
  const savingsRate = totalTargets > 0 ? (totalSavings / totalTargets) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getIconForPot = (icon: string) => {
    switch (icon) {
      case 'home':
        return <Home className="w-4 h-4 text-green-400" strokeWidth={1.5} />;
      case 'plane':
        return <Plane className="w-4 h-4 text-blue-400" strokeWidth={1.5} />;
      case 'car':
        return <Car className="w-4 h-4 text-purple-400" strokeWidth={1.5} />;
      default:
        return <PiggyBank className="w-4 h-4 text-green-400" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="px-4 sm:px-8 py-4 lg:py-6">
      {/* Savings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <PiggyBank className="w-5 h-5 text-green-400" strokeWidth={1.5} />
            <span className="text-sm font-medium font-geist">Total Savings</span>
          </div>
          <div className="text-2xl font-jakarta font-medium mb-1">{formatCurrency(totalSavings)}</div>
          <span className="text-xs text-green-400 font-geist">+15.3% this month</span>
        </div>
        
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
            <span className="text-sm font-medium font-geist">Savings Rate</span>
          </div>
          <div className="text-2xl font-jakarta font-medium mb-1">{savingsRate.toFixed(1)}%</div>
          <span className="text-xs text-blue-400 font-geist">
            {savingsRate > 20 ? 'Above recommended 20%' : 'Below recommended 20%'}
          </span>
        </div>
        
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
            <span className="text-sm font-medium font-geist">This Month</span>
          </div>
          <div className="text-2xl font-jakarta font-medium mb-1">{formatCurrency(2300)}</div>
          <span className="text-xs text-purple-400 font-geist">Goal: {formatCurrency(2000)}</span>
        </div>
      </div>

      {/* Savings Pots */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-jakarta font-medium">Savings Pots</h3>
          <button className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-full font-geist flex items-center gap-1">
            <Plus className="w-3 h-3" strokeWidth={1.5} />
            Add New Pot
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsPots && savingsPots.length > 0 ? (
            savingsPots.map((pot: any) => {
              const progress = parseFloat(pot.targetAmount) > 0 ? 
                (parseFloat(pot.currentAmount || 0) / parseFloat(pot.targetAmount)) * 100 : 0;
              
              return (
                <div key={pot.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getIconForPot(pot.icon)}
                      <span className="font-medium font-geist">{pot.name}</span>
                    </div>
                    <span className="text-sm text-white/60 font-geist">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-geist">{formatCurrency(parseFloat(pot.currentAmount || 0))}</span>
                      <span className="text-white/60 font-geist">
                        Goal: {formatCurrency(parseFloat(pot.targetAmount))}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-8 text-white/60">
              <PiggyBank className="w-12 h-12 mx-auto mb-2 opacity-40" strokeWidth={1} />
              <p className="font-geist">No savings pots yet</p>
              <p className="text-xs mt-1 font-geist">Create your first savings pot to start tracking your goals</p>
            </div>
          )}
        </div>
      </div>

      {/* Savings Goals Progress */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-jakarta font-medium">Savings Goals Progress</h3>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1 rounded-full bg-stone-600/20 hover:bg-stone-600/30 font-geist">6M</button>
            <button className="text-xs px-3 py-1 rounded-full bg-blue-600 font-geist">12M</button>
          </div>
        </div>
        
        {savingsPots && savingsPots.length > 0 ? (
          <div className="space-y-4">
            {savingsPots.slice(0, 3).map((pot: any) => {
              const progress = parseFloat(pot.targetAmount) > 0 ? 
                (parseFloat(pot.currentAmount || 0) / parseFloat(pot.targetAmount)) * 100 : 0;
              const remaining = parseFloat(pot.targetAmount) - parseFloat(pot.currentAmount || 0);
              
              return (
                <div key={pot.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getIconForPot(pot.icon)}
                      <span className="font-medium font-geist">{pot.name}</span>
                    </div>
                    <span className="text-sm text-white/60 font-geist">
                      {formatCurrency(remaining)} remaining
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-geist">{progress.toFixed(1)}% complete</span>
                      <span className="text-white/60 font-geist">
                        {formatCurrency(parseFloat(pot.currentAmount || 0))} / {formatCurrency(parseFloat(pot.targetAmount))}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          progress >= 100 ? 'bg-green-400' : 
                          progress >= 75 ? 'bg-blue-400' : 
                          progress >= 50 ? 'bg-yellow-400' : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-white/60">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-40" strokeWidth={1} />
            <p className="font-geist">No savings goals yet</p>
            <p className="text-xs mt-1 font-geist">Set your first savings goal to track your progress</p>
          </div>
        )}
      </div>
    </div>
  );
}
