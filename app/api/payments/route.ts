import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const chitFundId = searchParams.get("chit_fund_id")
    const memberId = searchParams.get("member_id")
    const status = searchParams.get("status")
    const month = searchParams.get("month")

    let query = `
      SELECT p.*, m.name as member_name, m.phone as member_phone, cf.name as chit_fund_name
      FROM payments p
      JOIN members m ON m.id = p.member_id
      JOIN chit_funds cf ON cf.id = p.chit_fund_id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (chitFundId) {
      query += ` AND p.chit_fund_id = $${paramIndex}`
      params.push(chitFundId)
      paramIndex++
    }

    if (memberId) {
      query += ` AND p.member_id = $${paramIndex}`
      params.push(memberId)
      paramIndex++
    }

    if (status && status !== "all") {
      query += ` AND p.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (month) {
      query += ` AND p.month_number = $${paramIndex}`
      params.push(month)
      paramIndex++
    }

    query += ` ORDER BY p.created_at DESC`

    const payments = await sql(query, params)
    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chit_fund_id, member_id, amount, month_number, payment_date, payment_method, notes } = body

    if (!chit_fund_id || !member_id || !amount || !month_number) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    // Check if payment already exists for this member and month
    const existing = await sql`
      SELECT * FROM payments 
      WHERE chit_fund_id = ${chit_fund_id} AND member_id = ${member_id} AND month_number = ${month_number}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Payment already exists for this month" }, { status: 400 })
    }

    const dueDate = new Date()
    dueDate.setMonth(dueDate.getMonth() + 1)
    
    const result = await sql`
      INSERT INTO payments (chit_fund_id, member_id, amount, month_number, due_date, paid_date, payment_method, notes, status)
      VALUES (${chit_fund_id}, ${member_id}, ${amount}, ${month_number}, ${dueDate.toISOString()}, ${payment_date || new Date().toISOString()}, ${payment_method || 'cash'}, ${notes || null}, 'paid')
      RETURNING *
    `

    // Create a transaction record
    await sql`
      INSERT INTO transactions (chit_fund_id, member_id, type, amount, description)
      VALUES (${chit_fund_id}, ${member_id}, 'contribution', ${amount}, ${'Monthly contribution for month ' + month_number})
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}

