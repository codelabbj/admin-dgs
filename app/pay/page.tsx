import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreditCard, Smartphone, Building, Zap, TrendingUp, Users, DollarSign, Clock, CheckCircle, AlertCircle, BarChart3, QrCode, Copy, Send, Download, Eye, EyeOff } from "lucide-react"

export default function Pay() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Payment Center</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Send money, make payments, and manage transactions</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              View History
            </Button>
            <Button className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl">
              <Zap className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </div>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">2.4M</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Sent</p>
                </div>
              </div>
              <div className="mt-4">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 rounded-full text-xs">+12.5%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">1,847</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Recipients</p>
                </div>
              </div>
              <div className="mt-4">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 rounded-full text-xs">+8.2%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">98.5%</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Success Rate</p>
                </div>
              </div>
              <div className="mt-4">
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 rounded-full text-xs">+2.1%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-amber-600 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">2.3s</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Avg Time</p>
                </div>
              </div>
              <div className="mt-4">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 rounded-full text-xs">-15.3%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-crimson-600" />
                  Send Payment
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Transfer money to any recipient quickly and securely
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Recipient Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient</Label>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <Input
                        id="recipient"
                        placeholder="Enter phone number, email, or select from contacts"
                        className="rounded-xl border-slate-200 dark:border-neutral-700 h-12"
                      />
                      <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700 h-12 px-4">
                        <Users className="h-4 w-4 mr-2" />
                        Contacts
                      </Button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        className="rounded-xl border-slate-200 dark:border-neutral-700 h-16 text-2xl font-bold pl-16"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <span className="text-lg font-medium text-neutral-600 dark:text-neutral-400">FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button variant="outline" className="h-16 rounded-xl border-slate-200 dark:border-neutral-700 hover:border-crimson-600 hover:bg-crimson-50 dark:hover:bg-crimson-900/20">
                        <div className="flex flex-col items-center space-y-1">
                          <Smartphone className="h-6 w-6 text-crimson-600" />
                          <span className="text-sm font-medium">Mobile Money</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-16 rounded-xl border-slate-200 dark:border-neutral-700 hover:border-crimson-600 hover:bg-crimson-50 dark:hover:bg-crimson-900/20">
                        <div className="flex flex-col items-center space-y-1">
                          <CreditCard className="h-6 w-6 text-crimson-600" />
                          <span className="text-sm font-medium">Card</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-16 rounded-xl border-slate-200 dark:border-neutral-700 hover:border-crimson-600 hover:bg-crimson-50 dark:hover:bg-crimson-900/20">
                        <div className="flex flex-col items-center space-y-1">
                          <Building className="h-6 w-6 text-crimson-600" />
                          <span className="text-sm font-medium">Bank</span>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Input
                      id="message"
                      placeholder="Add a personal message..."
                      className="rounded-xl border-slate-200 dark:border-neutral-700"
                    />
                  </div>

                  {/* Send Button */}
                  <Button className="w-full bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl h-14 text-lg font-semibold">
                    <Send className="h-5 w-5 mr-2" />
                    Send Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Options & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR Code
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Payment Link
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              </CardContent>
            </Card>

            {/* Recent Recipients */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Recent Recipients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                      JS
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">Jane Smith</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">+225 0123456789</p>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-lg text-crimson-600 hover:text-crimson-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                      BJ
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">Bob Johnson</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">+225 0987654321</p>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-lg text-crimson-600 hover:text-crimson-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                      AB
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">Alice Brown</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">+225 0555666777</p>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-lg text-crimson-600 hover:text-crimson-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Limits */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Payment Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Daily Limit</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">500,000 FCFA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Monthly Limit</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">5,000,000 FCFA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Used Today</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">125,000 FCFA</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-neutral-700 rounded-full h-2">
                  <div className="bg-crimson-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
