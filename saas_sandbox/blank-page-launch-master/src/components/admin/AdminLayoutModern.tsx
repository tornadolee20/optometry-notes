import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { SimpleAuthService } from "@/services/simpleAuthService";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminLayoutModernProps {
  children: React.ReactNode;
}

export default function AdminLayoutModern({ children }: AdminLayoutModernProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<{ email: string; name?: string; role?: string } | null>(null);

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const authResult = await SimpleAuthService.verifyAdminSession();
        if (authResult.success && authResult.user) {
          setAdminData({
            email: authResult.user.email,
            name: authResult.user.name || 'Admin User',
            role: authResult.user.role || 'super_admin'
          });
        } else {
          navigate("/admin/login");
          return;
        }
      } catch (error) {
        console.error('AdminLayoutModern init failed:', error);
        toast({ variant: "destructive", title: "初始化失敗", description: "管理員系統初始化時發生錯誤" });
        navigate("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };
    initializeAdmin();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-foreground">載入管理系統</h3>
            <p className="text-sm text-muted-foreground mt-1">驗證身份中...</p>
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
          {/* Top bar - clean & minimal */}
          <header className="sticky top-0 z-40 h-14 border-b border-border/60 bg-card/80 backdrop-blur-xl">
            <div className="flex h-full items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="flex-shrink-0 text-muted-foreground hover:text-foreground" />
                <div className="hidden md:flex items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(150,10%,55%)]" />
                    <Input 
                      placeholder="搜尋..."
                      className="w-64 h-8 pl-9 text-sm bg-card border border-[hsl(150,20%,85%)] focus:border-primary focus:bg-card rounded-lg placeholder:text-[hsl(150,10%,55%)]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full ring-2 ring-card" />
                </Button>
                
                <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-border/60">
                  <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {adminData?.email?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-medium text-foreground leading-none">{adminData?.name || 'Admin'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">超級管理員</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
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
