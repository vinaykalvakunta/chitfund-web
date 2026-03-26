"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowDownLeft, ArrowUpRight, Minus } from "lucide-react"

interface Transaction {
  id: string
  type: string
  amount: string | number
  member_name: string | null
  chit_fund_name: string | null
  description: string | null
  created_at: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(num)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "contribution":
        return <ArrowDownLeft className="h-4 w-4 text-success" />
      case "prize":
        return <ArrowUpRight className="h-4 w-4 text-primary" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "contribution":
        return <Badge variant="outline" className="border-success/50 text-success">Contribution</Badge>
      case "prize":
        return <Badge variant="outline" className="border-primary/50 text-primary">Prize</Badge>
      case "commission":
        return <Badge variant="outline">Commission</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest financial activities across all chit funds</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {getTypeIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{transaction.member_name || "System"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {transaction.chit_fund_name || transaction.description}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      transaction.type === "contribution" ? "text-success" : "text-foreground"
                    )}
                  >
                    {transaction.type === "contribution" ? "+" : ""}
                    {formatAmount(transaction.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
