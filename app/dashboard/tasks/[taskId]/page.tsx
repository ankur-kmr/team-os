import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getDashboardContext } from "@/lib/get-dashboard-context";
import { TaskStatusBadge } from "../components/TaskStatusBadge";

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
    const { taskId } = await params;
    const { orgId } = await getDashboardContext();
    if (!orgId) {
        throw new Error("Organization ID not found");
    }
    const task = await prisma.task.findUnique({
        where: { id: taskId, organizationId: orgId },
    });
    if (!task) {
        notFound();
    }
    return (
        <div className="mt-4 p-6">
            <h1 className="text-2xl font-bold">Task Detail</h1>
            <div className="flex flex-col gap-4 mt-4">
                <h2 className="text-lg font-bold">{task.title}</h2>
                <p className="text-sm text-gray-600">{task.description}</p>
                <TaskStatusBadge status={task.status} />
            </div>
        </div>
    );
}