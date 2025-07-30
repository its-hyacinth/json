"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { authService, type User } from "@/services/auth-service"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const handleAuthChange = useCallback((userData: User | null) => {
    setUser(userData)
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData))
    } else {
      localStorage.removeItem("user")
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        const userData = localStorage.getItem("user")
        const isValid = await authService.isAuthenticated()
        
        if (userData && isValid) {
          // Optionally verify with server here
          handleAuthChange(JSON.parse(userData))
        } else {
          handleAuthChange(null)
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        setError(err instanceof Error ? err : new Error("Authentication failed"))
        handleAuthChange(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Optional: Add storage event listener to sync across tabs
    const syncLogout = (e: StorageEvent) => {
      if (e.key === "user" && e.oldValue && !e.newValue) {
        handleAuthChange(null)
      }
    }

    window.addEventListener("storage", syncLogout)
    return () => window.removeEventListener("storage", syncLogout)
  }, [handleAuthChange])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await authService.login(email, password)
      handleAuthChange(response.user)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Login failed"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
    } catch (err) {
      console.error("Logout failed:", err)
    } finally {
      handleAuthChange(null)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user && authService.isAuthenticated(),
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}