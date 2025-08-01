import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, RotateCcw, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/use-currency";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RecurringExpense } from "@shared/schema";
import RecurringExpenseModal from "./recurring-expense-modal";

export default function RecurringExpenseList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();

  const { data: recurringExpenses, isLoading } = useQuery<RecurringExpense[]>({
    queryKey: ["/api/recurring-expenses"],
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/recurring-expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error('Failed to delete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-expenses"] });
      toast({
        title: "Success",
        description: "Recurring expense deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete recurring expense",
        variant: "destructive",
      });
    },
  });

  const generateTransactionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/recurring-expenses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Use current month/year
      });
      if (!response.ok) throw new Error('Failed to generate');
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Success",
        description: `Generated ${data.transactions?.length || 0} recurring transactions`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate recurring transactions",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (expense: RecurringExpense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this recurring expense?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const getExpenseGroupColor = (group: string) => {
    switch (group) {
      case 'fundamentals':
        return 'bg-red-600/20 text-red-400';
      case 'fun':
        return 'bg-purple-600/20 text-purple-400';
      case 'future-you':
        return 'bg-green-600/20 text-green-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getExpenseGroupLabel = (group: string) => {
    switch (group) {
      case 'fundamentals':
        return 'Fundamentals';
      case 'fun':
        return 'Fun';
      case 'future-you':
        return 'Future You';
      default:
        return group;
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-white font-geist">Recurring Expenses</h3>
            <p className="text-sm text-white/60 font-geist mt-1">
              Set up expenses that repeat every month automatically
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => generateTransactionsMutation.mutate()}
              disabled={generateTransactionsMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Generate This Month
            </Button>
            <Button
              onClick={handleAddNew}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Recurring Expense
            </Button>
          </div>
        </div>

        {!recurringExpenses?.length ? (
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white/80 mb-2 font-geist">No recurring expenses yet</h4>
            <p className="text-white/60 mb-6 font-geist">
              Set up your monthly expenses to save time on manual entry
            </p>
            <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Recurring Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recurringExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-white font-geist">{expense.description}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpenseGroupColor(expense.expenseGroup)}`}>
                        {getExpenseGroupLabel(expense.expenseGroup)}
                      </span>
                      {expense.isSharedExpense && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400">
                          Shared
                        </span>
                      )}
                      {!expense.isActive && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60 font-geist">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>Day {expense.dayOfMonth} of each month</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium text-white font-jakarta">
                      {formatCurrency(parseFloat(expense.amount))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleEdit(expense)}
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(expense.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                      disabled={deleteExpenseMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RecurringExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
      />
    </div>
  );
}