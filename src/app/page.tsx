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

    </div>
  );
}
