"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createOrganizationSchema, type CreateOrganizationInput } from "@/lib/validations"
import { createOrganization } from "@/lib/actions"
import { slugify } from "@/lib/utils"
import LogoutButton from "./LogoutButton"

interface CreateOrgFormProps {
  userId: string
}

export default function CreateOrgForm({ userId }: CreateOrgFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    form.setValue("name", name)
    if (!form.formState.dirtyFields.slug) {
      form.setValue("slug", slugify(name))
    }
  }

  async function onSubmit(values: CreateOrganizationInput) {
    setIsLoading(true)
    setError("")

    try {
      const result = await createOrganization(userId, values.name, values.slug)

      if (result.error) {
        setError(result.error)
      } else {
        // Success - redirect to dashboard
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Create Your Organization</h1>
        <p className="text-muted-foreground">
          Get started by creating your first workspace
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Acme Inc" 
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  The name of your company or team
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="acme-inc"
                    disabled={isLoading}
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Used in URLs. Only lowercase letters, numbers, and hyphens.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Organization"}
          </Button>
        </form>
      </Form>

      <div className="border-t pt-4">
        <p className="text-center text-sm text-muted-foreground mb-2">
          Not ready to create an organization?
        </p>
        <LogoutButton />
      </div>
    </div>
  )
}