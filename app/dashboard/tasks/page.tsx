import { getDashboardContext } from "@/lib/get-dashboard-context";
import { prisma } from "@/lib/prisma";
import TaskList from "./components/TaskList";

export default async function TasksPage() {
    const { orgId } = await getDashboardContext();
    if (!orgId) {
        throw new Error("Organization ID not found");
    }
    const tasks = await prisma.task.findMany({
        where: {
            organizationId: orgId,
        },
    });
    return (
        <div className="mt-4 p-6">
            <h1 className="text-2xl font-bold">Tasks</h1>
            <TaskList tasks={tasks} />
        </div>
    );
}