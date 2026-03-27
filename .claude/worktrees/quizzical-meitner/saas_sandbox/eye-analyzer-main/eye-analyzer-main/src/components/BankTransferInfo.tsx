import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { BANK_TRANSFER_INFO } from '@/lib/subscriptionUtils';

interface BankTransferInfoProps {
  showInstructions?: boolean;
  compact?: boolean;
}

export function BankTransferInfo({ showInstructions = true, compact = false }: BankTransferInfoProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className={`${compact ? 'bg-slate-50' : 'bg-gradient-to-br from-slate-50 to-white'} border-slate-200`}>
      <CardHeader className={compact ? 'pb-2' : ''}>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Building2 className="w-5 h-5 text-sky-600" />
          付款方式：銀行轉帳
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600 text-sm">
          目前採銀行轉帳方式收費，完成匯款後由管理員人工開通或延長使用權。
        </p>
        
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-sm">銀行代碼：</span>
              <span className="font-mono font-semibold text-slate-800 ml-2">{BANK_TRANSFER_INFO.bankCode}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(BANK_TRANSFER_INFO.bankCode, 'bankCode')}
            >
              {copied === 'bankCode' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-sm">銀行名稱：</span>
              <span className="font-semibold text-slate-800 ml-2">{BANK_TRANSFER_INFO.bankName}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-sm">帳號：</span>
              <span className="font-mono font-semibold text-slate-800 ml-2">{BANK_TRANSFER_INFO.accountNumber}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(BANK_TRANSFER_INFO.accountNumber, 'accountNumber')}
            >
              {copied === 'accountNumber' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {showInstructions && (
          <>
            <div className="text-sm text-slate-600 space-y-2">
              <p className="font-medium">匯款完成後，請提供以下資訊供我們對帳：</p>
              <ul className="list-disc list-inside space-y-1 text-slate-500 ml-2">
                <li>你的系統登入 email</li>
                <li>選擇的方案：月繳 NT$ 500 或 年繳 NT$ 3,600</li>
                <li>匯款金額</li>
                <li>匯款日期與時間</li>
                <li>匯款帳號後五碼</li>
                <li>你的姓名或店名</li>
              </ul>
            </div>
            
            <p className="text-xs text-slate-400">
              請將以上資訊透過 LINE 或 Email 傳給管理員，我們會在 24 小時內為你開通或延長使用權（通常會更快）。
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
