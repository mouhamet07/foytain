import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar />
      {/* Main content offset by sidebar width on desktop, top nav height on mobile */}
      <div className="md:pl-64 pt-14 md:pt-0">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
