"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { registerSchema, type RegisterInput } from "@/lib/validations"
import { signOut } from "@/lib/auth"

/**
 * Authentication Actions
 * Handle user registration and account creation
 */

/**
 * Register a new user
 * Validates input, hashes password, and creates user
 * Note: Client must call signIn() separately after registration
 */
export async function registerUser(input: RegisterInput) {
  try {
    // Validate input with Zod
    const validatedData = registerSchema.parse(input)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return { error: "Email already registered" }
    }

    // Hash password with bcrypt
    const passwordHash = await hash(validatedData.password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
      },
    })

    // Return success - client will handle sign in
    return { success: true, userId: user.id }
  } catch (error) {
    console.error("Registration error:", error)
    
    // Handle Zod validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return { error: "Invalid input data" }
    }
    
    return { error: "Failed to create account. Please try again." }
  }
}

/**
 * Clear org context cookie (call before signOut so next user doesn't get old org).
 */
export async function clearOrgCookie() {
  const c = await cookies()
  c.delete("orgId")
}

/**
 * Sign out the current user (server).
 * Prefer using signOut() from "next-auth/react" in client components
 * so redirect and cookie clearing work reliably.
 */
export async function logoutUser() {
  await signOut({ redirectTo: "/login" })
  await clearOrgCookie()
}
