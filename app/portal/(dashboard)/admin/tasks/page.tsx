import { getAdminTasks } from '@/lib/actions/admin-tasks';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import TaskManagerClient from './TaskManagerClient';

export default async function AdminTasksPage() {
  const { tasks, staff } = await getAdminTasks();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="task_alt"
        title="Task Manager"
        description="Assign and track internal tasks across your team."
      />
      <TaskManagerClient initialTasks={tasks} staff={staff} />
    </div>
  );
}
