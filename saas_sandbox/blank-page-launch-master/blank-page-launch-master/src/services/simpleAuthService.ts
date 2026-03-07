// 簡化的認證服務 - 繞過複雜的驗證邏輯
import { supabase } from "@/integrations/supabase/client";

export interface SimpleAuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export class SimpleAuthService {
  /**
   * 簡化的管理員登入 - 只做基本認證
   */
  static async authenticateAdmin(email: string, password: string): Promise<SimpleAuthResult> {
    try {
      console.log("🔐 開始簡化登入流程:", email);

      // 1. 基本的 Supabase 認證
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("❌ Supabase 認證失敗:", authError.message);
        return {
          success: false,
          error: this.getAuthErrorMessage(authError.message)
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: "認證失敗：無法取得用戶資訊"
        };
      }

      console.log("✅ Supabase 認證成功, User ID:", authData.user.id);

      // 檢查 user_roles 表中是否有 super_admin 角色
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'super_admin')
        .single();

      if (!roleData) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: '權限不足：僅限超級管理員登入後台'
        };
      }

      console.log("✅ 超級管理員登入成功:", { email, role: 'super_admin' });

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: 'super_admin',
          name: email.split('@')[0],
          permissions: ['admin'],
          created_at: authData.user.created_at,
          is_active: true
        }
      };

    } catch (error: any) {
      console.error("❌ 登入過程發生異常:", error);
      return {
        success: false,
        error: "登入過程發生錯誤，請稍後再試"
      };
    }
  }

  /**
   * 統一錯誤訊息處理
   */
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

  /**
   * 簡化的 session 驗證
   */
  static async verifyAdminSession(): Promise<SimpleAuthResult> {
    try {
      console.log("🔍 開始 session 驗證...");
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      console.log("📋 Session 數據:", { 
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        email: sessionData.session?.user?.email,
        error: sessionError 
      });

      if (sessionError || !sessionData.session?.user) {
        console.log("❌ Session 驗證失敗: 沒有有效的 session");
        return {
          success: false,
          error: "未找到有效的登入 session"
        };
      }

      const email = sessionData.session.user.email;
      if (!email) {
        await supabase.auth.signOut();
        return { success: false, error: '找不到使用者 Email' };
      }

      // 檢查 user_roles 表中的角色
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', sessionData.session.user.id)
        .eq('role', 'super_admin')
        .single();

      if (!roleData) {
        console.log('❌ 權限不足：非超級管理員');
        await supabase.auth.signOut();
        return { success: false, error: '權限不足：僅限超級管理員' };
      }

      const result = {
        success: true,
        user: {
          id: sessionData.session.user.id,
          email,
          role: 'super_admin',
          permissions: ['admin'],
          created_at: sessionData.session.user.created_at,
          is_active: true
        }
      };
      console.log('✅ Session 驗證成功（超級管理員）:', result.user);
      return result;

    } catch (error) {
      console.error("❌ 驗證管理員 session 時發生錯誤:", error);
      return {
        success: false,
        error: "Session 驗證失敗"
      };
    }
  }

  /**
   * 登出
   */
  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      console.log("✅ 登出成功");
    } catch (error) {
      console.error("登出過程發生錯誤:", error);
      await supabase.auth.signOut();
    }
  }
}