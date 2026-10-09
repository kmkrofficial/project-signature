import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SiteHeader />
            <main id="content" className="flex-1">
                {children}
            </main>
            <Footer />
        </>
    );
}
