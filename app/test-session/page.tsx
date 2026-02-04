import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function TestSessionPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Test</h1>
      
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">✅ You are authenticated!</h2>
        
        <div className="space-y-2 mt-4">
          <p><strong>User ID:</strong> {session.user?.id}</p>
          <p><strong>Email:</strong> {session.user?.email}</p>
          <p><strong>Name:</strong> {session.user?.name || "Not set"}</p>
        </div>

        <pre className="mt-4 p-4 bg-muted rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  )
}
