"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ButtonLinkProps extends React.ComponentProps<"button"> {
    href: string;
    children: React.ReactNode;
    showLoader?: boolean;
    outline?: boolean;
}

/**
 * A button that navigates with loading state
 * Shows spinner while navigating to the target page
 * 
 * @example
 * <ButtonLink href="/dashboard/projects/123/edit" variant="outline">
 *   Edit Project
 * </ButtonLink>
 */
export function ButtonLink({ 
    href, 
    children, 
    showLoader = true,
    disabled,
    outline = false,
    ...props 
}: ButtonLinkProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isNavigating, setIsNavigating] = useState(false);

    const isLoading = isPending || isNavigating;

    function handleClick() {
        setIsNavigating(true);
        startTransition(() => {
            router.push(href);
        });
    }

    return (
        <Button
            onClick={handleClick}
            disabled={disabled || isLoading}
            variant={outline ? "outline" : "default"}
            {...props}
        >
            {isLoading && showLoader && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {children}
        </Button>
    );
}
