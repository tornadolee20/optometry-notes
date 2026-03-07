
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const INDUSTRIES = [
  { value: 'restaurant', label: '餐飲業' },
  { value: 'retail', label: '零售業' },
  { value: 'education', label: '教育業' },
  { value: 'beauty', label: '美容美髮' },
  { value: 'healthcare', label: '醫療保健' },
  { value: 'automotive', label: '汽車維修' },
  { value: 'real_estate', label: '房地產' },
  { value: 'technology', label: '科技業' },
  { value: 'consulting', label: '顧問服務' },
  { value: 'other', label: '其他' }
];

export const SetupStore: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    industry: '',
    google_review_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "需要登入",
        description: "請先登入後再建立店家",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('🏪 Creating store with data:', formData);

    try {
      const { data: store, error } = await supabase
        .from('stores')
        .insert({
          ...formData,
          user_id: user.id,
          status: 'active' // 🔑 關鍵：設為 active 觸發 7 天試用
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Store creation failed:', error);
        throw error;
      }

      console.log('✅ Store created successfully:', store);

      toast({
        title: "店家建立成功！",
        description: "您的 7 天免費試用已開始，現在可以開始使用所有功能。",
      });

      // 導向店家管理頁面
      navigate(`/store/${store.id}`);

    } catch (error: any) {
      console.error('💥 Store setup failed:', error);
      toast({
        title: "建立失敗",
        description: error.message || "建立店家時發生錯誤，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>建立您的店家</CardTitle>
          <CardDescription>
            完成店家資料設定，立即獲得 7 天免費試用！
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="store_name">店家名稱 *</Label>
                <Input
                  id="store_name"
                  value={formData.store_name}
                  onChange={(e) => handleChange('store_name', e.target.value)}
                  required
                  placeholder="輸入您的店家名稱"
                />
              </div>

              <div>
                <Label htmlFor="industry">行業類別 *</Label>
                <Select 
                  value={formData.industry} 
                  onValueChange={(value) => handleChange('industry', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇您的行業" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email">聯絡信箱 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="store@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">聯絡電話 *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  placeholder="02-1234-5678"
                />
              </div>

              <div>
                <Label htmlFor="address">店家地址 *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  required
                  placeholder="完整的店家地址"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="description">店家簡介</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="簡單介紹您的店家特色"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="google_review_url">Google 評論連結</Label>
                <Input
                  id="google_review_url"
                  value={formData.google_review_url}
                  onChange={(e) => handleChange('google_review_url', e.target.value)}
                  placeholder="https://g.page/your-business/review"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">🎉 免費試用優惠</h3>
              <p className="text-sm text-blue-700">
                完成店家建立後，您將自動獲得 7 天免費試用，包含所有進階功能：
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• 無限制評論生成</li>
                <li>• 關鍵字管理</li>
                <li>• QR Code 下載</li>
                <li>• 數據分析</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? '建立中...' : '完成建立 & 開始試用'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
