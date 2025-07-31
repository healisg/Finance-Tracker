import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import Overview from "@/components/dashboard/overview";
import Income from "@/components/dashboard/income";
import Expenses from "@/components/dashboard/expenses";
import Savings from "@/components/dashboard/savings";
import Debts from "@/components/dashboard/debts";
import Investments from "@/components/dashboard/investments";
import Budget from "@/components/dashboard/budget";
import Goals from "@/components/dashboard/goals";
import TransactionModal from "@/components/modals/transaction-modal";
import type { Transaction } from "@shared/schema";

export type SectionType = 'overview' | 'income' | 'expenses' | 'savings' | 'debts' | 'investments' | 'budget' | 'goals' | 'payoff';

const sectionData = {
  overview: {
    title: 'Financial Overview',
    subtitle: 'Track your income, expenses, and savings goals'
  },
  income: {
    title: 'Income Management',
    subtitle: 'Monitor and track all your income sources'
  },
  expenses: {
    title: 'Expense Tracking',
    subtitle: 'Categorize and analyze your spending patterns'
  },
  savings: {
    title: 'Savings Management',
    subtitle: 'Track your savings pots and financial goals'
  },
  debts: {
    title: 'Debt Management',
    subtitle: 'Monitor and manage your debts effectively'
  },
  investments: {
    title: 'Investment Portfolio',
    subtitle: 'Track your investment performance and growth'
  },
  budget: {
    title: 'Monthly Budget',
    subtitle: 'Create and manage your monthly budgets'
  },
  goals: {
    title: 'Savings Goals',
    subtitle: 'Set and track your financial goals'
  },
  payoff: {
    title: 'Debt Payoff Plan',
    subtitle: 'Create strategies to pay off your debts'
  }
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  const openEditModal = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const closeModal = () => {
    setIsTransactionModalOpen(false);
    setEditTransaction(null);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview onEditTransaction={openEditModal} />;
      case 'income':
        return <Income />;
      case 'expenses':
        return <Expenses />;
      case 'savings':
        return <Savings />;
      case 'debts':
        return <Debts />;
      case 'investments':
        return <Investments />;
      case 'budget':
        return <Budget />;
      case 'goals':
        return <Goals />;
      default:
        return <Overview onEditTransaction={openEditModal} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#585662] p-4">
      <div className="w-full max-w-[1440px] min-h-[600px] h-[min(900px,calc(100vh-2rem))] finance-gradient-bg rounded-lg overflow-hidden text-white">
        <div className="flex h-full flex-col lg:flex-row">
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
          
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <TopBar
              title={sectionData[activeSection].title}
              subtitle={sectionData[activeSection].subtitle}
              onAddTransaction={() => setIsTransactionModalOpen(true)}
            />
            
            <div className="flex-1 overflow-y-auto">
              {renderSection()}
            </div>
          </main>
        </div>
      </div>

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={closeModal}
        editTransaction={editTransaction}
      />
    </div>
  );
}
