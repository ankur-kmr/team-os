"use client";

import { Task, Project, User } from "@/db/generated/prisma/client";
import { TaskStatusBadge } from "./TaskStatusBadge";
import Link from "next/link";

type TaskWithRelations = Task & {
    project?: Project;
    assignee?: User;
};

interface TaskCardProps {
    task: TaskWithRelations;
    showProject?: boolean;
}

export default function TaskCard({ task, showProject = false }: TaskCardProps) {
    return (
        <Link 
            href={`/dashboard/tasks/${task.id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    {task.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {task.description}
                        </p>
                    )}
                    {showProject && task.project && (
                        <p className="text-xs text-gray-500 mt-2">
                            📁 {task.project.name}
                        </p>
                    )}
                </div>
                <TaskStatusBadge status={task.status} />
            </div>
            
            {task.assignee && (
                <div className="mt-2 text-xs text-gray-500">
                    Assigned to: {task.assignee.name || task.assignee.email}
                </div>
            )}
        </Link>
    );
}