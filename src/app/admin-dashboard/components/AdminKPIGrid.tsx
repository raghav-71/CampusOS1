// BENTO GRID PLAN: 6 cards → grid-cols-3 × 2 rows
// Row 1: 3 cards (total students hero, total teachers, total subjects)
// Row 2: 3 cards (notes uploaded, upcoming events, pending reviews — warning state)

const adminKPIs = [
  {
    id: 'akpi-students',
    title: 'Total Students',
    value: '2,418',
    change: '+34 this month',
    trend: 'positive',
    detail: 'Across 4 departments',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20',
    hero: true,
  },
  {
    id: 'akpi-teachers',
    title: 'Faculty Members',
    value: '86',
    change: '+2 this semester',
    trend: 'positive',
    detail: '12 departments covered',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    hero: false,
  },
  {
    id: 'akpi-subjects',
    title: 'Active Subjects',
    value: '64',
    change: '8 new this semester',
    trend: 'positive',
    detail: 'Across all departments',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
    hero: false,
  },
  {
    id: 'akpi-notes',
    title: 'Notes Uploaded',
    value: '8,247',
    change: '+142 this week',
    trend: 'positive',
    detail: 'Total documents in library',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    hero: false,
  },
  {
    id: 'akpi-events',
    title: 'Upcoming Events',
    value: '7',
    change: '3 this week',
    trend: 'neutral',
    detail: 'Next: TechFest on Aug 28',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20',
    hero: false,
  },
  {
    id: 'akpi-pending',
    title: 'Pending Reviews',
    value: '5',
    change: '2 flagged for removal',
    trend: 'danger',
    detail: 'Content awaiting moderation',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/25',
    hero: false,
  },
];

export default function AdminKPIGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-6 gap-4 mb-5">
      {adminKPIs.map((kpi, idx) => (
        <AdminKPICard key={kpi.id} kpi={kpi} isHero={idx === 0} />
      ))}
    </div>
  );
}

interface AdminKPICardProps {
  kpi: typeof adminKPIs[0];
  isHero: boolean;
}

function AdminKPICard({ kpi, isHero }: AdminKPICardProps) {
  const trendColors = {
    positive: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    neutral: 'text-accent',
  };

  return (
    <div
      className={`glass-card rounded-2xl p-4 border ${kpi.borderColor} glass-card-hover relative overflow-hidden ${
        isHero ? 'md:col-span-2 xl:col-span-2' : ''
      }`}
    >
      {kpi.trend === 'danger' && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger animate-pulse" />
      )}
      <div className={`w-9 h-9 rounded-xl ${kpi.bgColor} border ${kpi.borderColor} flex items-center justify-center ${kpi.color} mb-3`}>
        {kpi.icon}
      </div>
      <p className="section-label mb-1">{kpi.title}</p>
      <div className="flex items-baseline gap-1.5 mb-0.5">
        <span className="text-2xl font-800 text-foreground metric-value">{kpi.value}</span>
      </div>
      <p className={`text-xs font-500 ${trendColors[kpi.trend as keyof typeof trendColors]}`}>{kpi.change}</p>
      <p className="text-xs text-muted-foreground mt-1 truncate">{kpi.detail}</p>
    </div>
  );
}