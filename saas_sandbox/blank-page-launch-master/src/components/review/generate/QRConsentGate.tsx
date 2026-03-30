
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface QRConsentGateProps {
  storeName: string;
  onAgree: () => void;
}

export const QRConsentGate: React.FC<QRConsentGateProps> = ({ storeName, onAgree }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardContent className="p-6 sm:p-8 space-y-5">
          <p className="text-center text-sm text-muted-foreground">{storeName}</p>
          <h2 className="text-xl font-bold text-center text-foreground">使用前請確認</h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            本工具將協助您根據個人親身體驗整理評論草稿，方便您參考後自行發佈到 Google Maps。
          </p>

          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 pl-1">
            <li>您所選擇的關鍵真實感受，應來自您的真實親身體驗</li>
            <li>最終發佈行為由您本人決定，本平台不代替您發布</li>
            <li>
              您的感受選擇及 IP 資訊將依
              <Link to="/privacy-policy" className="text-primary underline underline-offset-2 mx-0.5">
                隱私權政策
              </Link>
              及
              <Link to="/terms-of-service" className="text-primary underline underline-offset-2 mx-0.5">
                服務條款
              </Link>
              保存
            </li>
          </ol>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="consent"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="consent" className="text-sm leading-snug cursor-pointer select-none">
              我已閱讀並同意，且我所選擇的感受係基於我的真實親身體驗
            </Label>
          </div>

          <Button
            onClick={onAgree}
            disabled={!agreed}
            className="w-full"
            size="lg"
          >
            開始選擇感受 →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
