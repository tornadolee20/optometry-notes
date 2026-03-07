import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, Shield, Star, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
const Register = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    storeName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: ""
  });
  const totalSteps = 3;
  const progress = currentStep / totalSteps * 100;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 即時驗證
    validateField(name, value);
  };
  const validateField = (name: string, value: string) => {
    const errors = {
      ...validationErrors
    };
    switch (name) {
      case 'storeName':
        if (!value.trim()) {
          errors.storeName = '請輸入店家名稱';
        } else if (value.length < 2) {
          errors.storeName = '店家名稱至少需要2個字符';
        } else {
          delete errors.storeName;
        }
        break;
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
        } else if (value.length < 6) {
          errors.password = '密碼長度至少需要6個字符';
        } else if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
          errors.password = '密碼必須包含至少一個字母和一個數字';
        } else {
          delete errors.password;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = '請確認密碼';
        } else if (value !== formData.password) {
          errors.confirmPassword = '密碼不匹配';
        } else {
          delete errors.confirmPassword;
        }
        break;
      case 'phone':
        const phoneRegex = /^[0-9\-\s\+\(\)]+$/;
        if (!value) {
          errors.phone = '請輸入聯絡電話';
        } else if (!phoneRegex.test(value)) {
          errors.phone = '請輸入有效的電話號碼';
        } else {
          delete errors.phone;
        }
        break;
      case 'address':
        if (!value.trim()) {
          errors.address = '請輸入店家地址';
        } else if (value.length < 5) {
          errors.address = '請輸入完整的店家地址';
        } else {
          delete errors.address;
        }
        break;
    }
    setValidationErrors(errors);
  };
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.storeName && formData.email && !validationErrors.storeName && !validationErrors.email;
      case 2:
        return formData.password && formData.confirmPassword && !validationErrors.password && !validationErrors.confirmPassword;
      case 3:
        return formData.address && formData.phone && !validationErrors.address && !validationErrors.phone;
      default:
        return false;
    }
  };
  const handleNextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 如果已經在載入中，不要重複提交
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // 前端驗證密碼
      if (formData.password !== formData.confirmPassword) {
        toast({
          variant: "destructive",
          title: "密碼不匹配",
          description: "請確認兩次輸入的密碼一致"
        });
        setIsLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        toast({
          variant: "destructive",
          title: "密碼長度不足",
          description: "密碼長度必須至少為 6 個字符"
        });
        setIsLoading(false);
        return;
      }
      if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
        toast({
          variant: "destructive",
          title: "密碼強度不足",
          description: "密碼必須包含至少一個字母和一個數字"
        });
        setIsLoading(false);
        return;
      }

      // 註冊新用戶
      const {
        data: authData,
        error: authError
      }: any = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      if (authError) {
        const msg = (authError.message || '').toLowerCase();
        const status = (authError as any).status;
        const code = (authError as any).code;
        
        // 檢查密碼強度錯誤
        if (code === 'weak_password') {
          toast({
            variant: "destructive",
            title: '密碼安全性不足',
            description: '您的密碼可能已在數據洩露中被發現，或過於簡單。請選擇一個更複雜且獨特的密碼（建議包含大小寫字母、數字和特殊符號）。'
          });
          setIsLoading(false);
          return;
        }
        
        // 如果是 422 錯誤，先檢查是否真的已經在我們的 users 表中
        if (status === 422) {
          try {
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('email', formData.email)
              .single();
            
            if (existingUser) {
              // 真的已經註冊了
              toast({
                variant: "destructive",
                title: '此電子郵件已註冊',
                description: '請確認您的電子郵件是否正確，或使用其他電子郵件地址。'
              });
              setIsLoading(false);
              return;
            } else {
              // Auth 中有記錄但 users 表中沒有，可能是之前註冊失敗了
              // 讓用戶嘗試登入來完成註冊流程
              toast({
                variant: "destructive", 
                title: '註冊流程未完成',
                description: '此電子郵件的註冊流程未完成，請嘗試直接登入或聯繫客服。'
              });
              setIsLoading(false);
              return;
            }
          } catch (checkError) {
            // 查詢失敗，使用原來的錯誤處理
            toast({
              variant: "destructive",
              title: '此電子郵件已註冊',
              description: '請確認您的電子郵件是否正確，或使用其他電子郵件地址。'
            });
            setIsLoading(false);
            return;
          }
        }
        
        const alreadyExists = msg.includes('already registered') || msg.includes('user already exists');
        if (alreadyExists) {
          toast({
            variant: "destructive",
            title: '此電子郵件已註冊',
            description: '請確認您的電子郵件是否正確，或使用其他電子郵件地址。'
          });
          setIsLoading(false);
          return;
        }
        if (msg.includes('45 seconds')) {
          throw new Error('請等待 45 秒後再試');
        }
        throw authError;
      }
      if (!authData.user) throw new Error('註冊失敗');

      // 先創建用戶記錄在 users 表中
      const {
        error: userError
      } = await supabase.from('users').insert({
        id: authData.user.id,
        email: authData.user.email || formData.email,
        role: 'user',
        name: formData.storeName,
        is_active: true
      });
      if (userError) {
        // 如果創建用戶記錄失敗，退出用戶註冊
        await supabase.auth.signOut();
        throw userError;
      }

      // 創建店家資料
      const {
        data: storeData,
        error: storeError
      } = await supabase.from('stores').insert([{
        user_id: authData.user.id,
        store_name: formData.storeName,
        email: formData.email,
        address: formData.address,
        phone: formData.phone
      }]).select().single();
      if (storeError) {
        // 如果創建店家資料失敗，也要退出用戶註冊
        await supabase.auth.signOut();
        throw storeError;
      }
      toast({
        title: "註冊成功！",
        description: `您的店家編號為: ${storeData.store_number}`
      });

      // 註冊成功後導航到店家資訊管理頁面
      navigate(`/store/${storeData.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "註冊失敗",
        description: error instanceof Error ? error.message : "發生未知錯誤"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-brand-sage" />
              </div>
              <h3 className="text-xl font-semibold text-brand-sage-dark">歡迎加入評論助手！</h3>
              <p className="text-gray-600 mt-2">快速開始或填寫店家資訊</p>
            </div>


            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">店家名稱</label>
                <Input name="storeName" value={formData.storeName} onChange={handleChange} placeholder="例如：王家小館、美美髮廊" className={`transition-all duration-200 ${validationErrors.storeName ? 'border-red-500 focus:border-red-500' : formData.storeName && !validationErrors.storeName ? 'border-green-500' : ''}`} disabled={isLoading} />
                {validationErrors.storeName && <p className="text-sm text-red-500">{validationErrors.storeName}</p>}
                {formData.storeName && !validationErrors.storeName && <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>看起來不錯！</span>
                  </div>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">電子郵件</label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" className={`transition-all duration-200 ${validationErrors.email ? 'border-red-500 focus:border-red-500' : formData.email && !validationErrors.email ? 'border-green-500' : ''}`} disabled={isLoading} />
                {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
                {formData.email && !validationErrors.email && <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>電子郵件格式正確！</span>
                  </div>}
              </div>
            </div>
          </div>;
      case 2:
        return <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-brand-sage" />
              </div>
              <h3 className="text-xl font-semibold text-brand-sage-dark">設置安全密碼</h3>
              <p className="text-gray-600 mt-2">保護您的帳號安全</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">密碼</label>
                <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="請輸入至少6個字符" className={`transition-all duration-200 ${validationErrors.password ? 'border-red-500 focus:border-red-500' : formData.password && !validationErrors.password ? 'border-green-500' : ''}`} disabled={isLoading} />
                <div className="text-xs text-gray-500 mt-1">
                  <p>密碼要求：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>至少 6 個字符</li>
                    <li>包含至少一個字母（a-z 或 A-Z）</li>
                    <li>包含至少一個數字（0-9）</li>
                  </ul>
                </div>
                {validationErrors.password && <p className="text-sm text-red-500">{validationErrors.password}</p>}
                {formData.password && !validationErrors.password && <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>密碼強度良好！</span>
                  </div>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">確認密碼</label>
                <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="請再次輸入密碼" className={`transition-all duration-200 ${validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : formData.confirmPassword && !validationErrors.confirmPassword ? 'border-green-500' : ''}`} disabled={isLoading} />
                {validationErrors.confirmPassword && <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>}
                {formData.confirmPassword && !validationErrors.confirmPassword && <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>密碼匹配！</span>
                  </div>}
              </div>
            </div>
          </div>;
      case 3:
        return <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-brand-sage" />
              </div>
              <h3 className="text-xl font-semibold text-brand-sage-dark">完善店家資訊</h3>
              <p className="text-gray-600 mt-2">最後一步，讓客戶更容易找到您</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">店家地址</label>
                <Input name="address" value={formData.address} onChange={handleChange} placeholder="請輸入完整地址" className={`transition-all duration-200 ${validationErrors.address ? 'border-red-500 focus:border-red-500' : formData.address && !validationErrors.address ? 'border-green-500' : ''}`} disabled={isLoading} />
                {validationErrors.address && <p className="text-sm text-red-500">{validationErrors.address}</p>}
                {formData.address && !validationErrors.address && <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>地址資訊完整！</span>
                  </div>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">聯絡電話</label>
                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="例如：02-12345678" className={`transition-all duration-200 ${validationErrors.phone ? 'border-red-500 focus:border-red-500' : formData.phone && !validationErrors.phone ? 'border-green-500' : ''}`} disabled={isLoading} />
                {validationErrors.phone && <p className="text-sm text-red-500">{validationErrors.phone}</p>}
                {formData.phone && !validationErrors.phone && <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>聯絡方式完善！</span>
                  </div>}
              </div>
            </div>
          </div>;
      default:
        return null;
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-brand-sage-light/20 via-white to-brand-sage/10">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-brand-sage/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="text-brand-sage-dark hover:bg-brand-sage/10">
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
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="max-w-lg mx-auto">
          {/* 社交證明 */}
          <div className="text-center mb-8">
            
          </div>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-6">
              {/* 進度條 */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-sage-dark font-medium">註冊進度</span>
                  <span className="text-brand-sage">{currentStep}/{totalSteps}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <CardTitle className="text-2xl text-center text-brand-sage-dark">
                開始您的評論成長之旅
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                三個簡單步驟，讓更多客戶為您留下好評
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit}>
                {renderStepContent()}
                
                {/* 導航按鈕 */}
                <div className="flex gap-3 mt-8">
                  {currentStep > 1 && <Button type="button" variant="outline" onClick={handlePrevStep} className="flex-1 border-brand-sage/30 text-brand-sage-dark hover:bg-brand-sage/10" disabled={isLoading}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      上一步
                    </Button>}
                  
                  {currentStep < totalSteps ? <Button type="button" onClick={handleNextStep} disabled={!isStepValid(currentStep)} className={`${currentStep === 1 ? 'w-full' : 'flex-1'} bg-gradient-to-r from-brand-sage to-brand-sage-dark text-white hover:from-brand-sage-dark hover:to-brand-sage shadow-lg`}>
                      下一步
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button> : <Button type="submit" disabled={!isStepValid(currentStep) || isLoading} className="flex-1 bg-gradient-to-r from-brand-sage to-brand-sage-dark text-white hover:from-brand-sage-dark hover:to-brand-sage shadow-lg">
                      {isLoading ? <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          註冊中...
                        </div> : <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          完成註冊
                        </div>}
                    </Button>}
                </div>
              </form>
              
              {/* 信任元素 */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>SSL 加密保護</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>100% 安全合規</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>;
};
export default Register;