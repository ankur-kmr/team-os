import { getDashboardContext } from "@/lib/get-dashboard-context";
import { prisma } from "@/lib/prisma";
import TaskList from "@/app/dashboard/tasks/components/TaskList";

export default async function TasksPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    const { orgId } = await getDashboardContext();
    if (!orgId) {
        throw new Error("Organization ID not found");
    }
    const tasks = await prisma.task.findMany({
        where: {
            organizationId: orgId,
            projectId: projectId,
        },
    });
    return (
        <div className="mt-4 p-6">
            <h1 className="text-2xl font-bold">Tasks</h1>
            <TaskList tasks={tasks} />
        </div>
    );
}