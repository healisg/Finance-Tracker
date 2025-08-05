import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PiggyBank, Target, Calendar, Home, Plane, Car, Plus, Edit, Trash2, AlertCircle, X, GraduationCap, Heart, Gift } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/use-currency";
import type { SavingsPot } from "@shared/schema";

interface SavingsPotModalProps {
  isOpen: boolean;
  onClose: () => void;
  editPot?: SavingsPot | null;
}

interface SavingsPotFormData {
  name: string;
  targetAmount: string;
  currentAmount: string;
  category: string;
  icon: string;
  deadline: string;
}

function SavingsPotModal({ isOpen, onClose, editPot }: SavingsPotModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SavingsPotFormData>({
    name: "",
    targetAmount: "",
    currentAmount: "",
    category: "emergency",
    icon: "piggy-bank",
    deadline: "",
  });

  // Reset form data when editPot changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editPot?.name || "",
        targetAmount: editPot?.targetAmount || "",
        currentAmount: editPot?.currentAmount || "",
        category: editPot?.category || "emergency",
        icon: editPot?.icon || "piggy-bank",
        deadline: editPot?.deadline ? new Date(editPot.deadline).toISOString().split('T')[0] : "",
      });
    }
  }, [editPot, isOpen]);

  const potMutation = useMutation({
    mutationFn: async (data: SavingsPotFormData) => {
      const method = editPot ? 'PUT' : 'POST';
      const url = editPot ? `/api/savings-pots/${editPot.id}` : '/api/savings-pots';
      
      const response = await apiRequest(method, url, {
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || "0",
        category: data.category,
        icon: data.icon,
        deadline: data.deadline || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/savings-pots'] });
      toast({
        title: "Success",
        description: editPot ? "Savings pot updated successfully" : "Savings pot added successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save savings pot",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    potMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-jakarta font-medium">
              {editPot ? "Edit Savings Pot" : "Add New Pot"}
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pot Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Emergency Fund, Vacation, etc."
                data-testid="input-pot-name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="select-pot-category"
              >
                <option value="emergency">Emergency Fund</option>
                <option value="vacation">Vacation</option>
                <option value="house">House/Property</option>
                <option value="car">Car/Vehicle</option>
                <option value="education">Education</option>
                <option value="retirement">Retirement</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="select-pot-icon"
              >
                <option value="piggy-bank">Piggy Bank</option>
                <option value="home">House</option>
                <option value="plane">Travel</option>
                <option value="car">Car</option>
                <option value="graduation-cap">Education</option>
                <option value="heart">Health</option>
                <option value="gift">Gift</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  data-testid="input-target-amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  data-testid="input-current-amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Date</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="input-deadline"
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
                disabled={potMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
                data-testid="button-save-pot"
              >
                {potMutation.isPending ? "Saving..." : editPot ? "Update" : "Add Pot"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Savings() {
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPot, setEditingPot] = useState<SavingsPot | null>(null);

  const { data: savingsPots, isLoading } = useQuery<SavingsPot[]>({
    queryKey: ["/api/savings-pots"],
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    }
  });

  const deletePotMutation = useMutation({
    mutationFn: async (potId: string) => {
      const response = await apiRequest('DELETE', `/api/savings-pots/${potId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/savings-pots'] });
      toast({
        title: "Success",
        description: "Savings pot deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete savings pot",
        variant: "destructive",
      });
    },
  });

  const handleEditPot = (pot: SavingsPot) => {
    setEditingPot(pot);
    setIsModalOpen(true);
  };

  const handleDeletePot = (potId: string) => {
    if (confirm("Are you sure you want to delete this savings pot?")) {
      deletePotMutation.mutate(potId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPot(null);
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

  const totalSavings = savingsPots?.reduce((sum: number, pot: SavingsPot) => sum + parseFloat(pot.currentAmount || "0"), 0) || 0;
  const totalTargets = savingsPots?.reduce((sum: number, pot: SavingsPot) => sum + parseFloat(pot.targetAmount || "0"), 0) || 0;
  const savingsRate = totalTargets > 0 ? (totalSavings / totalTargets) * 100 : 0;

  // Get pot-related transactions for linking
  const getPotTransactions = (category: string) => {
    if (!transactions) return [];
    return transactions.filter((t: any) => 
      t.type === 'transfer' && 
      (t.category.toLowerCase().includes(category.toLowerCase()) ||
      (category === 'emergency' && t.category === 'savings') ||
      (category === 'vacation' && t.category === 'savings') ||
      (category === 'house' && t.category === 'savings') ||
      (category === 'car' && t.category === 'savings'))
    );
  };

  const getIconForPot = (icon: string | null) => {
    switch (icon) {
      case 'home':
        return <Home className="w-4 h-4 text-green-400" strokeWidth={1.5} />;
      case 'plane':
        return <Plane className="w-4 h-4 text-blue-400" strokeWidth={1.5} />;
      case 'car':
        return <Car className="w-4 h-4 text-purple-400" strokeWidth={1.5} />;
      case 'graduation-cap':
        return <GraduationCap className="w-4 h-4 text-yellow-400" strokeWidth={1.5} />;
      case 'heart':
        return <Heart className="w-4 h-4 text-red-400" strokeWidth={1.5} />;
      case 'gift':
        return <Gift className="w-4 h-4 text-pink-400" strokeWidth={1.5} />;
      default:
        return <PiggyBank className="w-4 h-4 text-green-400" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="px-4 sm:px-8 py-4 lg:py-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white font-jakarta mb-2">Savings Management</h1>
            <p className="text-white/60 font-geist">Track and manage your savings goals by category</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-geist text-sm transition-colors"
            data-testid="button-add-pot"
          >
            <Plus className="w-4 h-4" />
            Add New Pot
          </button>
        </div>

        {/* Savings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 bg-gradient-to-br from-green-900/20 to-green-800/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium font-geist">Total Saved</h3>
                <p className="text-xs text-white/60 font-geist">Current balance</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-400 font-geist">{formatCurrency(totalSavings)}</p>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium font-geist">Target Amount</h3>
                <p className="text-xs text-white/60 font-geist">Total goals</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-400 font-geist">{formatCurrency(totalTargets)}</p>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium font-geist">Progress</h3>
                <p className="text-xs text-white/60 font-geist">Goal completion</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-400 font-geist">{savingsRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Savings Pots List */}
      {savingsPots && savingsPots.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-medium font-jakarta mb-4">Your Savings Pots</h2>
          {savingsPots.map((pot: SavingsPot) => {
            const progress = parseFloat(pot.targetAmount) > 0 
              ? (parseFloat(pot.currentAmount || "0") / parseFloat(pot.targetAmount)) * 100 
              : 0;
            const relatedTransactions = getPotTransactions(pot.category || "other");
            
            return (
              <div key={pot.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium font-geist">{pot.name}</h3>
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs font-geist capitalize">
                        {pot.category?.replace('_', ' ') || 'other'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-white/60 font-geist">Current</p>
                        <p className="font-medium text-green-400 font-geist">{formatCurrency(parseFloat(pot.currentAmount || "0"))}</p>
                      </div>
                      <div>
                        <p className="text-white/60 font-geist">Target</p>
                        <p className="font-medium font-geist">{formatCurrency(parseFloat(pot.targetAmount))}</p>
                      </div>
                      <div>
                        <p className="text-white/60 font-geist">Remaining</p>
                        <p className="font-medium font-geist">{formatCurrency(parseFloat(pot.targetAmount) - parseFloat(pot.currentAmount || "0"))}</p>
                      </div>
                      {pot.deadline && (
                        <div>
                          <p className="text-white/60 font-geist">Deadline</p>
                          <p className="font-medium font-geist">{new Date(pot.deadline).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/60 font-geist">Progress</span>
                        <span className="text-xs font-medium font-geist">{progress.toFixed(1)}% saved</span>
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
                            Related Transfers ({relatedTransactions.length})
                          </span>
                        </div>
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                          {relatedTransactions.slice(0, 3).map((transaction: any) => (
                            <div key={transaction.id} className="flex items-center justify-between text-xs">
                              <span className="text-white/70 font-geist">{transaction.description}</span>
                              <span className="text-green-400 font-geist">{formatCurrency(parseFloat(transaction.amount))}</span>
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
                      onClick={() => handleEditPot(pot)}
                      className="p-2 text-white/60 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                      data-testid={`button-edit-pot-${pot.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePot(pot.id)}
                      className="p-2 text-white/60 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      data-testid={`button-delete-pot-${pot.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <PiggyBank className="w-16 h-16 text-white/40 mx-auto mb-4" strokeWidth={1} />
          <h3 className="text-xl font-jakarta font-medium mb-2">No Savings Pots Found</h3>
          <p className="text-white/60 font-geist mb-4">Start creating savings pots to track your financial goals</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 font-geist text-sm transition-colors"
            data-testid="button-add-first-pot"
          >
            Create Your First Pot
          </button>
        </div>
      )}

      <SavingsPotModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        editPot={editingPot}
      />
    </div>
  );
}