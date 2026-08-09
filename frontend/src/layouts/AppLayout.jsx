import Sidebar from "../components/Sidebar";
import TravelAmbience from "../components/TravelAmbience";
import ChatWidget from "../components/ChatWidget";

export default function AppLayout({ children }) {
  return (
    <div className="relative flex min-h-screen bg-canvas">
      <TravelAmbience />
      <Sidebar />
      <main className="relative z-10 flex-1 min-w-0 p-8 max-md:p-4">
        {children}
      </main>
      <ChatWidget />
    </div>
  );
}
