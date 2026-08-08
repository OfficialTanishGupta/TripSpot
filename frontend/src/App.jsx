import { Routes, Route, Navigate } from "react-router-dom";
import { Sparkles, Heart, Gift } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import GatewayPage from "./pages/GatewayPage";
import DashboardPage from "./pages/DashboardPage";
import LedgerPage from "./pages/LedgerPage";
import SettingsPage from "./pages/SettingsPage";
import SupportPage from "./pages/SupportPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import ExplorePage from "./pages/ExplorePage";
import PriceAlertsPage from "./pages/PriceAlertsPage";
import "./theme.css";

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <GatewayPage />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/ledger"
        element={
          <RequireAuth>
            <LedgerPage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/support"
        element={
          <RequireAuth>
            <SupportPage />
          </RequireAuth>
        }
      />

      <Route
        path="/explore"
        element={
          <RequireAuth>
            <ExplorePage />
          </RequireAuth>
        }
      />
      <Route
        path="/insights"
        element={
          <RequireAuth>
            <ComingSoonPage
              icon={Sparkles}
              title="Trip Insights"
              description="A deeper look at your travel persona, spending patterns, and personalized recommendations."
              accentColor="#7C6FFF"
              accentBg="#EEECFF"
            />
          </RequireAuth>
        }
      />
      <Route
        path="/wishlist"
        element={
          <RequireAuth>
            <ComingSoonPage
              icon={Heart}
              title="Saved"
              description="Bookmark routes and fares you're eyeing, so you can jump back in without searching again."
              accentColor="#FB7185"
              accentBg="#FFE4E9"
            />
          </RequireAuth>
        }
      />
      <Route
        path="/alerts"
        element={
          <RequireAuth>
            <PriceAlertsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/offers"
        element={
          <RequireAuth>
            <ComingSoonPage
              icon={Gift}
              title="Offers & Rewards"
              description="Deals, cashback, and referral rewards for TripSpot travelers — coming soon."
              accentColor="#C026D3"
              accentBg="#FBEAFE"
            />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
