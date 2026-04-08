import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface BinocularExam {
  id: string;
  exam_date: string;
  clinic_name: string;
  overall_level: number | null;
  overall_color: string | null;
  convergence: string | null;
  accommodation: string | null;
  stereopsis: string | null;
  short_conclusion: string | null;
  report_url: string | null;
}

interface PairingCode {
  id: string;
  code: string;
  expires_at: string;
  used: boolean;
}

const colorDot = (color: string | null) => {
  switch (color) {
    case 'green': return <span className="inline-block w-3 h-3 rounded-full bg-success" />;
    case 'yellow': return <span className="inline-block w-3 h-3 rounded-full bg-warning" />;
    case 'red': return <span className="inline-block w-3 h-3 rounded-full bg-destructive" />;
    default: return <span className="inline-block w-3 h-3 rounded-full bg-muted" />;
  }
};

const colorLabel = (color: string | null) => {
  switch (color) {
    case 'green': return '正常';
    case 'yellow': return '需注意';
    case 'red': return '異常';
    default: return '—';
  }
};

const StatusItem = ({ label, value }: { label: string; value: string | null }) => (
  <div className="flex justify-between items-center py-1.5">
    <span className="text-label text-muted-foreground">{label}</span>
    <span className="text-body font-medium text-card-foreground">{value || '—'}</span>
  </div>
);

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

interface Props {
  memberId: string;
}

const BinocularVisionTab = ({ memberId }: Props) => {
  const [exams, setExams] = useState<BinocularExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCode, setActiveCode] = useState<PairingCode | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [examsRes, codesRes] = await Promise.all([
      supabase
        .from('binocular_exams')
        .select('*')
        .eq('member_id', memberId)
        .order('exam_date', { ascending: false }),
      supabase
        .from('pairing_codes')
        .select('*')
        .eq('member_id', memberId)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1),
    ]);

    if (!examsRes.error && examsRes.data) {
      setExams(examsRes.data as BinocularExam[]);
    }
    if (!codesRes.error && codesRes.data && codesRes.data.length > 0) {
      setActiveCode(codesRes.data[0] as PairingCode);
    } else {
      setActiveCode(null);
    }
    setLoading(false);
  }, [memberId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateCode = async () => {
    setGenerating(true);
    const code = generateCode();
    const { data, error } = await supabase
      .from('pairing_codes')
      .insert({ member_id: memberId, code })
      .select()
      .single();

    if (error) {
      // If unique constraint fails, retry once
      const retryCode = generateCode();
      const retry = await supabase
        .from('pairing_codes')
        .insert({ member_id: memberId, code: retryCode })
        .select()
        .single();
      if (retry.error) {
        toast.error('產生配對碼失敗，請重試');
      } else {
        setActiveCode(retry.data as PairingCode);
      }
    } else {
      setActiveCode(data as PairingCode);
    }
    setGenerating(false);
  };

  const handleCopy = async () => {
    if (!activeCode) return;
    await navigator.clipboard.writeText(activeCode.code);
    setCopied(true);
    toast.success('已複製配對碼');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <motion.div key="binocular" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="binocular" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Pairing code section */}
      <div className="bg-card rounded-lg shadow-card p-4 mb-4">
        <h3 className="text-label font-semibold text-muted-foreground mb-3">配對碼</h3>
        {activeCode ? (
          <div className="text-center space-y-2">
            <p className="text-body text-muted-foreground">請將此碼告知您的驗光師</p>
            <div
              className="flex items-center justify-center gap-3 cursor-pointer"
              onClick={handleCopy}
            >
              <span className="text-[32px] font-bold tracking-[0.3em] text-primary">
                {activeCode.code}
              </span>
              {copied ? (
                <Check size={20} className="text-success" />
              ) : (
                <Copy size={20} className="text-muted-foreground" />
              )}
            </div>
            <p className="text-[13px] text-muted-foreground">
              有效時間：24 小時
            </p>
          </div>
        ) : (
          <button
            onClick={handleGenerateCode}
            disabled={generating}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold text-body touch-target active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {generating ? '產生中...' : '產生配對碼'}
          </button>
        )}
      </div>

      {exams.length === 0 ? (
        <div className="bg-card rounded-lg shadow-card p-6 text-center">
          <div className="text-[40px] mb-3">👁️</div>
          <p className="text-body text-muted-foreground">尚未由驗光所提供雙眼視機能檢查</p>
        </div>
      ) : (
        <>
          {/* Latest exam card */}
          <div className="bg-card rounded-lg shadow-card p-4 mb-4 border-l-4 border-primary">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-label font-semibold text-muted-foreground">最新檢查</h3>
              <div className="flex items-center gap-2">
                {colorDot(exams[0].overall_color)}
                <span className="text-[12px] font-medium text-card-foreground">{colorLabel(exams[0].overall_color)}</span>
              </div>
            </div>

            <div className="text-[13px] text-muted-foreground mb-3">
              {exams[0].exam_date} ・ {exams[0].clinic_name}
            </div>

            <div className="divide-y divide-border">
              <StatusItem label="聚合 (Convergence)" value={exams[0].convergence} />
              <StatusItem label="調節 (Accommodation)" value={exams[0].accommodation} />
              <StatusItem label="立體視 (Stereopsis)" value={exams[0].stereopsis} />
            </div>

            {exams[0].short_conclusion && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-label text-muted-foreground mb-1">結論</div>
                <p className="text-body text-card-foreground">{exams[0].short_conclusion}</p>
              </div>
            )}

            {exams[0].report_url && (
              <a
                href={exams[0].report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full py-3 rounded-md bg-primary/10 text-primary font-medium text-body flex items-center justify-center gap-2 touch-target active:scale-[0.98] transition-transform"
              >
                <ExternalLink size={16} />
                查看完整報告
              </a>
            )}
          </div>

          {/* History */}
          {exams.length > 1 && (
            <div className="space-y-2">
              <h3 className="text-label font-semibold text-muted-foreground">歷史紀錄</h3>
              {exams.slice(1).map(exam => (
                <div key={exam.id} className="bg-card rounded-lg shadow-card p-3 flex items-center justify-between">
                  <div>
                    <div className="text-body font-medium text-card-foreground">{exam.exam_date}</div>
                    <div className="text-[13px] text-muted-foreground">{exam.clinic_name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {colorDot(exam.overall_color)}
                    <span className="text-[12px] text-muted-foreground">{colorLabel(exam.overall_color)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default BinocularVisionTab;
