"use client"

import { Button } from "@/components/ui/button"
import { logoutUser } from "@/lib/actions/auth"

export default function LogoutButton() {
  
  async function handleLogout() {
    await logoutUser()
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="w-full"
    >
      Logout
    </Button>
  )
}
