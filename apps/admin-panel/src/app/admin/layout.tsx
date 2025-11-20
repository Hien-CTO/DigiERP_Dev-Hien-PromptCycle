import ProtectedLayout from '@/components/layout/protected-layout';
import AdminLayout from '@/components/layout/admin-layout';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedLayout>
  );
}
