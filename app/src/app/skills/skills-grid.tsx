"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export function SkillsGrid({ skills }: { skills: Skill[] }) {
  const [search, setSearch] = useState("");

  const filtered = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug?.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/[0.06] bg-[#1f1f1f] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-gray-600 focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((skill) => (
          <div
            key={skill.id}
            className="rounded-xl border border-white/[0.06] bg-[#1f1f1f] p-5 transition-all duration-200 hover:border-white/[0.1]"
          >
            <h3 className="text-sm font-semibold text-white">{skill.name}</h3>
            {skill.slug && (
              <span className="mt-1 inline-block rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-gray-500">
                {skill.slug}
              </span>
            )}
            <p className="mt-2 text-xs text-gray-400 line-clamp-3">
              {skill.description
                ? skill.description.slice(0, 100) + (skill.description.length > 100 ? "…" : "")
                : "No description"}
            </p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-8 col-span-3">
            No skills match your search.
          </p>
        )}
      </div>
    </>
  );
}
