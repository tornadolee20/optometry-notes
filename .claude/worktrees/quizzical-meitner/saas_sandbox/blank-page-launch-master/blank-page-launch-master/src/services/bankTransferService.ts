
import { supabase } from "@/integrations/supabase/client";

export type TransferStatus = 'pending' | 'verified' | 'rejected';

export interface BankTransferSubmission {
  id: string;
  store_id: string;
  submitted_by: string | null;
  transfer_code: string;
  amount: number | null;
  currency: string;
  status: TransferStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const BankTransferService = {
  async submitTransferCode(storeId: string, transferCode: string, amount?: number) {
    console.log("[BankTransferService] submitTransferCode", { storeId, transferCode, amount });
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? null;

    const payload = {
      store_id: storeId,
      submitted_by: userId,
      transfer_code: transferCode,
      amount: typeof amount === "number" ? amount : null,
      // currency default is TWD on DB side
      status: 'pending' as TransferStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('bank_transfer_submissions')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("[BankTransferService] submit error:", error);
      throw error;
    }

    console.log("[BankTransferService] submit success:", data);
    return data as BankTransferSubmission;
  },

  async listByStore(storeId: string) {
    console.log("[BankTransferService] listByStore", { storeId });
    const { data, error } = await supabase
      .from('bank_transfer_submissions')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("[BankTransferService] list error:", error);
      throw error;
    }
    return (data ?? []) as BankTransferSubmission[];
  },

  async updateStatus(id: string, status: Exclude<TransferStatus, 'pending'>, notes?: string) {
    console.log("[BankTransferService] updateStatus", { id, status, notes });
    const { data, error } = await supabase
      .from('bank_transfer_submissions')
      .update({
        status,
        notes: notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("[BankTransferService] updateStatus error:", error);
      throw error;
    }
    return data as BankTransferSubmission;
  }
};
