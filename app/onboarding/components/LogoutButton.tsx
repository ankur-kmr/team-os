"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { logoutUser } from "@/lib/actions"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  async function handleLogout() {
    setIsLoading(true)
    try {
      // logoutUser will redirect via Next.js redirect
      // so this won't return if successful
      await logoutUser()
      router.push("/login")
    } catch (error) {
      // Only called if redirect fails
      console.error("Logout failed:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  )
}
