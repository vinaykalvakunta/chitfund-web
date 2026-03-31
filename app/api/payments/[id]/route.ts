import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get the payment first to also clean up the related transaction
    const payment = await sql`SELECT * FROM payments WHERE id = ${id}`

    if (payment.length === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const p = payment[0]

    // Delete the related transaction record
    // We match by chit_fund_id, member_id, and the amount to ensure we remove the correct log
    await sql`
      DELETE FROM transactions 
      WHERE chit_fund_id = ${p.chit_fund_id} 
        AND member_id = ${p.member_id} 
        AND type = 'contribution'
        AND amount = ${p.amount}
        AND (description LIKE ${'%month ' + p.month_number + '%'} OR description LIKE ${'%Month ' + p.month_number + '%'})
    `

    // Delete the payment
    await sql`DELETE FROM payments WHERE id = ${id}`

    return NextResponse.json({ message: "Payment deleted successfully" })
  } catch (error) {
    console.error("Error deleting payment:", error)
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 })
  }
}
