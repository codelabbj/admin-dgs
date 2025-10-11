"use client"

import React from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings, Database, Bell, Shield, Globe, Server, Save, RefreshCw } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">System Settings</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Configure system preferences and behavior</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* General Settings */}
        <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Basic system configuration and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  defaultValue="Admin Dashboard"
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  defaultValue="admin@example.com"
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  defaultValue="UTC"
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Default Language</Label>
                <Input
                  id="language"
                  defaultValue="English"
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Configure security policies and authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Require 2FA for all admin accounts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Session Timeout</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Auto-logout after inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">IP Whitelist</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Restrict admin access to specific IPs</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Audit Logging</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Log all administrative actions</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  defaultValue="30"
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  defaultValue="5"
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Settings
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Database configuration and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Input
                  id="backupFrequency"
                  defaultValue="Daily"
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retentionDays">Retention Days</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  defaultValue="30"
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto Backup</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Automatically backup database</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Database Monitoring</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Monitor database performance</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Configure system notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Send notifications via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Security Alerts</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Immediate security notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">System Updates</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Notify about system updates</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Performance Alerts</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">System performance notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  defaultValue="notifications@example.com"
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
                <Input
                  id="alertThreshold"
                  type="number"
                  defaultValue="80"
                  className="rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
