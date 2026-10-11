import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { NotFoundContent } from "@/components/layout/NotFoundContent";

// Unmatched URLs render outside the (site) group, so include the site chrome here
export default function NotFound() {
    return (
        <>
            <SiteHeader />
            <main id="content" className="flex-1">
                <NotFoundContent />
            </main>
            <Footer />
        </>
    );
}
