import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/db/generated/prisma/client";

interface TaskStatusBadgeProps {
    status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
    const config = {
        TODO: { label: "To Do", variant: "secondary" as const },
        IN_PROGRESS: { label: "In Progress", variant: "default" as const },
        DONE: { label: "Done", variant: "outline" as const },
    };

    const { label, variant } = config[status];

    return <Badge variant={variant}>{label}</Badge>;
}