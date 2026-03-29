import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Loader2, Plus, Sparkles, Search } from "lucide-react";
import { format } from "date-fns";
import { KeywordDraftPreview } from "@/components/admin/KeywordDraftPreview";

interface IndustryRequest {
  id: string;
  store_id: string;
  parent_industry_id: string;
  requested_name: string;
  description: string;
  status: string;
  admin_note: string | null;
  created_template_id: string | null;
  handled_by: string | null;
  created_at: string;
  stores?: { store_name: string; store_number: number } | null;
}

interface TemplateKeyword {
  keyword?: string;
  text?: string;
  category?: string;
}

type KeywordCategory = "general" | "product" | "service" | "location" | "experience";

const slugify = (str: string): string => {
  const cleaned = str
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  if (/[\u4e00-\u9fff]/.test(cleaned)) {
    const hash = Array.from(str).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return `custom_${hash}_${Date.now().toString(36)}`;
  }
  return cleaned || `custom_${Date.now().toString(36)}`;
};

export const IndustryRequestsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; request?: IndustryRequest }>({ open: false });
  const [rejectNote, setRejectNote] = useState("");
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; request?: IndustryRequest }>({ open: false });
  const [draftTarget, setDraftTarget] = useState<{
    templateId: string;
    label: string;
    parentLabel: string;
    description?: string;
  } | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["industry-requests", activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industry_requests")
        .select("*, stores(store_name, store_number)")
        .eq("status", activeTab === "pending" ? "pending" : activeTab === "approved" ? "approved" : "rejected")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as IndustryRequest[];
    },
  });

  const { data: parentTemplates = [] } = useQuery({
    queryKey: ["parent-templates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("industry_templates")
        .select("template_id, label, emoji")
        .is("parent_id", null)
        .eq("is_active", true);
      return data || [];
    },
  });

  const getParentLabel = (parentId: string) => {
    const p = parentTemplates.find((t) => t.template_id === parentId);
    return p ? `${p.emoji} ${p.label}` : parentId;
  };

  const approveMutation = useMutation({
    mutationFn: async (req: IndustryRequest) => {
      const templateId = slugify(req.requested_name);

      const { data: siblings } = await supabase
        .from("industry_templates")
        .select("sort_order")
        .eq("parent_id", req.parent_industry_id)
        .order("sort_order", { ascending: false })
        .limit(1);
      const nextOrder = (siblings?.[0]?.sort_order ?? 0) + 1;

      // 新模板關鍵字留空，由管理員透過 AI 生成或手動設定
      const keywords: never[] = [];

      const { error: insertErr } = await supabase.from("industry_templates").insert({
        template_id: templateId,
        label: req.requested_name,
        emoji: "📦",
        parent_id: req.parent_industry_id,
        sort_order: nextOrder,
        is_active: true,
        keywords,
      });
      if (insertErr) throw insertErr;

      const { data: { user } } = await supabase.auth.getUser();
      const { error: updateErr } = await supabase
        .from("industry_requests")
        .update({
          status: "approved",
          handled_by: user?.id || null,
          created_template_id: templateId,
        })
        .eq("id", req.id);
      if (updateErr) throw updateErr;

      const { error: storeErr } = await supabase
        .from("stores")
        .update({ industry: templateId })
        .eq("id", req.store_id);
      if (storeErr) throw storeErr;

      if (Array.isArray(keywords) && keywords.length > 0) {
        await supabase.from("store_keywords").delete().eq("store_id", req.store_id);
        const mapCat = (cat: string): KeywordCategory => {
          const m: Record<string, KeywordCategory> = {
            general: "general", product: "product", service: "service",
            location: "location", experience: "experience",
            price: "general", tech: "product", env: "experience",
          };
          return m[cat] || "general";
        };
        const kwRows = (keywords as TemplateKeyword[])
          .map((kw, idx) => ({
            store_id: req.store_id,
            keyword: kw.text || kw.keyword || '',
            category: mapCat(kw.category || "general"),
            source: "system",
            priority: idx,
            industry: templateId,
          }))
          .filter(kw => kw.keyword.length >= 3 && kw.keyword.length <= 7);
        await supabase.from("store_keywords").insert(kwRows);
      }

      return templateId;
    },
    onSuccess: (templateId) => {
      toast({ title: "已建立新子產業", description: `模板 ID: ${templateId}` });
      queryClient.invalidateQueries({ queryKey: ["industry-requests"] });
      queryClient.invalidateQueries({ queryKey: ["industry-tree"] });
      setApproveDialog({ open: false });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "建立失敗", description: err.message });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, note }: { requestId: string; note: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("industry_requests")
        .update({
          status: "rejected",
          admin_note: note,
          handled_by: user?.id || null,
        })
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "已駁回需求" });
      queryClient.invalidateQueries({ queryKey: ["industry-requests"] });
      setRejectDialog({ open: false });
      setRejectNote("");
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "操作失敗", description: err.message });
    },
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-600/10">待審核</Badge>;
      case "approved": return <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">已批准</Badge>;
      case "rejected": return <Badge variant="destructive">已駁回</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter(req =>
    !searchTerm ||
    req.requested_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.stores?.store_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {draftTarget && (
        <KeywordDraftPreview
          templateId={draftTarget.templateId}
          templateLabel={draftTarget.label}
          parentLabel={draftTarget.parentLabel}
          description={draftTarget.description}
          onApplied={() => {
            setDraftTarget(null);
            queryClient.invalidateQueries({ queryKey: ["industry-requests"] });
          }}
          onClose={() => setDraftTarget(null)}
        />
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜尋需求..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 h-auto">
          <TabsTrigger value="pending" className="text-xs px-3 py-1.5">待審核</TabsTrigger>
          <TabsTrigger value="approved" className="text-xs px-3 py-1.5">已批准</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs px-3 py-1.5">已駁回</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              目前沒有{activeTab === "pending" ? "待審核" : activeTab === "approved" ? "已批准" : "已駁回"}的需求。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>店家</TableHead>
                    <TableHead>產業大類</TableHead>
                    <TableHead>期望名稱</TableHead>
                    <TableHead>說明</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>建立時間</TableHead>
                    {activeTab === "pending" && <TableHead>操作</TableHead>}
                    {activeTab === "rejected" && <TableHead>駁回備註</TableHead>}
                    {activeTab === "approved" && <TableHead>模板 ID</TableHead>}
                    {activeTab === "approved" && <TableHead>AI 關鍵字</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        {req.stores?.store_name || "—"}
                        <div className="text-xs text-muted-foreground">
                          #{String(req.stores?.store_number || 0).padStart(5, "0")}
                        </div>
                      </TableCell>
                      <TableCell>{getParentLabel(req.parent_industry_id)}</TableCell>
                      <TableCell className="font-medium">{req.requested_name}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {req.description}
                      </TableCell>
                      <TableCell>{statusBadge(req.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(req.created_at), "yyyy/MM/dd HH:mm")}
                      </TableCell>
                      {activeTab === "pending" && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="default" onClick={() => setApproveDialog({ open: true, request: req })} disabled={approveMutation.isPending}>
                              <Plus className="w-3 h-3 mr-1" />建立
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => setRejectDialog({ open: true, request: req })} disabled={rejectMutation.isPending}>
                              <X className="w-3 h-3 mr-1" />駁回
                            </Button>
                          </div>
                        </TableCell>
                      )}
                      {activeTab === "rejected" && (
                        <TableCell className="text-sm text-muted-foreground">{req.admin_note || "—"}</TableCell>
                      )}
                      {activeTab === "approved" && (
                        <TableCell className="text-xs font-mono">{req.created_template_id || "—"}</TableCell>
                      )}
                      {activeTab === "approved" && (
                        <TableCell>
                          {req.created_template_id && (
                            <Button size="sm" variant="outline" onClick={() => setDraftTarget({
                              templateId: req.created_template_id!,
                              label: req.requested_name,
                              parentLabel: getParentLabel(req.parent_industry_id),
                              description: req.description,
                            })}>
                              <Sparkles className="w-3 h-3 mr-1" />AI 生成關鍵字
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve dialog */}
      <AlertDialog open={approveDialog.open} onOpenChange={(o) => !o && setApproveDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認建立新子產業模板</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>將在「{getParentLabel(approveDialog.request?.parent_industry_id || "")}」大類下建立：</p>
              <p className="font-semibold text-foreground text-base">{approveDialog.request?.requested_name}</p>
              <p className="text-xs">模板將以空白關鍵字建立，請在「產業模板」分頁中使用 AI 生成或手動設定關鍵字。</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => approveDialog.request && approveMutation.mutate(approveDialog.request)} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? (<><Loader2 className="w-3 h-3 animate-spin mr-1" />建立中...</>) : (<><Check className="w-3 h-3 mr-1" />確認建立</>)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject dialog */}
      <AlertDialog open={rejectDialog.open} onOpenChange={(o) => !o && setRejectDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>駁回產業需求</AlertDialogTitle>
            <AlertDialogDescription>請填寫駁回原因（選填）：</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="例如：已有相似子產業模板..." rows={3} />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectNote("")}>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => rejectDialog.request && rejectMutation.mutate({ requestId: rejectDialog.request.id, note: rejectNote })}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "處理中..." : "確認駁回"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IndustryRequestsTab;
