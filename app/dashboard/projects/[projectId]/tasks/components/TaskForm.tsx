"use client";

import { TaskInput, taskSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Task, User } from "@/db/generated/prisma/client";
import { createTask, updateTaskStatus } from "@/lib/actions/tasks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TaskForm({ task, projectId, users, orgId, userId }: { task?: Task, projectId: string, users: User[], orgId: string, userId: string }) {
    const isEditing = !!task;
    const router = useRouter();

    const defaultValues = {
        title: task?.title || "",
        description: task?.description || "",
        status: task?.status || "TODO",
        priority: task?.priority || "MEDIUM",
        assignedToId: task?.assignedToId || "",
    };
    const form = useForm<TaskInput>({
        resolver: zodResolver(taskSchema),
        defaultValues,
    });

    async function onSubmit(data: TaskInput) {
        console.log(data);
        if (isEditing) {
            const result = await updateTaskStatus(orgId, userId, task?.id || "", data.status);
            if (result?.error) {
                toast.error(result.error);
                return;
            }
            if (result?.success) {
                toast.success("Task updated successfully");
                setTimeout(() => {
                    router.push(`/dashboard/projects/${projectId}/tasks`);
                }, 500);
            }
        } else {
            const result = await createTask(orgId, userId, projectId || "", data.title, data.description, data.priority, data.assignedToId);
            if (result?.error) {
                toast.error(result.error);
                return;
            }
            if (result?.success) {
                toast.success("Task created successfully");
                setTimeout(() => {
                    router.push(`/dashboard/projects/${projectId}/tasks`);
                }, 500);
            }
        }
    }
    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6 border rounded-md">
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                        <Input placeholder="Enter task title" {...field} disabled={isEditing} />
                    </FormControl>
                    <FormMessage />
                </FormItem>}
            />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Enter task description" {...field} disabled={isEditing} />
                    </FormControl>
                    <FormMessage />
                </FormItem>}
            />
            <div className="grid grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODO">TODO</SelectItem>
                                    <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                                    <SelectItem value="DONE">DONE</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>}
                />
                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">LOW</SelectItem>
                                    <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                                    <SelectItem value="HIGH">HIGH</SelectItem>
                                    <SelectItem value="URGENT">URGENT</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>}
                />
                <FormField
                    control={form.control}
                    name="assignedToId"
                    render={({ field }) => <FormItem>
                        <FormLabel>Assigned To</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* <SelectItem value="TODO">TODO</SelectItem> */}
                                    {users.map((user: User) => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>}
                />
            </div>
            <Button type="submit" disabled={isEditing}>{isEditing ? "Save Task" : "Create Task"}</Button>
            {isEditing && <Button type="button" variant="outline" onClick={() => form.reset()}>Cancel</Button>}
        </form>
    </Form>;
}