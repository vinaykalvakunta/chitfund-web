import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const chitFundId = searchParams.get("chit_fund_id")
    const memberId = searchParams.get("member_id")
    const type = searchParams.get("type")
    const limit = searchParams.get("limit") || "50"

    let query = `
      SELECT t.*, m.name as member_name, cf.name as chit_fund_name
      FROM transactions t
      LEFT JOIN members m ON m.id = t.member_id
      LEFT JOIN chit_funds cf ON cf.id = t.chit_fund_id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (chitFundId) {
      query += ` AND t.chit_fund_id = $${paramIndex}`
      params.push(chitFundId)
      paramIndex++
    }

    if (memberId) {
      query += ` AND t.member_id = $${paramIndex}`
      params.push(memberId)
      paramIndex++
    }

    if (type && type !== "all") {
      query += ` AND t.type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex}`
    params.push(parseInt(limit))

    const transactions = await sql(query, params)
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

