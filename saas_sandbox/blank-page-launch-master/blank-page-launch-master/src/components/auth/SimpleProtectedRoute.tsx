
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { SimpleAuthService } from "@/services/simpleAuthService";
import { Loader2 } from "lucide-react";

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const SimpleProtectedRoute = ({ 
  children, 
  fallbackPath = "/admin" 
}: SimpleProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        setIsLoading(true);
        console.log("🔍 SimpleProtectedRoute: 開始驗證訪問權限");

        // 使用簡化的 session 驗證
        const authResult = await SimpleAuthService.verifyAdminSession();
        
        if (authResult.success && authResult.user) {
          console.log("✅ SimpleProtectedRoute: 驗證成功", authResult.user);
          setIsAuthorized(true);
        } else {
          console.log("❌ SimpleProtectedRoute: 驗證失敗", authResult.error);
          setIsAuthorized(false);
        }

      } catch (error) {
        console.error("❌ SimpleProtectedRoute: 驗證過程發生錯誤", error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccess();
  }, []);

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">驗證權限中...</h3>
            <p className="text-sm text-gray-600">正在確認您的管理員身份</p>
          </div>
        </div>
      </div>
    );
  }

  // 權限驗證失敗 - 重新導向到登入頁
  if (!isAuthorized) {
    console.log("🚫 SimpleProtectedRoute: 權限不足，重新導向到登入頁");
    return <Navigate to={fallbackPath} replace />;
  }

  // 權限驗證成功 - 直接渲染受保護的內容
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
};

export default SimpleProtectedRoute;
