import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Search, Users } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface AdminUserWithRole {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean | null;
  role: AppRole;
}

const roleColors: Record<string, string> = { super_admin: 'destructive', admin: 'default', manager: 'secondary' };
const roleNames: Record<string, string> = { super_admin: '超級管理員', admin: '管理員', manager: '經理', store_owner: '店家', user: '一般用戶' };

export const PermissionsTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Query user_roles joined with users to get admin-level users
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role, users!inner(id, email, name, is_active)')
        .in('role', ['admin', 'super_admin', 'manager'] as AppRole[]);

      if (error) throw error;

      const mapped: AdminUserWithRole[] = (data || []).map((row) => {
        const u = row.users as unknown as { id: string; email: string; name: string | null; is_active: boolean | null };
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          is_active: u.is_active,
          role: row.role,
        };
      });

      setUsers(mapped);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally { setIsLoading(false); }
  };

  const handleRoleChange = async (userId: string, currentRole: AppRole, newRoleStr: string) => {
    const newRole = newRoleStr as AppRole;
    try {
      // Update the user_roles table instead of users.role
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('role', currentRole);

      if (error) throw error;
      toast({ title: '權限已更新' });
      loadUsers();
    } catch (error) {
      toast({ variant: 'destructive', title: '更新失敗' });
    }
  };

  const filteredUsers = users.filter(u =>
    !searchTerm || u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="搜尋用戶..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
      </div>

      <p className="text-xs text-muted-foreground">共 {filteredUsers.length} 位管理人員（資料來源：user_roles）</p>

      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <div key={`${user.id}-${user.role}`} className="flex items-center justify-between p-3.5 rounded-lg border border-border/50 hover:border-border hover:bg-accent/20 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm">
                {(user.name?.[0] || user.email[0]).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{user.name || '未設置'}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Badge variant={(roleColors[user.role] || 'secondary') as 'destructive' | 'default' | 'secondary'} className="text-[10px]">
                {roleNames[user.role] || user.role}
              </Badge>
              <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, user.role, v)}>
                <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">超級管理員</SelectItem>
                  <SelectItem value="admin">管理員</SelectItem>
                  <SelectItem value="manager">經理</SelectItem>
                  <SelectItem value="store_owner">店家</SelectItem>
                  <SelectItem value="user">一般用戶</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">沒有找到符合條件的用戶</p>
        </div>
      )}
    </div>
  );
};
