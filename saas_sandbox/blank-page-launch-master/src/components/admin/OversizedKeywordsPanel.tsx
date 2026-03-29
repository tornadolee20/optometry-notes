import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Trash2, RefreshCw, Check, X, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface InvalidKeyword {
  id: string;
  keyword: string;
  store_id: string | null;
  store_name?: string;
  category: string | null;
  is_sandbox: boolean;
}

export const OversizedKeywordsPanel = () => {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<InvalidKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchInvalid = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("store_keywords")
        .select("id, keyword, store_id, category, is_sandbox");

      if (error) throw error;

      const invalid = (data || []).filter(
        (k) => {
          const len = k.keyword.trim().length;
          return len < 3 || len > 7;
        }
      );

      const storeIds = [...new Set(invalid.map((k) => k.store_id).filter((id): id is string => id !== null))];
      let storeMap: Record<string, string> = {};
      if (storeIds.length > 0) {
        const { data: stores } = await supabase
          .from("stores")
          .select("id, store_name")
          .in("id", storeIds);
        storeMap = Object.fromEntries(
          (stores || []).map((s) => [s.id, s.store_name])
        );
      }

      setKeywords(
        invalid.map((k) => ({
          ...k,
          is_sandbox: k.is_sandbox ?? false,
          store_name: k.store_id ? storeMap[k.store_id] : undefined,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch invalid keywords:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvalid(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("store_keywords")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "刪除失敗", description: error.message });
      return;
    }
    setKeywords((prev) => prev.filter((k) => k.id !== id));
    toast({ title: "已刪除" });
  };

  const startEdit = (k: InvalidKeyword) => {
    setEditingId(k.id);
    setEditValue(k.keyword);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (id: string) => {
    const trimmed = editValue.trim();
    if (trimmed.length < 3 || trimmed.length > 7) {
      toast({ variant: "destructive", title: "長度不符", description: "修改後的關鍵字必須介於 3~7 字" });
      return;
    }

    const { error } = await supabase
      .from("store_keywords")
      .update({ keyword: trimmed })
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "儲存失敗", description: error.message });
      return;
    }

    setKeywords((prev) => prev.filter((k) => k.id !== id));
    setEditingId(null);
    toast({ title: "已更新", description: `關鍵字已修改為「${trimmed}」` });
  };

  if (loading) return <div className="text-sm text-muted-foreground p-4">載入中...</div>;
  if (keywords.length === 0) return (
    <Card className="border-green-200 bg-green-50/50">
      <CardContent className="py-4">
        <p className="text-sm text-green-700">✅ 沒有不合規的關鍵字（全部介於 3~7 字）</p>
      </CardContent>
    </Card>
  );

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-orange-800">
          <AlertTriangle className="w-4 h-4" />
          不合規關鍵字清單（長度 &lt;3 或 &gt;7 字）
          <Badge variant="secondary" className="ml-auto">{keywords.length} 筆</Badge>
          <Button size="sm" variant="ghost" onClick={fetchInvalid}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>關鍵字</TableHead>
                <TableHead className="w-16">長度</TableHead>
                <TableHead className="w-20">沙盒</TableHead>
                <TableHead>店家</TableHead>
                <TableHead className="w-28 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((k) => (
                <TableRow key={k.id}>
                  <TableCell>
                    {editingId === k.id ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(k.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{k.keyword}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={k.keyword.trim().length < 3 ? "destructive" : "secondary"}>
                      {k.keyword.trim().length}字
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={k.is_sandbox ? "outline" : "default"} className="text-xs">
                      {k.is_sandbox ? "沙盒" : "正式"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {k.store_name || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === k.id ? (
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => saveEdit(k.id)}>
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={cancelEdit}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(k)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(k.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
