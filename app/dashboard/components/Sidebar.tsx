import { FilesIcon, LayoutDashboardIcon, ListTodoIcon, UsersIcon } from "lucide-react";
import { Organization, Role, User } from "@/db/generated/prisma/client";
import { SidebarLink } from "./_SidebarLinkClient";

export function Sidebar({ user, organization, role }: {
    user: User,
    organization: Organization,
    role: Role
}) {
    if (!user || !organization || !role) {
        return null;
    }
    return (
        <div className="w-64 bg-gray-800 text-white">
            <div className="p-4">
                <h1 className="text-2xl font-bold">TeamOS</h1>
                <div className="mt-4 flex flex-col gap-2">
                    <SidebarLink href="/dashboard" icon={<LayoutDashboardIcon className="w-5 h-5" />}>
                        Dashboard
                    </SidebarLink>
                    <SidebarLink href="/dashboard/projects" icon={<FilesIcon className="w-5 h-5" />}>
                        Projects
                    </SidebarLink>
                    <SidebarLink href="/dashboard/tasks" icon={<ListTodoIcon className="w-5 h-5" />}>
                        Tasks
                    </SidebarLink>
                    <SidebarLink href="/dashboard/team" icon={<UsersIcon className="w-5 h-5" />}>
                        Team
                    </SidebarLink>

                </div>
            </div>
        </div>
    )
}