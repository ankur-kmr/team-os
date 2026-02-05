// app/dashboard/components/CreateOrgDialog.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { createOrganization } from "@/lib/actions/organizations"
import { User } from "@/db/generated/prisma/client"
import { toast } from "sonner"
import { slugify } from "@/lib/utils"

export function CreateOrgDialog({ user }: { user: User }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Get current user (from session)
      const result = await createOrganization(user.id, name, slug)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Success - close dialog and refresh
      setOpen(false)
      
      // Refresh and navigate to dashboard with new org
      router.refresh()
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    } catch (err) {
      setError("Failed to create organization")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" />
          Create New Organization
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your projects and team members.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => setSlug(slugify(e.target.value))}
              placeholder="Acme Inc."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL-friendly)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="acme-inc"
              required
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Organization"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}