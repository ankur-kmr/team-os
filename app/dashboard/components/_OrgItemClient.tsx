"use client";

import { Organization, User } from "@/db/generated/prisma/client";
import { switchOrganization } from "@/lib/org-context";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrgItemClient({ org, user, setOpen }: { org: Organization, user: User, setOpen: (open: boolean) => void }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (!user || !org) {
        return null;
    }

    async function handleSwitch(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("🔄 Starting org switch to:", org.name);
        setIsLoading(true);

        try {
            const result = await switchOrganization(org.id, user.id);

            if (result.success) {
                router.refresh();
                setOpen(false);
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
        }
    }

    return (
        <button
            onClick={handleSwitch}
            disabled={isLoading}
            className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded disabled:opacity-50"
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : org.name}
        </button>
    );
}