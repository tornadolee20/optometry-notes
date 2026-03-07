import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Info, CheckCircle2, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { getRegionOptions, getCountryOptions, getTaiwanCityOptions, getProfessionalRoleOptions, getRegistrationCountryOptions } from '@/lib/regionOptions';
import { LanguageToggle } from '@/components/LanguageToggle';
import { PrivacyConsentStep, CURRENT_PRIVACY_VERSION } from '@/components/PrivacyConsentStep';

const Register = () => {
  const { user, profile, refreshProfile, isLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingLicense, setIsCheckingLicense] = useState(false);
  const [licenseError, setLicenseError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Privacy consent state
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [researchConsent, setResearchConsent] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    optometristName: '',
    professionalRole: '',
    twLicenseNumber: '',
    yearsOfExperience: '',
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    clinicLineId: '',
    clinicWechatId: '',
    clinicEmail: '',
    clinicRegion: '',
    country: '',
  });

  // Set default country based on language
  useEffect(() => {
    if (!formData.country) {
      if (language === 'zh-TW') {
        setFormData(prev => ({ ...prev, country: 'TW' }));
        setSelectedCountry('tw');
      } else if (language === 'zh-CN') {
        setFormData(prev => ({ ...prev, country: 'CN' }));
      }
    }
  }, [language]);

  // Redirect if no user or already has profile
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth', { replace: true });
    } else if (!isLoading && profile) {
      navigate('/analyzer', { replace: true });
    }
  }, [user, profile, isLoading, navigate]);

  // Pre-fill email from user
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, clinicEmail: user.email || '' }));
    }
  }, [user]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'twLicenseNumber') {
      setLicenseError('');
    }
  };

  const tLocal = (tw: string, cn: string, en: string) => {
    if (language === 'en') return en;
    if (language === 'zh-CN') return cn;
    return tw;
  };

  // Validate Taiwan license number format: 驗師字第XXXXXX號
  const validateTaiwanLicenseNumber = (licenseNumber: string): { valid: boolean; error: string } => {
    const trimmed = licenseNumber.trim();
    if (!trimmed) {
      return { 
        valid: false, 
        error: tLocal('請輸入驗光師執照字號', '请输入验光师执照字号', 'Please enter your optometrist license number') 
      };
    }
    const licenseRegex = /^驗師字第\d{6}號$/;
    if (!licenseRegex.test(trimmed)) {
      return { 
        valid: false, 
        error: tLocal('請輸入正確格式，例如：驗師字第004226號', '请输入正确格式，例如：验师字第004226号', 'Please enter correct format, e.g., 驗師字第004226號') 
      };
    }
    return { valid: true, error: '' };
  };

  // Check license uniqueness
  const checkLicenseUnique = async (license: string): Promise<boolean> => {
    setIsCheckingLicense(true);
    try {
      const { data, error } = await supabase.rpc('check_license_unique', { 
        license_number: license.trim() 
      });
      
      if (error) {
        console.error('Error checking license:', error);
        return true;
      }
      
      return data as boolean;
    } catch (err) {
      console.error('Error in checkLicenseUnique:', err);
      return true;
    } finally {
      setIsCheckingLicense(false);
    }
  };

  const handleStep1Next = async () => {
    const country = formData.country;

    // Validate name for all
    if (!formData.optometristName.trim()) {
      toast({
        title: tLocal('請填寫必填欄位', '请填写必填栏位', 'Please fill in required fields'),
        description: tLocal('姓名為必填', '姓名为必填', 'Name is required'),
        variant: 'destructive',
      });
      return;
    }

    // Taiwan: require license number with format validation
    if (country === 'TW') {
      const licenseValidation = validateTaiwanLicenseNumber(formData.twLicenseNumber);
      if (!licenseValidation.valid) {
        setLicenseError(licenseValidation.error);
        toast({
          title: tLocal('請填寫必填欄位', '请填写必填栏位', 'Please fill in required fields'),
          description: licenseValidation.error,
          variant: 'destructive',
        });
        return;
      }

      const isUnique = await checkLicenseUnique(formData.twLicenseNumber);
      if (!isUnique) {
        setLicenseError(tLocal('此執照號碼已被註冊', '此执照号码已被注册', 'This license number is already registered'));
        return;
      }

      if (!formData.professionalRole) {
        toast({
          title: tLocal('請填寫必填欄位', '请填写必填栏位', 'Please fill in required fields'),
          description: tLocal('專業身分為必填', '专业身份为必填', 'Professional role is required'),
          variant: 'destructive',
        });
        return;
      }
    } else {
      // CN and others: require professional role
      if (!formData.professionalRole) {
        toast({
          title: tLocal('請填寫必填欄位', '请填写必填栏位', 'Please fill in required fields'),
          description: tLocal('專業身分為必填', '专业身份为必填', 'Professional role is required'),
          variant: 'destructive',
        });
        return;
      }
    }

    setStep(2);
  };

  const handleStep2Next = () => {
    if (!privacyAgreed) {
      toast({
        title: tLocal('請同意隱私政策', '请同意隐私政策', 'Please agree to privacy policy'),
        description: tLocal('您必須閱讀並同意隱私政策才能繼續', '您必须阅读并同意隐私政策才能继续', 'You must read and agree to the privacy policy to continue'),
        variant: 'destructive',
      });
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    // Validate step 3 fields
    const country = formData.country;
    const regionValid = country === 'TW' 
      ? (selectedCountry && (selectedCountry !== 'tw' || formData.clinicRegion))
      : formData.clinicRegion || country;
      
    if (!formData.clinicName || !formData.clinicAddress || !formData.clinicPhone || !regionValid) {
      toast({
        title: tLocal('請填寫必填欄位', '请填写必填栏位', 'Please fill in required fields'),
        description: tLocal('店名、地址、電話與執業地區為必填', '店名、地址、电话与执业地区为必填', 'Clinic name, address, phone, and region are required'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('optometrist_profiles').insert({
        user_id: user!.id,
        optometrist_name: formData.optometristName.trim(),
        professional_type: null,
        optometrist_license_number: formData.country === 'TW' ? formData.twLicenseNumber.trim() : null,
        years_of_experience: formData.yearsOfExperience || null,
        clinic_name: formData.clinicName.trim(),
        clinic_address: formData.clinicAddress.trim(),
        clinic_phone: formData.clinicPhone.trim(),
        clinic_line_id: formData.clinicLineId.trim() || null,
        clinic_wechat_id: formData.clinicWechatId.trim() || null,
        clinic_email: formData.clinicEmail.trim() || null,
        clinic_region: formData.clinicRegion || formData.country,
        registration_language: language,
        privacy_agreed_at: new Date().toISOString(),
        privacy_version: CURRENT_PRIVACY_VERSION,
        research_consent: researchConsent,
        country: formData.country,
        professional_role: formData.professionalRole,
      } as any);

      if (error) {
        throw error;
      }

      // Also create default user role
      await supabase.from('user_roles').insert({
        user_id: user!.id,
        role: 'user',
      });

      await refreshProfile();

      toast({
        title: tLocal('註冊完成', '注册完成', 'Registration complete'),
        description: tLocal('歡迎使用 MYOWN Vision！', '欢迎使用 MYOWN Vision！', 'Welcome to MYOWN Vision!'),
      });

      navigate('/analyzer', { replace: true });
    } catch (err: any) {
      console.error('Registration error:', err);
      toast({
        title: tLocal('註冊失敗', '注册失败', 'Registration failed'),
        description: err.message || tLocal('請稍後再試', '请稍后再试', 'Please try again later'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const regionOptions = getRegionOptions(language);
  const registrationCountryOptions = getRegistrationCountryOptions(language);
  const professionalRoleOptions = getProfessionalRoleOptions(language, formData.country);

  const getStepTitle = () => {
    switch (step) {
      case 1: return tLocal('身分驗證', '身份验证', 'Identity Verification');
      case 2: return tLocal('隱私政策', '隐私政策', 'Privacy Policy');
      case 3: return tLocal('驗光所資訊', '视光中心信息', 'Clinic Information');
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {tLocal('完成驗光師資料', '完成验光师资料', 'Complete Your Profile')}
          </CardTitle>
          <CardDescription>
            {tLocal(`步驟 ${step}/3：${getStepTitle()}`, `步骤 ${step}/3：${getStepTitle()}`, `Step ${step}/3: ${getStepTitle()}`)}
          </CardDescription>
          
          {/* Progress indicator - 3 steps */}
          <div className="flex gap-2 mt-4 justify-center">
            <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-12 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Step 1: Identity Verification */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Country Selection */}
              <div className="space-y-2">
                <Label>
                  {tLocal('國家/地區', '国家/地区', 'Country/Region')} <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(v) => {
                    updateFormData('country', v);
                    updateFormData('professionalRole', '');
                    updateFormData('twLicenseNumber', '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tLocal('請選擇國家/地區', '请选择国家/地区', 'Select country/region')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    {registrationCountryOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Professional Role */}
              <div className="space-y-2">
                <Label>
                  {tLocal('專業身分', '专业身份', 'Professional Role')} <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={formData.professionalRole} 
                  onValueChange={(v) => updateFormData('professionalRole', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tLocal('請選擇', '请选择', 'Select')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    {professionalRoleOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Taiwan License Number - Only for TW */}
              {formData.country === 'TW' && (
                <div className="space-y-2">
                  <Label htmlFor="twLicense">
                    {tLocal('驗光師執照字號', '验光师执照字号', 'Optometrist License Number')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="twLicense"
                    placeholder={tLocal('驗師字第004226號', '验师字第004226号', '驗師字第004226號')}
                    value={formData.twLicenseNumber}
                    onChange={(e) => updateFormData('twLicenseNumber', e.target.value)}
                    maxLength={20}
                    className={licenseError ? 'border-destructive' : ''}
                  />
                  {isCheckingLicense && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {tLocal('檢查執照號碼中...', '检查执照号码中...', 'Checking license...')}
                    </p>
                  )}
                  {licenseError && (
                    <p className="text-sm text-destructive">{licenseError}</p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {tLocal('此資訊僅供身份驗證使用，不會公開顯示', '此信息仅供身份验证使用，不会公开显示', 'This information is for identity verification only and will not be publicly displayed')}
                  </p>
                </div>
              )}
              
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  {tLocal('姓名', '姓名', 'Name')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={tLocal('例如：王小明', '例如：张三', 'e.g., John Smith')}
                  value={formData.optometristName}
                  onChange={(e) => updateFormData('optometristName', e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleStep1Next} 
                className="w-full mt-4"
                disabled={isCheckingLicense}
              >
                {isCheckingLicense ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {tLocal('下一步', '下一步', 'Next')}
              </Button>
            </div>
          )}

          {/* Step 2: Privacy Policy Consent */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Shield className="h-5 w-5" />
                <h3 className="font-semibold">
                  {tLocal('資料與隱私說明', '数据与隐私说明', 'Data & Privacy')}
                </h3>
              </div>
              
              <PrivacyConsentStep
                privacyAgreed={privacyAgreed}
                researchConsent={researchConsent}
                onPrivacyAgreedChange={setPrivacyAgreed}
                onResearchConsentChange={setResearchConsent}
              />
              
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {tLocal('上一步', '上一步', 'Back')}
                </Button>
                <Button 
                  onClick={handleStep2Next} 
                  className="flex-1"
                  disabled={!privacyAgreed}
                >
                  {tLocal('我同意並繼續', '我同意并继续', 'I agree & continue')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 3: Clinic Information */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">
                  {tLocal('店名', '店名', 'Clinic Name')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clinicName"
                  placeholder={tLocal('例如：自己的眼鏡', '例如：XX眼镜店', 'e.g., Eye Care Clinic')}
                  value={formData.clinicName}
                  onChange={(e) => updateFormData('clinicName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinicAddress">
                  {tLocal('驗光所地址', '地址', 'Address')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clinicAddress"
                  placeholder={tLocal('新北市板橋區文化路一段123號', '广东省广州市天河区XX路XX号', '123 Main St, City')}
                  value={formData.clinicAddress}
                  onChange={(e) => updateFormData('clinicAddress', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinicPhone">
                  {tLocal('連絡電話', '联系电话', 'Phone')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clinicPhone"
                  placeholder={tLocal('02-1234-5678', '020-1234-5678', '123-456-7890')}
                  value={formData.clinicPhone}
                  onChange={(e) => updateFormData('clinicPhone', e.target.value)}
                />
              </div>
              
              {formData.country === 'TW' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      {tLocal('執業地區', '执业地区', 'Practice Region')} <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={selectedCountry} 
                      onValueChange={(v) => {
                        setSelectedCountry(v);
                        if (v !== 'tw') {
                          updateFormData('clinicRegion', v);
                        } else {
                          updateFormData('clinicRegion', '');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={tLocal('請選擇國家/地區', '请选择国家/地区', 'Select country/region')} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border">
                        {getCountryOptions(language).map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedCountry === 'tw' && (
                    <div className="space-y-2">
                      <Label>
                        {tLocal('縣市', '县市', 'City/County')} <span className="text-destructive">*</span>
                      </Label>
                      <Select 
                        value={formData.clinicRegion} 
                        onValueChange={(v) => updateFormData('clinicRegion', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={tLocal('請選擇縣市', '请选择县市', 'Select city/county')} />
                        </SelectTrigger>
                        <SelectContent className="bg-background border max-h-[300px]">
                          {getTaiwanCityOptions().map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {tLocal('您的地區資訊將幫助我們優化系統功能', '您的地区信息将帮助我们优化系统功能', 'Your region helps us optimize system features')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>
                    {tLocal('執業地區', '执业地区', 'Practice Region')} <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.clinicRegion} 
                    onValueChange={(v) => updateFormData('clinicRegion', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tLocal('請選擇', '请选择', 'Select')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border max-h-[300px]">
                      {regionOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {tLocal('您的地區資訊將幫助我們優化系統功能', '您的地区信息将帮助我们优化系统功能', 'Your region helps us optimize system features')}
                  </p>
                </div>
              )}
              
              {(formData.country === 'TW' || language === 'zh-TW') && (
                <div className="space-y-2">
                  <Label htmlFor="clinicLine">LINE ID {tLocal('（選填）', '（选填）', '(Optional)')}</Label>
                  <Input
                    id="clinicLine"
                    placeholder="@youreyes"
                    value={formData.clinicLineId}
                    onChange={(e) => updateFormData('clinicLineId', e.target.value)}
                  />
                </div>
              )}
              
              {(formData.country === 'CN' || language === 'zh-CN') && (
                <div className="space-y-2">
                  <Label htmlFor="clinicWechat">{tLocal('微信（選填）', '微信（选填）', 'WeChat (Optional)')}</Label>
                  <Input
                    id="clinicWechat"
                    placeholder={tLocal('微信號', '微信号', 'WeChat ID')}
                    value={formData.clinicWechatId}
                    onChange={(e) => updateFormData('clinicWechatId', e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="clinicEmail">
                  {tLocal('電子郵件（選填）', '电子邮件（选填）', 'Email (Optional)')}
                </Label>
                <Input
                  id="clinicEmail"
                  type="email"
                  value={formData.clinicEmail}
                  onChange={(e) => updateFormData('clinicEmail', e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {tLocal('上一步', '上一步', 'Back')}
                </Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  {tLocal('完成註冊', '完成注册', 'Complete Registration')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;