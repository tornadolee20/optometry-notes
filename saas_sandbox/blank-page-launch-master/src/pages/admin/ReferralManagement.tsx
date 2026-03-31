import React, { useState, useEffect } from 'react';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Users, Gift, CheckCircle, Clock, Plus, Copy } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  code: string;
  type: string;
  phone: string | null;
  bank_account: string | null;
  total_referrals: number;
  total_payout: number;
  is_active: boolean;
  created_at: string;
}

interface ReferralEvent {
  id: string;
  partner_id: string;
  store_name: string;
  amount: number;
  status: string;
  note: string | null;
  paid_at: string | null;
  created_at: string;
  referral_partners?: { name: string; code: string };
}

const TYPE_LABELS: Record<string, string> = {
  temple: '廟方',
  store: '店家夥伴',
  salesperson: '業務',
  partner: '推薦人',
};

export default function ReferralManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [events, setEvents] = useState<ReferralEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPartner, setShowAddPartner] = useState(false);

  // Add partner form
  const [newPartner, setNewPartner] = useState({
    name: '', code: '', type: 'partner', phone: '', bank_account: ''
  });

  // Add event form
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    partner_id: '', store_name: '', amount: 600, note: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: pData }, { data: eData }] = await Promise.all([
      supabase.from('referral_partners').select('*').order('created_at', { ascending: false }),
      supabase.from('referral_events').select('*, referral_partners(name, code)').order('created_at', { ascending: false })
    ]);
    if (pData) setPartners(pData);
    if (eData) setEvents(eData as ReferralEvent[]);
    setLoading(false);
  };

  const addPartner = async () => {
    if (!newPartner.name || !newPartner.code) {
      toast({ variant: 'destructive', title: '請填入姓名與推薦碼' });
      return;
    }
    const { error } = await supabase.from('referral_partners').insert({
      name: newPartner.name,
      code: newPartner.code.toUpperCase(),
      type: newPartner.type,
      phone: newPartner.phone || null,
      bank_account: newPartner.bank_account || null,
    });
    if (error) {
      toast({ variant: 'destructive', title: '新增失敗', description: error.message });
      return;
    }
    toast({ title: '夥伴已新增' });
    setNewPartner({ name: '', code: '', type: 'partner', phone: '', bank_account: '' });
    setShowAddPartner(false);
    fetchData();
  };

  const addEvent = async () => {
    if (!newEvent.partner_id || !newEvent.store_name) {
      toast({ variant: 'destructive', title: '請選擇夥伴並填入店家名' });
      return;
    }
    const { error } = await supabase.from('referral_events').insert({
      partner_id: newEvent.partner_id,
      store_name: newEvent.store_name,
      amount: newEvent.amount,
      note: newEvent.note || null,
      status: 'pending',
    });
    if (error) {
      toast({ variant: 'destructive', title: '新增失敗', description: error.message });
      return;
    }
    // Update partner totals
    const partner = partners.find(p => p.id === newEvent.partner_id);
    if (partner) {
      await supabase.from('referral_partners')
        .update({ total_referrals: partner.total_referrals + 1 })
        .eq('id', partner.id);
    }
    toast({ title: '成交紀錄已新增' });
    setNewEvent({ partner_id: '', store_name: '', amount: 600, note: '' });
    setShowAddEvent(false);
    fetchData();
  };

  const markAsPaid = async (eventId: string, partnerId: string, amount: number) => {
    const { error } = await supabase.from('referral_events')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', eventId);
    if (error) {
      toast({ variant: 'destructive', title: '更新失敗' });
      return;
    }
    const partner = partners.find(p => p.id === partnerId);
    if (partner) {
      await supabase.from('referral_partners')
        .update({ total_payout: partner.total_payout + amount })
        .eq('id', partnerId);
    }
    toast({ title: '已標記為已付款' });
    fetchData();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: `推薦碼 ${code} 已複製` });
  };

  const pendingTotal = events.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
  const paidTotal = events.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
  const pendingCount = events.filter(e => e.status === 'pending').length;

  if (loading) return <AdminPageWrapper><div className="py-12 text-center text-muted-foreground">載入中...</div></AdminPageWrapper>;

  return (
    <AdminPageWrapper>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">推薦獎金管理</h1>
        <p className="text-sm text-muted-foreground mt-0.5">土地公廟 / 夥伴店家 / 業務 推薦佣金追蹤</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">待付佣金</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">NT${pendingTotal.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{pendingCount} 筆待付</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">已付佣金</p>
          <p className="text-2xl font-bold text-green-600 mt-1">NT${paidTotal.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{events.filter(e => e.status === 'paid').length} 筆已付</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">活躍夥伴</p>
          <p className="text-2xl font-bold mt-1">{partners.filter(p => p.is_active).length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">共 {partners.length} 位</p>
        </div>
      </div>

      <Tabs defaultValue="partners" className="space-y-5">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="partners" className="flex items-center gap-1.5 text-xs px-4 py-2">
            <Users className="h-3.5 w-3.5" />夥伴名單
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-1.5 text-xs px-4 py-2">
            <Gift className="h-3.5 w-3.5" />成交紀錄
          </TabsTrigger>
        </TabsList>

        {/* ── Partners tab ── */}
        <TabsContent value="partners" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddPartner(!showAddPartner)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />新增夥伴
            </Button>
          </div>

          {showAddPartner && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <p className="text-sm font-semibold">新增推薦夥伴</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">姓名 / 廟名</Label>
                  <Input placeholder="龍山堂 / 王大明" value={newPartner.name}
                    onChange={e => setNewPartner(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">推薦碼（唯一）</Label>
                  <Input placeholder="LONGSHANDIAN" value={newPartner.code}
                    onChange={e => setNewPartner(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">類型</Label>
                  <select
                    value={newPartner.type}
                    onChange={e => setNewPartner(p => ({ ...p, type: e.target.value }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="temple">廟方</option>
                    <option value="store">店家夥伴</option>
                    <option value="salesperson">業務</option>
                    <option value="partner">推薦人</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">聯絡電話</Label>
                  <Input placeholder="0912-345-678" value={newPartner.phone}
                    onChange={e => setNewPartner(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">銀行帳號（轉帳用）</Label>
                  <Input placeholder="012-1234-5678901" value={newPartner.bank_account}
                    onChange={e => setNewPartner(p => ({ ...p, bank_account: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={addPartner}>確認新增</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddPartner(false)}>取消</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {partners.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">尚無夥伴，點擊「新增夥伴」開始</div>
            )}
            {partners.map(partner => (
              <div key={partner.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{partner.name}</span>
                      <Badge variant="secondary" className="text-xs">{TYPE_LABELS[partner.type] || partner.type}</Badge>
                      {!partner.is_active && <Badge variant="outline" className="text-xs text-muted-foreground">停用</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{partner.code}</code>
                      <button onClick={() => copyCode(partner.code)} className="text-muted-foreground hover:text-foreground">
                        <Copy className="h-3 w-3" />
                      </button>
                      {partner.phone && <span className="text-xs text-muted-foreground">{partner.phone}</span>}
                    </div>
                    {partner.bank_account && (
                      <p className="text-xs text-muted-foreground mt-0.5">帳號：{partner.bank_account}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">NT${partner.total_payout.toLocaleString()} 已付</p>
                    <p className="text-xs text-muted-foreground">{partner.total_referrals} 筆成交</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Events tab ── */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddEvent(!showAddEvent)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />記錄成交
            </Button>
          </div>

          {showAddEvent && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <p className="text-sm font-semibold">新增成交紀錄</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">推薦夥伴</Label>
                  <select
                    value={newEvent.partner_id}
                    onChange={e => setNewEvent(ev => ({ ...ev, partner_id: e.target.value }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">選擇夥伴...</option>
                    {partners.filter(p => p.is_active).map(p => (
                      <option key={p.id} value={p.id}>{p.name}（{p.code}）</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">成交店家名稱</Label>
                  <Input placeholder="三峽豆花店" value={newEvent.store_name}
                    onChange={e => setNewEvent(ev => ({ ...ev, store_name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">佣金金額（NT$）</Label>
                  <Input type="number" value={newEvent.amount}
                    onChange={e => setNewEvent(ev => ({ ...ev, amount: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">備註</Label>
                  <Input placeholder="選填" value={newEvent.note}
                    onChange={e => setNewEvent(ev => ({ ...ev, note: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={addEvent}>確認記錄</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddEvent(false)}>取消</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {events.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">尚無成交紀錄</div>
            )}
            {events.map(event => (
              <div key={event.id} className="rounded-xl border bg-card p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{event.store_name}</span>
                    {event.status === 'paid'
                      ? <Badge className="text-xs bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-0.5" />已付</Badge>
                      : <Badge variant="outline" className="text-xs text-orange-600 border-orange-300"><Clock className="h-3 w-3 mr-0.5" />待付</Badge>
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    推薦人：{event.referral_partners?.name}（{event.referral_partners?.code}）
                    {event.note && ` · ${event.note}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleDateString('zh-TW')}
                    {event.paid_at && ` · 付款：${new Date(event.paid_at).toLocaleDateString('zh-TW')}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">NT${event.amount.toLocaleString()}</span>
                  {event.status === 'pending' && (
                    <Button size="sm" variant="outline" className="text-xs h-7"
                      onClick={() => markAsPaid(event.id, event.partner_id, event.amount)}>
                      標記已付
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  );
}
