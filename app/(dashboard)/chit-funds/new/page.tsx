"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useToast } from "@/hooks/use-toast"

export default function NewChitFundPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

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
      toast({
        title: "Chit fund created",
        description: `${data.name} has been created successfully.`,
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
