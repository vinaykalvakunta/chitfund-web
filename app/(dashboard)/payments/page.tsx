"use client"

import * as React from "react"
import Link from "next/link"
import useSWR from "swr"
import { Plus, Search, Filter, Calendar, IndianRupee, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty } from "@/components/ui/empty"
import { useToast } from "@/hooks/use-toast"

const fetcher = async (url: string) => { const res = await fetch(url); if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Failed to fetch data'); } return res.json(); }

interface Payment {
  id: string
  member_name: string
  member_phone: string
  chit_fund_name: string
  chit_fund_id: string
  member_id: string
  amount: string
  month_number: number
  payment_date: string
  payment_method: string
  status: string
  notes: string | null
}

interface ChitFund {
  id: string
  name: string
  monthly_contribution: string
  status: string
}

interface Member {
  id: string
  name: string
  phone: string
}

export default function PaymentsPage() {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [chitFundFilter, setChitFundFilter] = React.useState("all")
  const [addPaymentOpen, setAddPaymentOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const [selectedChitFund, setSelectedChitFund] = React.useState("")
  const [selectedMember, setSelectedMember] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [monthNumber, setMonthNumber] = React.useState("")
  const [paymentMethod, setPaymentMethod] = React.useState("cash")
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split("T")[0])

  const { data: paymentsData, error, isLoading, mutate } = useSWR(
    `/api/payments?status=${statusFilter}${chitFundFilter !== "all" ? `&chit_fund_id=${chitFundFilter}` : ""}`,
    fetcher
  )
  const { data: chitFundsData } = useSWR("/api/chit-funds?status=active", fetcher)
  const { data: membersData } = useSWR("/api/members?status=active", fetcher)

  // Handle potential error responses (non-array data)
  const payments: Payment[] = Array.isArray(paymentsData) ? paymentsData : []
  const chitFunds: ChitFund[] = Array.isArray(chitFundsData) ? chitFundsData : []
  const members: Member[] = Array.isArray(membersData) ? membersData : []

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

  const handleChitFundChange = (value: string) => {
    setSelectedChitFund(value)
    const fund = chitFunds?.find((f) => f.id === value)
    if (fund) {
      setAmount(fund.monthly_contribution)
    }
  }

  const resetForm = () => {
    setSelectedChitFund("")
    setSelectedMember("")
    setAmount("")
    setMonthNumber("")
    setPaymentMethod("cash")
    setPaymentDate(new Date().toISOString().split("T")[0])
  }

  const handleDeletePayment = async (paymentId: string) => {
    setDeletingId(paymentId)
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete payment")
      }

      toast({ title: "Payment deleted successfully" })
      mutate()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chit_fund_id: selectedChitFund,
          member_id: selectedMember,
          amount: Number(amount),
          month_number: Number(monthNumber),
          payment_method: paymentMethod,
          payment_date: paymentDate,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to record payment")
      }

      toast({ title: "Payment recorded successfully" })
      mutate()
      setAddPaymentOpen(false)
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
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track and record member payments</p>
        </div>
        <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>Record a new payment from a member</DialogDescription>
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
                      {chitFunds?.map((fund) => (
                        <SelectItem key={fund.id} value={fund.id}>
                          {fund.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Member *</FieldLabel>
                  <Select value={selectedMember} onValueChange={setSelectedMember}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members?.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <FieldLabel>Amount (₹) *</FieldLabel>
                    <Input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g., 5000"
                      required
                    />
                  </Field>
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <Field>
                    <FieldLabel>Payment Date *</FieldLabel>
                    <Input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Payment Method</FieldLabel>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldGroup>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setAddPaymentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !selectedChitFund || !selectedMember}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Record Payment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Select value={chitFundFilter} onValueChange={setChitFundFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by chit fund" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chit Funds</SelectItem>
            {chitFunds?.map((fund) => (
              <SelectItem key={fund.id} value={fund.id}>
                {fund.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load payments. Please try again.
        </div>
      ) : payments.length === 0 ? (
        <Empty
          title="No payments found"
          description="No payments have been recorded yet"
          action={
            <Button onClick={() => setAddPaymentOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Chit Fund</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.member_name}</p>
                        <p className="text-xs text-muted-foreground">{payment.member_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{payment.chit_fund_name}</TableCell>
                    <TableCell>Month {payment.month_number}</TableCell>
                    <TableCell className="font-medium">{formatAmount(payment.amount)}</TableCell>
                    <TableCell>{formatDate(payment.payment_date || (payment as any).paid_date || new Date().toISOString())}</TableCell>
                    <TableCell className="capitalize">{payment.payment_method?.replace("_", " ") || "Cash"}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          payment.status === "completed"
                            ? "bg-success text-success-foreground"
                            : "bg-warning text-warning-foreground"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this payment record and its associated transaction. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePayment(payment.id)}
                              disabled={deletingId === payment.id}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingId === payment.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

