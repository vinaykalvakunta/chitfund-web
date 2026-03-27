"use client"

import useSWR from "swr"
import { Users, Wallet, Receipt, Gavel, TrendingUp, IndianRupee } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { ActiveChitFunds } from "@/components/dashboard/active-chit-funds"
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const fetcher = async (url: string) => { const res = await fetch(url); if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Failed to fetch data'); } return res.json(); }

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 30000,
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || data?.error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load dashboard data. Please try again.
        </div>
      </div>
    )
  }

  const defaultStats = {
    members: { total_members: 0, active_members: 0 },
    chitFunds: { total_chit_funds: 0, active_chit_funds: 0, total_chit_value: 0 },
    payments: { total_collected: 0, pending_payments: 0 },
    auctions: { total_auctions: 0, total_prize_disbursed: 0 },
  }

  const stats = {
    members: data?.stats?.members || defaultStats.members,
    chitFunds: data?.stats?.chitFunds || defaultStats.chitFunds,
    payments: data?.stats?.payments || defaultStats.payments,
    auctions: data?.stats?.auctions || defaultStats.auctions,
  }
  const recentTransactions = data?.recentTransactions || []
  const activeChitFunds = data?.activeChitFunds || []
  const upcomingPayments = data?.upcomingPayments || []

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(1)}Cr`
    }
    if (num >= 100000) {
      return `${(num / 100000).toFixed(1)}L`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    }
    return num.toString()
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your chit fund operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Members"
          value={Number(stats.members.total_members)}
          description={`${stats.members.active_members} active`}
          icon={Users}
        />
        <StatsCard
          title="Active Chit Funds"
          value={Number(stats.chitFunds.active_chit_funds)}
          description={`${stats.chitFunds.total_chit_funds} total`}
          icon={Wallet}
        />
        <StatsCard
          title="Total Collected"
          value={`₹${formatAmount(stats.payments.total_collected)}`}
          description="From all contributions"
          icon={IndianRupee}
        />
        <StatsCard
          title="Prize Disbursed"
          value={`₹${formatAmount(stats.auctions.total_prize_disbursed)}`}
          description={`${stats.auctions.total_auctions} auctions completed`}
          icon={Gavel}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActiveChitFunds chitFunds={activeChitFunds} />
        <UpcomingPayments payments={upcomingPayments} />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={recentTransactions} />
    </div>
  )
}

