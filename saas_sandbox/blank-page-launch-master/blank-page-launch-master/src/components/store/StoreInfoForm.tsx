
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { GoogleReviewLinkPicker } from "@/components/forms/GoogleReviewLinkPicker";

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
  { value: 'optical', label: '眼鏡/視光' },
  { value: 'other', label: '其他' }
];

interface StoreInfo {
  id: string;
  store_name: string;
  address: string;
  description: string;
  google_review_url: string;
  phone: string;
  email: string;
  store_number: number;
  industry?: string;
}

interface Props {
  store: StoreInfo;
  onUpdate: (store: StoreInfo) => void;
  isAdminView?: boolean;
}

export const StoreInfoForm = ({ store, onUpdate, isAdminView = false }: Props) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(isAdminView); // Directly enable editing if isAdminView
  const [formData, setFormData] = useState(store);
  const [isLoading, setIsLoading] = useState(false);

  // Get industry label for display
  const getIndustryLabel = (value?: string) => {
    if (!value) return '未設定';
    const industry = INDUSTRIES.find(ind => ind.value === value);
    return industry ? industry.label : value;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('stores')
        .update({
          store_name: formData.store_name,
          address: formData.address,
          description: formData.description,
          google_review_url: formData.google_review_url,
          phone: formData.phone,
          email: formData.email,
          industry: formData.industry,
        })
        .eq('id', store.id);

      if (error) throw error;

      onUpdate(formData);
      setIsEditing(false);
      toast({
        title: "更新成功",
        description: "店家資料已更新",
      });
    } catch (error) {
      console.error('更新錯誤:', error);
      toast({
        variant: "destructive",
        title: "更新失敗",
        description: "無法更新店家資料",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 將店家編號格式化為五位數
  const formattedStoreNumber = String(store.store_number).padStart(5, '0');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>店家資訊</span>
          <span className="text-sm font-normal text-gray-500">
            店家編號：{formattedStoreNumber}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">店家名稱</label>
            <Input
              name="store_name"
              value={formData.store_name}
              onChange={handleInputChange}
              disabled={!isEditing && !isAdminView}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">行業別</label>
            {(isEditing || isAdminView) ? (
              <select
                name="industry"
                value={formData.industry || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">請選擇行業別</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={getIndustryLabel(formData.industry)}
                disabled={true}
              />
            )}
          </div>
          <div>
            <label className="text-sm text-gray-500">地址</label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={!isEditing && !isAdminView}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">店家描述</label>
            <Input
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              disabled={!isEditing && !isAdminView}
              placeholder="請輸入店家描述"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Google 評論連結</label>
            <Input
              name="google_review_url"
              value={formData.google_review_url || ''}
              onChange={handleInputChange}
              disabled={!isEditing && !isAdminView}
              type="url"
              placeholder="https://search.google.com/local/writereview?placeid=..."
            />
            {(isEditing || isAdminView) && (
              <div className="mt-2">
                <GoogleReviewLinkPicker
                  currentUrl={formData.google_review_url}
                  onUrlChange={(url) => setFormData(prev => ({ ...prev, google_review_url: url }))}
                />
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-500">聯絡電話</label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing && !isAdminView}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">電子郵件</label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing && !isAdminView}
              type="email"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            {isAdminView ? (
              // Admin view always shows Save and Cancel, doesn't need "Edit" button first
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData(store); // Reset form to original store data
                    // setIsEditing(false); // In admin view, perhaps keep it "editing"
                  }}
                  disabled={isLoading}
                >
                  重置
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "儲存中..." : "儲存變更 (管理員)"}
                </Button>
              </>
            ) : !isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)}>
                編輯資料
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData(store);
                    setIsEditing(false);
                  }}
                  disabled={isLoading}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "儲存中..." : "儲存變更"}
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
