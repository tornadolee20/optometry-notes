import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, LogOut, Mail } from 'lucide-react';

export default function AccountBlocked() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="w-6 h-6" />
              帳號已停用
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">
              您的帳號目前已被停用。如果您認為這是一個錯誤，請聯繫管理員。
            </p>
            
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4" />
                <span className="text-sm">如有疑問，請聯繫系統管理員</span>
              </div>
            </div>

            <Button variant="outline" onClick={handleSignOut} className="w-full gap-2">
              <LogOut className="w-4 h-4" />
              登出
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
