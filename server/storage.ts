import {
  users, transactions, savingsPots, debts, investments, budgets, financialGoals, recurringExpenses,
  type User, type InsertUser,
  type Transaction, type InsertTransaction,
  type SavingsPot, type InsertSavingsPot,
  type Debt, type InsertDebt,
  type Investment, type InsertInvestment,
  type Budget, type InsertBudget,
  type FinancialGoal, type InsertFinancialGoal,
  type RecurringExpense, type InsertRecurringExpense
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Transaction methods
  getTransactions(userId: string): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;

  // Savings Pot methods
  getSavingsPots(userId: string): Promise<SavingsPot[]>;
  getSavingsPotById(id: string): Promise<SavingsPot | undefined>;
  createSavingsPot(pot: InsertSavingsPot): Promise<SavingsPot>;
  updateSavingsPot(id: string, pot: Partial<InsertSavingsPot>): Promise<SavingsPot | undefined>;
  deleteSavingsPot(id: string): Promise<boolean>;

  // Debt methods
  getDebts(userId: string): Promise<Debt[]>;
  getDebtById(id: string): Promise<Debt | undefined>;
  createDebt(debt: InsertDebt): Promise<Debt>;
  updateDebt(id: string, debt: Partial<InsertDebt>): Promise<Debt | undefined>;
  deleteDebt(id: string): Promise<boolean>;

  // Investment methods
  getInvestments(userId: string): Promise<Investment[]>;
  getInvestmentById(id: string): Promise<Investment | undefined>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: string, investment: Partial<InsertInvestment>): Promise<Investment | undefined>;
  deleteInvestment(id: string): Promise<boolean>;

  // Budget methods
  getBudgets(userId: string, month?: number, year?: number): Promise<Budget[]>;
  getBudgetById(id: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: string): Promise<boolean>;

  // Financial Goal methods
  getFinancialGoals(userId: string): Promise<FinancialGoal[]>;
  getFinancialGoalById(id: string): Promise<FinancialGoal | undefined>;
  createFinancialGoal(goal: InsertFinancialGoal): Promise<FinancialGoal>;
  updateFinancialGoal(id: string, goal: Partial<InsertFinancialGoal>): Promise<FinancialGoal | undefined>;
  deleteFinancialGoal(id: string): Promise<boolean>;

  // Recurring Expense methods
  getRecurringExpenses(userId: string): Promise<RecurringExpense[]>;
  getRecurringExpenseById(id: string): Promise<RecurringExpense | undefined>;
  createRecurringExpense(expense: InsertRecurringExpense): Promise<RecurringExpense>;
  updateRecurringExpense(id: string, expense: Partial<InsertRecurringExpense>): Promise<RecurringExpense | undefined>;
  deleteRecurringExpense(id: string): Promise<boolean>;

  // Recurring expense automation
  generateRecurringTransactions(month: number, year: number): Promise<Transaction[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if default user exists
      const existingUser = await db.select().from(users).where(eq(users.id, "default-user")).limit(1);
      if (existingUser.length === 0) {
        // Create default user
        await db.insert(users).values({
          id: "default-user",
          username: "alex.johnson",
          password: "hashed_password",
          name: "Alex Johnson",
          avatar: "https://i.pravatar.cc/40?img=5"
        });
      }
    } catch (error) {
      console.error("Failed to initialize default data:", error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Transaction methods
  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.date);
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updated] = await db
      .update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Savings Pot methods
  async getSavingsPots(userId: string): Promise<SavingsPot[]> {
    return await db.select().from(savingsPots).where(eq(savingsPots.userId, userId));
  }

  async getSavingsPotById(id: string): Promise<SavingsPot | undefined> {
    const [pot] = await db.select().from(savingsPots).where(eq(savingsPots.id, id));
    return pot || undefined;
  }

  async createSavingsPot(pot: InsertSavingsPot): Promise<SavingsPot> {
    const [newPot] = await db
      .insert(savingsPots)
      .values(pot)
      .returning();
    return newPot;
  }

  async updateSavingsPot(id: string, pot: Partial<InsertSavingsPot>): Promise<SavingsPot | undefined> {
    const [updated] = await db
      .update(savingsPots)
      .set(pot)
      .where(eq(savingsPots.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSavingsPot(id: string): Promise<boolean> {
    const result = await db.delete(savingsPots).where(eq(savingsPots.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Debt methods
  async getDebts(userId: string): Promise<Debt[]> {
    return await db.select().from(debts).where(eq(debts.userId, userId));
  }

  async getDebtById(id: string): Promise<Debt | undefined> {
    const [debt] = await db.select().from(debts).where(eq(debts.id, id));
    return debt || undefined;
  }

  async createDebt(debt: InsertDebt): Promise<Debt> {
    const [newDebt] = await db
      .insert(debts)
      .values(debt)
      .returning();
    return newDebt;
  }

  async updateDebt(id: string, debt: Partial<InsertDebt>): Promise<Debt | undefined> {
    const [updated] = await db
      .update(debts)
      .set(debt)
      .where(eq(debts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDebt(id: string): Promise<boolean> {
    const result = await db.delete(debts).where(eq(debts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Investment methods
  async getInvestments(userId: string): Promise<Investment[]> {
    return await db.select().from(investments).where(eq(investments.userId, userId));
  }

  async getInvestmentById(id: string): Promise<Investment | undefined> {
    const [investment] = await db.select().from(investments).where(eq(investments.id, id));
    return investment || undefined;
  }

  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const [newInvestment] = await db
      .insert(investments)
      .values(investment)
      .returning();
    return newInvestment;
  }

  async updateInvestment(id: string, investment: Partial<InsertInvestment>): Promise<Investment | undefined> {
    const [updated] = await db
      .update(investments)
      .set(investment)
      .where(eq(investments.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteInvestment(id: string): Promise<boolean> {
    const result = await db.delete(investments).where(eq(investments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Budget methods
  async getBudgets(userId: string, month?: number, year?: number): Promise<Budget[]> {
    if (month && year) {
      return await db.select().from(budgets)
        .where(and(
          eq(budgets.userId, userId),
          eq(budgets.month, month),
          eq(budgets.year, year)
        ));
    }
    return await db.select().from(budgets).where(eq(budgets.userId, userId));
  }

  async getBudgetById(id: string): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget || undefined;
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db
      .insert(budgets)
      .values(budget)
      .returning();
    return newBudget;
  }

  async updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [updated] = await db
      .update(budgets)
      .set(budget)
      .where(eq(budgets.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteBudget(id: string): Promise<boolean> {
    const result = await db.delete(budgets).where(eq(budgets.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Financial Goal methods
  async getFinancialGoals(userId: string): Promise<FinancialGoal[]> {
    return await db.select().from(financialGoals).where(eq(financialGoals.userId, userId));
  }

  async getFinancialGoalById(id: string): Promise<FinancialGoal | undefined> {
    const [goal] = await db.select().from(financialGoals).where(eq(financialGoals.id, id));
    return goal || undefined;
  }

  async createFinancialGoal(goal: InsertFinancialGoal): Promise<FinancialGoal> {
    const [newGoal] = await db
      .insert(financialGoals)
      .values(goal)
      .returning();
    return newGoal;
  }

  async updateFinancialGoal(id: string, goal: Partial<InsertFinancialGoal>): Promise<FinancialGoal | undefined> {
    const [updated] = await db
      .update(financialGoals)
      .set(goal)
      .where(eq(financialGoals.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteFinancialGoal(id: string): Promise<boolean> {
    const result = await db.delete(financialGoals).where(eq(financialGoals.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Recurring Expense methods
  async getRecurringExpenses(userId: string): Promise<RecurringExpense[]> {
    return await db.select().from(recurringExpenses).where(eq(recurringExpenses.userId, userId));
  }

  async getRecurringExpenseById(id: string): Promise<RecurringExpense | undefined> {
    const [expense] = await db.select().from(recurringExpenses).where(eq(recurringExpenses.id, id));
    return expense || undefined;
  }

  async createRecurringExpense(expense: InsertRecurringExpense): Promise<RecurringExpense> {
    const [newExpense] = await db.insert(recurringExpenses).values(expense).returning();
    return newExpense;
  }

  async updateRecurringExpense(id: string, expense: Partial<InsertRecurringExpense>): Promise<RecurringExpense | undefined> {
    const updateData = { ...expense, updatedAt: new Date() };
    const [updatedExpense] = await db.update(recurringExpenses).set(updateData).where(eq(recurringExpenses.id, id)).returning();
    return updatedExpense || undefined;
  }

  async deleteRecurringExpense(id: string): Promise<boolean> {
    const result = await db.delete(recurringExpenses).where(eq(recurringExpenses.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Generate recurring transactions for a specific month
  async generateRecurringTransactions(month: number, year: number): Promise<Transaction[]> {
    const userId = "default-user"; // For now, using default user

    // Get all active recurring expenses for the user
    const activeRecurringExpenses = await db.select()
      .from(recurringExpenses)
      .where(and(
        eq(recurringExpenses.userId, userId),
        eq(recurringExpenses.isActive, true)
      ));

    const generatedTransactions: Transaction[] = [];

    for (const recurring of activeRecurringExpenses) {
      // Calculate the date for this recurring expense
      const targetDate = new Date(year, month - 1, recurring.dayOfMonth);

      // Check if we already have a transaction for this recurring expense in this month
      const existingTransactionsInMonth = await db.select()
        .from(transactions)
        .where(and(
          eq(transactions.recurringExpenseId, recurring.id),
          eq(transactions.userId, userId)
        ));

      // Filter for current month transactions
      const hasCurrentMonthTransaction = existingTransactionsInMonth.some(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === month - 1 && transactionDate.getFullYear() === year;
      });

      if (!hasCurrentMonthTransaction) {
        // Create the transaction
        const newTransaction: InsertTransaction = {
          userId,
          type: 'expense',
          amount: recurring.amount,
          description: recurring.description,
          category: recurring.category,
          date: targetDate,
          expenseGroup: recurring.expenseGroup,
          isSharedExpense: recurring.isSharedExpense,
          recurringExpenseId: recurring.id
        };

        const [createdTransaction] = await db.insert(transactions).values(newTransaction).returning();
        generatedTransactions.push(createdTransaction);
      }
    }

    return generatedTransactions;
  }
}

export const storage = new DatabaseStorage();