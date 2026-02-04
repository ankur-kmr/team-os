"use client"

import { Organization } from "@/db/generated/prisma/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { setActiveOrganization } from "@/app/onboarding/actions"
import LogoutButton from "./LogoutButton"

export default function OrgSelector({ orgList }: { orgList: Organization[] }) {
  const router = useRouter()
  const [selectedOrgId, setSelectedOrgId] = useState<string>(orgList[0]?.id || "")
  const [isLoading, setIsLoading] = useState(false)

  async function handleContinue() {
    if (!selectedOrgId) return
    
    setIsLoading(true)
    
    try {
      // Set the organization in a cookie
      const result = await setActiveOrganization(selectedOrgId)
      
      if (result.success) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to set organization:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Select Organization</h1>
        <p className="text-muted-foreground">
          Choose which workspace you&apos;d like to access
        </p>
      </div>

      <div className="space-y-3">
        {orgList.map((org) => (
          <button
            key={org.id}
            type="button"
            onClick={() => setSelectedOrgId(org.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedOrgId === org.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-semibold">{org.name}</div>
            <div className="text-sm text-muted-foreground">/{org.slug}</div>
          </button>
        ))}
      </div>

      <Button
        onClick={handleContinue}
        disabled={!selectedOrgId || isLoading}
        className="w-full"
      >
        {isLoading ? "Loading..." : "Continue"}
      </Button>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => router.push('/onboarding?create=true')}
          disabled={isLoading}
        >
          + Create New Organization
        </Button>
      </div>

      <div className="border-t pt-4">
        <LogoutButton />
      </div>
    </div>
  )
}