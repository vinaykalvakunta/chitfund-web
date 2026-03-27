"use client"

import * as React from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to fetch data')
  }
  return res.json()
}

export default function EditChitFundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { data: chitFund, error, isLoading } = useSWR(`/api/chit-funds/${id}`, fetcher)

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
      status: formData.get("status") || "active",
    }

    try {
      const response = await fetch(`/api/chit-funds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorRes = await response.json()
        throw new Error(errorRes.error || "Failed to update chit fund")
      }

      toast({
        title: "Chit fund updated",
        description: `${data.name} has been updated successfully.`,
      })
      router.push(`/chit-funds/${id}`)
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
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

  // Format the date for the date input (YYYY-MM-DD)
  const formattedDate = chitFund.start_date ? new Date(chitFund.start_date).toISOString().split('T')[0] : ""

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/chit-funds/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Chit Fund</h1>
          <p className="text-muted-foreground">Modify settings for {chitFund.name}</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Chit Fund Details</CardTitle>
          <CardDescription>Update the details and configuration for this chit fund scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Chit Fund Name</FieldLabel>
                <Input id="name" name="name" defaultValue={chitFund.name} required />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="total_value">Total Value (₹)</FieldLabel>
                  <Input
                    id="total_value"
                    name="total_value"
                    type="number"
                    defaultValue={chitFund.total_value}
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
                    defaultValue={chitFund.monthly_contribution}
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
                    defaultValue={chitFund.total_members}
                    min="2"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="duration_months">Duration (Months)</FieldLabel>
                  <Input
                    id="duration_months"
                    name="duration_months"
                    type="number"
                    defaultValue={chitFund.duration_months}
                    min="2"
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="start_date">Start Date</FieldLabel>
                <Input id="start_date" name="start_date" type="date" defaultValue={formattedDate} required />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description (Optional)</FieldLabel>
                <Input
                  id="description"
                  name="description"
                  defaultValue={chitFund.description || ""}
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select name="status" defaultValue={chitFund.status || "active"}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <div className="flex gap-4 mt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/chit-funds/${id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
