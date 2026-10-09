import AdminStudio from "@/components/admin/AdminStudio";

// The studio renders only after a client-side admin check (see AuthGuard), so there is nothing for Next to
// prerender or prefetch for this route. Opt out of instant-navigation validation instead of reporting a
// dropped segment. `instant` has to be exported from a Server Component, which is why this page is thin.
export const instant = false;

export default function AdminPage() {
    return <AdminStudio />;
}
