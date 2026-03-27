/**
 * 開發者測試面板
 * 只在開發模式下顯示，用於快速載入測試個案
 */
import { useState } from 'react';
import { MOCK_CASES, MockCase } from '@/lib/mockCases';
import { runAllDiagnosticTests, TestSummary, DiagnosticTestResult } from '@/lib/diagnosticTestRunner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FlaskConical, Download, TestTube2, Loader2, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DevTestPanelProps {
  onLoadCase: (caseData: MockCase['data']) => void;
}

const DIAGNOSIS_COLORS: Record<string, string> = {
  NORMAL: 'bg-green-100 text-green-800 border-green-300',
  CI: 'bg-orange-100 text-orange-800 border-orange-300',
  CE: 'bg-red-100 text-red-800 border-red-300',
  AI: 'bg-purple-100 text-purple-800 border-purple-300',
  AE: 'bg-pink-100 text-pink-800 border-pink-300',
  AIFI: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  BX: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  BE: 'bg-blue-100 text-blue-800 border-blue-300',
  DE: 'bg-teal-100 text-teal-800 border-teal-300',
  DI: 'bg-cyan-100 text-cyan-800 border-cyan-300',
};

// 失敗案例詳細列表元件
const FailedCasesList = ({ failedCases }: { failedCases: DiagnosticTestResult[] }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline">
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <AlertTriangle className="w-4 h-4" />
        <span>⚠️ {failedCases.length} 個案例診斷與預期不一致</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {failedCases.map((fc) => (
          <div 
            key={fc.caseId} 
            className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{fc.caseName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({fc.caseId})</span>
              </div>
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 text-xs">
                Health: {fc.actualHealthScore}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* 診斷對比 */}
              <div className="space-y-1">
                <div className="text-gray-500 dark:text-gray-400">診斷碼</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-700 dark:text-green-400">預期：</span>
                  <Badge variant="outline" className={`${DIAGNOSIS_COLORS[fc.expectedDiagnosis] || 'bg-gray-100 text-gray-800'} text-xs`}>
                    {fc.expectedDiagnosis}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-700 dark:text-red-400">實際：</span>
                  <Badge variant="outline" className={`${DIAGNOSIS_COLORS[fc.actualDiagnosis] || 'bg-gray-100 text-gray-800'} text-xs`}>
                    {fc.actualDiagnosis}
                  </Badge>
                  {fc.expectedDiagnosis !== fc.actualDiagnosis && (
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                  )}
                </div>
              </div>

              {/* 優先級對比 */}
              <div className="space-y-1">
                <div className="text-gray-500 dark:text-gray-400">處置優先級</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-700 dark:text-green-400">預期：</span>
                  <Badge variant="outline" className={`text-xs ${
                    fc.expectedPriority === 'Monitor' 
                      ? 'bg-blue-100 text-blue-800 border-blue-300' 
                      : 'bg-orange-100 text-orange-800 border-orange-300'
                  }`}>
                    {fc.expectedPriority === 'Monitor' ? '觀察' : fc.expectedPriority || '-'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-700 dark:text-red-400">實際：</span>
                  <Badge variant="outline" className={`text-xs ${
                    fc.actualPriority === 'Monitor' 
                      ? 'bg-blue-100 text-blue-800 border-blue-300' 
                      : 'bg-orange-100 text-orange-800 border-orange-300'
                  }`}>
                    {fc.actualPriority === 'Monitor' ? '觀察' : fc.actualPriority}
                  </Badge>
                  {fc.expectedPriority && fc.expectedPriority !== fc.actualPriority && (
                    <AlertTriangle className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Mismatches 列表 */}
            {fc.mismatches.length > 0 && (
              <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">差異詳情：</div>
                <div className="flex flex-wrap gap-1">
                  {fc.mismatches.map((m, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className={`text-xs ${
                        m.severity === 'critical' 
                          ? 'bg-red-100 text-red-800 border-red-400' 
                          : 'bg-yellow-100 text-yellow-800 border-yellow-400'
                      }`}
                    >
                      {m.field}: {m.expected} → {m.actual}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const DevTestPanel = ({ onLoadCase }: DevTestPanelProps) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Show toggle button in production, auto-show in development
  const isDev = import.meta.env.DEV;
  
  // In production, show a small toggle button
  if (!isDev && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="text-xs text-muted-foreground hover:text-foreground underline mb-2"
      >
        🧪 顯示測試面板
      </button>
    );
  }

  const selectedCase = MOCK_CASES.find(c => c.id === selectedCaseId);

  const handleLoadCase = () => {
    if (selectedCase) {
      onLoadCase(selectedCase.data);
    }
  };

  const handleRunTests = () => {
    setIsRunningTests(true);
    // 使用 setTimeout 讓 UI 有時間更新
    setTimeout(() => {
      const summary = runAllDiagnosticTests();
      setTestSummary(summary);
      
      // 在 Console 印出失敗案例詳細資訊
      if (summary.failedCases.length > 0) {
        console.group('🧪 診斷規則驗證測試 - 失敗案例');
        console.table(summary.failedCases.map(fc => ({
          caseId: fc.caseId,
          caseName: fc.caseName,
          expectedDiagnosis: fc.expectedDiagnosis,
          actualDiagnosis: fc.actualDiagnosis,
          expectedPriority: fc.expectedPriority || '-',
          actualPriority: fc.actualPriority,
        })));
        console.groupEnd();
      } else {
        console.log('🧪 診斷規則驗證測試 - 全部通過！✅');
      }
      
      setIsRunningTests(false);
    }, 100);
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-amber-800 dark:text-amber-200">🧪 開發者測試面板</h3>
          <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 border-amber-400">
            {isDev ? 'DEV' : 'TEST'}
          </Badge>
        </div>
        {!isDev && (
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            隱藏
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-start gap-3">
        {/* Case Selector */}
        <div className="flex-1 min-w-[200px]">
          <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
            <SelectTrigger className="bg-white dark:bg-gray-800 border-amber-300">
              <SelectValue placeholder="請選擇測試個案..." />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border z-50">
              {MOCK_CASES.map((mockCase) => (
                <SelectItem key={mockCase.id} value={mockCase.id}>
                  {mockCase.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Load Button */}
        <Button
          onClick={handleLoadCase}
          disabled={!selectedCase}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="w-4 h-4 mr-1" />
          載入測試資料
        </Button>
      </div>

      {/* Selected Case Info */}
      {selectedCase && (
        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">預期診斷：</span>
            <Badge 
              variant="outline" 
              className={`font-bold ${DIAGNOSIS_COLORS[selectedCase.expectedDiagnosis] || 'bg-gray-100 text-gray-800'}`}
            >
              {selectedCase.expectedDiagnosis}
            </Badge>
            {selectedCase.expected_priority && (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400">｜</span>
                <Badge 
                  variant="outline" 
                  className={selectedCase.expected_priority === 'Monitor' 
                    ? 'bg-blue-100 text-blue-800 border-blue-300' 
                    : 'bg-red-100 text-red-800 border-red-300'}
                >
                  {selectedCase.expected_priority === 'Monitor' ? '觀察追蹤' : '需處置'}
                </Badge>
              </>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">｜</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">{selectedCase.description}</span>
          </div>
          {/* 顯示詳細預期診斷說明 */}
          {selectedCase.expected_primary_diagnosis && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
              此案例預期為：{selectedCase.expected_primary_diagnosis}
            </p>
          )}
        </div>
      )}

      {/* 規則驗證測試區塊 */}
      <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-700">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleRunTests}
            disabled={isRunningTests}
            variant="outline"
            className="bg-white dark:bg-gray-800 border-amber-400 hover:bg-amber-100"
          >
            {isRunningTests ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <TestTube2 className="w-4 h-4 mr-1" />
            )}
            🧪 執行規則驗證測試
          </Button>

          {/* 測試摘要 */}
          {testSummary && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                總案例數：<strong>{testSummary.totalCases}</strong>
              </span>
              <span className="text-gray-400">｜</span>
              <span className="text-green-600 dark:text-green-400">
                通過：<strong>{testSummary.passed}</strong>
              </span>
              <span className="text-gray-400">｜</span>
              <span className={testSummary.failed > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}>
                失敗：<strong>{testSummary.failed}</strong>
              </span>
              <span className="text-gray-400">｜</span>
              <Badge 
                variant="outline" 
                className={testSummary.passRate === 100 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-yellow-100 text-yellow-800 border-yellow-300'}
              >
                通過率：{testSummary.passRate}%
              </Badge>
            </div>
          )}
        </div>

        {/* 失敗案例可展開詳細列表 */}
        {testSummary && testSummary.failed > 0 && (
          <FailedCasesList failedCases={testSummary.failedCases} />
        )}
      </div>
    </div>
  );
};
