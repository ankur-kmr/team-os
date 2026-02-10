import { prisma } from "@/lib/prisma";
import { Project } from "@/db/generated/prisma/client";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getDashboardContext } from "@/lib/get-dashboard-context";
import { ButtonLink } from "@/components/ui/button-link";

export default async function ProjectsPage() {
    const { orgId } = await getDashboardContext();
    if (!orgId) {
        throw new Error("Organization ID not found");
    }
    const projects = await prisma.project.findMany({
        where: { organizationId: orgId },
    });
    return (
        <div className="mt-4 p-6">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Projects</h1>
                <ButtonLink 
                    href="/dashboard/projects/new"
                    outline={true}
                >
                    <PlusIcon className="size-4" /> New Project
                </ButtonLink>
            </div>
            <ProjectsList projects={projects} />
        </div>
    );
}

function ProjectsList({ projects }: { projects: Project[] }) {
    return (
        <ul className="mt-4 space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
        ))}
        </ul>
    );
}

function ProjectCard({ project }: { project: Project }) {
    return (
        <li key={project.id} className="rounded-md border p-6 hover:bg-muted transition-colors">
            <Link href={`/dashboard/projects/${project.id}`} className="text-lg font-bold hover:text-primary">{project.name}</Link>
            <p className="text-sm text-gray-600">{project.description}</p>
            <Separator className="my-4" />
            <div className="flex items-center justify-between gap-2 mt-2">
                <p className="text-sm text-gray-500">Created at: {project.createdAt.toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Updated at: {project.updatedAt.toLocaleDateString()}</p>
            </div>
        </li>
    );
}