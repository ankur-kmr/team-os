import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button-link";
import { getDashboardContext } from "@/lib/get-dashboard-context";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import InviteMemberDialog from "../../members/components/InviteMemberDialog";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    const { orgId } = await getDashboardContext();
    if (!orgId) {
        throw new Error("Organization ID not found");
    }
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
            organizationId: orgId,
        },
        include: {
            tasks: {
                select: { id: true, status: true },
            },
        },
    });

    // Calculaet stats
    const todoCount = project?.tasks.filter((task) => task.status === "TODO").length;
    const inProgressCount = project?.tasks.filter((task) => task.status === "IN_PROGRESS").length;
    const doneCount = project?.tasks.filter((task) => task.status === "DONE").length;

    if (!project) {
        notFound();
    }
    return (
        <div className="mt-4 p-6">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <ButtonLink 
                    href={`/dashboard/projects/${project.id}/edit`}
                    outline={true}
                >
                    Edit
                </ButtonLink>
            </div>
            <p className="mt-4 text-gray-600">{project.description}</p>
            <Separator className="my-6" />
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6 mt-4">
                <StatsCard title="Tasks" value={project.tasks.length} />
                <StatsCard title="Todo" value={todoCount} />
                <StatsCard title="In Progress" value={inProgressCount} />
                <StatsCard title="Done" value={doneCount} />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
                <ButtonLink href={`/dashboard/projects/${projectId}/tasks`}>
                    View All Tasks
                </ButtonLink>
                <ButtonLink outline={true} href={`/dashboard/projects/${projectId}/tasks/new`}>
                    <PlusIcon className="size-4" /> New Task
                </ButtonLink>
                <InviteMemberDialog />
            </div>
        </div>
    );
}

function StatsCard({ title, value }: { title: string, value: number | undefined }) {
    return (
        <div>
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
            </CardContent>
        </Card>

    </div>
    );
}