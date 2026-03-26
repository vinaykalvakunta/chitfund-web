"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, AlertCircle } from "lucide-react"

interface UpcomingPayment {
  member_id: string
  member_name: string
  phone: string
  chit_fund_id: string
  chit_fund_name: string
  monthly_contribution: string | number
  due_month: number
}

interface UpcomingPaymentsProps {
  payments: UpcomingPayment[]
}

export function UpcomingPayments({ payments }: UpcomingPaymentsProps) {
  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(num)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Pending Payments
            {payments.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                {payments.length}
              </span>
            )}
          </CardTitle>
          <CardDescription>Members with pending contribution payments</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/payments">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No pending payments at the moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment, index) => (
              <div
                key={`${payment.member_id}-${payment.chit_fund_id}-${index}`}
                className="flex items-center gap-4 rounded-lg border p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                  M{payment.due_month}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{payment.member_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{payment.chit_fund_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatAmount(payment.monthly_contribution)}</p>
                  <p className="text-xs text-muted-foreground">{payment.phone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
