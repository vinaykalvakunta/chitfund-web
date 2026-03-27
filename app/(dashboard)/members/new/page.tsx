"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useToast } from "@/hooks/use-toast"

export default function NewMemberPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email") || null,
      address: formData.get("address") || null,
      aadhar_number: formData.get("aadhar_number") || null,
      pan_number: formData.get("pan_number") || null,
    }

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create member")
      }

      const result = await response.json()
      toast({
        title: "Member added",
        description: `${data.name} has been added successfully.`,
      })
      router.push(`/members/${result.id}`)
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
          <Link href="/members">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Member</h1>
          <p className="text-muted-foreground">Register a new member for chit funds</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Member Details</CardTitle>
          <CardDescription>Enter the member&apos;s personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name *</FieldLabel>
                <Input id="name" name="name" placeholder="Enter full name" required />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="phone">Phone Number *</FieldLabel>
                  <Input id="phone" name="phone" type="tel" placeholder="e.g., 9876543210" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input id="email" name="email" type="email" placeholder="e.g., john@example.com" />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Textarea id="address" name="address" placeholder="Enter full address" rows={3} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="aadhar_number">Aadhar Number</FieldLabel>
                  <Input
                    id="aadhar_number"
                    name="aadhar_number"
                    placeholder="e.g., 1234 5678 9012"
                    maxLength={14}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="pan_number">PAN Number</FieldLabel>
                  <Input
                    id="pan_number"
                    name="pan_number"
                    placeholder="e.g., ABCDE1234F"
                    maxLength={10}
                    className="uppercase"
                  />
                </Field>
              </div>
            </FieldGroup>

            <div className="flex gap-4 mt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Member
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/members">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
