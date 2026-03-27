import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { PRICING } from '@/lib/subscriptionUtils';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  plan_type: z.enum(['monthly', 'yearly'], {
    required_error: '請選擇方案',
  }),
  amount: z.coerce.number().min(1, '請輸入匯款金額'),
  paid_at: z.date({
    required_error: '請選擇匯款日期',
  }),
  bank_tail_number: z.string()
    .min(5, '請輸入帳號後五碼')
    .max(5, '請輸入帳號後五碼')
    .regex(/^\d{5}$/, '請輸入5位數字'),
  memo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PaymentReportFormProps {
  onSuccess?: () => void;
}

export function PaymentReportForm({ onSuccess }: PaymentReportFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plan_type: 'yearly',
      amount: PRICING.yearly,
      paid_at: new Date(),
      bank_tail_number: '',
      memo: '',
    },
  });

  const watchPlanType = form.watch('plan_type');

  // Update amount when plan type changes
  const handlePlanChange = (value: 'monthly' | 'yearly') => {
    form.setValue('plan_type', value);
    form.setValue('amount', value === 'monthly' ? PRICING.monthly : PRICING.yearly);
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: '請先登入',
        description: '您需要登入才能提交匯款資料',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('payments').insert({
        user_id: user.id,
        plan_type: data.plan_type,
        amount: data.amount,
        currency: 'TWD',
        payment_provider: 'bank_transfer',
        provider_trade_no: data.bank_tail_number,
        paid_at: data.paid_at.toISOString(),
        note: data.memo || null,
        status: 'pending',
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: '匯款資料已送出',
        description: '我們會在確認款項入帳後為您開通訂閱，通常在 1～2 個工作天內完成。',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: '送出失敗',
        description: '請稍後再試或聯繫客服。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
              匯款資料已收到
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              我們會在確認款項入帳後為您開通或延長訂閱，通常在 1～2 個工作天內完成。
              如有任何問題，歡迎透過 LINE 或 Email 聯繫我們。
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSubmitted(false);
                form.reset();
              }}
            >
              再提交一筆
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-sky-600" />
          匯款資料回報
        </CardTitle>
        <CardDescription>
          完成匯款後，請填寫以下表單，我們會在確認款項入帳後為您開通訂閱。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Plan Selection */}
            <FormField
              control={form.control}
              name="plan_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>選擇方案</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value: 'monthly' | 'yearly') => handlePlanChange(value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇訂閱方案" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">月付方案（NTD {PRICING.monthly.toLocaleString()}）</SelectItem>
                      <SelectItem value="yearly">年付方案（NTD {PRICING.yearly.toLocaleString()}）</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>匯款金額（NTD）</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="請輸入匯款金額"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    預設為所選方案金額，如有其他金額可手動修改
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Date */}
            <FormField
              control={form.control}
              name="paid_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>匯款日期</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "yyyy-MM-dd")
                          ) : (
                            <span>選擇日期</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("2024-01-01")
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bank Tail Number */}
            <FormField
              control={form.control}
              name="bank_tail_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>匯款帳號後五碼</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如：12345"
                      maxLength={5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    請輸入您匯款帳號的後五碼，供我們對帳確認
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Memo */}
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>備註（選填）</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="例如：某某銀行 App 匯款"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? '送出中...' : '送出匯款資料'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
