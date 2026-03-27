
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ArrowLeft, LogIn, Shield, CheckCircle, Sparkles, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 檢查是否已登入並正確導向
  useEffect(() => {
    const handleRedirect = async (userId: string) => {
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (storeData) navigate(`/store/${storeData.id}`);
      else navigate('/store/setup');
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) handleRedirect(session.user.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setFormData(prev => ({ ...prev, email: session.user!.email || prev.email }));
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  // 從 URL 預填電子郵件
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    if (email) setFormData(prev => ({ ...prev, email }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 即時驗證
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errors.email = '請輸入電子郵件';
        } else if (!emailRegex.test(value)) {
          errors.email = '請輸入有效的電子郵件格式';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = '請輸入密碼';
        } else {
          delete errors.password;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const isFormValid = () => {
    return formData.email && formData.password && 
           Object.keys(validationErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    setIsLoading(true);

    try {
      console.log("Attempting login with email:", formData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      console.log("Auth response:", { data, error });

      if (error) {
        console.error("Auth error:", error);
        throw error;
      }

      if (!data.user) {
        console.error("No user data received");
        throw new Error("登入失敗");
      }

      console.log("Fetching store data for user:", data.user.id);
      
      // 獲取店家資訊
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();

      console.log("Store data response:", { storeData, storeError });

      if (storeError) {
        console.error("Store data error:", storeError);
        throw storeError;
      }

      if (!storeData) {
        toast({
          title: "需要完成店家資料",
          description: "首次登入請建立您的店家資料",
        });
        navigate('/store/setup');
        return;
      }

      toast({
        title: "登入成功！",
        description: "歡迎回來",
      });

      // 導航到店家管理頁面
      navigate(`/store/${storeData.id}`);
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "登入失敗";
      if (error instanceof Error) {
        // 處理常見錯誤
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "電子郵件或密碼錯誤";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "請先驗證您的電子郵件";
        } else if (error.message.includes("找不到店家資訊")) {
          errorMessage = "找不到店家資訊";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "登入失敗",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-sage-light/20 via-white to-brand-sage/10">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-brand-sage/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-brand-sage-dark hover:bg-brand-sage/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
            
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-sage" />
              <span className="font-semibold text-brand-sage-dark">自己的評論</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-brand-sage" />
                </div>
                <CardTitle className="text-2xl text-brand-sage-dark">
                  歡迎回來！
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  登入您的店家帳號，繼續管理評論和提升業績
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">電子郵件</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`transition-all duration-200 ${
                      validationErrors.email ? 'border-red-500 focus:border-red-500' : 
                      formData.email && !validationErrors.email ? 'border-green-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                  {formData.email && !validationErrors.email && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>電子郵件格式正確！</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">密碼</label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="請輸入您的密碼"
                      className={`transition-all duration-200 pr-10 ${
                        validationErrors.password ? 'border-red-500 focus:border-red-500' : 
                        formData.password && !validationErrors.password ? 'border-green-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? 
                        <EyeOff className="h-4 w-4 text-gray-400" /> : 
                        <Eye className="h-4 w-4 text-gray-400" />
                      }
                    </Button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-sm text-red-500">{validationErrors.password}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-brand-sage to-brand-sage-dark text-white hover:from-brand-sage-dark hover:to-brand-sage shadow-lg"
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      登入中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      立即登入
                    </div>
                  )}
                </Button>
              </form>
              
              {/* 註冊連結 */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  還沒有帳號？
                  <Link 
                    to="/register" 
                    className="ml-1 text-brand-sage hover:text-brand-sage-dark font-medium transition-colors"
                  >
                    立即註冊
                  </Link>
                </p>
              </div>
              
              {/* 信任元素 */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>SSL 加密保護</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>安全登入驗證</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
