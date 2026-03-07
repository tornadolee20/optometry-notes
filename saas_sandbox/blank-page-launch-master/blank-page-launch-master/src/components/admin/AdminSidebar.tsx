import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Store, 
  Settings, 
  TrendingUp,
  LogOut,
  Home,
  Building2
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SimpleAuthService } from "@/services/simpleAuthService";
import { toast } from "@/hooks/use-toast";

interface NavigationItem {
  title: string;
  href: string;
  icon: any;
}

const navigationItems: NavigationItem[] = [
  { title: "儀表板", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "店家管理", href: "/admin/stores", icon: Store },
  { title: "數據報表", href: "/admin/reports", icon: TrendingUp },
  { title: "系統管理", href: "/admin/system", icon: Settings },
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
      toast({ title: "已安全登出", description: "您已成功登出管理系統" });
      navigate("/admin");
    } catch (error) {
      console.error("登出錯誤:", error);
      toast({ variant: "destructive", title: "登出失敗", description: "登出時發生錯誤" });
    }
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-72"}>
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-foreground">Review Quickly</h1>
              <p className="text-xs text-muted-foreground">管理後台</p>
            </div>
          )}
        </div>
        {!collapsed && adminData && (
          <div className="mt-3 p-2 bg-accent/50 rounded-md">
            <p className="text-xs text-muted-foreground">已登入</p>
            <p className="text-sm font-medium text-foreground truncate">{adminData.email}</p>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Home className="h-4 w-4" />
                  {!collapsed && <span>返回首頁</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
              管理選單
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={isActive(item.href) ? "bg-accent text-accent-foreground font-medium" : ""}
                  >
                    <Link to={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">登出系統</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
