import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    let query = `
      SELECT cf.*, 
        (SELECT COUNT(*) FROM chit_fund_members cfm WHERE cfm.chit_fund_id = cf.id) as member_count,
        (SELECT COALESCE(SUM(amount), 0) FROM payments p WHERE p.chit_fund_id = cf.id AND p.status = 'paid') as collected_amount
      FROM chit_funds cf
      WHERE 1=1
    `
    const params: any[] = []

    if (status && status !== "all") {
      query += ` AND cf.status = $1`
      params.push(status)
    }

    query += ` ORDER BY cf.created_at DESC`

    const chitFunds = await sql(query, params)
    return NextResponse.json(chitFunds)
  } catch (error) {
    console.error("Error fetching chit funds:", error)
    return NextResponse.json({ error: "Failed to fetch chit funds" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, total_value, monthly_contribution, total_members, duration_months, start_date, description } = body

    if (!name || !total_value || !monthly_contribution || !total_members || !duration_months || !start_date) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO chit_funds (name, total_value, monthly_contribution, total_members, duration_months, start_date, description)
      VALUES (${name}, ${total_value}, ${monthly_contribution}, ${total_members}, ${duration_months}, ${start_date}, ${description || null})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating chit fund:", error)
    return NextResponse.json({ error: "Failed to create chit fund" }, { status: 500 })
  }
}

