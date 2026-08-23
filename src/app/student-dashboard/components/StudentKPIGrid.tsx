// BENTO GRID PLAN: 5 cards → grid-cols-4
// Row 1: hero card (spans 2 cols) + 2 regular cards
// Row 2: 2 regular cards spanning 2 cols each

const kpiData = [
  {
    id: 'kpi-classes',
    title: "Today\'s Classes",
    value: '3',
    unit: 'sessions',
    change: '+1 from yesterday',
    trend: 'neutral',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    detail: 'Next: OS at 10:30 AM',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20',
    hero: false,
  },
  {
    id: 'kpi-exam',
    title: 'Next Exam',
    value: '6',
    unit: 'days away',
    change: 'DBMS — Sep 2, 2026',
    trend: 'warning',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    detail: 'Room 204, 10:00 AM',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/25',
    hero: false,
  },
  {
    id: 'kpi-notes',
    title: 'Notes Available',
    value: '247',
    unit: 'documents',
    change: '+12 this week',
    trend: 'positive',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    detail: '3 new in your subjects',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
    hero: false,
  },
  {
    id: 'kpi-announcements',
    title: 'Unread Alerts',
    value: '4',
    unit: 'announcements',
    change: '1 high priority',
    trend: 'danger',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z" />
        <path d="M5.45 17l4.42-8.85A2 2 0 0111.73 7h.54a2 2 0 011.86 1.15L18.55 17" />
        <path d="M12 3v4" />
      </svg>
    ),
    detail: 'Exam schedule updated',
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/25',
    hero: false,
  },
  {
    id: 'kpi-ai',
    title: 'AI Queries This Week',
    value: '38',
    unit: 'queries used',
    change: '↑ 14% vs last week',
    trend: 'positive',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    detail: 'Limit: 200/week',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    hero: false,
  },
];

export default function StudentKPIGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mb-5">
      {/* Hero card — spans 2 cols */}
      <HeroStudyCard />
      {/* Regular KPI cards */}
      {kpiData.slice(0, 4).map((kpi) => (
        <KPICard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}

function HeroStudyCard() {
  return (
    <div className="col-span-2 glass-card rounded-2xl p-5 border border-primary/20 relative overflow-hidden glass-card-hover">
      <div className="floating-orb orb-primary w-48 h-48 top-[-30%] right-[-10%] opacity-60" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="section-label mb-1">Study Progress</p>
            <h3 className="text-3xl font-800 text-foreground metric-value">68<span className="text-lg font-500 text-muted-foreground">%</span></h3>
            <p className="text-sm text-muted-foreground mt-0.5">Semester 5 completion</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: '68%' }} />
        </div>
        {/* Subject mini-progress */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'sub-os', name: 'OS', pct: 75, color: 'bg-accent' },
            { id: 'sub-dbms', name: 'DBMS', pct: 55, color: 'bg-primary' },
            { id: 'sub-cn', name: 'CN', pct: 80, color: 'bg-success' },
          ].map((sub) => (
            <div key={sub.id}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground font-500">{sub.name}</span>
                <span className="text-xs font-600 text-foreground metric-value">{sub.pct}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${sub.color}`} style={{ width: `${sub.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  kpi: typeof kpiData[0];
}

function KPICard({ kpi }: KPICardProps) {
  const trendColors = {
    positive: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    neutral: 'text-accent',
  };

  return (
    <div className={`glass-card rounded-2xl p-4 border ${kpi.borderColor} glass-card-hover relative overflow-hidden`}>
      {kpi.trend === 'danger' && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger animate-pulse" />
      )}
      <div className={`w-9 h-9 rounded-xl ${kpi.bgColor} border ${kpi.borderColor} flex items-center justify-center ${kpi.color} mb-3`}>
        {kpi.icon}
      </div>
      <p className="section-label mb-1">{kpi.title}</p>
      <div className="flex items-baseline gap-1.5 mb-0.5">
        <span className="text-2xl font-800 text-foreground metric-value">{kpi.value}</span>
        <span className="text-xs text-muted-foreground">{kpi.unit}</span>
      </div>
      <p className={`text-xs font-500 ${trendColors[kpi.trend as keyof typeof trendColors]}`}>{kpi.change}</p>
      <p className="text-xs text-muted-foreground mt-1.5 truncate">{kpi.detail}</p>
    </div>
  );
}