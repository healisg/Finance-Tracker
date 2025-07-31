import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTransactionSchema, insertSavingsPotSchema, insertDebtSchema,
  insertInvestmentSchema, insertBudgetSchema, insertFinancialGoalSchema 
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
      const validatedData = insertTransactionSchema.partial().parse({
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined
      });
      const transaction = await storage.updateTransaction(req.params.id, validatedData);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data", error });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTransaction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
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
        userId: DEFAULT_USER_ID
      });
      const pot = await storage.createSavingsPot(validatedData);
      res.json(pot);
    } catch (error) {
      res.status(400).json({ message: "Invalid savings pot data", error });
    }
  });

  app.put("/api/savings-pots/:id", async (req, res) => {
    try {
      const validatedData = insertSavingsPotSchema.partial().parse(req.body);
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
      
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const nextMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2;
      const nextYear = now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear();
      
      // Calculate current month totals (past + future within current month)
      const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() + 1 === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });
      
      // Calculate next month totals for forecasting
      const nextMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() + 1 === nextMonth && 
               transactionDate.getFullYear() === nextYear;
      });
      
      const currentMonthIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const currentMonthExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const nextMonthIncome = nextMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const nextMonthExpenses = nextMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const totalSavings = savingsPots
        .reduce((sum, pot) => sum + parseFloat(pot.currentAmount || '0'), 0);
      
      // Total balance includes all transactions (past and future)
      const allIncomeTransactions = transactions.filter(t => t.type === 'income');
      const allExpenseTransactions = transactions.filter(t => t.type === 'expense');
      const totalIncome = allIncomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalExpenses = allExpenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalBalance = totalIncome - totalExpenses + totalSavings;
      
      // Sort transactions by date descending for recent transactions
      const sortedTransactions = transactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      res.json({
        totalBalance,
        monthlyIncome: currentMonthIncome,
        monthlyExpenses: currentMonthExpenses,
        totalSavings,
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

  const httpServer = createServer(app);
  return httpServer;
}
