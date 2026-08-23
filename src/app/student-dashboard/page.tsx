import AppLayout from '@/components/AppLayout';
import StudentDashboardContent from './components/StudentDashboardContent';

export default function StudentDashboardPage() {
  return (
    <AppLayout role="student" activePath="/student-dashboard">
      <StudentDashboardContent />
    </AppLayout>
  );
}