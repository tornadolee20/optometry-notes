import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Language } from "@/lib/translations";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Records from "./pages/Records";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminResearchExport from "./pages/AdminResearchExport";
import AdminRoleManagement from "./pages/AdminRoleManagement";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminSubscriptionDetail from "./pages/AdminSubscriptionDetail";
import AdminPayments from "./pages/AdminPayments";
import Dashboard from "./pages/Dashboard";
import Subscription from "./pages/Subscription";
import Profile from "./pages/Profile";
import SubscriptionExpired from "./pages/SubscriptionExpired";
import AccountBlocked from "./pages/AccountBlocked";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  // Get persisted language from localStorage
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('bv_language');
    return (saved === 'zh-CN' || saved === 'zh-TW') ? saved : 'zh-TW';
  });

  // Persist language changes
  useEffect(() => {
    localStorage.setItem('bv_language', language);
  }, [language]);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider language={language} setLanguage={setLanguage}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/register" element={<Register />} />
                <Route 
                  path="/analyzer" 
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/records" 
                  element={
                    <ProtectedRoute>
                      <Records />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/privacy" 
                  element={
                    <ProtectedRoute>
                      <PrivacyPolicy />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/subscription" 
                  element={
                    <ProtectedRoute skipSubscriptionCheck>
                      <Subscription />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/subscription-expired" 
                  element={
                    <ProtectedRoute skipSubscriptionCheck>
                      <SubscriptionExpired />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/account-blocked" 
                  element={
                    <ProtectedRoute skipSubscriptionCheck>
                      <AccountBlocked />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/research-export" 
                  element={
                    <ProtectedRoute>
                      <AdminResearchExport />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/roles" 
                  element={
                    <ProtectedRoute>
                      <AdminRoleManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/announcements" 
                  element={
                    <ProtectedRoute>
                      <AdminAnnouncements />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/subscriptions" 
                  element={
                    <ProtectedRoute>
                      <AdminSubscriptions />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/subscriptions/:userId" 
                  element={
                    <ProtectedRoute>
                      <AdminSubscriptionDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/payments" 
                  element={
                    <ProtectedRoute>
                      <AdminPayments />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
