"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

export function SidebarLink({ href, icon, children }: SidebarLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                "text-gray-400 hover:text-white hover:bg-gray-700",
                isActive && "text-white bg-gray-700"
            )}
        >
            {icon}
            {children}
        </Link>
    );
}
