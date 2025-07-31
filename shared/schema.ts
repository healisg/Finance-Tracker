import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // 'income', 'expense', 'transfer'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  // New expense grouping fields
  expenseGroup: text("expense_group"), // 'fundamentals', 'fun', 'future-you'
  isSharedExpense: boolean("is_shared_expense").default(false), // true if split with spouse
  createdAt: timestamp("created_at").defaultNow(),
});

export const savingsPots = pgTable("savings_pots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
  icon: text("icon").default("piggy-bank"),
  color: text("color").default("green"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const debts = pgTable("debts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  minimumPayment: decimal("minimum_payment", { precision: 10, scale: 2 }),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'stocks', 'bonds', 'crypto', 'real_estate', 'other'
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 4 }),
  symbol: text("symbol"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(),
  budgetAmount: decimal("budget_amount", { precision: 10, scale: 2 }).notNull(),
  spentAmount: decimal("spent_amount", { precision: 10, scale: 2 }).default("0"),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const financialGoals = pgTable("financial_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
  targetDate: timestamp("target_date"),
  category: text("category").notNull(),
  priority: text("priority").default("medium"), // 'low', 'medium', 'high'
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  savingsPots: many(savingsPots),
  debts: many(debts),
  investments: many(investments),
  budgets: many(budgets),
  financialGoals: many(financialGoals),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const savingsPotsRelations = relations(savingsPots, ({ one }) => ({
  user: one(users, {
    fields: [savingsPots.userId],
    references: [users.id],
  }),
}));

export const debtsRelations = relations(debts, ({ one }) => ({
  user: one(users, {
    fields: [debts.userId],
    references: [users.id],
  }),
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  user: one(users, {
    fields: [investments.userId],
    references: [users.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
}));

export const financialGoalsRelations = relations(financialGoals, ({ one }) => ({
  user: one(users, {
    fields: [financialGoals.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertSavingsPotSchema = createInsertSchema(savingsPots).omit({
  id: true,
  createdAt: true,
});

export const insertDebtSchema = createInsertSchema(debts).omit({
  id: true,
  createdAt: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
});

export const insertFinancialGoalSchema = createInsertSchema(financialGoals).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type SavingsPot = typeof savingsPots.$inferSelect;
export type InsertSavingsPot = z.infer<typeof insertSavingsPotSchema>;
export type Debt = typeof debts.$inferSelect;
export type InsertDebt = z.infer<typeof insertDebtSchema>;
export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type FinancialGoal = typeof financialGoals.$inferSelect;
export type InsertFinancialGoal = z.infer<typeof insertFinancialGoalSchema>;

// Expense group constants
export const EXPENSE_GROUPS = {
  FUNDAMENTALS: 'fundamentals',
  FUN: 'fun',
  FUTURE_YOU: 'future-you'
} as const;

export type ExpenseGroup = typeof EXPENSE_GROUPS[keyof typeof EXPENSE_GROUPS];
