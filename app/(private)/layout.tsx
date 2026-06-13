import { ProtectedShell } from '@/components/console/protected-shell';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
