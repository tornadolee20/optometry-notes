
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { GoogleReviewLinkPicker } from "@/components/forms/GoogleReviewLinkPicker";
import { useIndustryTree, getChildLabel } from "@/hooks/useIndustryTree";
import { IndustrySelector } from "@/components/store/IndustrySelector";
import { IndustryRequestForm } from "@/components/store/IndustryRequestForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

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
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(isAdminView);
  const [formData, setFormData] = useState(store);
  const [isLoading, setIsLoading] = useState(false);
  const { data: industryTree = [] } = useIndustryTree();

  // Keyword swap confirmation
  const [showKeywordConfirm, setShowKeywordConfirm] = useState(false);
  const [pendingIndustry, setPendingIndustry] = useState<string>("");

  // Regular user: gate industry change behind confirmation
  const [showChangeIndustryConfirm, setShowChangeIndustryConfirm] = useState(false);
  const [industryUnlocked, setIndustryUnlocked] = useState(false);
  const hasExistingIndustry = !!store.industry;

  // "Other" request flow
  const [showOtherForm, setShowOtherForm] = useState(false);
  const [otherParentId, setOtherParentId] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Check for pending industry requests for this store
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["industry-requests-pending", store.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("industry_requests")
        .select("id, parent_industry_id")
        .eq("store_id", store.id)
        .eq("status", "pending");
      return data || [];
    },
    enabled: !!store.id,
  });

  const hasPendingRequestForParent = (parentId: string) =>
    pendingRequests.some((r) => r.parent_industry_id === parentId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIndustryChange = (newIndustry: string) => {
    setShowOtherForm(false);
    // If industry actually changed and store already had one, ask confirmation
    if (formData.industry && formData.industry !== newIndustry && newIndustry) {
      setPendingIndustry(newIndustry);
      setShowKeywordConfirm(true);
    } else {
      setFormData(prev => ({ ...prev, industry: newIndustry }));
    }
  };

  const handleOtherRequest = (parentId: string) => {
    if (hasPendingRequestForParent(parentId)) {
      toast({
        variant: "destructive",
        title: "已有待審核的需求",
        description: "您在此產業大類已有一筆等待審核的產業需求，請等待管理員處理。",
      });
      return;
    }
    setOtherParentId(parentId);
    setShowOtherForm(true);
  };

  const handleSubmitOtherRequest = async (data: { requestedName: string; description: string }) => {
    setIsSubmittingRequest(true);

    try {
      const { error } = await supabase.from("industry_requests").insert({
        store_id: store.id,
        parent_industry_id: otherParentId,
        requested_name: data.requestedName,
        description: data.description,
        status: "pending",
      });

      if (error) throw error;

      const parentNode = industryTree.find((p) => p.value === otherParentId);
      const fallbackChild = parentNode?.children?.[0]?.value;

      if (fallbackChild && !formData.industry) {
        setFormData((prev) => ({ ...prev, industry: fallbackChild }));

        const { error: fallbackError } = await supabase
          .from("stores")
          .update({ industry: fallbackChild })
          .eq("id", store.id);

        if (fallbackError) throw fallbackError;
      }

      setShowOtherForm(false);
      queryClient.invalidateQueries({ queryKey: ["industry-requests-pending", store.id] });
      toast({
        title: "已送出產業需求",
        description: "管理員審核後就會出現在系統管理中。",
      });
    } catch (err: unknown) {
      const description = err instanceof Error ? err.message : "未知錯誤";
      toast({
        variant: "destructive",
        title: "送出失敗",
        description,
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const applyIndustryKeywords = async (templateId: string, storeId: string) => {
    try {
      const { data: template } = await supabase
        .from("industry_templates")
        .select("keywords")
        .eq("template_id", templateId)
        .eq("is_active", true)
        .single();

      if (!template?.keywords || !Array.isArray(template.keywords)) return;

      await supabase.from("store_keywords").delete().eq("store_id", storeId);

      const mapCategory = (cat: string): "general" | "product" | "service" | "location" | "experience" => {
        const mapping: Record<string, "general" | "product" | "service" | "location" | "experience"> = {
          general: "general", product: "product", service: "service", location: "location", experience: "experience",
          price: "general", tech: "product", env: "experience",
        };
        return mapping[cat] || "general";
      };

      const rawKeywords = template.keywords as Array<{ text?: string; keyword?: string; category?: string }>;
      const keywordsToInsert = rawKeywords
        .map((kw, idx) => ({
          store_id: storeId,
          keyword: kw.text || kw.keyword || '',
          category: mapCategory(kw.category || "general"),
          source: "system",
          priority: idx,
          industry: templateId,
        }))
        .filter(kw => kw.keyword.length >= 3 && kw.keyword.length <= 7);

      const { error } = await supabase.from("store_keywords").insert(keywordsToInsert);
      if (error) throw error;

      toast({ title: "關鍵字已更新", description: "已套用新產業的專屬關鍵字模板" });
    } catch (err) {
      console.error("Apply keywords error:", err);
      toast({ variant: "destructive", title: "關鍵字套用失敗", description: "請稍後再試" });
    }
  };

  const handleConfirmKeywordSwap = async () => {
    const newIndustry = pendingIndustry;
    setFormData(prev => ({ ...prev, industry: newIndustry }));

    try {
      await supabase.from("stores").update({ industry: newIndustry }).eq("id", store.id);
    } catch (err) {
      console.error("Failed to save industry:", err);
    }

    await applyIndustryKeywords(newIndustry, store.id);
    setShowKeywordConfirm(false);
    onUpdate({ ...formData, industry: newIndustry });
  };

  const handleDeclineKeywordSwap = async () => {
    const newIndustry = pendingIndustry;
    setFormData(prev => ({ ...prev, industry: newIndustry }));

    try {
      await supabase.from("stores").update({ industry: newIndustry }).eq("id", store.id);
    } catch (err) {
      console.error("Failed to save industry:", err);
    }

    setShowKeywordConfirm(false);
    onUpdate({ ...formData, industry: newIndustry });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("stores")
        .update({
          store_name: formData.store_name,
          address: formData.address,
          description: formData.description,
          google_review_url: formData.google_review_url,
          phone: formData.phone,
          email: formData.email,
          industry: formData.industry,
        })
        .eq("id", store.id);

      if (error) throw error;

      // Auto-load keywords on FIRST industry set
      if (formData.industry && !store.industry) {
        const { count } = await supabase
          .from("store_keywords")
          .select("id", { count: "exact", head: true })
          .eq("store_id", store.id);

        if (!count || count === 0) {
          await applyIndustryKeywords(formData.industry, store.id);
        }
      }

      onUpdate(formData);
      setIsEditing(false);
      toast({ title: "更新成功", description: "店家資料已更新" });
    } catch (error) {
      console.error("更新錯誤:", error);
      toast({ variant: "destructive", title: "更新失敗", description: "無法更新店家資料" });
    } finally {
      setIsLoading(false);
    }
  };

  const formattedStoreNumber = String(store.store_number).padStart(5, "0");

  const otherParentLabel =
    industryTree.find((p) => p.value === otherParentId)
      ? `${industryTree.find((p) => p.value === otherParentId)!.emoji} ${industryTree.find((p) => p.value === otherParentId)!.label}`
      : otherParentId;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>店家資訊</span>
            <span className="text-sm font-normal text-muted-foreground">
              店家編號：{formattedStoreNumber}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">店家名稱</label>
              <Input
                name="store_name"
                value={formData.store_name}
                onChange={handleInputChange}
                disabled={!isEditing && !isAdminView}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">行業別</label>
              {isAdminView ? (
                <>
                  <IndustrySelector
                    value={formData.industry}
                    onChange={handleIndustryChange}
                    onOtherRequest={handleOtherRequest}
                    hasPendingRequest={pendingRequests.length > 0}
                    disabled={false}
                  />
                  {pendingRequests.length > 0 && !showOtherForm && (
                    <Alert className="mt-2 border-destructive/30 bg-destructive/5">
                      <Info className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-xs text-destructive">
                        您已有 {pendingRequests.length} 筆產業需求等待管理員審核中。
                      </AlertDescription>
                    </Alert>
                  )}
                  {showOtherForm && (
                    <IndustryRequestForm
                      parentIndustryLabel={otherParentLabel}
                      onSubmit={handleSubmitOtherRequest}
                      onCancel={() => setShowOtherForm(false)}
                      isSubmitting={isSubmittingRequest}
                    />
                  )}
                </>
              ) : isEditing ? (
                <>
                  {hasExistingIndustry && !industryUnlocked ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={getChildLabel(industryTree, formData.industry)}
                        disabled={true}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 text-xs"
                        onClick={() => setShowChangeIndustryConfirm(true)}
                      >
                        變更行業
                      </Button>
                    </div>
                  ) : (
                    <>
                      <IndustrySelector
                        value={formData.industry}
                        onChange={handleIndustryChange}
                        onOtherRequest={handleOtherRequest}
                        hasPendingRequest={pendingRequests.length > 0}
                        disabled={false}
                      />
                      {pendingRequests.length > 0 && !showOtherForm && (
                        <Alert className="mt-2 border-destructive/30 bg-destructive/5">
                          <Info className="h-4 w-4 text-destructive" />
                          <AlertDescription className="text-xs text-destructive">
                            您已有 {pendingRequests.length} 筆產業需求等待管理員審核中。
                          </AlertDescription>
                        </Alert>
                      )}
                      {showOtherForm && (
                        <IndustryRequestForm
                          parentIndustryLabel={otherParentLabel}
                          onSubmit={handleSubmitOtherRequest}
                          onCancel={() => setShowOtherForm(false)}
                          isSubmitting={isSubmittingRequest}
                        />
                      )}
                    </>
                  )}
                </>
              ) : (
                <Input
                  value={getChildLabel(industryTree, formData.industry)}
                  disabled={true}
                />
              )}
            </div>
            <div>
              <label className="text-sm text-muted-foreground">地址</label>
              <Input name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing && !isAdminView} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">店家描述</label>
              <Input name="description" value={formData.description || ""} onChange={handleInputChange} disabled={!isEditing && !isAdminView} placeholder="請輸入店家描述" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Google 評論連結</label>
              <Input name="google_review_url" value={formData.google_review_url || ""} onChange={handleInputChange} disabled={!isEditing && !isAdminView} type="url" placeholder="https://search.google.com/local/writereview?placeid=..." />
              {(isEditing || isAdminView) && (
                <div className="mt-2">
                  <GoogleReviewLinkPicker currentUrl={formData.google_review_url} onUrlChange={(url) => setFormData(prev => ({ ...prev, google_review_url: url }))} />
                </div>
              )}
            </div>
            <div>
              <label className="text-sm text-muted-foreground">聯絡電話</label>
              <Input name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing && !isAdminView} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">電子郵件</label>
              <Input name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing && !isAdminView} type="email" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              {isAdminView ? (
                <>
                  <Button type="button" variant="outline" onClick={() => setFormData(store)} disabled={isLoading}>重置</Button>
                  <Button type="submit" disabled={isLoading}>{isLoading ? "儲存中..." : "儲存變更 (管理員)"}</Button>
                </>
              ) : !isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)}>編輯資料</Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => { setFormData(store); setIsEditing(false); setShowOtherForm(false); setIndustryUnlocked(false); }} disabled={isLoading}>取消</Button>
                  <Button type="submit" disabled={isLoading}>{isLoading ? "儲存中..." : "儲存變更"}</Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showKeywordConfirm} onOpenChange={setShowKeywordConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>變更行業別</AlertDialogTitle>
            <AlertDialogDescription>
              偵測到您變更了行業別，是否要自動套用新產業的 48 個專屬關鍵字模板？
              <br /><br />
              <strong>此動作將覆蓋原有的關鍵字設定。</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeclineKeywordSwap}>僅變更行業別</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmKeywordSwap}>套用新關鍵字</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showChangeIndustryConfirm} onOpenChange={setShowChangeIndustryConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要變更行業嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              變更行業後，將會以新產業的 48 個專屬關鍵字取代目前所有關鍵字設定。
              <br /><br />
              <strong>此操作無法復原，請確認後再進行。</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setIndustryUnlocked(true); setShowChangeIndustryConfirm(false); }}>
              確定變更
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
