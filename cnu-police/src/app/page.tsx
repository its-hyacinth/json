"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FaUserShield, FaUsers } from "react-icons/fa"
import Image from "next/image"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"admin" | "employee">("admin")
  const { login, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#1a2c3d] via-[#1c2f4a] to-[#12356e]">
      <div className="glass-container relative w-full max-w-md mx-4">
        <div className="glass-card bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-10 sm:p-12">
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <Image
                src="/images/Badge.png"
                alt="CNU Police Badge"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-white uppercase tracking-wider mb-2 font-serif">
            CHRISTOPHER NEWPORT UNIVERSITY
          </h1>
          <h2 className="text-2xl font-medium text-center text-white/90 uppercase tracking-wider mb-8 font-serif">
            POLICE DEPARTMENT
          </h2>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-6" />

          <div className="flex bg-white/10 backdrop-blur-md rounded-full p-1 mb-6 border border-white/20 shadow-inner">
            <button
              className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center transition-all ${
                activeTab === "admin"
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
              onClick={() => setActiveTab("admin")}
            >
              <FaUserShield className="mr-2" />
              Admin Login
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center transition-all ${
                activeTab === "employee"
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
              onClick={() => setActiveTab("employee")}
            >
              <FaUsers className="mr-2" />
              Employee Login
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={
                  activeTab === "admin"
                    ? "jason.richards@cnu.edu"
                    : "sarah.wilson@cnu.edu"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border border-white/20 text-white placeholder-white/50 h-12 rounded-xl shadow-inner"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white placeholder-white/50 h-12 pr-10 rounded-xl shadow-inner"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-white/50 hover:text-white hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-white/70">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="#" className="text-white/70 hover:text-white">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium text-lg rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  Sign In as {activeTab === "admin" ? "Admin" : "Employee"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-white/70 hover:text-white text-sm">
              Need help? Contact IT Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
