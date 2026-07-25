import Sidebar from '../components/Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-ink">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8 max-md:p-4">{children}</main>
    </div>
  );
}
