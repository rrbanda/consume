import { getSkills } from "@/lib/data";
import { SkillsGrid } from "./skills-grid";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const skills = await getSkills();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Skills</h1>
        <p className="text-gray-400 mt-1">{skills.length} skills available</p>
      </div>

      <SkillsGrid skills={skills} />
    </div>
  );
}
