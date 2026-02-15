import { getDashboardContext } from "@/lib/get-dashboard-context";
import MembersTable from "./components/MembersTable";
import { getMembers } from "@/lib/actions/members";

export default async function MembersPage() {
    const { orgId } = await getDashboardContext();
    if (!orgId) {
        throw new Error("Organization ID not found");
    }
    const members = await getMembers(orgId);
    
    return (
        <div className="mt-4 p-6">
            <h1 className="text-2xl font-bold">Members</h1>
            <MembersTable members={members} />
        </div>
    );
}