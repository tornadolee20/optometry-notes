import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchExamRecords, 
  deleteExamRecord, 
  batchDeleteExamRecords,
  exportToCSV,
  downloadCSV,
  importFromCSV,
  ExamRecord 
} from '@/lib/examRecordService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, Download, Upload, Trash2, Search, ArrowLeft, 
  FileSpreadsheet, Eye, RefreshCw, AlertTriangle, Info, Settings, History
} from 'lucide-react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';
import { RecordDetailDialog } from '@/components/RecordDetailDialog';
import { PatientHistoryDialog } from '@/components/PatientHistoryDialog';

const Records = () => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [records, setRecords] = useState<ExamRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ExamRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ExamRecord | null>(null);
  const [showRecordDetail, setShowRecordDetail] = useState(false);
  const [showPatientHistory, setShowPatientHistory] = useState(false);
  const [selectedPatientCode, setSelectedPatientCode] = useState<string | null>(null);

  const t = useCallback((zhTW: string, zhCN: string, en?: string) => {
    if (language === 'en') return en || zhTW;
    return language === 'zh-TW' ? zhTW : zhCN;
  }, [language]);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchExamRecords();
      setRecords(data);
      setFilteredRecords(data);
    } catch (err) {
      console.error('Error loading records:', err);
      toast({
        title: t('載入失敗', '加载失败'),
        description: t('無法載入檢查紀錄', '无法加载检查记录'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Filter records based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredRecords(records.filter(r => 
        r.patient_code.toLowerCase().includes(term) ||
        r.diagnostic_classification?.toLowerCase().includes(term) ||
        r.exam_date.includes(term)
      ));
    }
  }, [searchTerm, records]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvContent = exportToCSV(records, language);
      const filename = `exam_records_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
      toast({
        title: t('匯出成功', '导出成功'),
        description: t(`已匯出 ${records.length} 筆紀錄`, `已导出 ${records.length} 条记录`),
      });
    } catch (err) {
      console.error('Export error:', err);
      toast({
        title: t('匯出失敗', '导出失败'),
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const count = await importFromCSV(text);
      toast({
        title: t('匯入成功', '导入成功'),
        description: t(`成功匯入 ${count} 筆資料`, `成功导入 ${count} 条数据`),
      });
      await loadRecords();
    } catch (err: any) {
      console.error('Import error:', err);
      toast({
        title: t('匯入失敗', '导入失败'),
        description: err.message || t('請確認檔案格式正確', '请确认文件格式正确'),
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteExamRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast({
        title: t('刪除成功', '删除成功'),
      });
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: t('刪除失敗', '删除失败'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    
    setIsDeleting(true);
    try {
      await batchDeleteExamRecords(Array.from(selectedIds));
      setRecords(prev => prev.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
      toast({
        title: t('刪除成功', '删除成功'),
        description: t(`已刪除 ${selectedIds.size} 筆紀錄`, `已删除 ${selectedIds.size} 条记录`),
      });
    } catch (err) {
      console.error('Batch delete error:', err);
      toast({
        title: t('刪除失敗', '删除失败'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map(r => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const genderLabel = (gender: string) => {
    const map: Record<string, string> = {
      male: t('男', '男'),
      female: t('女', '女'),
      other: t('其他', '其他'),
    };
    return map[gender] || gender;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Edit Dialog */}
      <ProfileEditDialog open={showProfileEdit} onOpenChange={setShowProfileEdit} />
      
      {/* Record Detail Dialog */}
      <RecordDetailDialog 
        record={selectedRecord} 
        open={showRecordDetail} 
        onOpenChange={setShowRecordDetail} 
      />
      
      {/* Patient History Dialog */}
      <PatientHistoryDialog
        patientCode={selectedPatientCode}
        open={showPatientHistory}
        onOpenChange={setShowPatientHistory}
      />
      
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-card border-b border-border sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/analyzer')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">{t('我的檢查紀錄', '我的检查记录')}</h1>
            <button 
              onClick={() => setShowProfileEdit(true)}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              {profile?.clinic_name} · {profile?.optometrist_name}
              <Settings className="h-3 w-3" />
            </button>
          </div>
        </div>
        <LanguageToggle />
      </header>

      <main className="p-4 max-w-6xl mx-auto space-y-4">
        {/* Info Banner */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-primary">
                {t('資料安全提示', '数据安全提示')}
              </p>
              <p className="text-muted-foreground mt-1">
                {t(
                  '請定期下載備份此檔案，以保留完整顧客資料。系統僅保存去識別化檢查數據。',
                  '请定期下载备份此文件，以保留完整客户资料。系统仅保存去识别化检查数据。'
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('搜尋顧客編號、日期...', '搜索客户编号、日期...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={loadRecords} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {t('重新整理', '刷新')}
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting || records.length === 0}>
                  {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  {t('匯出全部', '导出全部')}
                </Button>
                
                <label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    className="hidden"
                    disabled={isImporting}
                  />
                  <Button variant="outline" size="sm" asChild disabled={isImporting}>
                    <span className="cursor-pointer">
                      {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                      {t('匯入備份', '导入备份')}
                    </span>
                  </Button>
                </label>
                
                {selectedIds.size > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={isDeleting}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t(`刪除 (${selectedIds.size})`, `删除 (${selectedIds.size})`)}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          {t('確認刪除', '确认删除')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t(
                            `確定要刪除選取的 ${selectedIds.size} 筆紀錄嗎？此操作無法復原。`,
                            `确定要删除选取的 ${selectedIds.size} 条记录吗？此操作无法恢复。`
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('取消', '取消')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBatchDelete} className="bg-destructive text-destructive-foreground">
                          {t('確認刪除', '确认删除')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              {t('檢查紀錄', '检查记录')}
            </CardTitle>
            <CardDescription>
              {t(`共 ${records.length} 筆紀錄`, `共 ${records.length} 条记录`)}
              {filteredRecords.length !== records.length && 
                t(` (篩選後 ${filteredRecords.length} 筆)`, ` (筛选后 ${filteredRecords.length} 条)`)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {records.length === 0 
                  ? t('尚無檢查紀錄', '暂无检查记录')
                  : t('沒有符合條件的紀錄', '没有符合条件的记录')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedIds.size === filteredRecords.length && filteredRecords.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>{t('顧客編號', '客户编号')}</TableHead>
                      <TableHead>{t('年齡', '年龄')}</TableHead>
                      <TableHead>{t('性別', '性别')}</TableHead>
                      <TableHead>{t('檢查日期', '检查日期')}</TableHead>
                      <TableHead>{t('健康分數', '健康分数')}</TableHead>
                      <TableHead>{t('診斷', '诊断')}</TableHead>
                      <TableHead className="text-right">{t('操作', '操作')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(record.id)}
                            onCheckedChange={() => toggleSelect(record.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => navigate(`/analyzer?patient_code=${encodeURIComponent(record.patient_code)}`)}
                            className="text-primary hover:underline cursor-pointer"
                          >
                            {record.patient_code}
                          </button>
                        </TableCell>
                        <TableCell>{record.age}</TableCell>
                        <TableCell>{genderLabel(record.gender)}</TableCell>
                        <TableCell>{record.exam_date}</TableCell>
                        <TableCell>
                          {record.health_score !== null ? (
                            <span className={
                              record.health_score >= 80 ? 'text-green-600' :
                              record.health_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }>
                              {record.health_score}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {record.diagnostic_classification || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedPatientCode(record.patient_code);
                                setShowPatientHistory(true);
                              }}
                              title={t('查看歷史', '查看历史')}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowRecordDetail(true);
                              }}
                              title={t('檢視報告', '查看报告')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('確認刪除', '确认删除')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t(
                                      `確定要刪除顧客 ${record.patient_code} 的紀錄嗎？`,
                                      `确定要删除客户 ${record.patient_code} 的记录吗？`
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('取消', '取消')}</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(record.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    {t('刪除', '删除')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Records;
