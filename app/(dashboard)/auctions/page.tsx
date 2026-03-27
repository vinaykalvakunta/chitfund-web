"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { Plus, Filter, Gavel, IndianRupee, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty } from "@/components/ui/empty"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Auction {
  id: string
  chit_fund_id: string
  chit_fund_name: string
  total_value: string
  month_number: number
  winner_name: string | null
  winner_phone: string | null
  winner_id: string | null
  winning_bid: string
  prize_amount: string
  auction_date: string
  is_completed: boolean
}

interface ChitFund {
  id: string
  name: string
  total_value: string
  current_month: number
  status: string
  members?: Array<{
    id: string
    name: string
    phone: string
    has_won_prize: boolean
  }>
}

function AuctionsPageContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [chitFundFilter, setChitFundFilter] = React.useState(searchParams.get("chit_fund_id") || "all")
  const [addAuctionOpen, setAddAuctionOpen] = React.useState(searchParams.has("chit_fund_id"))
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [selectedChitFund, setSelectedChitFund] = React.useState(searchParams.get("chit_fund_id") || "")
  const [selectedWinner, setSelectedWinner] = React.useState("")
  const [bidAmount, setBidAmount] = React.useState("")
  const [monthNumber, setMonthNumber] = React.useState("")
  const [auctionDate, setAuctionDate] = React.useState(new Date().toISOString().split("T")[0])

  const { data: auctionsData, error, isLoading, mutate } = useSWR(
    `/api/auctions${chitFundFilter !== "all" ? `?chit_fund_id=${chitFundFilter}` : ""}`,
    fetcher
  )
  const { data: chitFundsData } = useSWR("/api/chit-funds?status=active", fetcher)
  
  // Handle potential error responses (non-array data)
  const auctions: Auction[] = Array.isArray(auctionsData) ? auctionsData : []
  const chitFunds: ChitFund[] = Array.isArray(chitFundsData) ? chitFundsData : []
  const { data: selectedChitFundData } = useSWR<ChitFund>(
    selectedChitFund ? `/api/chit-funds/${selectedChitFund}` : null,
    fetcher
  )

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const eligibleMembers = selectedChitFundData?.members?.filter((m) => !m.has_won_prize) || []

  const handleChitFundChange = (value: string) => {
    setSelectedChitFund(value)
    setSelectedWinner("")
    setBidAmount("")
    const fund = chitFunds.find((f) => String(f.id) === value)
    if (fund) {
      setMonthNumber(String(fund.current_month + 1))
    }
  }

  const resetForm = () => {
    setSelectedChitFund("")
    setSelectedWinner("")
    setBidAmount("")
    setMonthNumber("")
    setAuctionDate(new Date().toISOString().split("T")[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chit_fund_id: selectedChitFund,
          winner_id: selectedWinner,
          winning_bid: Number(bidAmount),
          month_number: Number(monthNumber),
          auction_date: auctionDate,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to record auction")
      }

      toast({ title: "Auction recorded successfully" })
      mutate()
      setAddAuctionOpen(false)
      resetForm()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auctions</h1>
          <p className="text-muted-foreground">Record and track monthly auctions</p>
        </div>
        <Dialog open={addAuctionOpen} onOpenChange={setAddAuctionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Gavel className="mr-2 h-4 w-4" />
              Record Auction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Auction</DialogTitle>
              <DialogDescription>Record a new monthly auction result</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Chit Fund *</FieldLabel>
                  <Select value={selectedChitFund} onValueChange={handleChitFundChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chit fund" />
                    </SelectTrigger>
                    <SelectContent>
                      {chitFunds.map((fund) => (
                        <SelectItem key={fund.id} value={String(fund.id)}>
                          {fund.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Auction Winner *</FieldLabel>
                  <Select
                    value={selectedWinner}
                    onValueChange={setSelectedWinner}
                    disabled={!selectedChitFund}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedChitFund ? "Select winner" : "Select chit fund first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedChitFund && eligibleMembers.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      All members have already won an auction
                    </p>
                  )}
                </Field>

                <div className="grid gap-4 grid-cols-2">
                  <Field>
                    <FieldLabel>Month Number *</FieldLabel>
                    <Input
                      type="number"
                      min="1"
                      value={monthNumber}
                      onChange={(e) => setMonthNumber(e.target.value)}
                      placeholder="e.g., 1"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Bid Amount (₹) *</FieldLabel>
                    <Input
                      type="number"
                      min="0"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="e.g., 5000"
                      required
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Auction Date *</FieldLabel>
                  <Input
                    type="date"
                    value={auctionDate}
                    onChange={(e) => setAuctionDate(e.target.value)}
                    required
                  />
                </Field>

                {selectedChitFundData && bidAmount && (
                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <p className="text-sm font-medium">Prize Calculation</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Value:</span>
                      <span>{formatAmount(selectedChitFundData.total_value)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Winning Bid:</span>
                      <span>- {formatAmount(bidAmount)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Prize Amount:</span>
                      <span className="text-success">
                        {formatAmount(Number(selectedChitFundData.total_value) - Number(bidAmount))}
                      </span>
                    </div>
                  </div>
                )}
              </FieldGroup>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setAddAuctionOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedChitFund || !selectedWinner || !bidAmount}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Record Auction
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center">
        <Select value={chitFundFilter} onValueChange={setChitFundFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by chit fund" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chit Funds</SelectItem>
            {chitFunds.map((fund) => (
              <SelectItem key={fund.id} value={String(fund.id)}>
                {fund.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error || auctionsData?.error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load auctions. Please try again.
        </div>
      ) : auctions.length === 0 ? (
        <Empty
          title="No auctions found"
          description="No auctions have been recorded yet"
          action={
            <Button onClick={() => setAddAuctionOpen(true)}>
              <Gavel className="mr-2 h-4 w-4" />
              Record Auction
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chit Fund</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Bid Amount</TableHead>
                  <TableHead>Prize Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auctions.map((auction) => (
                  <TableRow key={auction.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{auction.chit_fund_name}</p>
                        <p className="text-xs text-muted-foreground">{formatAmount(auction.total_value)}</p>
                      </div>
                    </TableCell>
                    <TableCell>Month {auction.month_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{auction.winner_name || "-"}</p>
                        {auction.winner_phone && (
                          <p className="text-xs text-muted-foreground">{auction.winner_phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-destructive">{formatAmount(auction.winning_bid)}</TableCell>
                    <TableCell className="font-medium text-success">{formatAmount(auction.prize_amount)}</TableCell>
                    <TableCell>{formatDate(auction.auction_date)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          auction.is_completed
                            ? "bg-success text-success-foreground"
                            : "bg-warning text-warning-foreground"
                        }
                      >
                        {auction.is_completed ? "Completed" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function AuctionsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 mb-2 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-36 bg-muted animate-pulse rounded" />
        </div>
      </div>
    }>
      <AuctionsPageContent />
    </Suspense>
  )
}
