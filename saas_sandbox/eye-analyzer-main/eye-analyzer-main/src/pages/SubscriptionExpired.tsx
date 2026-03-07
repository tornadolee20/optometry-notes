import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, LogOut } from 'lucide-react';
import { BankTransferInfo } from '@/components/BankTransferInfo';
import { PRICING } from '@/lib/subscriptionUtils';

export default function SubscriptionExpired() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-6 h-6" />
              訂閱已到期
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              您的訂閱方案已到期，請續費以繼續使用系統。
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="border border-slate-200 bg-white rounded-lg p-4">
                <h3 className="font-semibold text-slate-800 mb-2">月繳方案</h3>
                <p className="text-xl font-bold text-sky-600">
                  NT$ {PRICING.monthly.toLocaleString()} <span className="text-sm font-normal text-slate-500">/月</span>
                </p>
              </div>
              <div className="border-2 border-sky-500 bg-white rounded-lg p-4">
                <h3 className="font-semibold text-slate-800 mb-2">年繳方案（推薦）</h3>
                <p className="text-xl font-bold text-sky-600">
                  NT$ {PRICING.yearly.toLocaleString()} <span className="text-sm font-normal text-slate-500">/年</span>
                </p>
                <p className="text-sm text-green-600">平均每月 NT$ 300</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <BankTransferInfo showInstructions={true} />

        <div className="flex justify-center">
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            登出
          </Button>
        </div>
      </div>
    </div>
  );
}
