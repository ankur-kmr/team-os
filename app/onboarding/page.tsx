import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation"
import CreateOrgForm from "./components/CreateOrgForm";
import OrgSelector from "./components/OrgSelector";
import { setActiveOrganization } from "./actions";
import { AutoSelectOrg } from "./components/AutoSelectOrg";

export default async function OnboardingPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    // Fetch user's organizations
    const userOrgs = await prisma.member.findMany({
        where: { userId: session.user.id },
        include: { organization: true },
    });

    // Case 1: No organizations - show create form
    if (userOrgs.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <CreateOrgForm userId={session.user.id} />
                </div>
            </div>
        )
    }

    // Case 2: Exactly one organization - auto-select and redirect
    if (userOrgs.length === 1) {
        const org = userOrgs[0].organization;
        
        // Set orgId cookie for tenant context
        return <AutoSelectOrg orgId={org.id} />
    }

    // Case 3: Multiple organizations - show selector
    const organizations = userOrgs.map(m => m.organization);
    
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md">
                <OrgSelector orgList={organizations} />
            </div>
        </div>
    )
}