"use client"

import * as React from "react"
import useSWR from "swr"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Users, Wallet, IndianRupee, TrendingUp, Download, PiggyBank, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const fetcher = async (url: string) => { const res = await fetch(url); if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Failed to fetch data'); } return res.json(); }

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

interface MonthlyCollection {
  month: string
  payment_count: string
  total_amount: string
}

interface ChitFundPerformance {
  id: string
  name: string
  total_value: string
  duration_months: number
  current_month: number
  status: string
  member_count: string
  collected_amount: string
}

interface TopMember {
  id: string
  name: string
  phone: string
  chit_funds: string
  payment_count: string
  total_contributed: string
}

interface PaymentMethod {
  payment_method: string
  count: string
  total_amount: string
}

interface CollectionRate {
  id: string
  name: string
  enrolled_members: string
  current_month: number
  payments_received: string
  expected_payments: string
}

interface Summary {
  active_members: string
  active_chit_funds: string
  total_collected: string
  pending_payments: string
}

interface ReportsData {
  error?: string
  monthlyCollections: MonthlyCollection[]
  chitFundPerformance: ChitFundPerformance[]
  topMembers: TopMember[]
  paymentMethods: PaymentMethod[]
  collectionRates: CollectionRate[]
  summary: Summary
}

export default function ReportsPage() {
  const { data, error, isLoading } = useSWR<ReportsData>("/api/reports", fetcher)
  const [chartType, setChartType] = React.useState<"line" | "bar" | "pie">("line")

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatCompactAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`
    return `₹${num}`
  }

  const formatMonth = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !data || data.error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load reports. Please try again.
        </div>
      </div>
    )
  }

  // Safely extract data with defaults
  const monthlyCollections = Array.isArray(data.monthlyCollections) ? data.monthlyCollections : []
  const chitFundPerformance = Array.isArray(data.chitFundPerformance) ? data.chitFundPerformance : []
  const topMembers = Array.isArray(data.topMembers) ? data.topMembers : []
  const paymentMethods = Array.isArray(data.paymentMethods) ? data.paymentMethods : []
  const collectionRates = Array.isArray(data.collectionRates) ? data.collectionRates : []
  const summary = data.summary || {
    active_members: "0",
    active_chit_funds: "0",
    total_collected: "0",
    pending_payments: "0",
  }

  const chartData = monthlyCollections.map((item) => ({
    month: formatMonth(item.month),
    amount: Number(item.total_amount),
    count: Number(item.payment_count),
  }))

  const pieData = paymentMethods.map((item) => ({
    name: item.payment_method.replace("_", " ").charAt(0).toUpperCase() + item.payment_method.slice(1).replace("_", " "),
    value: Number(item.total_amount),
    count: Number(item.count),
  }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Financial insights and performance metrics</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <IndianRupee className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold">{formatCompactAmount(summary.total_collected)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <Receipt className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">{summary.pending_payments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Collections Point Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Monthly Collections Trend</CardTitle>
              <CardDescription>Payment collections over the last 12 months</CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
              <Button variant={chartType === "line" ? "default" : "ghost"} size="sm" className="h-7 px-2 text-xs" onClick={() => setChartType("line")}>Line</Button>
              <Button variant={chartType === "bar" ? "default" : "ghost"} size="sm" className="h-7 px-2 text-xs" onClick={() => setChartType("bar")}>Bar</Button>
              <Button variant={chartType === "pie" ? "default" : "ghost"} size="sm" className="h-7 px-2 text-xs" onClick={() => setChartType("pie")}>Pie</Button>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">No collection data yet</p>
            ) : (
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => formatCompactAmount(value)}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="text-sm font-medium">{payload[0].payload.month}</p>
                                <p className="text-sm text-muted-foreground">
                                  Amount: {formatAmount(payload[0].value as number)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Payments: {payload[0].payload.count}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  ) : chartType === "bar" ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => formatCompactAmount(value)}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="text-sm font-medium">{payload[0].payload.month}</p>
                                <p className="text-sm text-muted-foreground">
                                  Amount: {formatAmount(payload[0].value as number)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Payments: {payload[0].payload.count}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="month"
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="text-sm font-medium">{payload[0].name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Amount: {formatAmount(payload[0].value as number)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Payments: {payload[0].payload.count}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of payments by method</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">No payment data yet</p>
            ) : (
              <div className="flex items-center gap-8">
                <ChartContainer config={{}} className="h-[250px] flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="text-sm font-medium">{payload[0].name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatAmount(payload[0].value as number)}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="space-y-3">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Collection Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Rates by Chit Fund</CardTitle>
          <CardDescription>Payment collection performance for active chit funds</CardDescription>
        </CardHeader>
        <CardContent>
          {collectionRates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No active chit funds</p>
          ) : (
            <div className="space-y-6">
              {collectionRates.map((fund) => {
                const rate =
                  Number(fund.expected_payments) > 0
                    ? (Number(fund.payments_received) / Number(fund.expected_payments)) * 100
                    : 0
                return (
                  <div key={fund.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{fund.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {fund.payments_received} of {fund.expected_payments} expected payments
                        </p>
                      </div>
                      <Badge
                        variant={rate >= 90 ? "default" : rate >= 70 ? "secondary" : "destructive"}
                        className={rate >= 90 ? "bg-success text-success-foreground" : ""}
                      >
                        {rate.toFixed(0)}%
                      </Badge>
                    </div>
                    <Progress value={rate} className="h-2" />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chit Fund Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Chit Fund Performance</CardTitle>
            <CardDescription>Financial summary of all chit funds</CardDescription>
          </CardHeader>
          <CardContent>
            {chitFundPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No chit funds yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Collected</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chitFundPerformance.map((fund) => (
                    <TableRow key={fund.id}>
                      <TableCell>
                        <p className="font-medium">{fund.name}</p>
                      </TableCell>
                      <TableCell className="text-success">{formatCompactAmount(fund.collected_amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={fund.status === "active" ? "default" : "secondary"}
                          className={fund.status === "active" ? "bg-success text-success-foreground" : ""}
                        >
                          {fund.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Contributing Members */}
        <Card>
          <CardHeader>
            <CardTitle>Top Contributing Members</CardTitle>
            <CardDescription>Members with highest total contributions</CardDescription>
          </CardHeader>
          <CardContent>
            {topMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No members yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Chit Funds</TableHead>
                    <TableHead>Payments</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{member.chit_funds}</TableCell>
                      <TableCell>{member.payment_count}</TableCell>
                      <TableCell className="font-medium text-success">
                        {formatCompactAmount(member.total_contributed)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

