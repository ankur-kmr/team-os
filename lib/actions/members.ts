"use server"

import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { hasAccess, canManageRole, canRemoveMember } from "@/lib/rbac"
import { Role } from "@/db/generated/prisma/client"
import { hash } from "bcryptjs"
import { signIn } from "@/lib/auth"
import crypto from "crypto"
import { generateInviteToken } from "../invite"
import { sendInviteEmail } from "../email"
import { cookies } from "next/headers"
import { auth } from "@/lib/auth"

/**
 * Member Management Actions
 * Handle team member operations
 */

export async function getMembers(orgId: string) {
  const members = await prisma.member.findMany({
    where: { organizationId: orgId },
    include: { user: true },
  })
  return members
}


/**
 * Invite a member to the organization
 */

export async function inviteMember(email: string, role: Role) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const orgId = (await cookies()).get("orgId")?.value
  if (!orgId) throw new Error("No organization")

  const actor = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: orgId,
      },
    },
  })

  if (!actor || actor.role === "MEMBER") {
    throw new Error("Forbidden")
  }

  if (role === "OWNER" && actor.role !== "OWNER") {
    throw new Error("Only owner can assign owner role")
  }

  const normalizedEmail = email.toLowerCase().trim()

  // Remove existing invite (re-invite case)
  await prisma.invitation.deleteMany({
    where: { email: normalizedEmail, organizationId: orgId },
  })

  const { rawToken, tokenHash } = generateInviteToken()

  await prisma.invitation.create({
    data: {
      email: normalizedEmail,
      organizationId: orgId,
      role,
      tokenHash,
      invitedById: session.user.id,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  })

  const inviteUrl = `${process.env.APP_URL}/accept-invite?token=${rawToken}`

  await sendInviteEmail(normalizedEmail, inviteUrl)

  return { success: true }
}

// export async function inviteMember(
//   orgId: string,
//   userId: string,
//   email: string,
//   role: string
// ) {
//   try {
//     // Verify actor has permission
//     const actor = await prisma.member.findFirst({
//       where: { userId, organizationId: orgId },
//     })

//     if (!actor || !hasAccess(actor.role, ["OWNER", "ADMIN"])) {
//       return { error: "Unauthorized" }
//     }

//     // Check if user already exists
//     let invitedUser = await prisma.user.findUnique({
//       where: { email },
//     })

//     // If user doesn't exist, create them (they'll set password on first login)
//     if (!invitedUser) {
//       invitedUser = await prisma.user.create({
//         data: { email },
//       })
//     }

//     // Check if already a member
//     const existingMember = await prisma.member.findUnique({
//       where: {
//         userId_organizationId: {
//           userId: invitedUser.id,
//           organizationId: orgId,
//         },
//       },
//     })

//     if (existingMember) {
//       return { error: "User is already a member of this organization" }
//     }

//     // Create member
//     const member = await prisma.member.create({
//       data: {
//         userId: invitedUser.id,
//         organizationId: orgId,
//         role: role as Role,
//       },
//     })

//     // Log audit event
//     await logAudit({
//       organizationId: orgId,
//       actorId: userId,
//       action: "member_invited",
//       metadata: { email, role },
//     })

//     // TODO: Send invitation email to invitedUser.email

//     return { success: true, member }
//   } catch (error) {
//     console.error("Failed to invite member:", error)
//     return { error: "Failed to invite member" }
//   }
// }

export async function acceptInvite(token: string, name: string, password: string) {
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")

  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash },
  })

  if (!invitation || invitation.expiresAt < new Date()) {
    throw new Error("Invalid or expired invite")
  }

  await prisma.$transaction(async (tx) => {
    // Check if user already exists
    const existingUser = await tx.user.findUnique({
      where: { email: invitation.email },
    })

    if (existingUser) {
      await tx.member.create({
        data: {
          userId: existingUser.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      })
    } else {
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          name,
          passwordHash: await hash(password, 10),
        },
      })

      await tx.member.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      })
    }
    await tx.invitation.delete({
      where: { id: invitation.id },
    })
  })

  await signIn("credentials", {
    email: invitation.email,
    password,
    redirectTo: "/dashboard",
  })
}

/**
 * Change a member's role
 */
export async function changeMemberRole(
  orgId: string,
  actorId: string,
  memberId: string,
  newRole: string
) {
  try {
    // Verify actor has permission
    const actor = await prisma.member.findFirst({
      where: { userId: actorId, organizationId: orgId },
    })

    if (!actor || !hasAccess(actor.role, ["OWNER", "ADMIN"])) {
      return { error: "Unauthorized" }
    }

    // Get target member
    const target = await prisma.member.findUnique({
      where: { id: memberId },
    })

    if (!target || target.organizationId !== orgId) {
      return { error: "Member not found" }
    }

    // Check if actor can manage this role
    if (!canManageRole(actor.role as Role, target.role as Role)) {
      return { error: "Cannot change role of equal or higher role" }
    }

    // Update role
    const updated = await prisma.member.update({
      where: { id: memberId },
      data: { role: newRole as Role },
    })

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId,
      action: "member_role_changed",
      metadata: { memberId, oldRole: target.role, newRole },
    })

    return { success: true, member: updated }
  } catch (error) {
    console.error("Failed to change member role:", error)
    return { error: "Failed to change member role" }
  }
}

/**
 * Remove a member from the organization
 */
export async function removeMember(
  orgId: string,
  actorId: string,
  memberId: string
) {
  try {
    // Verify actor has permission
    const actor = await prisma.member.findFirst({
      where: { userId: actorId, organizationId: orgId },
    })

    if (!actor || !hasAccess(actor.role, ["OWNER", "ADMIN"])) {
      return { error: "Unauthorized" }
    }

    // Check if can remove this member
    const canRemove = await canRemoveMember(memberId, orgId, prisma)
    if (!canRemove) {
      return { error: "Cannot remove the last owner" }
    }

    // Get member info before deletion
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    })

    if (!member) {
      return { error: "Member not found" }
    }

    // Delete member
    await prisma.member.delete({
      where: { id: memberId },
    })

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId,
      action: "member_removed",
      metadata: { email: member.user.email, role: member.role },
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to remove member:", error)
    return { error: "Failed to remove member" }
  }
}
