import { useState } from "react";
import { Wallet, Home, TrendingUp, TrendingDown, PiggyBank, CreditCard, BarChart3, Target, ChevronDown, Settings, Heart } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { SectionType } from "@/pages/dashboard";

interface SidebarProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isBudgetExpanded, setIsBudgetExpanded] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { id: 'overview' as SectionType, icon: Home, label: 'Overview' },
    { id: 'income' as SectionType, icon: TrendingUp, label: 'Income' },
    { id: 'expenses' as SectionType, icon: TrendingDown, label: 'Expenses' },
    { id: 'savings' as SectionType, icon: PiggyBank, label: 'Savings' },
    { id: 'debts' as SectionType, icon: CreditCard, label: 'Debts' },
    { id: 'investments' as SectionType, icon: BarChart3, label: 'Investments' },
  ];

  const budgetItems = [
    { id: 'budget' as SectionType, label: 'Monthly Budget' },
    { id: 'goals' as SectionType, label: 'Savings Goals' },
    { id: 'payoff' as SectionType, label: 'Debt Payoff' },
  ];

  return (
    <aside className="w-full lg:w-64 sidebar-gradient-bg flex flex-col lg:max-h-full overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 lg:py-6 flex-shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Wallet className="w-4 h-4 text-white" strokeWidth={1.5} />
        </div>
        <span className="text-lg font-semibold tracking-tight font-geist">FinanceTracker</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`nav-item ${activeSection === item.id ? 'nav-item-active' : ''}`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm font-medium font-geist">{item.label}</span>
            </button>
          );
        })}



        {/* Budget collapsible */}
        <div>
          <button
            onClick={() => setIsBudgetExpanded(!isBudgetExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-stone-600/20"
          >
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm font-medium font-geist">Budget & Goals</span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${isBudgetExpanded ? 'rotate-180' : ''}`} 
              strokeWidth={1.5} 
            />
          </button>
          
          {isBudgetExpanded && (
            <div className="space-y-1 pl-11 mt-1">
              {budgetItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-stone-600/20 text-xs font-geist ${
                    activeSection === item.id ? 'bg-stone-600/20' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* User Profile */}
      <div className="flex items-center gap-3 px-6 py-4 lg:py-6 flex-shrink-0">
        <img 
          src="https://i.pravatar.cc/40?img=5" 
          alt="avatar" 
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-medium font-geist">Alex Johnson</p>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-600/30 hover:bg-stone-600/40">
          <Settings className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
