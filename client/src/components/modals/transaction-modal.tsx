import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, AlertCircle, CreditCard, PiggyBank } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/use-currency";
import type { Transaction, Debt, SavingsPot } from "@shared/schema";
import { EXPENSE_GROUPS } from "@shared/schema";

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  expenseGroup: z.enum(['fundamentals', 'fun', 'future-you']).optional(),
  isSharedExpense: z.boolean().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

function SavingsIndicator({ description }: { description: string }) {
  const { formatCurrency } = useCurrency();
  
  const { data: savingsPots } = useQuery<SavingsPot[]>({
    queryKey: ['/api/savings-pots'],
    queryFn: async () => {
      const response = await fetch('/api/savings-pots');
      if (!response.ok) throw new Error('Failed to fetch savings pots');
      return response.json();
    },
  });

  if (!savingsPots || savingsPots.length === 0) {
    return (
      <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-400 font-geist">
            No Savings Pots Found
          </span>
        </div>
        <p className="text-xs text-yellow-300/80 font-geist">
          Create a savings pot to track this savings transaction
        </p>
      </div>
    );
  }

  // Find matching pot based on description
  const matchingPot = description ? savingsPots.find(pot => 
    description.toLowerCase().includes(pot.name.toLowerCase()) ||
    pot.name.toLowerCase().includes(description.toLowerCase())
  ) : null;

  return (
    <div className="mt-2 p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <PiggyBank className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium text-green-400 font-geist">
          {matchingPot ? 'Will Update Savings Pot' : 'Available Savings Pots'}
        </span>
      </div>
      <div className="space-y-1">
        {matchingPot ? (
          <div className="p-2 bg-green-800/30 rounded border border-green-600/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-medium font-geist">{matchingPot.name}</span>
              <span className="text-green-400 font-geist">
                {formatCurrency(parseFloat(matchingPot.currentAmount || '0'))} saved
              </span>
            </div>
            <p className="text-xs text-green-300/80 mt-1 font-geist">
              This pot will be updated with your transaction amount
            </p>
          </div>
        ) : (
          <>
            {savingsPots.slice(0, 3).map((pot: SavingsPot) => (
              <div key={pot.id} className="flex items-center justify-between text-xs">
                <span className="text-white/70 font-geist">{pot.name}</span>
                <span className="text-green-400 font-geist">
                  {formatCurrency(parseFloat(pot.currentAmount || '0'))} saved
                </span>
              </div>
            ))}
            <p className="text-xs text-green-300/80 mt-2 font-geist">
              💡 Include a pot name in the description to auto-update it
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function TransactionModal({ isOpen, onClose, editTransaction }: TransactionModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  // Fetch debts for category-based associations
  const { data: debts } = useQuery({
    queryKey: ['/api/debts'],
    queryFn: async () => {
      const response = await fetch('/api/debts');
      if (!response.ok) throw new Error('Failed to fetch debts');
      return response.json();
    },
    enabled: isOpen,
  });

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      expenseGroup: undefined,
      isSharedExpense: false,
    },
  });

  // Update form when editing a transaction
  useEffect(() => {
    if (editTransaction) {
      // Check if the transaction was shared by looking at the description
      const wasShared = editTransaction.description.includes('(Shared expense');
      const originalDescription = wasShared 
        ? editTransaction.description.split(' (Shared expense')[0] 
        : editTransaction.description;

      // If it was shared, double the amount to show the original total
      const originalAmount = wasShared && editTransaction.type === 'expense'
        ? (parseFloat(editTransaction.amount) * 2).toString()
        : editTransaction.amount;

      form.reset({
        type: editTransaction.type as 'income' | 'expense' | 'transfer',
        amount: originalAmount,
        category: editTransaction.category,
        description: originalDescription,
        date: new Date(editTransaction.date).toISOString().split('T')[0],
        expenseGroup: editTransaction.expenseGroup as 'fundamentals' | 'fun' | 'future-you' | undefined,
        isSharedExpense: editTransaction.isSharedExpense || false,
      });
    } else {
      form.reset({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        expenseGroup: undefined,
        isSharedExpense: false,
      });
    }
  }, [editTransaction, form]);

  const saveTransactionMutation = useMutation({
    mutationFn: async ({ data, transactionId }: { data: TransactionFormData; transactionId?: string }) => {

      
      // Calculate the final amount - split in half if isSharedExpense is enabled
      const finalAmount = data.isSharedExpense && data.type === 'expense' 
        ? (parseFloat(data.amount) / 2).toString()
        : data.amount;

      // Update description to indicate it's a shared expense
      const finalDescription = data.isSharedExpense && data.type === 'expense'
        ? `${data.description} (Shared expense - your share: £${finalAmount})`
        : data.description;

      const method = transactionId ? 'PUT' : 'POST';
      const url = transactionId ? `/api/transactions/${transactionId}` : '/api/transactions';
      


      const response = await apiRequest(method, url, {
        userId: 'default-user',
        type: data.type,
        amount: finalAmount,
        category: data.category,
        description: finalDescription,
        date: data.date + 'T00:00:00.000Z',
        expenseGroup: data.expenseGroup,
        isSharedExpense: data.isSharedExpense,
      });
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      toast({
        title: "Success",
        description: variables.transactionId ? "Transaction updated successfully" : "Transaction added successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error: any, variables) => {
      toast({
        title: "Error",
        description: error.message || (variables.transactionId ? "Failed to update transaction" : "Failed to add transaction"),
        variant: "destructive",
      });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async () => {

      if (!editTransaction) throw new Error('No transaction to delete');
      const response = await apiRequest('DELETE', `/api/transactions/${editTransaction.id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: TransactionFormData) => {

    saveTransactionMutation.mutate({ 
      data, 
      transactionId: editTransaction?.id 
    });
  };

  const categoryOptions = {
    income: [
      { value: 'salary', label: 'Salary' },
      { value: 'freelance', label: 'Freelance' },
      { value: 'investment', label: 'Investment' },
      { value: 'business', label: 'Business' },
      { value: 'other', label: 'Other' },
    ],
    expense: [
      { value: 'food', label: 'Food & Dining' },
      { value: 'transport', label: 'Transportation' },
      { value: 'shopping', label: 'Shopping' },
      { value: 'utilities', label: 'Utilities' },
      { value: 'subscriptions', label: 'Subscriptions' },
      { value: 'credit-cards', label: 'Credit Cards' },
      { value: 'entertainment', label: 'Entertainment' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'education', label: 'Education' },
      { value: 'housing', label: 'Housing' },
      { value: 'savings', label: 'Savings' },
      { value: 'investments', label: 'Investments' },
      { value: 'other', label: 'Other' },
    ],
    transfer: [
      { value: 'savings', label: 'To Savings' },
      { value: 'checking', label: 'To Checking' },
      { value: 'investment', label: 'To Investment' },
      { value: 'other', label: 'Other' },
    ],
  };

  if (!isOpen) return null;

  const selectedType = form.watch('type');
  const currentAmount = form.watch('amount');

  return (
    <>
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="sidebar-gradient-bg rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-jakarta font-semibold">
              {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium font-geist">Transaction Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium font-geist">
                      Amount
                      {form.watch('isSharedExpense') && selectedType === 'expense' && currentAmount && (
                        <span className="text-blue-400 ml-2">
                          (Your share: £{(parseFloat(currentAmount || '0') / 2).toFixed(2)})
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-white/60">£</span>
                        <Input 
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder={form.watch('isSharedExpense') && selectedType === 'expense' ? "Total bill amount" : "0.00"}
                          className="pl-8 bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedType === 'expense' && (
                <>
                  <FormField
                    control={form.control}
                    name="expenseGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Expense Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select expense category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fundamentals">Fundamentals</SelectItem>
                            <SelectItem value="fun">Fun</SelectItem>
                            <SelectItem value="future-you">Future You</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-white/60 mt-1">
                          {field.value === 'fundamentals' && 'Essential household expenses and bills'}
                          {field.value === 'fun' && 'Entertainment and discretionary spending'}
                          {field.value === 'future-you' && 'Investments and savings for future goals'}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Only show shared expense option for Fundamentals */}
                  {form.watch('expenseGroup') === 'fundamentals' && (
                    <FormField
                      control={form.control}
                      name="isSharedExpense"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 p-3 bg-white/5">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium font-geist">
                              Shared with Spouse
                            </FormLabel>
                            <div className="text-xs text-white/60 font-geist">
                              Split this expense in half with spouse
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium font-geist">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions[selectedType].map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    
                    {/* Debt Association Indicator - Only for Credit Cards category */}
                    {selectedType === 'expense' && field.value === 'credit-cards' && debts && (() => {
                      const relatedDebts = debts.filter((debt: Debt) => debt.category === 'credit_card');
                      
                      if (relatedDebts.length > 0) {
                        return (
                          <div className="mt-2 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard className="w-4 h-4 text-blue-400" />
                              <span className="text-sm font-medium text-blue-400 font-geist">
                                Related Debts
                              </span>
                            </div>
                            <div className="space-y-1">
                              {relatedDebts.map((debt: Debt) => (
                                <div key={debt.id} className="flex items-center justify-between text-xs">
                                  <span className="text-white/70 font-geist">{debt.name}</span>
                                  <span className="text-red-400 font-geist">
                                    {formatCurrency(parseFloat(debt.remainingAmount))} remaining
                                  </span>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-blue-300/80 mt-2 font-geist">
                              This expense may affect the debt balances above
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </FormItem>
                )}
              />

              {/* Savings Association Indicator - Only for Savings category */}
              {selectedType === 'expense' && form.watch('category') === 'savings' && (
                <SavingsIndicator description={form.watch('description')} />
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium font-geist">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Transaction description"
                        className="bg-white/10 border-white/20 text-white resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium font-geist">Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="date"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-white/20 hover:bg-white/10 text-white"
                >
                  Cancel
                </Button>
                {editTransaction && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => deleteTransactionMutation.mutate()}
                    disabled={deleteTransactionMutation.isPending}
                    className="border-red-500/50 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                  >
                    {deleteTransactionMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={saveTransactionMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saveTransactionMutation.isPending 
                    ? (editTransaction ? 'Updating...' : 'Adding...') 
                    : (editTransaction ? 'Update Transaction' : 'Add Transaction')
                  }
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}