"use client"

import React from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, ShieldCheck, AlertTriangle, Lock, Eye, EyeOff, Key, Server, Network, Activity } from "lucide-react"

export default function AdminSecurityPage() {
  const securityMetrics = {
    overallScore: 87,
    lastScan: "2 hours ago",
    threatsBlocked: 156,
    vulnerabilities: 3,
    firewallStatus: "Active",
    sslStatus: "Valid",
    backupStatus: "Up to date",
    monitoringStatus: "Live"
  }

  const recentThreats = [
    { id: 1, type: "Suspicious IP", severity: "Medium", time: "5 min ago", status: "Blocked" },
    { id: 2, type: "Brute Force Attempt", severity: "High", time: "15 min ago", status: "Blocked" },
    { id: 3, type: "Malware Detection", severity: "High", time: "1 hour ago", status: "Quarantined" },
    { id: 4, type: "DDoS Attack", severity: "Critical", time: "2 hours ago", status: "Mitigated" },
    { id: 5, type: "SQL Injection", severity: "Medium", time: "3 hours ago", status: "Blocked" }
  ]

  const securityChecks = [
    { name: "Firewall Protection", status: "Active", score: 95 },
    { name: "SSL/TLS Security", status: "Valid", score: 100 },
    { name: "Database Security", status: "Protected", score: 88 },
    { name: "API Security", status: "Monitored", score: 92 },
    { name: "User Authentication", status: "Secure", score: 85 },
    { name: "Data Encryption", status: "Enabled", score: 100 }
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Security Center</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Monitor and manage system security</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
              <Activity className="h-4 w-4 mr-2" />
              Run Security Scan
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergency Lockdown
            </Button>
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Security Score */}
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Security Overview</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Overall system security status and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {securityMetrics.overallScore}%
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Security Score</p>
                  <Progress value={securityMetrics.overallScore} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {securityMetrics.threatsBlocked}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Threats Blocked</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {securityMetrics.vulnerabilities}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Vulnerabilities</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {securityMetrics.lastScan}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Last Scan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Status */}
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Firewall</span>
                <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">SSL/TLS</span>
                <Badge className="bg-emerald-100 text-emerald-800">Valid</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Backup</span>
                <Badge className="bg-emerald-100 text-emerald-800">Up to date</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Monitoring</span>
                <Badge className="bg-emerald-100 text-emerald-800">Live</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Checks */}
        <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Security Checks</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Detailed breakdown of security measures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityChecks.map((check) => (
                <div key={check.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      check.score >= 90 ? 'bg-emerald-100 dark:bg-emerald-900/20' :
                      check.score >= 80 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                      'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      {check.score >= 90 ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> :
                       check.score >= 80 ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                       <AlertTriangle className="h-4 w-4 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{check.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{check.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24">
                      <Progress value={check.score} className="h-2" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-12 text-right">
                      {check.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Threats */}
        <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Recent Security Threats</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Latest security incidents and responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentThreats.map((threat) => (
                <div key={threat.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      threat.severity === 'Critical' ? 'bg-red-100 dark:bg-red-900/20' :
                      threat.severity === 'High' ? 'bg-orange-100 dark:bg-orange-900/20' :
                      'bg-yellow-100 dark:bg-yellow-900/20'
                    }`}>
                      {threat.severity === 'Critical' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                       threat.severity === 'High' ? <AlertTriangle className="h-4 w-4 text-orange-600" /> :
                       <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{threat.type}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{threat.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      className={`${
                        threat.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        threat.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {threat.severity}
                    </Badge>
                    <Badge 
                      className={`${
                        threat.status === 'Blocked' ? 'bg-emerald-100 text-emerald-800' :
                        threat.status === 'Quarantined' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {threat.status}
                    </Badge>
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
