import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const chitFund = await sql`
      SELECT cf.*, 
        (SELECT COUNT(*) FROM chit_fund_members cfm WHERE cfm.chit_fund_id = cf.id) as member_count,
        (SELECT COALESCE(SUM(amount), 0) FROM payments p WHERE p.chit_fund_id = cf.id AND p.status = 'paid') as collected_amount
      FROM chit_funds cf
      WHERE cf.id = ${id}
    `

    if (chitFund.length === 0) {
      return NextResponse.json({ error: "Chit fund not found" }, { status: 404 })
    }

    // Get members of this chit fund
    const members = await sql`
      SELECT m.id, m.name, m.phone, m.email, cfm.joined_at
      FROM members m
      JOIN chit_fund_members cfm ON cfm.member_id = m.id
      WHERE cfm.chit_fund_id = ${id}
      ORDER BY cfm.joined_at
    `

    return NextResponse.json({ ...chitFund[0], members })
  } catch (error) {
    console.error("Error fetching chit fund:", error)
    return NextResponse.json({ error: "Failed to fetch chit fund" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, total_value, monthly_contribution, total_members, duration_months, start_date, description, status } = body

    const result = await sql`
      UPDATE chit_funds
      SET name = ${name}, total_value = ${total_value}, monthly_contribution = ${monthly_contribution},
          total_members = ${total_members}, duration_months = ${duration_months}, start_date = ${start_date},
          description = ${description || null}, status = ${status || 'pending'}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Chit fund not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating chit fund:", error)
    return NextResponse.json({ error: "Failed to update chit fund" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Check if chit fund is active
    const chitFund = await sql`SELECT status FROM chit_funds WHERE id = ${id}`
    
    if (chitFund.length > 0 && chitFund[0].status === 'active') {
      return NextResponse.json({ error: "Cannot delete active chit fund" }, { status: 400 })
    }

    // Delete related records first (cascade should handle this, but being explicit)
    await sql`DELETE FROM transactions WHERE chit_fund_id = ${id}`
    await sql`DELETE FROM payments WHERE chit_fund_id = ${id}`
    await sql`DELETE FROM chit_fund_members WHERE chit_fund_id = ${id}`
    
    const result = await sql`DELETE FROM chit_funds WHERE id = ${id} RETURNING *`

    if (result.length === 0) {
      return NextResponse.json({ error: "Chit fund not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Chit fund deleted successfully" })
  } catch (error) {
    console.error("Error deleting chit fund:", error)
    return NextResponse.json({ error: "Failed to delete chit fund" }, { status: 500 })
  }
}
