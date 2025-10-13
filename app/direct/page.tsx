import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send, Search, Filter, Plus, Users, Clock, CheckCircle, AlertCircle, BarChart3, Phone, Mail, MapPin, Calendar, Star, Eye, MoreHorizontal } from "lucide-react"

export default function Direct() {
  // Mock data for enhanced direct page
  const directStats = [
    { label: "Total Messages", value: "2,847", change: "+12.5%", icon: MessageCircle, color: "blue" },
    { label: "Active Chats", value: "156", change: "+8.2%", icon: Users, color: "green" },
    { label: "Response Rate", value: "98.5%", change: "+2.1%", icon: CheckCircle, color: "emerald" },
    { label: "Avg Response", value: "2.3 min", change: "-15.3%", icon: Clock, color: "purple" },
  ]

  const recentChats = [
    {
      id: 1,
      name: "John Doe",
      lastMessage: "Hi, I have a question about the payment system",
      time: "2 min ago",
      unread: 2,
      status: "Online",
      avatar: "/placeholder-user.jpg",
      lastSeen: "Online now"
    },
    {
      id: 2,
      name: "Jane Smith",
      lastMessage: "Thank you for the quick response!",
      time: "15 min ago",
      unread: 0,
      status: "Offline",
      avatar: "/placeholder-user.jpg",
      lastSeen: "2 hours ago"
    },
    {
      id: 3,
      name: "Bob Johnson",
      lastMessage: "Can you help me with the API integration?",
      time: "1 hour ago",
      unread: 1,
      status: "Online",
      avatar: "/placeholder-user.jpg",
      lastSeen: "Online now"
    },
    {
      id: 4,
      name: "Alice Brown",
      lastMessage: "The transaction was successful, thanks!",
      time: "3 hours ago",
      unread: 0,
      status: "Offline",
      avatar: "/placeholder-user.jpg",
      lastSeen: "5 hours ago"
    },
    {
      id: 5,
      name: "Charlie Wilson",
      lastMessage: "I need help with my account settings",
      time: "1 day ago",
      unread: 0,
      status: "Offline",
      avatar: "/placeholder-user.jpg",
      lastSeen: "1 day ago"
    },
  ]

  const quickReplies = [
    "Hello! How can I help you today?",
    "Thank you for contacting us!",
    "I'll look into this for you right away.",
    "Is there anything else you need help with?",
    "Your request has been processed successfully.",
  ]

  const chatMetrics = [
    { metric: "Customer Satisfaction", value: 4.8, status: "Excellent", icon: Star, color: "yellow" },
    { metric: "First Response Time", value: 2.3, status: "Good", icon: Clock, color: "blue" },
    { metric: "Resolution Rate", value: 95.2, status: "Excellent", icon: CheckCircle, color: "green" },
    { metric: "Chat Volume", value: 156, status: "High", icon: MessageCircle, color: "purple" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Direct Messages</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Manage customer conversations and support chats</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Direct Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {directStats.map((stat, index) => (
            <Card key={index} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 bg-${stat.color}-600 rounded-xl shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className={`bg-${stat.color}-100 text-${stat.color}-800 hover:bg-${stat.color}-100 rounded-full text-xs`}>
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Quick Actions */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search conversations, customers, or messages..."
                  className="pl-10 rounded-xl border-slate-200 dark:border-neutral-700 h-12"
                />
              </div>
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700 h-12 px-6">
                <Users className="h-4 w-4 mr-2" />
                All Chats
              </Button>
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700 h-12 px-6">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Chats */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-crimson-600" />
                  Recent Conversations
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Latest customer messages and support requests
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentChats.map((chat) => (
                    <div key={chat.id} className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={chat.avatar} />
                          <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                            {chat.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-neutral-900 ${
                          chat.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{chat.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">{chat.time}</span>
                            {chat.unread > 0 && (
                              <Badge className="bg-crimson-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
                                {chat.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate mb-1">{chat.lastMessage}</p>
                        
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={`text-xs ${
                              chat.status === 'Online' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {chat.status}
                          </Badge>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">{chat.lastSeen}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="rounded-lg text-crimson-600 hover:text-crimson-700">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-lg text-neutral-600 hover:text-neutral-700">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Insights & Quick Actions */}
          <div className="space-y-6">
            {/* Chat Metrics */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-crimson-600" />
                  Chat Metrics
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {chatMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 dark:bg-neutral-800 rounded-lg">
                          <metric.icon className="h-4 w-4 text-crimson-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{metric.metric}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{metric.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                          {typeof metric.value === 'number' && metric.value > 100 ? metric.value : `${metric.value}${metric.metric.includes('Rate') ? '%' : ''}`}
                        </p>
                        <div className="w-16 bg-slate-200 dark:bg-neutral-700 rounded-full h-2 mt-1">
                          <div
                            className={`bg-${metric.color}-600 h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(metric.value / (metric.metric.includes('Rate') ? 100 : 5) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Replies */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <Send className="h-5 w-5 mr-2 text-crimson-600" />
                  Quick Replies
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Pre-written responses for common queries
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700 text-left h-auto p-3"
                    >
                      <span className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">{reply}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Users className="h-4 w-4 mr-2" />
                  View All Chats
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Send className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                  <Phone className="h-4 w-4 text-crimson-600" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">+225 0123456789</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                  <Mail className="h-4 w-4 text-crimson-600" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">support@example.com</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                  <MapPin className="h-4 w-4 text-crimson-600" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Abidjan, Ivory Coast</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                  <Clock className="h-4 w-4 text-crimson-600" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">24/7 Support</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
