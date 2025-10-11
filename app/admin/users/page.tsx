"use client"

import React from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Plus, MoreHorizontal, UserCheck, UserX, Edit, Trash2, Clock, Users } from "lucide-react"

export default function AdminUsersPage() {
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Merchant",
      status: "Active",
      lastLogin: "2 hours ago",
      avatar: "/placeholder-user.jpg"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Customer",
      status: "Active",
      lastLogin: "1 day ago",
      avatar: "/placeholder-user.jpg"
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: "Merchant",
      status: "Suspended",
      lastLogin: "1 week ago",
      avatar: "/placeholder-user.jpg"
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice.brown@example.com",
      role: "Customer",
      status: "Active",
      lastLogin: "3 days ago",
      avatar: "/placeholder-user.jpg"
    },
    {
      id: 5,
      name: "Charlie Wilson",
      email: "charlie.wilson@example.com",
      role: "Merchant",
      status: "Pending",
      lastLogin: "Never",
      avatar: "/placeholder-user.jpg"
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">User Management</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Manage system users and permissions</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-600 rounded-xl">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">1,247</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <UserX className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">23</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Suspended</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-600 rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-600 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">856</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Merchants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 rounded-xl border-slate-200 dark:border-neutral-700"
                />
              </div>
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">All Users</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            user.role === 'Merchant' ? 'border-blue-200 text-blue-700' : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {user.role}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            user.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                            user.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mr-4">
                      Last login: {user.lastLogin}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
