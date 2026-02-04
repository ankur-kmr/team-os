"use server"

import { cookies } from "next/headers"

/**
 * Set the active organization in a cookie
 * This establishes the tenant context for the user's session
 */
export async function setActiveOrganization(orgId: string) {
  try {
    (await cookies()).set("orgId", orgId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to set organization:", error)
    return { error: "Failed to set organization" }
  }
}
