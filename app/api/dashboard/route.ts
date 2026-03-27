import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get summary statistics
    const memberStats = await sql`
      SELECT 
        COUNT(*) as total_members,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_members
      FROM members
    `

    const chitFundStats = await sql`
      SELECT 
        COUNT(*) as total_chit_funds,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_chit_funds,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_chit_funds,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_chit_funds,
        COALESCE(SUM(total_value), 0) as total_chit_value
      FROM chit_funds
    `

    const paymentStats = await sql`
      SELECT 
        COUNT(*) as total_payments,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_collected,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_payments
      FROM payments
    `

    const auctionStats = await sql`
      SELECT 
        COUNT(*) as total_auctions,
        COALESCE(SUM(prize_amount), 0) as total_prize_disbursed
      FROM auctions WHERE is_completed = true
    `

    // Get recent transactions
    const recentTransactions = await sql`
      SELECT t.*, m.name as member_name, cf.name as chit_fund_name
      FROM transactions t
      LEFT JOIN members m ON m.id = t.member_id
      LEFT JOIN chit_funds cf ON cf.id = t.chit_fund_id
      ORDER BY t.created_at DESC
      LIMIT 10
    `

    // Get active chit funds with progress
    const activeChitFunds = await sql`
      SELECT cf.*, 
        (SELECT COUNT(*) FROM chit_fund_members cfm WHERE cfm.chit_fund_id = cf.id) as member_count,
        (SELECT COALESCE(SUM(amount), 0) FROM payments p WHERE p.chit_fund_id = cf.id AND p.status = 'paid') as collected_amount
      FROM chit_funds cf
      WHERE cf.status = 'active'
      ORDER BY cf.start_date DESC
      LIMIT 5
    `

    // Get upcoming payments due
    const upcomingPayments = await sql`
      SELECT DISTINCT ON (cfm.member_id, cfm.chit_fund_id)
        m.id as member_id, m.name as member_name, m.phone,
        cf.id as chit_fund_id, cf.name as chit_fund_name, cf.monthly_contribution,
        cf.current_month + 1 as due_month
      FROM chit_fund_members cfm
      JOIN members m ON m.id = cfm.member_id
      JOIN chit_funds cf ON cf.id = cfm.chit_fund_id
      WHERE cf.status = 'active'
        AND NOT EXISTS (
          SELECT 1 FROM payments p 
          WHERE p.chit_fund_id = cf.id 
            AND p.member_id = m.id 
            AND p.month_number = cf.current_month + 1
            AND p.status = 'paid'
        )
      ORDER BY cfm.member_id, cfm.chit_fund_id
      LIMIT 10
    `

    return NextResponse.json({
      stats: {
        members: memberStats[0],
        chitFunds: chitFundStats[0],
        payments: paymentStats[0],
        auctions: auctionStats[0],
      },
      recentTransactions,
      activeChitFunds,
      upcomingPayments,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

