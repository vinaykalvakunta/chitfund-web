-- ChitFund Manager Database Schema
-- Migration 001: Create all tables

-- Create enums
DO $$ BEGIN
    CREATE TYPE chit_fund_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE member_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('contribution', 'payout', 'penalty', 'refund');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address TEXT,
    status member_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chit Funds table
CREATE TABLE IF NOT EXISTS chit_funds (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    total_value DECIMAL(12, 2) NOT NULL,
    monthly_contribution DECIMAL(10, 2) NOT NULL,
    total_members INTEGER NOT NULL,
    duration_months INTEGER NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    current_month INTEGER NOT NULL DEFAULT 0,
    status chit_fund_status NOT NULL DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chit Fund Members junction table
CREATE TABLE IF NOT EXISTS chit_fund_members (
    id SERIAL PRIMARY KEY,
    chit_fund_id INTEGER NOT NULL REFERENCES chit_funds(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    ticket_number INTEGER NOT NULL,
    has_won_prize BOOLEAN NOT NULL DEFAULT FALSE,
    prize_won_month INTEGER,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(chit_fund_id, member_id),
    UNIQUE(chit_fund_id, ticket_number)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    chit_fund_id INTEGER NOT NULL REFERENCES chit_funds(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    month_number INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    paid_date TIMESTAMP,
    status payment_status NOT NULL DEFAULT 'pending',
    penalty_amount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Transactions table (audit trail)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    chit_fund_id INTEGER NOT NULL REFERENCES chit_funds(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    reference_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Auctions/Prize Draws table
CREATE TABLE IF NOT EXISTS auctions (
    id SERIAL PRIMARY KEY,
    chit_fund_id INTEGER NOT NULL REFERENCES chit_funds(id) ON DELETE CASCADE,
    month_number INTEGER NOT NULL,
    winner_id INTEGER REFERENCES members(id),
    winning_bid DECIMAL(10, 2),
    prize_amount DECIMAL(12, 2) NOT NULL,
    dividend DECIMAL(10, 2) DEFAULT 0,
    auction_date TIMESTAMP NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(chit_fund_id, month_number)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chit_fund_members_chit_fund_id ON chit_fund_members(chit_fund_id);
CREATE INDEX IF NOT EXISTS idx_chit_fund_members_member_id ON chit_fund_members(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_chit_fund_id ON payments(chit_fund_id);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_transactions_chit_fund_id ON transactions(chit_fund_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_auctions_chit_fund_id ON auctions(chit_fund_id);
