import { useState } from "react";
import { Wallet, Home, TrendingUp, TrendingDown, PiggyBank, CreditCard, BarChart3, Target, ChevronDown, Settings, Heart, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { SectionType } from "@/pages/dashboard";

interface SidebarProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ activeSection, onSectionChange, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const [isBudgetExpanded, setIsBudgetExpanded] = useState(false);
  const [location] = useLocation();

  const handleSectionChange = (section: SectionType) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
  };

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
    <>
      {/* Mobile Navigation - Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 sidebar-gradient-bg border-t border-white/10">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
                  activeSection === item.id 
                    ? 'bg-blue-600/20 text-blue-400' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-xs font-medium font-geist">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Desktop Sidebar / Mobile Slide-out Menu */}
      <aside className={`
        fixed lg:relative top-0 left-0 z-50 lg:z-auto
        w-80 lg:w-64 h-full lg:h-auto
        sidebar-gradient-bg flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:max-h-full overflow-y-auto
      `}>
        {/* Mobile Header with Close Button */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-lg font-semibold tracking-tight font-geist">FinanceTracker</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Desktop Logo */}
        <div className="hidden lg:flex items-center gap-2 px-6 py-4 lg:py-6 flex-shrink-0">
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
              onClick={() => handleSectionChange(item.id)}
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
                  onClick={() => handleSectionChange(item.id)}
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
    </>
  );
}
