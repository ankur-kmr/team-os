import { Member, User } from "@/db/generated/prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MembersTable({ members }: { members: (Member & { user: User })[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {members.map((member) => (
                    <TableRow key={member.id}>
                        <TableCell>{member.user?.name}</TableCell>
                        <TableCell>{member.user?.email}</TableCell>
                        <TableCell>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}