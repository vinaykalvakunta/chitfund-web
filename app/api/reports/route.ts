import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Monthly collection trends (last 12 months)
    const monthlyCollections = await sql`
      SELECT 
        DATE_TRUNC('month', paid_date)::date as month,
        COUNT(*) as payment_count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM payments
      WHERE status = 'paid'
        AND paid_date >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
      GROUP BY DATE_TRUNC('month', paid_date)
      ORDER BY month
    `

    // Chit fund performance
    const chitFundPerformance = await sql`
      SELECT 
        cf.id,
        cf.name,
        cf.total_value,
        cf.duration_months,
        cf.current_month,
        cf.status,
        (SELECT COUNT(*) FROM chit_fund_members cfm WHERE cfm.chit_fund_id = cf.id) as member_count,
        (SELECT COALESCE(SUM(amount), 0) FROM payments p WHERE p.chit_fund_id = cf.id AND p.status = 'paid') as collected_amount,
        (SELECT COUNT(*) FROM auctions a WHERE a.chit_fund_id = cf.id AND a.is_completed = true) as auctions_completed,
        (SELECT COALESCE(SUM(prize_amount), 0) FROM auctions a WHERE a.chit_fund_id = cf.id AND a.is_completed = true) as prizes_disbursed
      FROM chit_funds cf
      ORDER BY cf.created_at DESC
      LIMIT 10
    `

    // Top contributing members
    const topMembers = await sql`
      SELECT 
        m.id,
        m.name,
        m.phone,
        COUNT(DISTINCT p.chit_fund_id) as chit_funds,
        COUNT(p.id) as payment_count,
        COALESCE(SUM(p.amount), 0) as total_contributed
      FROM members m
      LEFT JOIN payments p ON p.member_id = m.id AND p.status = 'paid'
      WHERE m.status = 'active'
      GROUP BY m.id, m.name, m.phone
      ORDER BY total_contributed DESC
      LIMIT 10
    `

    // Payment status distribution
    const paymentStatuses = await sql`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM payments
      GROUP BY status
    `

    // Collection rate by chit fund
    const collectionRates = await sql`
      SELECT 
        cf.id,
        cf.name,
        cf.total_members,
        cf.current_month,
        (SELECT COUNT(*) FROM chit_fund_members cfm WHERE cfm.chit_fund_id = cf.id) as enrolled_members,
        (SELECT COUNT(DISTINCT p.member_id || '-' || p.month_number) 
         FROM payments p 
         WHERE p.chit_fund_id = cf.id AND p.status = 'paid') as payments_received,
        (cf.current_month * (SELECT COUNT(*) FROM chit_fund_members cfm WHERE cfm.chit_fund_id = cf.id)) as expected_payments
      FROM chit_funds cf
      WHERE cf.status = 'active'
    `

    // Summary stats
    const summaryStats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM members WHERE status = 'active') as active_members,
        (SELECT COUNT(*) FROM chit_funds WHERE status = 'active') as active_chit_funds,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'paid') as total_collected,
        (SELECT COALESCE(SUM(prize_amount), 0) FROM auctions WHERE is_completed = true) as total_disbursed,
        (SELECT COALESCE(SUM(winning_bid), 0) FROM auctions WHERE is_completed = true) as total_bid_savings,
        (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments
    `

    return NextResponse.json({
      monthlyCollections,
      chitFundPerformance,
      topMembers,
      paymentStatuses,
      collectionRates,
      summary: summaryStats[0],
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
