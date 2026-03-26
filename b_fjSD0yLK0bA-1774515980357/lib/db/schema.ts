import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const chitFundStatusEnum = pgEnum("chit_fund_status", [
  "pending",
  "active",
  "completed",
  "cancelled",
]);

export const memberStatusEnum = pgEnum("member_status", [
  "active",
  "inactive",
  "suspended",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "overdue",
  "cancelled",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "contribution",
  "payout",
  "penalty",
  "refund",
]);

// Members Table
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  address: text("address"),
  status: memberStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chit Funds Table
export const chitFunds = pgTable("chit_funds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),
  monthlyContribution: decimal("monthly_contribution", { precision: 10, scale: 2 }).notNull(),
  totalMembers: integer("total_members").notNull(),
  durationMonths: integer("duration_months").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  currentMonth: integer("current_month").default(0).notNull(),
  status: chitFundStatusEnum("status").default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chit Fund Members (Junction Table)
export const chitFundMembers = pgTable("chit_fund_members", {
  id: serial("id").primaryKey(),
  chitFundId: integer("chit_fund_id")
    .notNull()
    .references(() => chitFunds.id, { onDelete: "cascade" }),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  ticketNumber: integer("ticket_number").notNull(),
  hasWonPrize: boolean("has_won_prize").default(false).notNull(),
  prizeWonMonth: integer("prize_won_month"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Payments Table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  chitFundId: integer("chit_fund_id")
    .notNull()
    .references(() => chitFunds.id, { onDelete: "cascade" }),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  monthNumber: integer("month_number").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: paymentStatusEnum("status").default("pending").notNull(),
  penaltyAmount: decimal("penalty_amount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions Table (for audit trail)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  chitFundId: integer("chit_fund_id")
    .notNull()
    .references(() => chitFunds.id, { onDelete: "cascade" }),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  referenceId: integer("reference_id"), // Link to payment or payout
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Auctions/Prize Draws Table
export const auctions = pgTable("auctions", {
  id: serial("id").primaryKey(),
  chitFundId: integer("chit_fund_id")
    .notNull()
    .references(() => chitFunds.id, { onDelete: "cascade" }),
  monthNumber: integer("month_number").notNull(),
  winnerId: integer("winner_id").references(() => members.id),
  winningBid: decimal("winning_bid", { precision: 10, scale: 2 }),
  prizeAmount: decimal("prize_amount", { precision: 12, scale: 2 }).notNull(),
  dividend: decimal("dividend", { precision: 10, scale: 2 }).default("0"),
  auctionDate: timestamp("auction_date").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const membersRelations = relations(members, ({ many }) => ({
  chitFundMemberships: many(chitFundMembers),
  payments: many(payments),
  transactions: many(transactions),
  wonAuctions: many(auctions),
}));

export const chitFundsRelations = relations(chitFunds, ({ many }) => ({
  members: many(chitFundMembers),
  payments: many(payments),
  transactions: many(transactions),
  auctions: many(auctions),
}));

export const chitFundMembersRelations = relations(chitFundMembers, ({ one }) => ({
  chitFund: one(chitFunds, {
    fields: [chitFundMembers.chitFundId],
    references: [chitFunds.id],
  }),
  member: one(members, {
    fields: [chitFundMembers.memberId],
    references: [members.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  chitFund: one(chitFunds, {
    fields: [payments.chitFundId],
    references: [chitFunds.id],
  }),
  member: one(members, {
    fields: [payments.memberId],
    references: [members.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  chitFund: one(chitFunds, {
    fields: [transactions.chitFundId],
    references: [chitFunds.id],
  }),
  member: one(members, {
    fields: [transactions.memberId],
    references: [members.id],
  }),
}));

export const auctionsRelations = relations(auctions, ({ one }) => ({
  chitFund: one(chitFunds, {
    fields: [auctions.chitFundId],
    references: [chitFunds.id],
  }),
  winner: one(members, {
    fields: [auctions.winnerId],
    references: [members.id],
  }),
}));

// Types
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type ChitFund = typeof chitFunds.$inferSelect;
export type NewChitFund = typeof chitFunds.$inferInsert;
export type ChitFundMember = typeof chitFundMembers.$inferSelect;
export type NewChitFundMember = typeof chitFundMembers.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Auction = typeof auctions.$inferSelect;
export type NewAuction = typeof auctions.$inferInsert;
