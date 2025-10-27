import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTransactionSchema, insertSavingsPotSchema, insertDebtSchema,
  insertInvestmentSchema, insertBudgetSchema, insertFinancialGoalSchema,
  insertRecurringExpenseSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = "default-user";

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions(DEFAULT_USER_ID);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
        date: new Date(req.body.date)
      });
      const transaction = await storage.createTransaction(validatedData);
      
      // If this is a savings transaction, update the corresponding savings pot
      if (validatedData.category === 'savings' && validatedData.type === 'expense') {
        const savingsPots = await storage.getSavingsPots(DEFAULT_USER_ID);
        
        // Try to match the transaction description with a savings pot name
        const matchingPot = savingsPots.find(pot => 
          validatedData.description.toLowerCase().includes(pot.name.toLowerCase()) ||
          pot.name.toLowerCase().includes(validatedData.description.toLowerCase())
        );
        
        if (matchingPot) {
          // Update the savings pot's current amount
          const newAmount = (parseFloat(matchingPot.currentAmount || "0") + parseFloat(validatedData.amount)).toString();
          await storage.updateSavingsPot(matchingPot.id, {
            currentAmount: newAmount
          });
        }
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data", error });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransactionById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const oldTransaction = await storage.getTransactionById(req.params.id);
      if (!oldTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      const validatedData = insertTransactionSchema.partial().parse({
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined
      });
      
      const transaction = await storage.updateTransaction(req.params.id, validatedData);
      
      // Handle savings pot updates when transaction is updated
      const savingsPots = await storage.getSavingsPots(DEFAULT_USER_ID);
      
      // If the old transaction was a savings expense, reverse it
      if (oldTransaction.category === 'savings' && oldTransaction.type === 'expense') {
        const matchingPot = savingsPots.find(pot => 
          oldTransaction.description.toLowerCase().includes(pot.name.toLowerCase()) ||
          pot.name.toLowerCase().includes(oldTransaction.description.toLowerCase())
        );
        
        if (matchingPot) {
          const newAmount = (parseFloat(matchingPot.currentAmount || "0") - parseFloat(oldTransaction.amount)).toString();
          await storage.updateSavingsPot(matchingPot.id, {
            currentAmount: Math.max(0, parseFloat(newAmount)).toString()
          });
        }
      }
      
      // If the new transaction is a savings expense, apply it
      if (validatedData.category === 'savings' && (validatedData.type === 'expense' || oldTransaction.type === 'expense')) {
        const matchingPot = savingsPots.find(pot => 
          (validatedData.description || oldTransaction.description).toLowerCase().includes(pot.name.toLowerCase()) ||
          pot.name.toLowerCase().includes((validatedData.description || oldTransaction.description).toLowerCase())
        );
        
        if (matchingPot) {
          const amountToAdd = validatedData.amount || oldTransaction.amount;
          const newAmount = (parseFloat(matchingPot.currentAmount || "0") + parseFloat(amountToAdd)).toString();
          await storage.updateSavingsPot(matchingPot.id, {
            currentAmount: newAmount
          });
        }
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data", error });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransactionById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // If this was a savings transaction, reverse it from the savings pot
      if (transaction.category === 'savings' && transaction.type === 'expense') {
        const savingsPots = await storage.getSavingsPots(DEFAULT_USER_ID);
        const matchingPot = savingsPots.find(pot => 
          transaction.description.toLowerCase().includes(pot.name.toLowerCase()) ||
          pot.name.toLowerCase().includes(transaction.description.toLowerCase())
        );
        
        if (matchingPot) {
          const newAmount = (parseFloat(matchingPot.currentAmount || "0") - parseFloat(transaction.amount)).toString();
          await storage.updateSavingsPot(matchingPot.id, {
            currentAmount: Math.max(0, parseFloat(newAmount)).toString()
          });
        }
      }
      
      const deleted = await storage.deleteTransaction(req.params.id);
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Savings Pots routes
  app.get("/api/savings-pots", async (req, res) => {
    try {
      const pots = await storage.getSavingsPots(DEFAULT_USER_ID);
      res.json(pots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch savings pots" });
    }
  });

  app.post("/api/savings-pots", async (req, res) => {
    try {
      const validatedData = insertSavingsPotSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined
      });
      const pot = await storage.createSavingsPot(validatedData);
      res.json(pot);
    } catch (error) {
      res.status(400).json({ message: "Invalid savings pot data", error });
    }
  });

  app.put("/api/savings-pots/:id", async (req, res) => {
    try {
      const validatedData = insertSavingsPotSchema.partial().parse({
        ...req.body,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined
      });
      const pot = await storage.updateSavingsPot(req.params.id, validatedData);
      if (!pot) {
        return res.status(404).json({ message: "Savings pot not found" });
      }
      res.json(pot);
    } catch (error) {
      res.status(400).json({ message: "Invalid savings pot data", error });
    }
  });

  app.delete("/api/savings-pots/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSavingsPot(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Savings pot not found" });
      }
      res.json({ message: "Savings pot deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete savings pot" });
    }
  });

  // Debts routes
  app.get("/api/debts", async (req, res) => {
    try {
      const debts = await storage.getDebts(DEFAULT_USER_ID);
      res.json(debts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch debts" });
    }
  });

  app.post("/api/debts", async (req, res) => {
    try {
      const validatedData = insertDebtSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
      });
      const debt = await storage.createDebt(validatedData);
      res.json(debt);
    } catch (error) {
      res.status(400).json({ message: "Invalid debt data", error });
    }
  });



  app.put("/api/debts/:id", async (req, res) => {
    try {
      const validatedData = insertDebtSchema.partial().parse({
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
      });
      const debt = await storage.updateDebt(req.params.id, validatedData);
      if (!debt) {
        return res.status(404).json({ message: "Debt not found" });
      }
      res.json(debt);
    } catch (error) {
      res.status(400).json({ message: "Invalid debt data", error });
    }
  });

  app.delete("/api/debts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDebt(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Debt not found" });
      }
      res.json({ message: "Debt deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete debt" });
    }
  });

  // Investments routes
  app.get("/api/investments", async (req, res) => {
    try {
      const investments = await storage.getInvestments(DEFAULT_USER_ID);
      res.json(investments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  app.post("/api/investments", async (req, res) => {
    try {
      const validatedData = insertInvestmentSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      const investment = await storage.createInvestment(validatedData);
      res.json(investment);
    } catch (error) {
      res.status(400).json({ message: "Invalid investment data", error });
    }
  });

  // Budgets routes
  app.get("/api/budgets", async (req, res) => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const budgets = await storage.getBudgets(DEFAULT_USER_ID, month, year);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const validatedData = insertBudgetSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      const budget = await storage.createBudget(validatedData);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ message: "Invalid budget data", error });
    }
  });

  // Financial Goals routes
  app.get("/api/financial-goals", async (req, res) => {
    try {
      const goals = await storage.getFinancialGoals(DEFAULT_USER_ID);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial goals" });
    }
  });

  app.post("/api/financial-goals", async (req, res) => {
    try {
      const validatedData = insertFinancialGoalSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
        targetDate: req.body.targetDate ? new Date(req.body.targetDate) : undefined
      });
      const goal = await storage.createFinancialGoal(validatedData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid financial goal data", error });
    }
  });

  // Dashboard summary route - includes future transactions for forecasting
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const transactions = await storage.getTransactions(DEFAULT_USER_ID);
      const savingsPots = await storage.getSavingsPots(DEFAULT_USER_ID);
      const recurringExpenses = await storage.getRecurringExpenses(DEFAULT_USER_ID);

      const now = new Date();
      // Allow filtering by specific month/year from query params
      const targetMonth = req.query.month ? parseInt(req.query.month as string) : now.getMonth() + 1;
      const targetYear = req.query.year ? parseInt(req.query.year as string) : now.getFullYear();
      
      console.log(`Dashboard Summary - Target: ${targetMonth}/${targetYear}, Total transactions: ${transactions.length}`);
      
      const nextMonth = targetMonth + 1 > 12 ? 1 : targetMonth + 1;
      const nextYear = targetMonth + 1 > 12 ? targetYear + 1 : targetYear;

      // Calculate target month totals
      const targetMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const txMonth = transactionDate.getMonth() + 1;
        const txYear = transactionDate.getFullYear();
        return txMonth === targetMonth && txYear === targetYear;
      });

      // Calculate next month totals for forecasting
      const nextMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() + 1 === nextMonth && 
               transactionDate.getFullYear() === nextYear;
      });

      const incomeTransactions = targetMonthTransactions.filter(t => t.type === 'income');
      console.log(`Found ${incomeTransactions.length} income transactions for ${targetMonth}/${targetYear}`);
      incomeTransactions.forEach(t => console.log(`  - ${t.description}: £${t.amount} on ${new Date(t.date).toLocaleDateString()}`));
      const monthlyIncome = incomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expenseTransactions = targetMonthTransactions.filter(t => t.type === 'expense');
      const monthlyExpenses = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

      let nextMonthIncome = nextMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      let nextMonthExpenses = nextMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      // If next month has no transactions, estimate based on recurring expenses
      if (nextMonthTransactions.length === 0) {
        const activeRecurringExpenses = recurringExpenses.filter(re => re.isActive);
        nextMonthExpenses = activeRecurringExpenses.reduce((sum, re) => sum + parseFloat(re.amount), 0);
        
        // Estimate income based on current month if available, or average of last 3 months
        if (monthlyIncome > 0) {
          nextMonthIncome = monthlyIncome;
        } else {
          const lastThreeMonths = [];
          for (let i = 1; i <= 3; i++) {
            const pastMonth = targetMonth - i;
            const pastYear = pastMonth <= 0 ? targetYear - 1 : targetYear;
            const adjustedMonth = pastMonth <= 0 ? 12 + pastMonth : pastMonth;
            
            const pastMonthIncome = transactions
              .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'income' &&
                       transactionDate.getMonth() + 1 === adjustedMonth && 
                       transactionDate.getFullYear() === pastYear;
              })
              .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            if (pastMonthIncome > 0) {
              lastThreeMonths.push(pastMonthIncome);
            }
          }
          
          if (lastThreeMonths.length > 0) {
            nextMonthIncome = lastThreeMonths.reduce((sum, val) => sum + val, 0) / lastThreeMonths.length;
          }
        }
      }

      const totalSavings = savingsPots
        .reduce((sum, pot) => sum + parseFloat(pot.currentAmount || '0'), 0);

      // Total balance is monthly income minus monthly expenses (excludes savings)
      const totalBalance = monthlyIncome - monthlyExpenses;

      // Sort transactions by date descending for recent transactions
      const sortedTransactions = transactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      res.json({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        totalSavings,
        currentMonth: targetMonth,
        currentYear: targetYear,
        recentTransactions: sortedTransactions.slice(0, 5),
        forecast: {
          nextMonthIncome,
          nextMonthExpenses,
          nextMonthNet: nextMonthIncome - nextMonthExpenses
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // Recurring Expense routes
  app.get("/api/recurring-expenses", async (req, res) => {
    try {
      const expenses = await storage.getRecurringExpenses(DEFAULT_USER_ID);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recurring expenses" });
    }
  });

  app.post("/api/recurring-expenses", async (req, res) => {
    try {
      const validatedData = insertRecurringExpenseSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      const expense = await storage.createRecurringExpense(validatedData);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid recurring expense data", error });
    }
  });

  app.get("/api/recurring-expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getRecurringExpenseById(req.params.id);
      if (!expense) {
        return res.status(404).json({ message: "Recurring expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recurring expense" });
    }
  });

  app.put("/api/recurring-expenses/:id", async (req, res) => {
    try {
      const validatedData = insertRecurringExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateRecurringExpense(req.params.id, validatedData);
      if (!expense) {
        return res.status(404).json({ message: "Recurring expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid recurring expense data", error });
    }
  });

  app.delete("/api/recurring-expenses/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRecurringExpense(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Recurring expense not found" });
      }
      res.json({ message: "Recurring expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recurring expense" });
    }
  });

  // Generate recurring transactions for current month
  app.post("/api/recurring-expenses/generate", async (req, res) => {
    try {
      const { month, year } = req.body;
      const currentDate = new Date();
      const targetMonth = month || currentDate.getMonth() + 1;
      const targetYear = year || currentDate.getFullYear();

      const generatedTransactions = await storage.generateRecurringTransactions(targetMonth, targetYear);
      res.json({ 
        message: `Generated ${generatedTransactions.length} recurring transactions`,
        transactions: generatedTransactions 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recurring transactions", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}