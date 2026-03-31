"use client"

import * as React from "react"
import Link from "next/link"
import useSWR from "swr"
import { Plus, Search, Filter, MoreHorizontal, Users, Calendar, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty } from "@/components/ui/empty"

const fetcher = async (url: string) => { const res = await fetch(url); if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Failed to fetch data'); } return res.json(); }

interface ChitFund {
  id: string
  name: string
  total_value: string
  monthly_contribution: string
  total_members: number
  member_count: string
  duration_months: number
  current_month: number
  collected_amount: string
  start_date: string
  status: string
}

export default function ChitFundsPage() {
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [search, setSearch] = React.useState("")

  const { data: chitFundsData, error, isLoading } = useSWR(
    `/api/chit-funds?status=${statusFilter}`,
    fetcher
  )

  // Handle potential error responses (non-array data)
  const chitFunds: ChitFund[] = Array.isArray(chitFundsData) ? chitFundsData : []

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredFunds = chitFunds.filter((fund) =>
    fund.name.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chit Funds</h1>
          <p className="text-muted-foreground">Manage your chit fund schemes</p>
        </div>
        <Button asChild>
          <Link href="/chit-funds/new">
            <Plus className="mr-2 h-4 w-4" />
            New Chit Fund
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search chit funds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load chit funds. Please try again.
        </div>
      ) : filteredFunds.length === 0 ? (
        <Empty
          title="No chit funds found"
          description={search ? "Try a different search term" : "Get started by creating your first chit fund"}
          action={
            !search && (
              <Button asChild>
                <Link href="/chit-funds/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Chit Fund
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFunds.map((fund) => {
            const memberCount = Number(fund.member_count)
            const progress = fund.duration_months > 0 ? (fund.current_month / fund.duration_months) * 100 : 0

            return (
              <Card key={fund.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{fund.name}</CardTitle>
                      <CardDescription className="mt-1">{formatAmount(fund.total_value)}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(fund.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/chit-funds/${fund.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/chit-funds/${fund.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {memberCount}/{fund.total_members}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{fund.duration_months}m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span>{formatAmount(fund.monthly_contribution)}</span>
                    </div>
                  </div>

                  {fund.status === "active" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>
                          Month {fund.current_month}/{fund.duration_months}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/chit-funds/${fund.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

