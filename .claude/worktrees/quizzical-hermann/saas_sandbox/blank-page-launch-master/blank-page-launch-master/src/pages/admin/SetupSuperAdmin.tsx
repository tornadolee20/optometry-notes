import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export const SetupSuperAdmin = () => {
  const [email, setEmail] = useState('tornadolee20@yahoo.com.tw');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSetSuperAdmin = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: '請輸入電子郵件地址',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 調用 edge function 使用 service role 權限設置 super_admin
      const { data, error } = await supabase.functions.invoke('setup-super-admin', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: '成功',
        description: `已將 ${email} 設置為超級管理員`,
      });

      console.log('角色設置成功:', data);
    } catch (error: any) {
      console.error('設置超級管理員失敗:', error);
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: error.message || '設置超級管理員失敗',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>設置超級管理員</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">電子郵件</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <Button
            onClick={handleSetSuperAdmin}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '處理中...' : '設置為超級管理員'}
          </Button>
          <p className="text-sm text-muted-foreground">
            這將為指定的用戶帳號分配 super_admin 角色權限
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupSuperAdmin;
