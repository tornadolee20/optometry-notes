import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Store, Settings, TrendingUp,
  LogOut, Home, ChevronRight, BookOpen, Gift
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar, SidebarFooter, SidebarHeader
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SimpleAuthService } from "@/services/simpleAuthService";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "儀表板", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "店家管理", href: "/admin/stores", icon: Store },
  { title: "數據報表", href: "/admin/reports", icon: TrendingUp },
  { title: "推薦獎金", href: "/admin/referrals", icon: Gift },
  { title: "系統管理", href: "/admin/system", icon: Settings },
  { title: "操作手冊", href: "/admin/manual", icon: BookOpen },
];

interface AdminSidebarProps {
  adminData?: { email: string } | null;
}

export function AdminSidebar({ adminData }: AdminSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (href: string) => {
    if (href === "/admin/stores" && currentPath.startsWith("/admin/store")) return true;
    if (href === "/admin/system" && currentPath.startsWith("/admin/system")) return true;
    return currentPath === href;
  };

  const handleLogout = async () => {
    try {
      await SimpleAuthService.logout();
      toast({ title: "已安全登出" });
      navigate("/admin");
    } catch (error) {
      console.error("登出錯誤:", error);
      toast({ variant: "destructive", title: "登出失敗" });
    }
  };

  return (
    <Sidebar className={cn(
      "border-r-0",
      collapsed ? "w-[68px]" : "w-[260px]"
    )}>
      <div className="flex flex-col h-full bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]">
        {/* Brand */}
        <SidebarHeader className="p-5 pb-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/40b8add3-b8f5-4e78-8a90-9987bc19b773.png" 
              alt="Myownreviews Logo" 
              className="h-9 w-9 rounded-lg object-contain"
            />
            {!collapsed && (
              <div className="flex flex-col">
                <h1 className="text-[15px] font-bold tracking-tight text-white">Myownreviews</h1>
                <p className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em]">Admin</p>
              </div>
            )}
          </div>
        </SidebarHeader>

        {/* User info */}
        {!collapsed && adminData && (
          <div className="mx-4 mb-4 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center text-emerald-400 text-xs font-bold">
                {adminData.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/40 font-medium">管理員</p>
                <p className="text-xs text-white/70 truncate">{adminData.email}</p>
              </div>
            </div>
          </div>
        )}

        <SidebarContent className="px-3 flex-1">
          {/* Home */}
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all text-sm">
                    <Home className="h-4 w-4" />
                    {!collapsed && <span>返回首頁</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Divider */}
          <div className="mx-3 my-1 h-px bg-white/[0.06]" />

          {/* Navigation */}
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.2em] px-3 mb-1">
                管理選單
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {navigationItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="p-0">
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                            active
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                              : "text-white/50 hover:text-white/90 hover:bg-white/[0.06]"
                          )}
                        >
                          <item.icon className={cn("h-4 w-4 flex-shrink-0", active && "text-white")} />
                          {!collapsed && (
                            <>
                              <span className="flex-1">{item.title}</span>
                              {active && <ChevronRight className="h-3.5 w-3.5 text-white/60" />}
                            </>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 mt-auto">
          <div className="mx-1 mb-2 h-px bg-white/[0.06]" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors rounded-lg"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-sm">登出系統</span>}
          </Button>
          {!collapsed && (
            <p className="text-[10px] text-white/15 text-center mt-3 font-medium">v2.1</p>
          )}
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
