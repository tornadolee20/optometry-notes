import { supabase } from "@/integrations/supabase/client";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string;
  permissions: string[];
  created_at: string;
  is_active: boolean;
}

export interface SimpleAuthResult {
  success: boolean;
  user?: AdminUser;
  error?: string;
}

export class SimpleAuthService {
  static async authenticateAdmin(email: string, password: string): Promise<SimpleAuthResult> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: this.getAuthErrorMessage(authError.message) };
      }

      if (!authData.user) {
        return { success: false, error: "認證失敗：無法取得用戶資訊" };
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'super_admin')
        .single();

      if (!roleData) {
        await supabase.auth.signOut();
        return { success: false, error: '權限不足：僅限超級管理員登入後台' };
      }

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email ?? email,
          role: 'super_admin',
          name: email.split('@')[0],
          permissions: ['admin'],
          created_at: authData.user.created_at,
          is_active: true
        }
      };
    } catch (error: unknown) {
      return { success: false, error: "登入過程發生錯誤，請稍後再試" };
    }
  }

  private static getAuthErrorMessage(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': '帳號或密碼錯誤',
      'Email not confirmed': '請先確認您的電子郵件',
      'Too many requests': '登入嘗試次數過多，請稍後再試',
      'User not found': '找不到此帳號',
      'Invalid email': '電子郵件格式不正確',
      'Weak password': '密碼強度不足',
    };
    return errorMap[errorMessage] || '登入失敗，請稍後再試';
  }

  static async verifyAdminSession(): Promise<SimpleAuthResult> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session?.user) {
        return { success: false, error: "未找到有效的登入 session" };
      }

      const user = sessionData.session.user;
      if (!user.email) {
        await supabase.auth.signOut();
        return { success: false, error: '找不到使用者 Email' };
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .single();

      if (!roleData) {
        await supabase.auth.signOut();
        return { success: false, error: '權限不足：僅限超級管理員' };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: 'super_admin',
          name: user.email.split('@')[0],
          permissions: ['admin'],
          created_at: user.created_at,
          is_active: true
        }
      };
    } catch (error: unknown) {
      return { success: false, error: "Session 驗證失敗" };
    }
  }

  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error: unknown) {
      await supabase.auth.signOut();
    }
  }
}
