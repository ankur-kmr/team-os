import { getDashboardContext } from "@/lib/get-dashboard-context";
import NewProjectForm from "../components/NewProjectForm";
import { redirect } from "next/navigation";

export default async function NewProjectPage() {
    const { organization, user } = await getDashboardContext();
    if (!organization || !user) {
        redirect("/dashboard");
    }
    return (
        <div className="mt-4 max-w-md mx-auto border p-6 rounded-md">
            <h1 className="text-2xl font-bold mb-4">New Project</h1>
            <NewProjectForm organization={organization} user={user} />
        </div>
    );
}