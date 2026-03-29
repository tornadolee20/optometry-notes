import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ExcelJS from 'exceljs';

interface CustomerImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedRow {
  store_name: string;
  email: string;
  phone: string;
  address: string;
  industry?: string;
  line_id?: string;
  notes?: string;
  tags?: string;
  keywords?: string;
  valid: boolean;
  error?: string;
}

export const CustomerImportModal: React.FC<CustomerImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const mapRowsToSchema = (json: Record<string, string>[]): ParsedRow[] => {
    return json.map((row) => {
      const name = row['店家名稱'] || row['store_name'] || '';
      const email = row['Email'] || row['email'] || '';
      const phone = row['電話'] || row['phone'] || '';
      const address = row['地址'] || row['address'] || '';
      const industry = row['行業'] || row['industry'] || '';
      const line_id = row['LINE ID'] || row['line_id'] || '';
      const notes = row['備註'] || row['notes'] || '';
      const tags = row['標籤'] || row['tags'] || '';
      const keywords = row['關鍵字'] || row['keywords'] || '';
      const valid = !!name && !!email && !!phone && !!address;
      return {
        store_name: name, email, phone, address, industry, line_id, notes, tags, keywords,
        valid,
        error: !valid ? '缺少必填欄位（名稱、Email、電話、地址）' : undefined
      };
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const isCSV = file.name.toLowerCase().endsWith('.csv');

    if (isCSV) {
      const textReader = new FileReader();
      textReader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          const lines = text.split(/\r?\n/).filter(l => l.trim());
          if (lines.length < 2) throw new Error('檔案為空');

          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          const json: Record<string, string>[] = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => { obj[h] = values[i] || ''; });
            return obj;
          });

          setParsedRows(mapRowsToSchema(json));
        } catch {
          toast({ variant: 'destructive', title: '解析失敗', description: '無法讀取此 CSV 檔案' });
        }
      };
      textReader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = evt.target?.result as ArrayBuffer;
          const wb = new ExcelJS.Workbook();
          await wb.xlsx.load(data);
          const ws = wb.getWorksheet(1);
          if (!ws) throw new Error('No worksheet');
          
          const headers: string[] = [];
          ws.getRow(1).eachCell((cell, colNumber) => {
            headers[colNumber - 1] = String(cell.value || '');
          });

          const json: Record<string, string>[] = [];
          ws.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const obj: Record<string, string> = {};
            row.eachCell((cell, colNumber) => {
              obj[headers[colNumber - 1]] = String(cell.value || '');
            });
            json.push(obj);
          });

          setParsedRows(mapRowsToSchema(json));
        } catch {
          toast({ variant: 'destructive', title: '解析失敗', description: '無法讀取此檔案格式' });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter(r => r.valid);
    if (!validRows.length) return;

    setImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未登入');

      const inserts = validRows.map(r => ({
        store_name: r.store_name,
        email: r.email,
        phone: r.phone,
        address: r.address,
        industry: r.industry || null,
        line_id: r.line_id || null,
        notes: r.notes || null,
        tags: r.tags ? r.tags.split(/[,，、]/).map(t => t.trim()).filter(Boolean) : [],
        user_id: user.id,
        status: 'active' as const,
      }));

      const { data: insertedStores, error } = await supabase.from('stores').insert(inserts).select('id, store_name');
      if (error) throw error;

      // Write keywords back to store_keywords
      let kwCount = 0;
      if (insertedStores) {
        const keywordInserts: { store_id: string; keyword: string; source: string }[] = [];
        insertedStores.forEach((store, idx) => {
          const row = validRows[idx];
          if (row.keywords) {
            const kws = row.keywords.split(/[,，、]/).map(k => k.trim()).filter(k => k.length >= 3 && k.length <= 7);
            kws.forEach(kw => {
              keywordInserts.push({ store_id: store.id, keyword: kw, source: 'import' });
            });
            kwCount += kws.length;
          }
        });
        if (keywordInserts.length > 0) {
          const { error: kwError } = await supabase.from('store_keywords').insert(keywordInserts);
          if (kwError) console.warn('關鍵字匯入部分失敗:', kwError);
        }
      }

      const kwMsg = kwCount > 0 ? `，含 ${kwCount} 個關鍵字` : '';
      toast({ title: '匯入成功', description: `已匯入 ${validRows.length} 筆客戶資料${kwMsg}` });
      setParsedRows([]);
      setFileName('');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: '匯入失敗', description: err instanceof Error ? err.message : '未知錯誤' });
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedRows.filter(r => r.valid).length;
  const invalidCount = parsedRows.filter(r => !r.valid).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); setParsedRows([]); setFileName(''); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>匯入客戶資料</DialogTitle>
          <DialogDescription>上傳 Excel 或 CSV 檔案，系統會自動解析並匯入</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload area */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{fileName || '點擊選擇檔案'}</p>
            <p className="text-xs text-muted-foreground mt-1">支援 .xlsx、.xls、.csv 格式</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
          </div>

          {/* Template info */}
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">欄位說明（必填 *）：</p>
            <p>店家名稱* · Email* · 電話* · 地址* · 行業 · LINE ID · 備註 · 標籤（逗號分隔）</p>
          </div>

          {/* Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  共 {parsedRows.length} 筆
                </Badge>
                {validCount > 0 && (
                  <Badge className="bg-emerald-500/10 text-emerald-700 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />{validCount} 有效
                  </Badge>
                )}
                {invalidCount > 0 && (
                  <Badge className="bg-destructive/10 text-destructive text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />{invalidCount} 錯誤
                  </Badge>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto border rounded-lg divide-y divide-border">
                {parsedRows.slice(0, 20).map((row, i) => (
                  <div key={i} className={`px-3 py-2 text-xs flex items-center justify-between ${!row.valid ? 'bg-destructive/5' : ''}`}>
                    <div className="truncate flex-1">
                      <span className="font-medium">{row.store_name || '(空)'}</span>
                      <span className="text-muted-foreground ml-2">{row.email}</span>
                    </div>
                    {!row.valid && <span className="text-destructive text-[10px] flex-shrink-0 ml-2">{row.error}</span>}
                  </div>
                ))}
                {parsedRows.length > 20 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                    ...還有 {parsedRows.length - 20} 筆
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleImport} disabled={!validCount || importing}>
            {importing ? '匯入中...' : `匯入 ${validCount} 筆客戶`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
