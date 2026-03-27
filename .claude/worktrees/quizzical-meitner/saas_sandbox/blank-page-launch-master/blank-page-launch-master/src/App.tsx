
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-skeleton";
import { initCSRFProtection } from "@/utils/csrf-protection";
import { AuthProvider } from "@/hooks/useAuth";

// 立即載入的核心頁面
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// 延遲載入的頁面
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const StoreProfile = lazy(() => import("./pages/StoreProfile"));
const StoreSetup = lazy(() => import("./pages/StoreSetup"));
const CreateStore = lazy(() => import("./pages/CreateStore"));
const GenerateReview = lazy(() => import("./pages/GenerateReview"));
const ScanQR = lazy(() => import("./pages/ScanQR"));
const StoreAnalytics = lazy(() => import("./pages/Analytics"));
const EnterpriseAnalytics = lazy(() => import("./pages/EnterpriseAnalytics"));
const TruthfulAnalytics = lazy(() => import("./pages/TruthfulAnalytics"));
const Pricing = lazy(() => import("./pages/Pricing"));

// 設計系統展示
const ColorPalette = lazy(() => import("./components/design/ColorPalette"));

// 延遲載入的管理員頁面
const AdminLayoutModern = lazy(() => import("./components/admin/AdminLayoutModern"));
const SimpleProtectedRoute = lazy(() => import("./components/auth/SimpleProtectedRoute"));
const EnterpriseAdminDashboard = lazy(() => import("./pages/admin/EnterpriseAdminDashboard"));
const StoreList = lazy(() => import("./pages/admin/StoreList"));
const AdminStoreView = lazy(() => import("./pages/admin/AdminStoreView"));
const EnterpriseReports = lazy(() => import("./pages/admin/EnterpriseReports"));
const SystemManagement = lazy(() => import("./pages/admin/SystemManagement"));
const SetupSuperAdmin = lazy(() => import("./pages/admin/SetupSuperAdmin"));

const queryClient = new QueryClient();

// 初始化 CSRF 防護
initCSRFProtection();

const App = () => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('全域錯誤捕獲:', { error, errorInfo });
    }}
  >
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<Index />} />
          <Route path="/register" element={
            <Suspense fallback={<LoadingSpinner text="載入註冊頁面..." />}>
              <Register />
            </Suspense>
          } />
          <Route path="/login" element={
            <Suspense fallback={<LoadingSpinner text="載入登入頁面..." />}>
              <Login />
            </Suspense>
          } />
          <Route path="/store/setup" element={
            <Suspense fallback={<LoadingSpinner text="載入店家設定..." />}>
              <StoreSetup />
            </Suspense>
          } />
          <Route path="/store/create" element={
            <Suspense fallback={<LoadingSpinner text="載入建立店家..." />}>
              <CreateStore />
            </Suspense>
          } />
          <Route path="/admin" element={
            <Suspense fallback={<LoadingSpinner text="載入管理員登入..." />}>
              <AdminLogin />
            </Suspense>
          } />
          <Route path="/scan" element={
            <Suspense fallback={<LoadingSpinner text="載入掃描功能..." />}>
              <ScanQR />
            </Suspense>
          } />
          <Route 
            path="/admin/*" 
            element={
              <Suspense fallback={<LoadingSpinner text="載入管理員介面..." />}>
                <SimpleProtectedRoute>
                  <AdminLayoutModern>
                    <Routes>
                      <Route path="dashboard" element={
                        <Suspense fallback={<LoadingSpinner text="載入儀表板..." />}>
                          <EnterpriseAdminDashboard />
                        </Suspense>
                      } />
                      <Route path="stores" element={
                        <Suspense fallback={<LoadingSpinner text="載入店家列表..." />}>
                          <StoreList />
                        </Suspense>
                      } />
                      <Route path="store/:storeId" element={
                        <Suspense fallback={<LoadingSpinner text="載入店家詳情..." />}>
                          <AdminStoreView />
                        </Suspense>
                      } />
                      <Route path="reports" element={
                        <Suspense fallback={<LoadingSpinner text="載入數據報表..." />}>
                          <EnterpriseReports />
                        </Suspense>
                      } />
                      <Route path="system" element={
                        <Suspense fallback={<LoadingSpinner text="載入系統管理..." />}>
                          <SystemManagement />
                        </Suspense>
                      } />
                      {/* 舊路由重定向 */}
                      <Route path="enterprise-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="advanced-stores" element={<Navigate to="/admin/stores" replace />} />
                      <Route path="enterprise-reports" element={<Navigate to="/admin/reports" replace />} />
                      <Route path="logs" element={<Navigate to="/admin/system" replace />} />
                      <Route path="permissions" element={<Navigate to="/admin/system" replace />} />
                      <Route path="settings" element={<Navigate to="/admin/system" replace />} />
                      <Route path="analytics" element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                  </AdminLayoutModern>
                </SimpleProtectedRoute>
              </Suspense>
            } 
          />
          <Route path="/store/:storeId" element={
            <Suspense fallback={<LoadingSpinner text="載入店家資料..." />}>
              <StoreProfile />
            </Suspense>
          } />
          <Route path="/store/:storeId/analytics" element={
            <Suspense fallback={<LoadingSpinner text="載入數據分析..." />}>
              <StoreAnalytics />
            </Suspense>
          } />
          <Route path="/store/:storeId/enterprise-analytics" element={
            <Suspense fallback={<LoadingSpinner text="載入企業級分析..." />}>
              <EnterpriseAnalytics />
            </Suspense>
          } />
          <Route path="/store/:storeId/truthful-analytics" element={
            <Suspense fallback={<LoadingSpinner text="載入真實性分析..." />}>
              <TruthfulAnalytics />
            </Suspense>
          } />
          <Route path="/:storeNumber/generate-review" element={
            <Suspense fallback={<LoadingSpinner text="載入評論生成..." />}>
              <GenerateReview />
            </Suspense>
          } />
          <Route path="/pricing" element={
            <Suspense fallback={<LoadingSpinner text="載入定價方案..." />}>
              <Pricing />
            </Suspense>
          } />
          <Route path="/design/colors" element={
            <Suspense fallback={<LoadingSpinner text="載入色彩系統..." />}>
              <ColorPalette />
            </Suspense>
          } />
          <Route path="/setup-super-admin" element={
            <Suspense fallback={<LoadingSpinner text="載入設定頁面..." />}>
              <SetupSuperAdmin />
            </Suspense>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
