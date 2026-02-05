import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { getDashboardContext } from "@/lib/get-dashboard-context";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, organization, role } = await getDashboardContext();
    
    return (
        <div className="flex h-screen">
            <Sidebar user={user} organization={organization} role={role} />
            <main className="flex-1">
                <Header user={user} organization={organization} role={role} />
                {children}
            </main>
        </div>
    )
}