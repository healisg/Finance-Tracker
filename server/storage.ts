import { 
  type User, type InsertUser, 
  type Transaction, type InsertTransaction,
  type SavingsPot, type InsertSavingsPot,
  type Debt, type InsertDebt,
  type Investment, type InsertInvestment,
  type Budget, type InsertBudget,
  type FinancialGoal, type InsertFinancialGoal
} from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private transactions: Map<string, Transaction>;
  private savingsPots: Map<string, SavingsPot>;
  private debts: Map<string, Debt>;
  private investments: Map<string, Investment>;
  private budgets: Map<string, Budget>;
  private financialGoals: Map<string, FinancialGoal>;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.savingsPots = new Map();
    this.debts = new Map();
    this.investments = new Map();
    this.budgets = new Map();
    this.financialGoals = new Map();
    
    // Initialize with default user
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    const defaultUser: User = {
      id: "default-user",
      username: "alex.johnson",
      password: "hashed_password",
      name: "Alex Johnson",
      avatar: "https://i.pravatar.cc/40?img=5"
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      avatar: insertUser.avatar ?? null
    };
    this.users.set(id, user);
    return user;
  }

  // Transaction methods
  async getTransactions(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existing = this.transactions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...transaction };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Savings Pot methods
  async getSavingsPots(userId: string): Promise<SavingsPot[]> {
    return Array.from(this.savingsPots.values())
      .filter(pot => pot.userId === userId);
  }

  async getSavingsPotById(id: string): Promise<SavingsPot | undefined> {
    return this.savingsPots.get(id);
  }

  async createSavingsPot(pot: InsertSavingsPot): Promise<SavingsPot> {
    const id = randomUUID();
    const newPot: SavingsPot = {
      ...pot,
      id,
      createdAt: new Date(),
      currentAmount: pot.currentAmount ?? "0",
      icon: pot.icon ?? "piggy-bank",
      color: pot.color ?? "green"
    };
    this.savingsPots.set(id, newPot);
    return newPot;
  }

  async updateSavingsPot(id: string, pot: Partial<InsertSavingsPot>): Promise<SavingsPot | undefined> {
    const existing = this.savingsPots.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...pot };
    this.savingsPots.set(id, updated);
    return updated;
  }

  async deleteSavingsPot(id: string): Promise<boolean> {
    return this.savingsPots.delete(id);
  }

  // Debt methods
  async getDebts(userId: string): Promise<Debt[]> {
    return Array.from(this.debts.values())
      .filter(debt => debt.userId === userId);
  }

  async getDebtById(id: string): Promise<Debt | undefined> {
    return this.debts.get(id);
  }

  async createDebt(debt: InsertDebt): Promise<Debt> {
    const id = randomUUID();
    const newDebt: Debt = {
      ...debt,
      id,
      createdAt: new Date(),
      interestRate: debt.interestRate ?? null,
      minimumPayment: debt.minimumPayment ?? null,
      dueDate: debt.dueDate ?? null
    };
    this.debts.set(id, newDebt);
    return newDebt;
  }

  async updateDebt(id: string, debt: Partial<InsertDebt>): Promise<Debt | undefined> {
    const existing = this.debts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...debt };
    this.debts.set(id, updated);
    return updated;
  }

  async deleteDebt(id: string): Promise<boolean> {
    return this.debts.delete(id);
  }

  // Investment methods
  async getInvestments(userId: string): Promise<Investment[]> {
    return Array.from(this.investments.values())
      .filter(investment => investment.userId === userId);
  }

  async getInvestmentById(id: string): Promise<Investment | undefined> {
    return this.investments.get(id);
  }

  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const id = randomUUID();
    const newInvestment: Investment = {
      ...investment,
      id,
      createdAt: new Date(),
      quantity: investment.quantity ?? null,
      symbol: investment.symbol ?? null
    };
    this.investments.set(id, newInvestment);
    return newInvestment;
  }

  async updateInvestment(id: string, investment: Partial<InsertInvestment>): Promise<Investment | undefined> {
    const existing = this.investments.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...investment };
    this.investments.set(id, updated);
    return updated;
  }

  async deleteInvestment(id: string): Promise<boolean> {
    return this.investments.delete(id);
  }

  // Budget methods
  async getBudgets(userId: string, month?: number, year?: number): Promise<Budget[]> {
    let budgets = Array.from(this.budgets.values())
      .filter(budget => budget.userId === userId);
    
    if (month !== undefined) {
      budgets = budgets.filter(budget => budget.month === month);
    }
    
    if (year !== undefined) {
      budgets = budgets.filter(budget => budget.year === year);
    }
    
    return budgets;
  }

  async getBudgetById(id: string): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const newBudget: Budget = {
      ...budget,
      id,
      createdAt: new Date(),
      spentAmount: budget.spentAmount ?? "0"
    };
    this.budgets.set(id, newBudget);
    return newBudget;
  }

  async updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existing = this.budgets.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...budget };
    this.budgets.set(id, updated);
    return updated;
  }

  async deleteBudget(id: string): Promise<boolean> {
    return this.budgets.delete(id);
  }

  // Financial Goal methods
  async getFinancialGoals(userId: string): Promise<FinancialGoal[]> {
    return Array.from(this.financialGoals.values())
      .filter(goal => goal.userId === userId);
  }

  async getFinancialGoalById(id: string): Promise<FinancialGoal | undefined> {
    return this.financialGoals.get(id);
  }

  async createFinancialGoal(goal: InsertFinancialGoal): Promise<FinancialGoal> {
    const id = randomUUID();
    const newGoal: FinancialGoal = {
      ...goal,
      id,
      createdAt: new Date(),
      currentAmount: goal.currentAmount ?? "0",
      targetDate: goal.targetDate ?? null,
      priority: goal.priority ?? "medium"
    };
    this.financialGoals.set(id, newGoal);
    return newGoal;
  }

  async updateFinancialGoal(id: string, goal: Partial<InsertFinancialGoal>): Promise<FinancialGoal | undefined> {
    const existing = this.financialGoals.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...goal };
    this.financialGoals.set(id, updated);
    return updated;
  }

  async deleteFinancialGoal(id: string): Promise<boolean> {
    return this.financialGoals.delete(id);
  }
}

export const storage = new MemStorage();
