
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 組件載入時測試 Supabase 連線
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('stores').select('count').limit(1);
        if (error) {
          toast({
            variant: "destructive",
            title: "連線錯誤",
            description: "無法連接到資料庫，請稍後再試",
          });
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "連線錯誤", 
          description: "無法連接到資料庫，請稍後再試",
        });
      }
    };
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    console.log("開始安全登入流程，嘗試登入帳號:", email);
    
    try {
      // 簡化登入驗證
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw new Error(error.message);
      }

      console.log("管理員驗證成功:", data.user);

      toast({
        title: "登入成功",
        description: `歡迎回來，${data.user?.email}！`,
      });
      
      navigate("/admin/dashboard");

    } catch (error: any) {
      console.error("登入過程發生錯誤:", error);
      toast({
        variant: "destructive",
        title: "登入失敗",
        description: error.message || "登入過程中發生錯誤",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Button
        variant="ghost"
        className="mb-8"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回首頁
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-gray-100 inline-block">
              <Shield className="w-6 h-6" />
            </div>
            <CardTitle>管理員登入</CardTitle>
            <CardDescription>請輸入管理員帳號密碼</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">帳號</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="輸入管理員信箱"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">密碼</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "登入中..." : "登入"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
