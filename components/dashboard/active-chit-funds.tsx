"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users } from "lucide-react"

interface ChitFund {
  id: string
  name: string
  total_value: string | number
  monthly_contribution: string | number
  total_members: number
  member_count: string | number
  duration_months: number
  current_month: number
  collected_amount: string | number
  start_date: string
}

interface ActiveChitFundsProps {
  chitFunds: ChitFund[]
}

export function ActiveChitFunds({ chitFunds }: ActiveChitFundsProps) {
  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const calculateProgress = (current: number, total: number) => {
    return Math.round((current / total) * 100)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Chit Funds</CardTitle>
          <CardDescription>Currently running chit fund schemes</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/chit-funds">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {chitFunds.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">No active chit funds</p>
            <Button asChild>
              <Link href="/chit-funds/new">Create your first chit fund</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {chitFunds.map((fund) => {
              const memberCount = Number(fund.member_count)
              const progress = calculateProgress(fund.current_month, fund.duration_months)
              const collectedAmount = Number(fund.collected_amount)
              const totalAmount = Number(fund.total_value)
              const collectionProgress = calculateProgress(collectedAmount, totalAmount * fund.duration_months)

              return (
                <Link
                  key={fund.id}
                  href={`/chit-funds/${fund.id}`}
                  className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{fund.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatAmount(fund.total_value)} &middot; {fund.duration_months} months
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      <Users className="mr-1 h-3 w-3" />
                      {memberCount}/{fund.total_members}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        Month {fund.current_month} of {fund.duration_months}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Collected: {formatAmount(collectedAmount)}</span>
                    <span>{collectionProgress}% of target</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
