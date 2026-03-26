import { pgTable, serial, text, integer, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const chitGroups = pgTable("chit_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  totalAmount: integer("total_amount").notNull(),
  durationMonths: integer("duration_months").notNull(),
  monthlySubscription: integer("monthly_subscription").notNull(),
  commissionPercentage: numeric("commission_percentage").notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  // For PG, text does not accept an enum array natively. We use $type to constrain the TS string.
  status: text("status").$type<"active" | "completed" | "pending">().notNull().default("pending"),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => chitGroups.id).notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  passwordHash: text("password_hash"), // Storing SHA-256 local hash
});

export const auctions = pgTable("auctions", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => chitGroups.id).notNull(),
  monthNumber: integer("month_number").notNull(),
  winnerId: integer("winner_id").references(() => members.id).notNull(),
  bidAmount: integer("bid_amount").notNull(),
  dividendPerMember: integer("dividend_per_member").notNull(),
  auctionDate: timestamp("auction_date").notNull().defaultNow(),
});

export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  auctionId: integer("auction_id").references(() => auctions.id).notNull(),
  amountPaid: integer("amount_paid").notNull(),
  paidAt: timestamp("paid_at").notNull().defaultNow(),
  isCollected: boolean("is_collected").notNull().default(false),
});

export const insertChitGroupSchema = createInsertSchema(chitGroups);
export const selectChitGroupSchema = createSelectSchema(chitGroups);

export const insertMemberSchema = createInsertSchema(members);
export const selectMemberSchema = createSelectSchema(members);

export const insertAuctionSchema = createInsertSchema(auctions);
export const selectAuctionSchema = createSelectSchema(auctions);

export const insertContributionSchema = createInsertSchema(contributions);
export const selectContributionSchema = createSelectSchema(contributions);

export type ChitGroup = typeof chitGroups.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Auction = typeof auctions.$inferSelect;
export type Contribution = typeof contributions.$inferSelect;
