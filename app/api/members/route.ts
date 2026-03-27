import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    let query = `
      SELECT m.*, 
        (SELECT COUNT(*) FROM chit_fund_members cfm WHERE cfm.member_id = m.id) as chit_count,
        (SELECT COALESCE(SUM(amount), 0) FROM payments p WHERE p.member_id = m.id AND p.status = 'paid') as total_paid
      FROM members m
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (search) {
      query += ` AND (m.name ILIKE $${paramIndex} OR m.phone ILIKE $${paramIndex} OR m.email ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (status && status !== "all") {
      query += ` AND m.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    query += ` ORDER BY m.created_at DESC`

    const members = await sql(query, params)
    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, address, aadhar_number, pan_number } = body

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO members (name, phone, email, address, aadhar_number, pan_number)
      VALUES (${name}, ${phone}, ${email || null}, ${address || null}, ${aadhar_number || null}, ${pan_number || null})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating member:", error)
    if (error.message?.includes("unique")) {
      return NextResponse.json({ error: "Member with this phone/email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 })
  }
}

