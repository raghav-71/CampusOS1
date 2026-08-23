const announcements = [
  {
    id: 'ann-001',
    title: 'DBMS Exam Rescheduled',
    body: 'The DBMS end-term exam has been moved to September 2nd. New room: Hall B.',
    priority: 'high',
    category: 'Exam',
    time: '2 hours ago',
    author: 'Admin Office',
    read: false,
  },
  {
    id: 'ann-002',
    title: 'Tech Fest Registration Open',
    body: 'TechFest 2026 registrations are now open. Last date: Aug 30th.',
    priority: 'medium',
    category: 'Event',
    time: '5 hours ago',
    author: 'Student Council',
    read: false,
  },
  {
    id: 'ann-003',
    title: 'Library Extended Hours',
    body: 'The library will remain open until 10 PM during exam season.',
    priority: 'low',
    category: 'General',
    time: 'Yesterday',
    author: 'Library Dept',
    read: true,
  },
  {
    id: 'ann-004',
    title: 'New OS Notes Uploaded',
    body: 'Dr. Priya Nair has uploaded Chapter 7 — Memory Management notes.',
    priority: 'low',
    category: 'Academic',
    time: 'Yesterday',
    author: 'Dr. Priya Nair',
    read: true,
  },
];

const priorityConfig = {
  high: { badge: 'badge-danger', label: 'Urgent', dot: 'bg-danger' },
  medium: { badge: 'badge-warning', label: 'Important', dot: 'bg-warning' },
  low: { badge: 'badge-muted', label: 'Info', dot: 'bg-muted-foreground' },
};

const categoryConfig: Record<string, string> = {
  Exam: 'badge-warning',
  Event: 'badge-violet',
  General: 'badge-muted',
  Academic: 'badge-cyan',
  Emergency: 'badge-danger',
};

export default function StudentAnnouncementsFeed() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-border h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-600 text-foreground">Announcements</h3>
          <p className="text-xs text-muted-foreground mt-0.5">4 unread</p>
        </div>
        <button className="text-xs text-primary hover:underline font-500">View all →</button>
      </div>

      <div className="space-y-3">
        {announcements.map((ann) => {
          const priority = priorityConfig[ann.priority as keyof typeof priorityConfig];
          return (
            <div
              key={ann.id}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:border-border ${
                !ann.read ? 'border-border bg-muted/30' : 'border-transparent bg-muted/10 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {!ann.read && <span className={`status-dot ${priority.dot} flex-shrink-0 mt-0.5`} />}
                  <span className={`text-xs px-2 py-0.5 rounded-md font-600 ${categoryConfig[ann.category] || 'badge-muted'}`}>
                    {ann.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-500 ${priority.badge}`}>
                    {priority.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{ann.time}</span>
              </div>
              <p className="text-sm font-600 text-foreground mb-0.5">{ann.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{ann.body}</p>
              <p className="text-xs text-muted-foreground mt-1.5">— {ann.author}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}