import TaskForm from "../components/TaskForm";
import { getDashboardContext } from "@/lib/get-dashboard-context";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function NewTaskPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    const { organization, user, orgId } = await getDashboardContext();

    if (!organization || !user || !orgId) {
        throw new Error("Organization ID not found");
    }

    const task = await prisma.task.findFirst({
        where: {
            projectId: projectId,
            organizationId: orgId,
        },
    });
    const users = await prisma.user.findMany({
        where: {
            memberships: {
                some: {
                    organizationId: orgId,
                    // role: "MEMBER",
                },
            },
        },
    });
    if (!users) {
        notFound();
    }

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">New Task</h1>
            <TaskForm task={task || undefined} projectId={projectId} users={users} orgId={orgId} userId={user.id} />
        </div>
    );
}