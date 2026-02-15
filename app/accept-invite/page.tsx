import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { notFound } from "next/navigation"
import AcceptInviteForm from "./components/AcceptInviteForm"

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const searchParamsObj = await searchParams
  if (!searchParamsObj?.token) notFound()

  const tokenHash = crypto
    .createHash("sha256")
    .update(searchParamsObj.token)
    .digest("hex")

  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash },
  })

  if (!invitation || invitation.expiresAt < new Date()) {
    notFound()
  }

  return (
    <AcceptInviteForm
      email={invitation.email}
      token={searchParamsObj.token}
    />
  )
}
