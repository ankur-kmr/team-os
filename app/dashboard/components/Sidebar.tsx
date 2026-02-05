import Link from "next/link";
import { LayoutDashboardIcon } from "lucide-react";
import { Organization, Role, User } from "@/db/generated/prisma/client";

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
                <div className="mt-4">
                    <Link href="/dashboard">
                        <span className="flex items-center gap-2 text-gray-400 hover:text-white">
                            <LayoutDashboardIcon className="w-5 h-5" />
                            Dashboard
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}