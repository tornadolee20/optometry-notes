import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface FormState {
  store_name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  google_review_url?: string;
  industry?: string;
}

const CreateStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isTrialMode = searchParams.get('trial') === 'true';
  
  const [form, setForm] = useState<FormState>({
    store_name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    google_review_url: "",
    industry: "",
  });

  useEffect(() => {
    const title = isTrialMode ? "開始 7 天免費試用 - 建立店家" : "建立店家 - 自己的評論";
    document.title = title;
    const desc = isTrialMode 
      ? "立即建立店家開始 7 天免費試用，體驗完整功能"
      : "建立店家資料，開始使用評論生成與分析功能";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, [isTrialMode]);

  useEffect(() => {
    // 檢查登入狀態
    if (!user) {
      navigate(isTrialMode ? '/register?trial=true' : '/login');
      return;
    }

    // 預填目前使用者的 email
    if (!form.email && user.email) {
      setForm((prev) => ({ ...prev, email: user.email || "" }));
    }

    // 檢查是否已經有店家（限制一個帳號一間店家）
    checkExistingStore();
  }, [user, isTrialMode]);

  const checkExistingStore = async () => {
    if (!user) return;
    
    try {
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingStore) {
        toast({ 
          title: "已有店家", 
          description: "每個帳號僅能建立一間店家，為您導向現有店家" 
        });
        navigate(`/store/${existingStore.id}`);
      }
    } catch (error) {
      console.error("檢查現有店家失敗:", error);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 簡單必填驗證
    if (!form.store_name || !form.email || !form.phone || !form.address) {
      toast({ title: "請完整填寫必填欄位", description: "店名、Email、電話、地址皆為必填" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user) {
        toast({ title: "尚未登入", description: "請先登入後再建立店家" });
        navigate('/login');
        return;
      }

      // 確保 users 表存在當前使用者
      const { data: existingUser, error: fetchUserErr } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchUserErr) {
        console.warn('Fetch user failed:', fetchUserErr);
      }

      if (!existingUser) {
        const { error: createUserErr } = await supabase.from('users').insert({
          id: user.id,
          email: user.email ?? form.email,
          is_active: true,
          role: 'user',
        });
        if (createUserErr) throw createUserErr;
      }

      // 再次檢查是否已有店家
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      if (existingStore?.id) {
        toast({ title: '已有店家', description: '每個帳號僅能建立一間店家' });
        navigate(`/store/${existingStore.id}`);
        return;
      }

      const payload = {
        store_name: form.store_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        description: form.description?.trim() || null,
        google_review_url: form.google_review_url?.trim() || null,
        industry: form.industry?.trim() || null,
        user_id: user.id,
      };

      const { data: storeData, error } = await supabase
        .from('stores')
        .insert([payload])
        .select('id')
        .single();

      if (error) throw error;

      // 如果是試用模式，自動建立 7 天試用訂閱
      if (isTrialMode && storeData?.id) {
        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 7); // 7 天後到期

        const { error: subscriptionError } = await supabase
          .from('store_subscriptions')
          .insert({
            store_id: storeData.id,
            plan_type: 'trial',
            status: 'active',
            expires_at: trialExpiresAt.toISOString(),
            trial_ends_at: trialExpiresAt.toISOString(),
            auto_renew: false,
            payment_source: 'trial',
            features: {
              analytics: true,
              qr_download: true,
              review_generation: true,
              review_system_url: true,
              keyword_management: true
            }
          });

        if (subscriptionError) {
          console.error('建立試用訂閱失敗:', subscriptionError);
          // 不拋出錯誤，店家已建立成功
        }
      }

      const successMessage = isTrialMode 
        ? "恭喜！店家建立成功，7 天免費試用已開始！" 
        : "建立成功，已建立店家，為您導向儀表板";
      
      toast({ title: "建立成功", description: successMessage });
      if (storeData?.id) navigate(`/store/${storeData.id}`);
    } catch (err: any) {
      console.error('Create store failed:', err);
      toast({
        title: "建立失敗",
        description: err?.message || '請稍後再試',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {isTrialMode ? "開始 7 天免費試用" : "建立店家"}
            </CardTitle>
            {isTrialMode && (
              <p className="text-sm text-green-600 font-medium">
                🎉 建立店家後立即開始 7 天完整功能免費試用！
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" aria-label="建立店家表單">
              <div className="grid gap-2">
                <Label htmlFor="store_name">店名（必填）</Label>
                <Input id="store_name" name="store_name" value={form.store_name} onChange={onChange} placeholder="範例：綠光咖啡" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">聯絡 Email（必填）</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">電話（必填）</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={onChange} placeholder="02-1234-5678" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">地址（必填）</Label>
                <Input id="address" name="address" value={form.address} onChange={onChange} placeholder="台北市中正區仁愛路一段 1 號" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="industry">產業（選填）</Label>
                <Input id="industry" name="industry" value={form.industry} onChange={onChange} placeholder="餐飲、眼鏡、教育…" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="google_review_url">Google 評論連結（選填）</Label>
                <Input id="google_review_url" name="google_review_url" value={form.google_review_url} onChange={onChange} placeholder="https://g.page/r/..." />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">店家簡介（選填）</Label>
                <Textarea id="description" name="description" value={form.description} onChange={onChange} placeholder="簡短介紹您的店家特色…" />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate('/pricing')}>返回</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '建立中…' : (isTrialMode ? '開始免費試用' : '建立店家')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateStore;
