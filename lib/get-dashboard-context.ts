// lib/get-dashboard-context.ts (NOT a server action)
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getDashboardContext() {
  const session = await auth();
  const orgId = (await cookies()).get("orgId")?.value;

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!orgId) {
    redirect("/onboarding");
  }

  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: {
        where: { organizationId: orgId },
        include: { organization: true },
      },
    },
  });

  if (!userData || userData.memberships.length === 0) {
    redirect("/onboarding");
  }

  return {
    user: userData,
    session,
    organization: userData.memberships[0].organization,
    role: userData.memberships[0].role,
    orgId,
  };
}