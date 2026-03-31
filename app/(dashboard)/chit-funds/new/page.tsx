"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, Loader2, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to fetch data")
  }
  return res.json()
}

interface Member {
  id: string
  name: string
  phone: string
}

export default function NewChitFundPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedMembers, setSelectedMembers] = React.useState<string[]>([])
  const [totalMembers, setTotalMembers] = React.useState(0)

  const { data: membersData } = useSWR("/api/members?status=active", fetcher)
  const members: Member[] = Array.isArray(membersData) ? membersData : []

  const handleAddMember = (memberId: string) => {
    if (selectedMembers.includes(memberId)) return
    if (totalMembers > 0 && selectedMembers.length >= totalMembers) {
      toast({ title: "Maximum members reached", description: `You can only select up to ${totalMembers} members.`, variant: "destructive" })
      return
    }
    setSelectedMembers([...selectedMembers, memberId])
  }

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter((id) => id !== memberId))
  }

  const availableMembers = members.filter((m) => !selectedMembers.includes(m.id))
  const selectedMemberObjects = members.filter((m) => selectedMembers.includes(m.id))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      total_value: Number(formData.get("total_value")),
      monthly_contribution: Number(formData.get("monthly_contribution")),
      total_members: Number(formData.get("total_members")),
      duration_months: Number(formData.get("duration_months")),
      start_date: formData.get("start_date"),
      description: formData.get("description") || null,
    }

    try {
      const response = await fetch("/api/chit-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create chit fund")
      }

      const result = await response.json()

      // Add selected members to the chit fund
      for (const memberId of selectedMembers) {
        const memberResponse = await fetch(`/api/chit-funds/${result.id}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_id: memberId }),
        })
        if (!memberResponse.ok) {
          const memberError = await memberResponse.json()
          console.error(`Failed to add member ${memberId}:`, memberError.error)
        }
      }

      toast({
        title: "Chit fund created",
        description: `${data.name} has been created${selectedMembers.length > 0 ? ` with ${selectedMembers.length} member(s)` : ""}.`,
      })
      router.push(`/chit-funds/${result.id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chit-funds">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Chit Fund</h1>
          <p className="text-muted-foreground">Set up a new chit fund scheme</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Chit Fund Details</CardTitle>
          <CardDescription>Enter the details for your new chit fund scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Chit Fund Name</FieldLabel>
                <Input id="name" name="name" placeholder="e.g., Monthly Gold Chit 2024" required />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="total_value">Total Value (₹)</FieldLabel>
                  <Input
                    id="total_value"
                    name="total_value"
                    type="number"
                    placeholder="e.g., 100000"
                    min="1000"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="monthly_contribution">Monthly Contribution (₹)</FieldLabel>
                  <Input
                    id="monthly_contribution"
                    name="monthly_contribution"
                    type="number"
                    placeholder="e.g., 5000"
                    min="100"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="total_members">Total Members</FieldLabel>
                  <Input
                    id="total_members"
                    name="total_members"
                    type="number"
                    placeholder="e.g., 20"
                    min="2"
                    required
                    onChange={(e) => setTotalMembers(Number(e.target.value))}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="duration_months">Duration (Months)</FieldLabel>
                  <Input
                    id="duration_months"
                    name="duration_months"
                    type="number"
                    placeholder="e.g., 20"
                    min="2"
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="start_date">Start Date</FieldLabel>
                <Input id="start_date" name="start_date" type="date" required />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description (Optional)</FieldLabel>
                <Input
                  id="description"
                  name="description"
                  placeholder="e.g., Monthly savings scheme for gold purchase"
                />
              </Field>

              {/* Member Selection */}
              <Field>
                <FieldLabel>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Add Members
                    {totalMembers > 0 && (
                      <span className="text-muted-foreground font-normal">
                        ({selectedMembers.length}/{totalMembers})
                      </span>
                    )}
                  </div>
                </FieldLabel>
                <Select onValueChange={handleAddMember} value="">
                  <SelectTrigger>
                    <SelectValue placeholder={
                      availableMembers.length === 0
                        ? "No more members available"
                        : totalMembers > 0 && selectedMembers.length >= totalMembers
                          ? "Maximum members reached"
                          : "Select a member to add"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedMemberObjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMemberObjects.map((member) => (
                      <Badge key={member.id} variant="secondary" className="flex items-center gap-1 pr-1">
                        {member.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </Field>
            </FieldGroup>

            <div className="flex gap-4 mt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Chit Fund
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/chit-funds">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
