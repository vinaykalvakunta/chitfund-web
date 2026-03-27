"use client"

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  Wallet,
  IndianRupee,
  Trash2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Member {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  aadhar_number: string | null
  pan_number: string | null
  status: string
  chit_count: string
  total_paid: string
  created_at: string
}

interface Payment {
  id: string
  chit_fund_name: string
  amount: string
  month_number: number
  payment_date: string
  payment_method: string
  status: string
}

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const { data: member, error, isLoading } = useSWR<Member>(`/api/members/${id}`, fetcher)
  const { data: payments } = useSWR<Payment[]>(`/api/payments?member_id=${id}`, fetcher)

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/members/${id}`, { method: "DELETE" })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete member")
      }

      toast({ title: "Member deleted successfully" })
      router.push("/members")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load member details. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/members">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{member.name}</h1>
              {getStatusBadge(member.status)}
            </div>
            <p className="text-muted-foreground">Member since {formatDate(member.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/members/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Member?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this member. Members who are part of active chit funds cannot be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chit Funds</p>
                <p className="text-2xl font-bold">{member.chit_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <IndianRupee className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">{formatAmount(member.total_paid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payments</p>
                <p className="text-2xl font-bold">{payments?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details and Payments */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Personal and identification details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{member.phone}</p>
                </div>
              </div>
              {member.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                </div>
              )}
              {member.address && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{member.address}</p>
                  </div>
                </div>
              )}
              {member.aadhar_number && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Aadhar Number</p>
                    <p className="font-medium font-mono">****-****-{member.aadhar_number.slice(-4)}</p>
                  </div>
                </div>
              )}
              {member.pan_number && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">PAN Number</p>
                    <p className="font-medium font-mono">{member.pan_number}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payments made by this member</CardDescription>
            </CardHeader>
            <CardContent>
              {!payments || payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No payments recorded yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chit Fund</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.chit_fund_name}</TableCell>
                        <TableCell>Month {payment.month_number}</TableCell>
                        <TableCell>{formatAmount(payment.amount)}</TableCell>
                        <TableCell>{formatDate(payment.payment_date)}</TableCell>
                        <TableCell className="capitalize">{payment.payment_method}</TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
