"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProjectTabsProps {
    projectId: string;
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
    const pathname = usePathname();

    const tabs = [
        {
            name: "Overview",
            href: `/dashboard/projects/${projectId}`,
            isActive: pathname === `/dashboard/projects/${projectId}`,
        },
        {
            name: "Tasks",
            href: `/dashboard/projects/${projectId}/tasks`,
            isActive: pathname.startsWith(`/dashboard/projects/${projectId}/tasks`),
        },
        {
            name: "Settings",
            href: `/dashboard/projects/${projectId}/settings`,
            isActive: pathname.startsWith(`/dashboard/projects/${projectId}/settings`),
        },
    ];

    return (
        <div className="border-b border-gray-200">
            <nav className="flex gap-8">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={cn(
                            "pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
                            tab.isActive
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        {tab.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
