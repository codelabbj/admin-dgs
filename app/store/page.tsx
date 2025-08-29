import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Plus, ShoppingCart, Package, TrendingUp, Users, DollarSign, Star, Eye, Heart, Share2, ShoppingBag, Tag, MapPin, Clock, CheckCircle, AlertCircle, Home, Activity, BookOpen } from "lucide-react"

export default function Store() {
  // Mock data for enhanced store page
  const storeStats = [
    { label: "Total Products", value: "1,247", change: "+8.2%", icon: Package, color: "blue" },
    { label: "Active Orders", value: "89", change: "+15.3%", icon: ShoppingCart, color: "green" },
    { label: "Revenue", value: "2.4M FCFA", change: "+23.1%", icon: DollarSign, color: "emerald" },
    { label: "Customers", value: "1,847", change: "+12.5%", icon: Users, color: "purple" },
  ]

  const featuredProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: "45,000 FCFA",
      originalPrice: "60,000 FCFA",
      rating: 4.8,
      reviews: 156,
      image: "/placeholder.jpg",
      category: "Electronics",
      status: "In Stock",
      discount: 25
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: "85,000 FCFA",
      originalPrice: "120,000 FCFA",
      rating: 4.6,
      reviews: 89,
      image: "/placeholder.jpg",
      category: "Electronics",
      status: "In Stock",
      discount: 30
    },
    {
      id: 3,
      name: "Organic Cotton T-Shirt",
      price: "12,500 FCFA",
      originalPrice: "15,000 FCFA",
      rating: 4.9,
      reviews: 234,
      image: "/placeholder.jpg",
      category: "Fashion",
      status: "Low Stock",
      discount: 17
    },
    {
      id: 4,
      name: "Professional Camera Lens",
      price: "250,000 FCFA",
      originalPrice: "300,000 FCFA",
      rating: 4.7,
      reviews: 67,
      image: "/placeholder.jpg",
      category: "Electronics",
      status: "In Stock",
      discount: 17
    },
  ]

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      product: "Premium Wireless Headphones",
      amount: "45,000 FCFA",
      status: "Delivered",
      date: "2 hours ago",
      avatar: "/placeholder-user.jpg"
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      product: "Smart Fitness Watch",
      amount: "85,000 FCFA",
      status: "Processing",
      date: "4 hours ago",
      avatar: "/placeholder-user.jpg"
    },
    {
      id: "ORD-003",
      customer: "Bob Johnson",
      product: "Organic Cotton T-Shirt",
      amount: "12,500 FCFA",
      status: "Shipped",
      date: "1 day ago",
      avatar: "/placeholder-user.jpg"
    },
  ]

  const categories = [
    { name: "Electronics", count: 456, icon: Package, color: "blue" },
    { name: "Fashion", count: 234, icon: ShoppingBag, color: "purple" },
    { name: "Home & Garden", count: 189, icon: Home, color: "green" },
    { name: "Sports", count: 123, icon: Activity, color: "orange" },
    { name: "Books", count: 89, icon: BookOpen, color: "indigo" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Store Management</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Manage your products, orders, and store analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Store Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {storeStats.map((stat, index) => (
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

        {/* Search and Filters */}
        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search products, categories, or customers..."
                  className="pl-10 rounded-xl border-slate-200 dark:border-neutral-700 h-12"
                />
              </div>
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700 h-12 px-6">
                <Tag className="h-4 w-4 mr-2" />
                Categories
              </Button>
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-neutral-700 h-12 px-6">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Products */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <Star className="h-5 w-5 mr-2 text-crimson-600" />
                  Featured Products
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Your best-selling and most popular products
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="group relative bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-600 overflow-hidden hover:shadow-lg transition-all duration-300">
                      {/* Product Image */}
                      <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-neutral-700 dark:to-neutral-800">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.discount > 0 && (
                          <Badge className="absolute top-3 left-3 bg-red-600 text-white">
                            -{product.discount}%
                          </Badge>
                        )}
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-700">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-700">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs border-slate-200 text-slate-700">
                            {product.category}
                          </Badge>
                          <Badge 
                            className={`text-xs ${
                              product.status === 'In Stock' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {product.status}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">({product.reviews})</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-neutral-900 dark:text-white">{product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-neutral-500 dark:text-neutral-400 line-through">{product.originalPrice}</span>
                            )}
                          </div>
                          <Button size="sm" className="bg-crimson-600 hover:bg-crimson-700 text-white rounded-lg">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Insights */}
          <div className="space-y-6">
            {/* Categories */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-crimson-600" />
                  Categories
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Product distribution by category
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 dark:bg-neutral-700 rounded-lg">
                          <category.icon className="h-4 w-4 text-crimson-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{category.name}</span>
                      </div>
                      <Badge className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-slate-200 dark:border-neutral-700 shadow-xl rounded-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-crimson-600" />
                  Recent Orders
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Latest customer orders
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-600">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={order.avatar} />
                        <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                          {order.customer.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">{order.customer}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{order.product}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            className={`text-xs ${
                              order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {order.status}
                          </Badge>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">{order.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{order.amount}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{order.id}</p>
                      </div>
                    </div>
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
                  Add Product
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View Orders
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-neutral-700">
                  <Package className="h-4 w-4 mr-2" />
                  Inventory
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
