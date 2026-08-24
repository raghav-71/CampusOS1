const subjectColors: Record<string, string> = {
  'Operating Systems': 'border-l-primary bg-primary/5',
  DBMS: 'border-l-accent bg-accent/5',
  'Computer Networks': 'border-l-success bg-success/5',
  'Java Programming': 'border-l-warning bg-warning/5',
  DAA: 'border-l-[#FF6B9D] bg-[#FF6B9D]/5',
};

const todayClasses = [
  {
    id: 'cls-001',
    subject: 'Operating Systems',
    time: '10:30 AM',
    endTime: '11:30 AM',
    room: 'A-204',
    teacher: 'Dr. Priya Nair',
    status: 'upcoming',
  },
  {
    id: 'cls-002',
    subject: 'DBMS',
    time: '12:00 PM',
    endTime: '1:00 PM',
    room: 'B-301',
    teacher: 'Prof. Rajan Mehta',
    status: 'upcoming',
  },
  {
    id: 'cls-003',
    subject: 'Computer Networks',
    time: '2:30 PM',
    endTime: '3:30 PM',
    room: 'Lab-2',
    teacher: 'Dr. Kavitha Rao',
    status: 'upcoming',
  },
];

const upcomingClasses = [
  {
    id: 'cls-004',
    subject: 'Java Programming',
    time: 'Mon, 9:00 AM',
    room: 'A-102',
    teacher: 'Prof. Anil Kumar',
  },
  {
    id: 'cls-005',
    subject: 'DAA',
    time: 'Mon, 11:00 AM',
    room: 'B-204',
    teacher: 'Dr. Suresh Pillai',
  },
];

export default function StudentTimetableWidget() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-600 text-foreground">Today&apos;s Schedule</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Friday, Aug 22, 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-success text-xs px-2.5 py-1 rounded-lg font-500">3 classes</span>
          <button className="text-xs text-primary hover:underline font-500">
            Full timetable →
          </button>
        </div>
      </div>

      {/* Today's classes */}
      <div className="space-y-3 mb-5">
        {todayClasses.map((cls) => (
          <div
            key={cls.id}
            className={`flex items-center gap-4 p-3.5 rounded-xl border-l-2 ${subjectColors[cls.subject] || 'border-l-muted bg-muted/20'} border border-border/50`}
          >
            <div className="text-center min-w-[52px]">
              <p className="text-xs font-700 text-foreground metric-value">{cls.time}</p>
              <p className="text-xs text-muted-foreground">{cls.endTime}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-600 text-foreground truncate">{cls.subject}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{cls.teacher}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs font-500 text-muted-foreground">{cls.room}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div>
        <p className="section-label mb-3">Coming Up</p>
        <div className="space-y-2">
          {upcomingClasses.map((cls) => (
            <div
              key={cls.id}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                <span className="text-sm text-foreground font-500">{cls.subject}</span>
                <span className="text-xs text-muted-foreground">{cls.teacher}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{cls.room}</span>
                <span className="badge-muted text-xs px-2 py-0.5 rounded-md font-500">
                  {cls.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
