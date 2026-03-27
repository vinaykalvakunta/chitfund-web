"use client"

import * as React from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { data: member, error, isLoading } = useSWR(`/api/members/${id}`, fetcher)

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
      status: formData.get("status") || "active",
    }

    try {
      const response = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorRes = await response.json()
        throw new Error(errorRes.error || "Failed to update member")
      }

      toast({
        title: "Member updated",
        description: `${data.name}'s info has been updated successfully.`,
      })
      router.push(`/members/${id}`)
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/members/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Member</h1>
          <p className="text-muted-foreground">Update information for {member.name}</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Member Details</CardTitle>
          <CardDescription>Update the member&apos;s personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name *</FieldLabel>
                <Input id="name" name="name" defaultValue={member.name} required />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="phone">Phone Number *</FieldLabel>
                  <Input id="phone" name="phone" type="tel" defaultValue={member.phone} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input id="email" name="email" type="email" defaultValue={member.email || ""} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Textarea id="address" name="address" rows={3} defaultValue={member.address || ""} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="aadhar_number">Aadhar Number</FieldLabel>
                  <Input
                    id="aadhar_number"
                    name="aadhar_number"
                    maxLength={14}
                    defaultValue={member.aadhar_number || ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="pan_number">PAN Number</FieldLabel>
                  <Input
                    id="pan_number"
                    name="pan_number"
                    maxLength={10}
                    className="uppercase"
                    defaultValue={member.pan_number || ""}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="status">Account Status</FieldLabel>
                <Select name="status" defaultValue={member.status || "active"}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
                <Link href={`/members/${id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
