"use client";

import { useEffect } from "react";
import { setActiveOrganization } from "../actions";
import { useRouter } from "next/navigation";

export function AutoSelectOrg({ orgId }: { orgId: string }) {
  const router = useRouter();

  useEffect(() => {
    async function selectOrg() {
      const result = await setActiveOrganization(orgId);
      if (result.success) {
        router.push("/dashboard");
      }
    }
    selectOrg();
  }, [orgId, router]);

  return <div>Setting up your workspace...</div>;
}