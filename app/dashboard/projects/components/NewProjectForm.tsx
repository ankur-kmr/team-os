"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectInput, projectSchema } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { toast } from "sonner";
import { createProject, updateProject } from "@/lib/actions/projects";
import { useRouter } from "next/navigation";
import { Organization, Project, User } from "@/db/generated/prisma/client";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function NewProjectForm({ organization, user, project }: {
    organization: Organization,
    user: User,
    project?: Project
}) {
    const defaultValues = {
        name: project?.name || "",
        description: project?.description || "",
    };
    const form = useForm<ProjectInput>({
        resolver: zodResolver(projectSchema),
        defaultValues,
    });
    const router = useRouter();
    
    async function onSubmit(values: ProjectInput) {
        let result: { success?: boolean, project?: Project, error?: string } | undefined;
        const isEditing = !!project;
        
        if (project) {
            result = await updateProject(organization.id, user.id, project.id, values.name, values.description);
        } else {
            result = await createProject(organization.id, user.id, values.name, values.description);
        }
        
        if (result?.error) {
            toast.error(result.error);
            return;
        }
        
        if (result?.success) {
            const message = isEditing ? "Project updated successfully" : "Project created successfully";
            toast.success(message);
            
            // Give toast time to render before redirecting
            setTimeout(() => {
                router.push("/dashboard/projects");
            }, 500);
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => 
                    (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                        </FormItem>
                    )
                } />
                <FormField control={form.control} name="description" render={({ field }) => 
                    (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={4} />
                            </FormControl>
                        </FormItem>
                    )
                } />
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full mt-2">
                    {form.formState.isSubmitting ? "Saving..." : (project ? "Update Project" : "Create Project")}
                    {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </Button>
            </form>
        </Form>
    );
}