import NewProjectForm from "../../components/NewProjectForm";
import { getDashboardContext } from "@/lib/get-dashboard-context";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    const { organization, user, orgId } = await getDashboardContext();

    if (!organization || !user || !orgId) {
        throw new Error("Organization ID not found");
    }
    const project = await prisma.project.findUnique({
        where: { id: projectId, organizationId: orgId },
    });
    console.log(project, projectId, orgId, 'edit project');
    if (!project) {
        notFound();
    }

    return (
        <div className="mt-4 p-6">
            <h1 className="text-2xl font-bold">Edit Project</h1>
            <NewProjectForm organization={organization} user={user} project={project} />
        </div>
    );
}