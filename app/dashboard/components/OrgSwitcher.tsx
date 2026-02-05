"use client";
import { Button } from "@/components/ui/button";
import { Building2Icon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Organization, User } from "@/db/generated/prisma/client";
import { OrgItemClient } from "./_OrgItemClient";
import { CreateOrgDialog } from "./CreateOrgDialog";
import { useState } from "react";

export function OrgSwitcher({ user, organization, orgs }: { user: User, organization: Organization, orgs: Organization[] }) {
    const [open, setOpen] = useState(true);
    if (!user || !organization) {
        return null;
    }

    return (
        <div className="flex items-center space-x-2">
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" onClick={() => setOpen(true)}>
                        <Building2Icon className="w-5 h-5" />
                        <span>{organization.name}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {orgs.map((org) => (
                        <DropdownMenuItem key={org.id} className={org.id === organization.id ? "bg-primary text-primary-foreground" : ""}>
                            <OrgItemClient org={org} user={user} setOpen={setOpen} />
                        </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <CreateOrgDialog user={user} />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}