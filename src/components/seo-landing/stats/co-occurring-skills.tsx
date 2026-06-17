import { CoOccurringSkill } from "@/lib/api-server";

interface Props {
  tag: string;
  skills: CoOccurringSkill[];
}

export function CoOccurringSkills({ tag, skills }: Props) {
  if (!skills.length) return null;

  const max = skills[0].mentions;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-4">
        Often hired with {tag}
      </h3>
      <ul className="space-y-3">
        {skills.map((skill) => (
          <li key={skill.tag}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white/90">{skill.tag}</span>
              <span className="text-xs text-white/50">{skill.pct}% of roles</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500/70"
                style={{ width: `${(skill.mentions / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
