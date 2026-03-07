import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { SimpleAuthService } from "@/services/simpleAuthService";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutModernProps {
  children: React.ReactNode;
}

export default function AdminLayoutModern({ children }: AdminLayoutModernProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<{ email: string; name?: string; role?: string } | null>(null);
  const [systemStatus, setSystemStatus] = useState<'online' | 'warning' | 'error'>('online');

  // 獲取當前頁面標題
  const getPageTitle = () => {
    const path = location.pathname;
    const titleMap: Record<string, string> = {
      '/admin/dashboard': '儀表板',
      '/admin/stores': '店家管理',
      '/admin/reports': '數據報表',
      '/admin/system': '系統管理'
    };
    // Check for store detail page
    if (path.startsWith('/admin/store/')) return '店家詳情';
    return titleMap[path] || '管理後台';
  };

  const getPageDescription = () => {
    const path = location.pathname;
    const descMap: Record<string, string> = {
      '/admin/dashboard': '營運數據總覽與關鍵指標',
      '/admin/stores': '查看與管理所有店家',
      '/admin/reports': '數據分析與報表',
      '/admin/system': '日誌、設定與權限管理'
    };
    if (path.startsWith('/admin/store/')) return '查看店家詳細資訊';
    return descMap[path] || '管理控制台';
  };

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        console.log("🔧 AdminLayoutModern: 開始初始化管理員信息");
        const authResult = await SimpleAuthService.verifyAdminSession();
        
        if (authResult.success && authResult.user) {
          console.log("✅ AdminLayoutModern: 管理員驗證成功", authResult.user);
          setAdminData({
            email: authResult.user.email,
            name: authResult.user.name || 'Admin User',
            role: authResult.user.role || 'super_admin'
          });
          
          // 模擬系統狀態檢查
          setTimeout(() => {
            setSystemStatus('online');
          }, 1000);
        } else {
          console.log("❌ AdminLayoutModern: 管理員驗證失敗，重新導向");
          navigate("/admin");
          return;
        }
      } catch (error) {
        console.error('❌ AdminLayoutModern: 初始化失敗:', error);
        toast({
          variant: "destructive",
          title: "初始化失敗",
          description: "管理員系統初始化時發生錯誤"
        });
        navigate("/admin");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdmin();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20">
        <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-background/80 backdrop-blur-sm border shadow-lg">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/30 border-t-primary" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">正在啟動管理系統</h3>
            <p className="text-sm text-muted-foreground">驗證管理員身份中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar adminData={adminData} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* 頂部標題欄 - 調整為與內容區域一致的佈局 */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <SidebarTrigger className="flex-shrink-0" />
                
                {/* 頁面標題和描述 */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-foreground truncate">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm text-muted-foreground truncate">
                    {getPageDescription()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* 系統狀態指示器 */}
                <Badge 
                  variant={systemStatus === 'online' ? 'default' : 'destructive'}
                  className="text-xs hidden sm:inline-flex"
                >
                  {systemStatus === 'online' ? '系統正常' : '系統異常'}
                </Badge>

                {/* 搜索框 */}
                <div className="hidden lg:flex relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="搜索功能..."
                    className="pl-9 w-64 bg-accent/50 border-input"
                  />
                </div>

                {/* 通知和設定 */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="relative h-9 w-9">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* 主要內容區域 */}
          <main className="flex-1 overflow-auto">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
