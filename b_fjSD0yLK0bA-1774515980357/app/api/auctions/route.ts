import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const chitFundId = searchParams.get("chit_fund_id")

    let query = `
      SELECT a.*, cf.name as chit_fund_name, cf.total_value, m.name as winner_name, m.phone as winner_phone
      FROM auctions a
      JOIN chit_funds cf ON cf.id = a.chit_fund_id
      LEFT JOIN members m ON m.id = a.winner_id
      WHERE 1=1
    `
    const params: any[] = []

    if (chitFundId) {
      query += ` AND a.chit_fund_id = $1`
      params.push(chitFundId)
    }

    query += ` ORDER BY a.auction_date DESC`

    const auctions = await sql(query, params)
    return NextResponse.json(auctions)
  } catch (error) {
    console.error("Error fetching auctions:", error)
    return NextResponse.json({ error: "Failed to fetch auctions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chit_fund_id, month_number, winner_id, winning_bid, auction_date } = body

    if (!chit_fund_id || !month_number || !winner_id || winning_bid === undefined) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    // Check if auction already exists for this month
    const existing = await sql`
      SELECT * FROM auctions WHERE chit_fund_id = ${chit_fund_id} AND month_number = ${month_number}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Auction already exists for this month" }, { status: 400 })
    }

    // Check if member has already won in this chit fund
    const memberWon = await sql`
      SELECT has_won_prize FROM chit_fund_members 
      WHERE chit_fund_id = ${chit_fund_id} AND member_id = ${winner_id}
    `

    if (memberWon.length > 0 && memberWon[0].has_won_prize) {
      return NextResponse.json({ error: "Member has already won a prize in this chit fund" }, { status: 400 })
    }

    // Get chit fund details for calculating prize amount
    const chitFund = await sql`SELECT total_value FROM chit_funds WHERE id = ${chit_fund_id}`
    
    if (chitFund.length === 0) {
      return NextResponse.json({ error: "Chit fund not found" }, { status: 404 })
    }

    const prizeAmount = Number(chitFund[0].total_value) - Number(winning_bid)

    const result = await sql`
      INSERT INTO auctions (chit_fund_id, month_number, winner_id, winning_bid, prize_amount, auction_date, is_completed)
      VALUES (${chit_fund_id}, ${month_number}, ${winner_id}, ${winning_bid}, ${prizeAmount}, ${auction_date || new Date().toISOString()}, true)
      RETURNING *
    `

    // Update member's has_won_prize status
    await sql`
      UPDATE chit_fund_members SET has_won_prize = true, prize_won_month = ${month_number}
      WHERE chit_fund_id = ${chit_fund_id} AND member_id = ${winner_id}
    `

    // Update chit fund current month
    await sql`
      UPDATE chit_funds SET current_month = ${month_number}, updated_at = NOW() 
      WHERE id = ${chit_fund_id}
    `

    // Create transaction record for prize disbursement
    await sql`
      INSERT INTO transactions (chit_fund_id, member_id, type, amount, description)
      VALUES (${chit_fund_id}, ${winner_id}, 'payout', ${prizeAmount}, ${'Prize amount for month ' + month_number + ' auction'})
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating auction:", error)
    return NextResponse.json({ error: "Failed to create auction" }, { status: 500 })
  }
}
