import Image from "next/image";
import { HeroSection } from "@/components/features/HeroSection";
import { SkillsSection } from "@/components/features/SkillsSection";
import { ExperienceSection } from "@/components/features/ExperienceSection";
import { ProjectsSection } from "@/components/features/ProjectsSection";
import { AchievementsSection } from "@/components/features/AchievementsSection";

export default function Home() {
  return (
    <div className="flex flex-col gap-0">
      <HeroSection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <AchievementsSection />

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border bg-background">
        <p>SYSTEM STATUS: ONLINE // ALL SYSTEMS NOMINAL</p>
        <p className="mt-2 opacity-50">© 2024 Keerthi Raajan K M. Built with Next.js & React Three Fiber.</p>
      </footer>
    </div>
  );
}
