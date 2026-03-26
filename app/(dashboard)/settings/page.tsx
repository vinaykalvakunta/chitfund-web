"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Settings, Database, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your ChitFund Manager preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Configure basic application settings</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="orgName">Organization Name</FieldLabel>
                <Input id="orgName" placeholder="Your organization name" defaultValue="ChitFund Manager" />
              </Field>
              <Field>
                <FieldLabel htmlFor="currency">Currency Symbol</FieldLabel>
                <Input id="currency" placeholder="₹" defaultValue="₹" />
              </Field>
              <Field>
                <FieldLabel htmlFor="defaultCommission">Default Commission (%)</FieldLabel>
                <Input id="defaultCommission" type="number" placeholder="5" defaultValue="5" />
              </Field>
            </FieldGroup>
            <Button className="mt-4">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="emailNotify">Email Notifications</FieldLabel>
                <Input id="emailNotify" placeholder="admin@example.com" />
              </Field>
              <Field>
                <FieldLabel htmlFor="reminderDays">Payment Reminder Days</FieldLabel>
                <Input id="reminderDays" type="number" placeholder="3" defaultValue="3" />
              </Field>
            </FieldGroup>
            <Button className="mt-4">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
            <CardDescription>Database connection status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="flex items-center gap-2 text-sm font-medium text-success">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Provider</span>
                <span className="text-sm font-medium">Neon PostgreSQL</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Region</span>
                <span className="text-sm font-medium">Auto</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Security and access settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Authentication</span>
                <span className="text-sm font-medium">Not configured</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Session Timeout</span>
                <span className="text-sm font-medium">30 minutes</span>
              </div>
            </div>
            <Button variant="outline" className="mt-4">Configure Auth</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
