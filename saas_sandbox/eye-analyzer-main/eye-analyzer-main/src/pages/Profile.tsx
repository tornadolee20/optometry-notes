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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, User, Info, Building2, Shield } from 'lucide-react';
import { getRegionOptions, getCountryOptions, getTaiwanCityOptions, getProfessionalRoleOptions, getRegistrationCountryOptions } from '@/lib/regionOptions';
import { LanguageToggle } from '@/components/LanguageToggle';

const Profile = () => {
  const { user, profile, refreshProfile, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Form data for editable fields
  const [formData, setFormData] = useState({
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    clinicLineId: '',
    clinicWechatId: '',
    clinicEmail: '',
    clinicRegion: '',
    country: '',
    professionalRole: '',
  });

  // Read-only data
  const [readOnlyData, setReadOnlyData] = useState({
    optometristName: '',
    licenseNumber: '',
    twLicenseNumber: '',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        clinicName: profile.clinic_name || '',
        clinicAddress: profile.clinic_address || '',
        clinicPhone: profile.clinic_phone || '',
        clinicLineId: profile.clinic_line_id || '',
        clinicWechatId: profile.clinic_wechat_id || '',
        clinicEmail: profile.clinic_email || '',
        clinicRegion: profile.clinic_region || '',
        country: profile.country || '',
        professionalRole: profile.professional_role || '',
      });
      setReadOnlyData({
        optometristName: profile.optometrist_name || '',
        licenseNumber: profile.optometrist_license_number || '',
        twLicenseNumber: profile.optometrist_license_number || '',
      });
      
      // Determine country from region
      if (profile.country) {
        setSelectedCountry(profile.country === 'TW' ? 'tw' : profile.country.toLowerCase());
      } else if (profile.clinic_region?.startsWith('tw_')) {
        setSelectedCountry('tw');
      } else if (profile.clinic_region) {
        setSelectedCountry(profile.clinic_region);
      }
      
      setIsDataLoading(false);
    }
  }, [profile]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const tLocal = (tw: string, cn: string, en: string) => {
    if (language === 'en') return en;
    if (language === 'zh-CN') return cn;
    return tw;
  };

  // Validate phone format
  const validatePhone = (phone: string): boolean => {
    const pattern = /^[\d\-\+\(\)\s]{7,20}$/;
    return pattern.test(phone.trim());
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    if (!email) return true;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email.trim());
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.clinicName.trim() || formData.clinicName.trim().length < 2) {
      toast({
        title: tLocal('驗證錯誤', '验证错误', 'Validation Error'),
        description: tLocal('店名至少需要2個字元', '店名至少需要2个字符', 'Clinic name must be at least 2 characters'),
        variant: 'destructive',
      });
      return;
    }

    if (!formData.clinicAddress.trim() || formData.clinicAddress.trim().length < 5) {
      toast({
        title: tLocal('驗證錯誤', '验证错误', 'Validation Error'),
        description: tLocal('地址至少需要5個字元', '地址至少需要5个字符', 'Address must be at least 5 characters'),
        variant: 'destructive',
      });
      return;
    }

    if (!formData.clinicPhone.trim() || !validatePhone(formData.clinicPhone)) {
      toast({
        title: tLocal('驗證錯誤', '验证错误', 'Validation Error'),
        description: tLocal('請輸入有效的電話號碼', '请输入有效的电话号码', 'Please enter a valid phone number'),
        variant: 'destructive',
      });
      return;
    }

    // Validate professional role for non-TW countries
    if (formData.country && formData.country !== 'TW' && !formData.professionalRole) {
      toast({
        title: tLocal('驗證錯誤', '验证错误', 'Validation Error'),
        description: tLocal('請選擇專業身分', '请选择专业身份', 'Please select professional role'),
        variant: 'destructive',
      });
      return;
    }

    // For Taiwan, need either country or city selected
    const regionValid = formData.country === 'TW' 
      ? (selectedCountry && (selectedCountry !== 'tw' || formData.clinicRegion))
      : formData.clinicRegion || formData.country;

    if (!regionValid) {
      toast({
        title: tLocal('驗證錯誤', '验证错误', 'Validation Error'),
        description: tLocal('請選擇執業地區', '请选择执业地区', 'Please select your practice region'),
        variant: 'destructive',
      });
      return;
    }

    if (formData.clinicEmail && !validateEmail(formData.clinicEmail)) {
      toast({
        title: tLocal('驗證錯誤', '验证错误', 'Validation Error'),
        description: tLocal('請輸入有效的電子郵件', '请输入有效的电子邮件', 'Please enter a valid email address'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: any = {
        clinic_name: formData.clinicName.trim(),
        clinic_address: formData.clinicAddress.trim(),
        clinic_phone: formData.clinicPhone.trim(),
        clinic_line_id: formData.clinicLineId.trim() || null,
        clinic_wechat_id: formData.clinicWechatId.trim() || null,
        clinic_email: formData.clinicEmail.trim() || null,
        clinic_region: formData.clinicRegion || formData.country,
      };

      // Update professional role if changed (for non-TW)
      if (formData.professionalRole) {
        updateData.professional_role = formData.professionalRole;
      }

      // Update country if not set
      if (formData.country && !profile?.country) {
        updateData.country = formData.country;
      }

      const { error } = await supabase
        .from('optometrist_profiles')
        .update(updateData)
        .eq('user_id', user!.id);

      if (error) {
        throw error;
      }

      await refreshProfile();

      toast({
        title: tLocal('✓ 資料已成功更新', '✓ 资料已成功更新', '✓ Profile updated successfully'),
      });
    } catch (err: any) {
      console.error('Update error:', err);
      toast({
        title: tLocal('✗ 儲存失敗', '✗ 保存失败', '✗ Save failed'),
        description: tLocal('請稍後再試', '请稍后再试', 'Please try again later'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (authLoading || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const regionOptions = getRegionOptions(language);
  const countryOptions = getCountryOptions(language);
  const taiwanCityOptions = getTaiwanCityOptions();
  const registrationCountryOptions = getRegistrationCountryOptions(language);
  const professionalRoleOptions = getProfessionalRoleOptions(language, formData.country);

  // Get display text for professional role
  const getProfessionalRoleDisplay = (role: string) => {
    const option = professionalRoleOptions.find(opt => opt.value === role);
    return option?.label || role;
  };

  // Get display text for country
  const getCountryDisplay = (country: string) => {
    const option = registrationCountryOptions.find(opt => opt.value === country);
    return option?.label || country;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      {/* Header with back button and language toggle */}
      <div className="flex justify-between items-center max-w-lg mx-auto mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {tLocal('返回', '返回', 'Back')}
        </Button>
        <LanguageToggle />
      </div>
      
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <User className="h-6 w-6" />
            {tLocal('我的資料', '我的资料', 'My Profile')}
          </CardTitle>
          <CardDescription>
            {tLocal('管理您的執業資訊', '管理您的执业信息', 'Manage your practice information')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Section 1: Clinic Information (Editable) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Building2 className="h-5 w-5" />
              <h3 className="font-semibold">
                {tLocal('驗光所資訊', '视光中心信息', 'Clinic Information')}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {tLocal('此資訊將顯示在客戶的驗光報告中', '此信息将显示在客户的验光报告中', 'This information will be displayed on customer reports')}
            </p>
            
            {/* Clinic Name */}
            <div className="space-y-2">
              <Label htmlFor="clinicName">
                {tLocal('店名', '店名', 'Clinic Name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="clinicName"
                placeholder={tLocal('例如：自己的眼鏡', '例如：XX眼镜店', 'e.g., Own Glasses')}
                value={formData.clinicName}
                onChange={(e) => updateFormData('clinicName', e.target.value)}
              />
            </div>
            
            {/* Clinic Address */}
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
            
            {/* Clinic Phone */}
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
            
            {/* Region Selection */}
            {formData.country === 'TW' || (!formData.country && language === 'zh-TW') ? (
              <>
                <div className="space-y-2">
                  <Label>
                    {tLocal('執業國家/地區', '执业国家/地区', 'Country/Region')} <span className="text-destructive">*</span>
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
                      {countryOptions.map(opt => (
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
                        {taiwanCityOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
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
                    <SelectValue placeholder={tLocal('請選擇地區', '请选择地区', 'Select region')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border max-h-[300px]">
                    {regionOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {tLocal('您的地區資訊將幫助我們優化系統功能', '您的地区信息将帮助我们优化系统功能', 'Your region helps us optimize system features')}
                </p>
              </div>
            )}
            
            {/* LINE ID - Show for Taiwan */}
            {(formData.country === 'TW' || language === 'zh-TW' || selectedCountry === 'tw') && (
              <div className="space-y-2">
                <Label htmlFor="clinicLineId">
                  LINE ID {tLocal('（選填）', '（选填）', '(Optional)')}
                </Label>
                <Input
                  id="clinicLineId"
                  placeholder="@youreyes"
                  value={formData.clinicLineId}
                  onChange={(e) => updateFormData('clinicLineId', e.target.value)}
                />
              </div>
            )}
            
            {/* WeChat ID - Show for China */}
            {(formData.country === 'CN' || language === 'zh-CN') && (
              <div className="space-y-2">
                <Label htmlFor="clinicWechatId">
                  {tLocal('微信號（選填）', '微信号（选填）', 'WeChat ID (Optional)')}
                </Label>
                <Input
                  id="clinicWechatId"
                  placeholder="your_wechat_id"
                  value={formData.clinicWechatId}
                  onChange={(e) => updateFormData('clinicWechatId', e.target.value)}
                />
              </div>
            )}
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="clinicEmail">
                {tLocal('電子郵件', '电子邮件', 'Email')} {tLocal('（選填）', '（选填）', '(Optional)')}
              </Label>
              <Input
                id="clinicEmail"
                type="email"
                placeholder="clinic@example.com"
                value={formData.clinicEmail}
                onChange={(e) => updateFormData('clinicEmail', e.target.value)}
              />
            </div>
          </div>
          
          {/* Section 2: Optometrist Information (Read-only and editable) */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <User className="h-5 w-5" />
              <h3 className="font-semibold">
                {tLocal('驗光師資訊', '验光师信息', 'Optometrist Information')}
              </h3>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              {/* Name - Read only */}
              <p className="text-sm">
                <span className="text-muted-foreground">{tLocal('姓名', '姓名', 'Name')}：</span>
                <span className="font-medium">{readOnlyData.optometristName || '-'}</span>
              </p>
              
              {/* Country - Read only if set */}
              {formData.country && (
                <p className="text-sm">
                  <span className="text-muted-foreground">{tLocal('國家/地區', '国家/地区', 'Country/Region')}：</span>
                  <span className="font-medium">{getCountryDisplay(formData.country)}</span>
                </p>
              )}
              
              {/* Taiwan License - Read only */}
              {formData.country === 'TW' && readOnlyData.twLicenseNumber && (
                <p className="text-sm">
                  <span className="text-muted-foreground">{tLocal('執業執照號碼', '执业执照号码', 'License Number')}：</span>
                  <span className="font-medium">{readOnlyData.twLicenseNumber}</span>
                </p>
              )}
              
              {/* Professional Role - Editable for non-TW, Read-only display for TW */}
              {formData.country === 'TW' && formData.professionalRole && (
                <p className="text-sm">
                  <span className="text-muted-foreground">{tLocal('專業身分', '专业身份', 'Professional Role')}：</span>
                  <span className="font-medium">{getProfessionalRoleDisplay(formData.professionalRole)}</span>
                </p>
              )}
            </div>

            {/* Professional Role - Editable for non-TW countries */}
            {formData.country && formData.country !== 'TW' && (
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
            )}

            {/* Show notice for TW users without country set - need to set it */}
            {!formData.country && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2 text-primary">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">{tLocal('請補充國家資訊', '请补充国家信息', 'Please add country information')}</span>
                </div>
                
                <div className="space-y-2">
                  <Label>
                    {tLocal('國家/地區', '国家/地区', 'Country/Region')} <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.country}
                    onValueChange={(v) => {
                      updateFormData('country', v);
                      updateFormData('professionalRole', '');
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

                {formData.country && formData.country !== 'TW' && (
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
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {tLocal('姓名與執照號碼無法修改', '姓名与执照号码无法修改', 'Name and license number cannot be modified')}
            </p>
          </div>
          
          {/* Important Notice */}
          <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
              <strong>{tLocal('💡 重要提示', '💡 重要提示', '💡 Important Notice')}</strong>
              <br />
              {tLocal(
                '更改驗光所資訊後，只有新建立的客戶記錄會使用新資訊。已存在的客戶記錄保留當時的驗光所資訊，以確保歷史記錄的準確性。',
                '更改视光中心信息后，只有新建立的客户记录会使用新信息。已存在的客户记录保留当时的视光中心信息，以确保历史记录的准确性。',
                'After changing clinic information, only newly created customer records will use the new information. Existing customer records will retain the original information to ensure historical accuracy.'
              )}
            </AlertDescription>
          </Alert>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              {tLocal('取消', '取消', 'Cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {tLocal('儲存中...', '保存中...', 'Saving...')}
                </>
              ) : (
                tLocal('儲存變更', '保存更改', 'Save Changes')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;