"use client"

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import {
  ArrowLeft,
  Edit,
  Users,
  Calendar,
  IndianRupee,
  UserPlus,
  Trash2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Member {
  id: string
  name: string
  phone: string
  email: string | null
  joined_at: string
}

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
  members: Member[]
}

export default function ChitFundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [addMemberOpen, setAddMemberOpen] = React.useState(false)
  const [selectedMember, setSelectedMember] = React.useState("")
  const [isAddingMember, setIsAddingMember] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const { data: chitFund, error, isLoading, mutate } = useSWR<ChitFund>(`/api/chit-funds/${id}`, fetcher)
  const { data: allMembers } = useSWR<Member[]>("/api/members?status=active", fetcher)

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

  const handleAddMember = async () => {
    if (!selectedMember) return
    setIsAddingMember(true)

    try {
      const response = await fetch(`/api/chit-funds/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: selectedMember }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add member")
      }

      toast({ title: "Member added successfully" })
      mutate()
      setAddMemberOpen(false)
      setSelectedMember("")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/chit-funds/${id}/members?member_id=${memberId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove member")
      }

      toast({ title: "Member removed successfully" })
      mutate()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleDeleteChitFund = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/chit-funds/${id}`, { method: "DELETE" })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete chit fund")
      }

      toast({ title: "Chit fund deleted successfully" })
      router.push("/chit-funds")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      setIsDeleting(false)
    }
  }

  const handleActivateChitFund = async () => {
    try {
      const response = await fetch(`/api/chit-funds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...chitFund, status: "active" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to activate chit fund")
      }

      toast({ title: "Chit fund activated successfully" })
      mutate()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
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
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !chitFund) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load chit fund details. Please try again.
        </div>
      </div>
    )
  }

  const memberCount = Number(chitFund.member_count) || chitFund.members?.length || 0
  const progress = chitFund.duration_months > 0 ? (chitFund.current_month / chitFund.duration_months) * 100 : 0
  const availableMembers = allMembers?.filter(
    (m) => !chitFund.members?.some((cm) => cm.id === m.id)
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/chit-funds">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{chitFund.name}</h1>
              {getStatusBadge(chitFund.status)}
            </div>
            <p className="text-muted-foreground">{formatAmount(chitFund.total_value)} chit fund</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {chitFund.status === "pending" && memberCount >= chitFund.total_members && (
            <Button onClick={handleActivateChitFund}>Activate Chit Fund</Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/chit-funds/${id}/edit`}>
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
                <AlertDialogTitle>Delete Chit Fund?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this chit fund and all associated data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteChitFund}
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="text-2xl font-bold">
                  {memberCount}/{chitFund.total_members}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold">{chitFund.duration_months} months</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <IndianRupee className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly</p>
                <p className="text-2xl font-bold">{formatAmount(chitFund.monthly_contribution)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <IndianRupee className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatAmount(chitFund.total_value)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {chitFund.status === "active" && (
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Current month {chitFund.current_month} of {chitFund.duration_months}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-3" />
            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span>Started: {formatDate(chitFund.start_date)}</span>
              <span>Collected: {formatAmount(chitFund.collected_amount)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members ({memberCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>Members enrolled in this chit fund</CardDescription>
              </div>
              {memberCount < chitFund.total_members && chitFund.status !== "completed" && (
                <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Member</DialogTitle>
                      <DialogDescription>Select a member to add to this chit fund</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Select value={selectedMember} onValueChange={setSelectedMember}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMembers?.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} - {member.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddMember} disabled={!selectedMember || isAddingMember}>
                          {isAddingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Member
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {chitFund.members?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No members yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chitFund.members?.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>{formatDate(member.joined_at)}</TableCell>
                        <TableCell>
                          {chitFund.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              Remove
                            </Button>
                          )}
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
