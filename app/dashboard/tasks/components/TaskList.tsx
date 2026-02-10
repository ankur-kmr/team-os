"use client";

import { Task, Project, User } from "@/db/generated/prisma/client";
import TaskCard from "./TaskCard";

type TaskWithRelations = Task & {
    project?: Project;
    assignee?: User;
};

interface TaskListProps {
    tasks: TaskWithRelations[];
    groupBy?: "status" | "project" | "none";
    showProject?: boolean;
    emptyMessage?: string;
}

export default function TaskList({ 
    tasks, 
    groupBy = "none",
    showProject = false,
    emptyMessage = "No tasks found"
}: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    // Group by status
    if (groupBy === "status") {
        const grouped = {
            TODO: tasks.filter(t => t.status === "TODO"),
            IN_PROGRESS: tasks.filter(t => t.status === "IN_PROGRESS"),
            DONE: tasks.filter(t => t.status === "DONE"),
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(grouped).map(([status, statusTasks]) => (
                    <div key={status}>
                        <h3 className="font-semibold mb-2">
                            {status.replace("_", " ")} ({statusTasks.length})
                        </h3>
                        <div className="space-y-2">
                            {statusTasks.map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    showProject={showProject}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Group by project
    if (groupBy === "project") {
        const grouped = tasks.reduce((acc, task) => {
            const projectId = task.projectId;
            if (!acc[projectId]) acc[projectId] = [];
            acc[projectId].push(task);
            return acc;
        }, {} as Record<string, TaskWithRelations[]>);

        return (
            <div className="space-y-6">
                {Object.entries(grouped).map(([projectId, projectTasks]) => (
                    <div key={projectId}>
                        <h3 className="font-semibold mb-2">
                            {projectTasks[0].project?.name || "Unknown Project"} 
                            ({projectTasks.length})
                        </h3>
                        <div className="space-y-2">
                            {projectTasks.map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    showProject={false}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // No grouping - simple list
    return (
        <div className="space-y-2">
            {tasks.map(task => (
                <TaskCard 
                    key={task.id} 
                    task={task} 
                    showProject={showProject}
                />
            ))}
        </div>
    );
}

// import { Task } from "@/db/generated/prisma/client";
// import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

// export default function TaskList({ tasks }: { tasks: Task[] }) {
//     return (
//             <Card>
//             <CardHeader>
//                 <CardTitle>Tasks</CardTitle>
//             </CardHeader>
//             <CardContent>
//                 {tasks.map((task) => (
//                 <Card key={task.id}>
//                         <CardHeader>
//                             <CardTitle>{task.title}</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <p>{task.description}</p>
//                         </CardContent>
//                         <CardFooter>
//                             <p>{task.status}</p>
//                         </CardFooter>
//                     </Card>
//                 ))}
//             </CardContent>
//         </Card>
//     );
// }