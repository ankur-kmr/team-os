"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserIcon, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import { logoutUser } from "@/lib/actions/auth";

export function UserMenu() {
    const { data: session } = useSession();
    if (!session?.user) {
        return null;
    }

    async function handleLogout() {
        await logoutUser();
        // window.location.href = "/api/auth/signout?callbackUrl=" + encodeURIComponent("/login");
    }

    return (
        <div className="flex items-center space-x-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <UserIcon className="w-5 h-5" />
                        <span>{session.user.name ?? session.user.email}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 focus:text-red-600"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}