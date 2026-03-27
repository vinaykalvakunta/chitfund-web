import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const member = await sql`
      SELECT m.*, 
        (SELECT COUNT(*) FROM chit_fund_members cfm WHERE cfm.member_id = m.id) as chit_count,
        (SELECT COALESCE(SUM(amount), 0) FROM payments p WHERE p.member_id = m.id AND p.status = 'paid') as total_paid
      FROM members m
      WHERE m.id = ${id}
    `

    if (member.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json(member[0])
  } catch (error) {
    console.error("Error fetching member:", error)
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, phone, email, address, status, aadhar_number, pan_number } = body

    const result = await sql`
      UPDATE members
      SET name = ${name}, phone = ${phone}, email = ${email || null}, 
          address = ${address || null}, status = ${status || 'active'},
          aadhar_number = ${aadhar_number || null}, pan_number = ${pan_number || null}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating member:", error)
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Check if member is part of any active chit fund
    const activeChits = await sql`
      SELECT COUNT(*) as count FROM chit_fund_members cfm
      JOIN chit_funds cf ON cf.id = cfm.chit_fund_id
      WHERE cfm.member_id = ${id} AND cf.status = 'active'
    `

    if (Number(activeChits[0].count) > 0) {
      return NextResponse.json({ error: "Cannot delete member who is part of active chit funds" }, { status: 400 })
    }

    const result = await sql`DELETE FROM members WHERE id = ${id} RETURNING *`

    if (result.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Member deleted successfully" })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 })
  }
}
