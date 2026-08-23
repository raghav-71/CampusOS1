import AppLayout from '@/components/AppLayout';
import TeacherDashboardContent from './components/TeacherDashboardContent';

export default function TeacherDashboardPage() {
  return (
    <AppLayout role="teacher" activePath="/teacher-dashboard">
      <TeacherDashboardContent />
    </AppLayout>
  );
}
