import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Activity, BarChart3, FileText } from 'lucide-react';
import { z } from 'zod';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Language } from '@/lib/translations';

const getEmailSchema = (lang: Language) => z.string().trim().email({ 
  message: lang === 'en' ? "Please enter a valid email" : lang === 'zh-CN' ? "请输入有效的电子邮件" : "請輸入有效的電子郵件" 
}).max(255);
const getPasswordSchema = (lang: Language) => z.string().min(8, { 
  message: lang === 'en' ? "Password must be at least 8 characters" : lang === 'zh-CN' ? "密码至少需要 8 个字符" : "密碼至少需要 8 個字元" 
});

const Auth = () => {
  const { user, profile, signIn, signUp, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in (wait until auth/profile is fully loaded)
  useEffect(() => {
    if (isLoading) return;

    if (user && profile) {
      navigate('/analyzer', { replace: true });
    } else if (user && !profile) {
      navigate('/auth/register', { replace: true });
    }
  }, [user, profile, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      getEmailSchema(language).parse(email);
      getPasswordSchema(language).parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: language === 'en' ? 'Input Error' : language === 'zh-TW' ? '輸入錯誤' : '输入错误',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: language === 'en' ? 'Login Failed' : language === 'zh-TW' ? '登入失敗' : '登录失败',
        description: error.message === 'Invalid login credentials' 
          ? (language === 'en' ? 'Invalid email or password' : language === 'zh-TW' ? '帳號或密碼錯誤' : '账号或密码错误')
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'en' ? 'Login Successful' : language === 'zh-TW' ? '登入成功' : '登录成功',
        description: language === 'en' ? 'Welcome back!' : language === 'zh-TW' ? '歡迎回來！' : '欢迎回来！',
      });
    }
    
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      getEmailSchema(language).parse(email);
      getPasswordSchema(language).parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: language === 'en' ? 'Input Error' : language === 'zh-TW' ? '輸入錯誤' : '输入错误',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
    }

    if (password !== confirmPassword) {
      toast({
        title: language === 'en' ? 'Password Mismatch' : language === 'zh-TW' ? '密碼不符' : '密码不符',
        description: language === 'en' ? 'Please make sure both passwords match' : language === 'zh-TW' ? '請確認兩次輸入的密碼相同' : '请确认两次输入的密码相同',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = await signUp(email, password);
    
    if (error) {
      let errorMessage = error.message;
      if (error.message.includes('already registered')) {
        errorMessage = language === 'en' 
          ? 'This email is already registered. Please use a different email or log in.'
          : language === 'zh-TW' 
          ? '此電子郵件已被註冊，請使用其他信箱或直接登入' 
          : '此电子邮件已被注册，请使用其他邮箱或直接登录';
      }
      toast({
        title: language === 'en' ? 'Registration Failed' : language === 'zh-TW' ? '註冊失敗' : '注册失败',
        description: errorMessage,
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'en' ? 'Account Created' : language === 'zh-TW' ? '帳號建立成功' : '账号建立成功',
        description: language === 'en' ? 'Please complete your optometrist profile.' : language === 'zh-TW' ? '請繼續完成驗光師資料填寫' : '请继续完成验光师资料填写',
      });
      navigate('/auth/register', { replace: true });
    }
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 text-white">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            MYWONVISION
          </h1>
          <p className="text-lg text-blue-100 mb-2">
            Binocular Vision Analysis System
          </p>
          <p className="text-sm text-blue-200/80 mb-8">
            {language === 'en' ? 'From Taiwan, Built for Global Optometrists' : language === 'zh-TW' ? '源自台灣，為全球驗光師打造' : '源自台湾，为全球验光师打造'}
          </p>
          
          {/* Feature highlights */}
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">
                  {language === 'en' ? 'Smart Analysis' : language === 'zh-TW' ? '智能分析' : '智能分析'}
                </p>
                <p className="text-sm text-blue-200">
                  {language === 'en' ? 'AI-powered binocular vision insights' : language === 'zh-TW' ? 'AI 驅動的雙眼視覺洞察' : 'AI 驱动的双眼视觉洞察'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">
                  {language === 'en' ? 'Professional Reports' : language === 'zh-TW' ? '專業報告' : '专业报告'}
                </p>
                <p className="text-sm text-blue-200">
                  {language === 'en' ? 'Patient-friendly visual reports' : language === 'zh-TW' ? '患者友善的視覺報告' : '患者友善的视觉报告'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">
                  {language === 'en' ? 'Track Progress' : language === 'zh-TW' ? '追蹤進度' : '追踪进度'}
                </p>
                <p className="text-sm text-blue-200">
                  {language === 'en' ? 'Monitor patient improvements over time' : language === 'zh-TW' ? '追蹤患者改善狀況' : '追踪患者改善状况'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-4 relative">
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>
        
        {/* Mobile Branding (visible on mobile only) */}
        <div className="lg:hidden text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">MYWONVISION</h1>
          <p className="text-sm text-muted-foreground mt-1">Binocular Vision Analysis System</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
            {language === 'en' ? 'From Taiwan, Built for Global Optometrists' : language === 'zh-TW' ? '源自台灣，為全球驗光師打造' : '源自台湾，为全球验光师打造'}
          </p>
        </div>

        {/* Desktop heading (visible on desktop only) */}
        <div className="hidden lg:block text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {language === 'en' ? 'Welcome Back' : language === 'zh-TW' ? '歡迎回來' : '欢迎回来'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'en' 
              ? 'Sign in to access your analysis dashboard' 
              : language === 'zh-TW' 
              ? '登入以存取您的分析儀表板' 
              : '登录以访问您的分析仪表板'}
          </p>
        </div>

        {/* Product Description - Mobile only */}
        <p className="lg:hidden text-sm text-muted-foreground text-center mb-4 max-w-md px-4">
          {language === 'en' 
            ? 'Turn binocular vision measurements into clear, patient‑friendly reports.' 
            : language === 'zh-TW' 
            ? '把雙眼視覺數據，變成顧客一看就懂的專業報告。' 
            : '把双眼视觉数据，变成顾客一看就懂的专业报告。'}
        </p>
      
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=inactive]:font-normal"
              >
                {language === 'en' ? 'Login' : language === 'zh-TW' ? '登入' : '登录'}
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=inactive]:font-normal"
              >
                {language === 'en' ? 'Register' : language === 'zh-TW' ? '註冊' : '注册'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">
                    {language === 'en' ? 'Email' : language === 'zh-TW' ? '電子郵件' : '电子邮件'}
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">
                    {language === 'en' ? 'Password' : language === 'zh-TW' ? '密碼' : '密码'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {language === 'en' ? 'Login' : language === 'zh-TW' ? '登入' : '登录'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">
                    {language === 'en' ? 'Email' : language === 'zh-TW' ? '電子郵件' : '电子邮件'} *
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">
                    {language === 'en' ? 'Password (min. 8 characters)' : language === 'zh-TW' ? '密碼（至少 8 位）' : '密码（至少 8 位）'} *
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">
                    {language === 'en' ? 'Confirm Password' : language === 'zh-TW' ? '確認密碼' : '确认密码'} *
                  </Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {language === 'en' ? 'Create Account' : language === 'zh-TW' ? '建立帳號' : '创建账号'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Auth;
