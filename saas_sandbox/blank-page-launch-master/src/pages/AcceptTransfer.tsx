import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendTransferAlert } from '@/services/transferAlertService';

type Status = 'loading' | 'success' | 'error';

const AcceptTransfer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('缺少轉移 Token，請確認連結是否正確');
      return;
    }

    const accept = async () => {
      try {
        const { data, error } = await supabase.rpc('accept_store_transfer', {
          _token: token,
        });

        if (error) throw error;

        const result = data as { success: boolean; error?: string; store_name?: string };

        if (result.success) {
          setStatus('success');
          setStoreName(result.store_name || '');
          setMessage('管理權轉移成功！');

          // Fetch transfer details for notification
          const { data: req } = await supabase
            .from('store_transfer_requests')
            .select('from_owner_email, to_owner_email')
            .eq('transfer_token', token)
            .single();

          if (req) {
            sendTransferAlert({
              type: 'accepted',
              storeName: result.store_name || '',
              fromEmail: req.from_owner_email,
              toEmail: req.to_owner_email,
            });
          }
        } else {
          setStatus('error');
          setMessage(result.error || '轉移失敗');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || '發生未知錯誤');
      }
    };

    accept();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
            <p className="text-muted-foreground">正在處理管理權轉移...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-500" />
            <div>
              <h1 className="text-xl font-semibold">{message}</h1>
              {storeName && (
                <p className="text-muted-foreground mt-1">
                  你已成為「{storeName}」的管理員
                </p>
              )}
            </div>
            <Button asChild>
              <Link to="/login">前往登入管理後台</Link>
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-14 w-14 mx-auto text-destructive" />
            <div>
              <h1 className="text-xl font-semibold">轉移失敗</h1>
              <p className="text-muted-foreground mt-1">{message}</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/">返回首頁</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptTransfer;
