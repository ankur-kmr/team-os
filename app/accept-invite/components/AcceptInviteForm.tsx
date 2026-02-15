"use client"

import { acceptInvite } from "@/lib/actions/members"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { acceptInviteSchema, AcceptInviteInput } from "@/lib/validations"
import { toast } from "sonner"

export default function AcceptInviteForm({
  email,
  token,
}: {
  email: string
  token: string
}) {

  const form = useForm<AcceptInviteInput>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { password: "", name: "" },
  })

  async function onSubmit(values: AcceptInviteInput) {
    try {
      await acceptInvite(token, values.name, values.password);
    } catch (error) {
      toast.error((error as Error).message);
      console.error(error as Error);
    }
  }

  return (
    <div className="space-y-4 max-w-md mx-auto my-10 border p-4 rounded-lg">
      <div className="text-sm text-muted-foreground">
        Accept invitation for:
      </div>
      <div className="font-medium">{email}</div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Set Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            Accept Invitation
          </Button>
        </form>
      </Form>
    </div>
  )
}
