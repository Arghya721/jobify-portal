// Stack-stats DTOs. Kept free of `server-only` so both server code
// (api-server.ts, the /api/stats/stack route) and client components
// (StatsGrid and the stat blocks) can import them.

export interface CoOccurringSkill {
  tag: string;
  mentions: number;
  pct: number;
}

export interface ExperienceDistribution {
  band: string;
  count: number;
}

export interface PostingVelocity {
  thisWeek: number;
  lastWeek: number;
  changePercent: number;
}

export interface TopCompany {
  name: string;
  openRoles: number;
}

export interface RemoteBreakdown {
  remote: number;
  onsite: number;
  total: number;
}

export interface AtsBreakdown {
  source: string;
  count: number;
}

export interface StackStats {
  tag: string;
  totalJobs: number;
  coOccurringSkills: CoOccurringSkill[];
  experienceDistribution: ExperienceDistribution[];
  postingVelocity: PostingVelocity;
  topCompanies: TopCompany[];
  remoteBreakdown: RemoteBreakdown;
  atsBreakdown: AtsBreakdown[];
}
