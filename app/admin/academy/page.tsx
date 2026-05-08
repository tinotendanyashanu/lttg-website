import AdminPageBanner from '@/components/admin/AdminPageBanner';
import AcademyManagerClient from '@/app/portal/employee/admin/academy/AcademyManagerClient';
import { getAdminCourses } from '@/lib/actions/portal-admin-academy';

export const metadata = { title: 'Academy | Admin' };

export default async function AdminAcademyPage() {
  let courses: any[] = [];

  try {
    const response = await getAdminCourses();
    courses = response?.courses ?? [];
  } catch {
    courses = [];
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="school"
        title="Academy Management"
        description="Create and manage courses, modules, lessons, and quizzes."
      />
      <AcademyManagerClient initialCourses={courses} />
    </div>
  );
}
