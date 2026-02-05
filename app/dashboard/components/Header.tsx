import { Organization, Role, User } from "@/db/generated/prisma/client";
import { OrgSwitcher } from "./OrgSwitcher";
import { UserMenu } from "./UserMenu";
import { getUserOrganizations } from "@/lib/org-context";

export async function Header({ user, organization, role }: { user: User,
    organization: Organization,
    role: Role
}) {
    if (!user || !organization || !role) {
        return null;
    }
    const orgs = await getUserOrganizations(user.id);

    return (
        <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-2xl font-bold">TeamOS</h1>
            <OrgSwitcher user={user} organization={organization} orgs={orgs} />
            <UserMenu />
        </div>
    )
}