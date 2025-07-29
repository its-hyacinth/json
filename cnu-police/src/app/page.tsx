"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Head from "next/head"
import {
  Shield,
  Clock,
  Users,
  Calendar,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  BarChart3,
  Bell,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Redirect if already logged in
  if (user) {
    router.push(user.role === "admin" ? "/admin" : "/employee")
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast({
        title: "Welcome back!",
        description: "Successfully logged into the system",
      })
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: Shield,
      title: "Campus Safety",
      description: "24/7 protection for the CNU community with optimized officer coverage",
      color: "bg-blue-500",
    },
    {
      icon: Clock,
      title: "Shift Management",
      description: "Efficient scheduling for day, evening, and night shifts at CNU",
      color: "bg-green-500",
    },
    {
      icon: Users,
      title: "Team Coordination",
      description: "Seamless collaboration between CNU police staff and administration",
      color: "bg-purple-500",
    },
    {
      icon: Bell,
      title: "Emergency Alerts",
      description: "Instant notifications for campus emergencies and critical incidents",
      color: "bg-orange-500",
    },
    {
      icon: BarChart3,
      title: "Campus Analytics",
      description: "Data-driven insights for patrol patterns and incident response",
      color: "bg-red-500",
    },
    {
      icon: Calendar,
      title: "Event Coverage",
      description: "Special scheduling for CNU events, games, and ceremonies",
      color: "bg-yellow-500",
    },
  ]

  const stats = [
    { number: "24/7", label: "Campus Protection" },
    { number: "50+", label: "Trained Officers" },
    { number: "100%", label: "CNU Community Served" },
    { number: "260+", label: "Acres Covered" },
  ]

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="relative h-10 w-10">
                  <Image 
                    src="/images/Badge.png" 
                    alt="CNU Police Badge"
                    fill
                    className="object-contain"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">CNU Police</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Department Scheduling</p>
                </div>
              </div>
              <Badge variant="secondary" className="hidden sm:flex">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Campus Secure
              </Badge>
            </div>
          </div>
        </header>

        <main className="relative">
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-400/5 dark:to-indigo-400/5"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Shield className="w-3 h-3 mr-1" />
                      CNU Campus Safety
                    </Badge>
                    <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                      CNU Police
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        {" "}
                        Department
                      </span>
                      <br />
                      Scheduling System
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                      Secure scheduling platform for Christopher Newport University Police Department, 
                      ensuring optimal campus coverage and officer coordination.
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stat.number}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Features */}
                  <div className="flex flex-wrap gap-3">
                    {["Campus Safety", "Emergency Response", "Secure Access", "CNU Community"].map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/50 dark:border-gray-700/50"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Content - Login Form */}
                <div className="flex justify-center lg:justify-end">
                  <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-6">
                      <CardTitle className="text-2xl font-bold text-center">CNU Police Login</CardTitle>
                      <CardDescription className="text-center">
                        Restricted access for CNU Police Department personnel
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">
                            CNU Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="officer@cnu.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-medium">
                            Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="h-11 pr-10"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Signing in...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>Officer Login</span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </Button>
                      </form>

                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          For assistance, contact CNU IT at{" "}
                          <a href="mailto:itsupport@cnu.edu" className="text-blue-600 hover:underline">
                            itsupport@cnu.edu
                          </a>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <Badge className="mb-4">CNU Police Services</Badge>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Protecting the CNU Community
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Comprehensive tools and services designed specifically for Christopher Newport University's 
                  campus safety needs.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`${feature.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 dark:bg-black text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">CNU Police Department</h3>
                  <p className="text-gray-400 text-sm">
                    1 Avenue of the Arts<br />
                    Newport News, VA 23606<br />
                    Emergency: (757) 594-7777<br />
                    Non-Emergency: (757) 594-7059
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="https://www.cnu.edu/police" className="hover:text-white">CNU Police Website</a></li>
                    <li><a href="https://www.cnu.edu" className="hover:text-white">CNU Main Site</a></li>
                    <li><a href="https://www.cnu.edu/police/safety" className="hover:text-white">Campus Safety</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a href="https://facebook.com/cnu" className="text-gray-400 hover:text-white">
                      <span className="sr-only">Facebook</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="https://twitter.com/cnu" className="text-gray-400 hover:text-white">
                      <span className="sr-only">Twitter</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} Christopher Newport University Police Department. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  )
}