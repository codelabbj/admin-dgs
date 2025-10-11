"use client"

import React from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Building, Shield, Edit, Save, Camera, Key, Bell, Globe } from "lucide-react"

export default function AdminProfilePage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Admin Profile</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Manage your administrator account</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Your personal and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue="John"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue="Doe"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      defaultValue="+1 (555) 123-4567"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      defaultValue="System Administrator"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      defaultValue="IT & Security"
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
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                    <div className="flex items-center space-x-3">
                      <Key className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Secure your account with 2FA</p>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
                      Enable
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Login Notifications</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Get notified of new logins</p>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Preferences
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Customize your dashboard experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      defaultValue="UTC-5 (Eastern Time)"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      defaultValue="English"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Input
                      id="dateFormat"
                      defaultValue="MM/DD/YYYY"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      defaultValue="USD ($)"
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Picture */}
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="h-32 w-32 mx-auto ring-4 ring-blue-600">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-3xl font-bold">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">John Doe</h3>
                    <p className="text-slate-600 dark:text-slate-400">System Administrator</p>
                    <Badge className="mt-2 bg-blue-100 text-blue-800">Admin Level 3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Account Type</span>
                  <Badge className="bg-emerald-100 text-emerald-800">Administrator</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                  <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Last Login</span>
                  <span className="text-sm text-slate-900 dark:text-white">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Member Since</span>
                  <span className="text-sm text-slate-900 dark:text-white">Jan 2024</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Globe className="h-4 w-4 mr-2" />
                  Language & Region
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
