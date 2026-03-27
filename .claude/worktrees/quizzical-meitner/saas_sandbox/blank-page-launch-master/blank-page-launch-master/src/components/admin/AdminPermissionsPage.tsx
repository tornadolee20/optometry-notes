import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

import { 
  Users, 
  Shield, 
  Search, 
  Plus,
  UserCheck,
  UserX,
  Crown,
  Key
} from "lucide-react";

interface UserRole {
  id: string;
  email: string;
  role: string;
  name?: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

const roleColors = {
  super_admin: "bg-red-500",
  admin: "bg-orange-500", 
  manager: "bg-blue-500",
  user: "bg-gray-500"
};

const roleNames = {
  super_admin: "超級管理員",
  admin: "管理員",
  manager: "經理",
  user: "一般用戶"
};

export default function AdminPermissionsPage() {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  // 模擬數據載入
  useEffect(() => {
    const mockUsers: UserRole[] = [
      {
        id: "1",
        email: "admin@test.com",
        role: "super_admin",
        name: "系統管理員",
        isActive: true,
        lastLogin: "2024-01-15T10:30:00Z",
        createdAt: "2024-01-01T00:00:00Z"
      },
      {
        id: "2", 
        email: "manager@test.com",
        role: "admin",
        name: "店家管理員",
        isActive: true,
        lastLogin: "2024-01-14T15:45:00Z",
        createdAt: "2024-01-05T00:00:00Z"
      },
      {
        id: "3",
        email: "user@test.com", 
        role: "manager",
        name: "店家經理",
        isActive: false,
        lastLogin: "2024-01-10T09:15:00Z",
        createdAt: "2024-01-10T00:00:00Z"
      }
    ];
    
    setTimeout(() => {
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: "權限已更新",
        description: `用戶權限已成功更改為 ${roleNames[newRole as keyof typeof roleNames]}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失敗",
        description: "權限更新時發生錯誤",
      });
    }
  };

  const handleStatusToggle = async (userId: string) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive: !user.isActive } : user
      ));
      
      toast({
        title: "狀態已更新", 
        description: "用戶狀態已成功變更",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失敗",
        description: "狀態更新時發生錯誤",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "從未登入";
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-accent rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-accent rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 標題區域 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">權限管理中心</h1>
          <p className="text-muted-foreground">
            管理用戶角色與系統存取權限
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加用戶
        </Button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">系統註冊用戶</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活躍用戶</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">當前活躍狀態</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">管理員數</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'super_admin' || u.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">系統管理員</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">權限等級</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">不同權限級別</p>
          </CardContent>
        </Card>
      </div>

      {/* 篩選和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            用戶權限管理
          </CardTitle>
          <CardDescription>
            查看和管理所有用戶的角色權限
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">搜索用戶</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="輸入郵箱或姓名搜索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">篩選角色</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有角色</SelectItem>
                  <SelectItem value="super_admin">超級管理員</SelectItem>
                  <SelectItem value="admin">管理員</SelectItem>
                  <SelectItem value="manager">經理</SelectItem>
                  <SelectItem value="user">一般用戶</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 用戶列表 */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full ${roleColors[user.role as keyof typeof roleColors]} flex items-center justify-center text-white font-bold text-sm`}>
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{user.name || "未設置姓名"}</h3>
                        <Badge 
                          variant={user.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {user.isActive ? "活躍" : "停用"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        最後登入: {formatDate(user.lastLogin)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Label className="text-xs text-muted-foreground">角色權限</Label>
                      <Select 
                        value={user.role} 
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super_admin">超級管理員</SelectItem>
                          <SelectItem value="admin">管理員</SelectItem>
                          <SelectItem value="manager">經理</SelectItem>
                          <SelectItem value="user">一般用戶</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`status-${user.id}`} className="text-xs">
                        {user.isActive ? "停用" : "啟用"}
                      </Label>
                      <Switch
                        id={`status-${user.id}`}
                        checked={user.isActive}
                        onCheckedChange={() => handleStatusToggle(user.id)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">沒有找到符合條件的用戶</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}