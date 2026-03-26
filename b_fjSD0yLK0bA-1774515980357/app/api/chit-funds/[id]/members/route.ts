import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: chitFundId } = await params
    const body = await request.json()
    const { member_id } = body

    if (!member_id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    // Check if chit fund exists and has capacity
    const chitFund = await sql`
      SELECT cf.*, 
        (SELECT COUNT(*) FROM chit_fund_members cfm WHERE cfm.chit_fund_id = cf.id) as current_members
      FROM chit_funds cf
      WHERE cf.id = ${chitFundId}
    `

    if (chitFund.length === 0) {
      return NextResponse.json({ error: "Chit fund not found" }, { status: 404 })
    }

    if (Number(chitFund[0].current_members) >= chitFund[0].total_members) {
      return NextResponse.json({ error: "Chit fund is full" }, { status: 400 })
    }

    // Check if member is already in this chit fund
    const existing = await sql`
      SELECT * FROM chit_fund_members WHERE chit_fund_id = ${chitFundId} AND member_id = ${member_id}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Member is already in this chit fund" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO chit_fund_members (chit_fund_id, member_id)
      VALUES (${chitFundId}, ${member_id})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error adding member to chit fund:", error)
    return NextResponse.json({ error: "Failed to add member to chit fund" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: chitFundId } = await params
    const searchParams = request.nextUrl.searchParams
    const memberId = searchParams.get("member_id")

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    // Check if chit fund is active
    const chitFund = await sql`SELECT status FROM chit_funds WHERE id = ${chitFundId}`
    
    if (chitFund.length > 0 && chitFund[0].status === 'active') {
      return NextResponse.json({ error: "Cannot remove member from active chit fund" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM chit_fund_members 
      WHERE chit_fund_id = ${chitFundId} AND member_id = ${memberId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Member not found in this chit fund" }, { status: 404 })
    }

    return NextResponse.json({ message: "Member removed from chit fund successfully" })
  } catch (error) {
    console.error("Error removing member from chit fund:", error)
    return NextResponse.json({ error: "Failed to remove member from chit fund" }, { status: 500 })
  }
}
