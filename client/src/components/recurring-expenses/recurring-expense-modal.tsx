import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RecurringExpense, InsertRecurringExpense } from "@shared/schema";

const recurringExpenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be a positive number"),
  category: z.string().min(1, "Category is required"),
  expenseGroup: z.enum(["fundamentals", "fun", "future-you"], {
    required_error: "Expense group is required",
  }),
  dayOfMonth: z.number().min(1).max(31),
  isSharedExpense: z.boolean(),
  isActive: z.boolean(),
});

type RecurringExpenseFormData = z.infer<typeof recurringExpenseSchema>;

interface RecurringExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: RecurringExpense | null;
}

export default function RecurringExpenseModal({ isOpen, onClose, expense }: RecurringExpenseModalProps) {
  const { toast } = useToast();
  const [selectedExpenseGroup, setSelectedExpenseGroup] = useState<string>("");

  const form = useForm<RecurringExpenseFormData>({
    resolver: zodResolver(recurringExpenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      expenseGroup: "fundamentals",
      dayOfMonth: 1,
      isSharedExpense: false,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertRecurringExpense) => {
      const response = await fetch("/api/recurring-expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });  
      if (!response.ok) throw new Error('Failed to create');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-expenses"] });
      toast({
        title: "Success",
        description: "Recurring expense created successfully",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create recurring expense",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertRecurringExpense> }) => {
      const response = await fetch(`/api/recurring-expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-expenses"] });
      toast({
        title: "Success",
        description: "Recurring expense updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update recurring expense",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        expenseGroup: expense.expenseGroup as "fundamentals" | "fun" | "future-you",
        dayOfMonth: expense.dayOfMonth,
        isSharedExpense: expense.isSharedExpense || false,
        isActive: expense.isActive !== false,
      });
      setSelectedExpenseGroup(expense.expenseGroup);
    } else {
      form.reset({
        description: "",
        amount: "",
        category: "",
        expenseGroup: "fundamentals",
        dayOfMonth: 1,
        isSharedExpense: false,
        isActive: true,
      });
      setSelectedExpenseGroup("fundamentals");
    }
  }, [expense, form]);

  const onSubmit = (data: RecurringExpenseFormData) => {
    const submitData: InsertRecurringExpense = {
      ...data,
      userId: "default-user", // This will be set by the backend
    };

    if (expense) {
      updateMutation.mutate({ id: expense.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 font-geist">
            {expense ? "Edit Recurring Expense" : "Add Recurring Expense"}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="description" className="text-gray-700 font-geist">
              Description
            </Label>
            <Input
              id="description"
              placeholder="e.g., Netflix Subscription, Rent, Groceries"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount" className="text-gray-700 font-geist">
              Amount (£)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              {...form.register("amount")}
            />
            {form.formState.errors.amount && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category" className="text-gray-700 font-geist">
              Category
            </Label>
            <Input
              id="category"
              placeholder="e.g., Entertainment, Housing, Groceries"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              {...form.register("category")}
            />
            {form.formState.errors.category && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div>
            <Label className="text-gray-700 font-geist">Expense Group</Label>
            <Select
              value={selectedExpenseGroup}
              onValueChange={(value) => {
                setSelectedExpenseGroup(value);
                form.setValue("expenseGroup", value as "fundamentals" | "fun" | "future-you");
              }}
            >
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select expense group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fundamentals">Fundamentals</SelectItem>
                <SelectItem value="fun">Fun</SelectItem>
                <SelectItem value="future-you">Future You</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.expenseGroup && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.expenseGroup.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="dayOfMonth" className="text-gray-700 font-geist">
              Day of Month (1-31)
            </Label>
            <Input
              id="dayOfMonth"
              type="number"
              min="1"
              max="31"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              {...form.register("dayOfMonth", { valueAsNumber: true })}
            />
            <p className="text-xs text-gray-500 mt-1 font-geist">
              The day of each month when this expense should be created
            </p>
            {form.formState.errors.dayOfMonth && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.dayOfMonth.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="text-gray-700 font-geist">Shared Expense</Label>
              <p className="text-xs text-gray-500 font-geist">Split this expense with spouse</p>
            </div>
            <Switch
              checked={form.watch("isSharedExpense")}
              onCheckedChange={(checked) => form.setValue("isSharedExpense", checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="text-gray-700 font-geist">Active</Label>
              <p className="text-xs text-gray-500 font-geist">Generate transactions for this expense</p>
            </div>
            <Switch
              checked={form.watch("isActive")}
              onCheckedChange={(checked) => form.setValue("isActive", checked)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isPending}
            >
              {isPending ? "Saving..." : expense ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}