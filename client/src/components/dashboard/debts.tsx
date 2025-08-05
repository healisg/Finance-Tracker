import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, CreditCard, TrendingDown, Calendar, Percent, Edit, Trash2, AlertCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/use-currency";
import type { Debt } from "@shared/schema";

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  editDebt?: Debt | null;
}

interface DebtFormData {
  name: string;
  category: string;
  totalAmount: string;
  remainingAmount: string;
  interestRate: string;
  minimumPayment: string;
  dueDate: string;
}

function DebtModal({ isOpen, onClose, editDebt }: DebtModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<DebtFormData>({
    name: "",
    category: "credit_card",
    totalAmount: "",
    remainingAmount: "",
    interestRate: "",
    minimumPayment: "",
    dueDate: "",
  });

  // Reset form data when editDebt changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editDebt?.name || "",
        category: editDebt?.category || "credit_card",
        totalAmount: editDebt?.totalAmount || "",
        remainingAmount: editDebt?.remainingAmount || "",
        interestRate: editDebt?.interestRate || "",
        minimumPayment: editDebt?.minimumPayment || "",
        dueDate: editDebt?.dueDate ? new Date(editDebt.dueDate).toISOString().split('T')[0] : "",
      });
    }
  }, [editDebt, isOpen]);

  const debtMutation = useMutation({
    mutationFn: async (data: DebtFormData) => {
      const method = editDebt ? 'PUT' : 'POST';
      const url = editDebt ? `/api/debts/${editDebt.id}` : '/api/debts';
      
      const response = await apiRequest(method, url, {
        name: data.name,
        category: data.category,
        totalAmount: data.totalAmount,
        remainingAmount: data.remainingAmount,
        interestRate: data.interestRate || null,
        minimumPayment: data.minimumPayment || null,
        dueDate: data.dueDate || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/debts'] });
      toast({
        title: "Success",
        description: editDebt ? "Debt updated successfully" : "Debt added successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save debt",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.totalAmount || !formData.remainingAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    debtMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-jakarta font-medium mb-4">
            {editDebt ? "Edit Debt" : "Add New Debt"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Debt Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Credit Card, Student Loan, etc."
                data-testid="input-debt-name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="select-debt-category"
              >
                <option value="credit_card">Credit Card</option>
                <option value="loan">Personal Loan</option>
                <option value="mortgage">Mortgage</option>
                <option value="student_loan">Student Loan</option>
                <option value="car_loan">Car Loan</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Total Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  data-testid="input-total-amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Remaining *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.remainingAmount}
                  onChange={(e) => setFormData({ ...formData, remainingAmount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  data-testid="input-remaining-amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  data-testid="input-interest-rate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Min Payment</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minimumPayment}
                  onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  data-testid="input-minimum-payment"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="input-due-date"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors"
                data-testid="button-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={debtMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
                data-testid="button-save-debt"
              >
                {debtMutation.isPending ? "Saving..." : editDebt ? "Update" : "Add Debt"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Debts() {
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const { data: debts, isLoading } = useQuery({
    queryKey: ['/api/debts'],
    queryFn: async () => {
      const response = await fetch('/api/debts');
      if (!response.ok) throw new Error('Failed to fetch debts');
      return response.json();
    }
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    }
  });

  const deleteDebtMutation = useMutation({
    mutationFn: async (debtId: string) => {
      const response = await apiRequest('DELETE', `/api/debts/${debtId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/debts'] });
      toast({
        title: "Success",
        description: "Debt deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete debt",
        variant: "destructive",
      });
    },
  });

  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
  };

  const handleDeleteDebt = (debtId: string) => {
    if (confirm("Are you sure you want to delete this debt?")) {
      deleteDebtMutation.mutate(debtId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDebt(null);
  };

  // Calculate debt analytics
  const totalDebts = debts?.reduce((sum: number, debt: Debt) => sum + parseFloat(debt.remainingAmount), 0) || 0;
  const totalOriginalDebt = debts?.reduce((sum: number, debt: Debt) => sum + parseFloat(debt.totalAmount), 0) || 0;
  const totalPaidOff = totalOriginalDebt - totalDebts;
  const progressPercentage = totalOriginalDebt > 0 ? (totalPaidOff / totalOriginalDebt) * 100 : 0;

  // Get debt-related transactions for linking
  const getDebtTransactions = (category: string) => {
    if (!transactions) return [];
    return transactions.filter((t: any) => 
      t.type === 'expense' && 
      (t.category.toLowerCase().includes(category.toLowerCase()) ||
      (category === 'credit_card' && (t.category === 'shopping' || t.category === 'entertainment')) ||
      (category === 'mortgage' && t.category === 'housing') ||
      (category === 'car_loan' && t.category === 'transportation'))
    );
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-8 py-4 lg:py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-800 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-4 lg:py-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white font-jakarta mb-2">Debt Management</h1>
            <p className="text-white/60 font-geist">Track and manage your debts by category</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-geist text-sm transition-colors"
            data-testid="button-add-debt"
          >
            <Plus className="w-4 h-4" />
            Add Debt
          </button>
        </div>

        {/* Debt Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 bg-gradient-to-br from-red-900/20 to-red-800/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-medium font-geist">Total Debt</h3>
                <p className="text-xs text-white/60 font-geist">Current balance</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-red-400 font-geist">{formatCurrency(totalDebts)}</p>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-green-900/20 to-green-800/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium font-geist">Paid Off</h3>
                <p className="text-xs text-white/60 font-geist">Amount reduced</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-400 font-geist">{formatCurrency(totalPaidOff)}</p>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Percent className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium font-geist">Progress</h3>
                <p className="text-xs text-white/60 font-geist">Debt reduction</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-400 font-geist">{progressPercentage.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Debt List */}
      {debts && debts.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-medium font-jakarta mb-4">Your Debts</h2>
          {debts.map((debt: Debt) => {
            const progress = parseFloat(debt.totalAmount) > 0 
              ? ((parseFloat(debt.totalAmount) - parseFloat(debt.remainingAmount)) / parseFloat(debt.totalAmount)) * 100 
              : 0;
            const relatedTransactions = getDebtTransactions(debt.category);
            
            return (
              <div key={debt.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium font-geist">{debt.name}</h3>
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs font-geist capitalize">
                        {debt.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-white/60 font-geist">Remaining</p>
                        <p className="font-medium text-red-400 font-geist">{formatCurrency(parseFloat(debt.remainingAmount))}</p>
                      </div>
                      <div>
                        <p className="text-white/60 font-geist">Original</p>
                        <p className="font-medium font-geist">{formatCurrency(parseFloat(debt.totalAmount))}</p>
                      </div>
                      {debt.interestRate && (
                        <div>
                          <p className="text-white/60 font-geist">Interest</p>
                          <p className="font-medium font-geist">{debt.interestRate}%</p>
                        </div>
                      )}
                      {debt.minimumPayment && (
                        <div>
                          <p className="text-white/60 font-geist">Min Payment</p>
                          <p className="font-medium font-geist">{formatCurrency(parseFloat(debt.minimumPayment))}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/60 font-geist">Progress</span>
                        <span className="text-xs font-medium font-geist">{progress.toFixed(1)}% paid off</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Related Transactions */}
                    {relatedTransactions.length > 0 && (
                      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-medium text-blue-400 font-geist">
                            Related Transactions ({relatedTransactions.length})
                          </span>
                        </div>
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                          {relatedTransactions.slice(0, 3).map((transaction: any) => (
                            <div key={transaction.id} className="flex items-center justify-between text-xs">
                              <span className="text-white/70 font-geist">{transaction.description}</span>
                              <span className="text-red-400 font-geist">{formatCurrency(parseFloat(transaction.amount))}</span>
                            </div>
                          ))}
                          {relatedTransactions.length > 3 && (
                            <p className="text-xs text-white/50 font-geist">+{relatedTransactions.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEditDebt(debt)}
                      className="p-2 text-white/60 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                      data-testid={`button-edit-debt-${debt.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDebt(debt.id)}
                      className="p-2 text-white/60 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      data-testid={`button-delete-debt-${debt.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {debt.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Calendar className="w-4 h-4" />
                    <span className="font-geist">Due: {new Date(debt.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <CreditCard className="w-16 h-16 text-white/40 mx-auto mb-4" strokeWidth={1} />
          <h3 className="text-xl font-jakarta font-medium mb-2">No Debts Found</h3>
          <p className="text-white/60 font-geist mb-4">Start tracking your debts to manage them effectively</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 font-geist text-sm transition-colors"
            data-testid="button-add-first-debt"
          >
            Add Your First Debt
          </button>
        </div>
      )}

      <DebtModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        editDebt={editingDebt}
      />
    </div>
  );
}
