import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ToneStyle =
  | 'casual' | 'warm' | 'humorous' | 'professional'
  | 'storytelling' | 'friend-rec' | 'surprised'
  | 'local' | 'first-timer' | 'concise-punch';

export interface PersonaConfig {
  gender: 'male' | 'female';
  ageGroup: 'student' | 'worker' | 'parent' | 'elder';
  writingStyle: 'concise' | 'narrative' | 'detailed';
  toneStyle?: ToneStyle;
}

/** 根據關鍵字數量自動決定評論長度 */
export function deriveWritingStyle(keywordCount: number): PersonaConfig['writingStyle'] {
  if (keywordCount <= 3) return 'concise';
  if (keywordCount <= 5) return 'narrative';
  return 'detailed';
}

interface PersonaSelectorProps {
  keywordCount: number;
  onConfirm: (persona: PersonaConfig) => void;
  onSkip: () => void;
}

interface OptionItem<T extends string> {
  value: T;
  label: string;
  emoji?: string;
}

const genderOptions: OptionItem<PersonaConfig['gender']>[] = [
  { value: 'male', label: '男生' },
  { value: 'female', label: '女生' },
];

const ageGroupOptions: OptionItem<PersonaConfig['ageGroup']>[] = [
  { value: 'student', label: '學生' },
  { value: 'worker', label: '上班族' },
  { value: 'parent', label: '家長' },
  { value: 'elder', label: '長輩' },
];

const toneStyleOptions: OptionItem<ToneStyle>[] = [
  { value: 'casual',        label: '口語直白',  emoji: '💬' },
  { value: 'warm',          label: '溫暖感性',  emoji: '🤍' },
  { value: 'humorous',      label: '幽默風趣',  emoji: '😄' },
  { value: 'professional',  label: '專業分析',  emoji: '🔬' },
  { value: 'storytelling',  label: '說故事',    emoji: '📖' },
  { value: 'friend-rec',    label: '朋友推薦',  emoji: '👋' },
  { value: 'surprised',     label: '驚喜發現',  emoji: '😲' },
  { value: 'local',         label: '在地熟客',  emoji: '📍' },
  { value: 'first-timer',   label: '初次體驗',  emoji: '✨' },
  { value: 'concise-punch', label: '精簡有力',  emoji: '⚡' },
];

function CardOption<T extends string>({
  item,
  selected,
  onSelect,
  compact = false,
}: {
  item: OptionItem<T>;
  selected: boolean;
  onSelect: (v: T) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.value)}
      className={cn(
        "w-full rounded-xl border-2 font-medium transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        compact ? "min-h-[44px] px-2 py-2 text-xs" : "min-h-[52px] px-4 py-3 text-sm",
        selected
          ? "border-primary bg-primary/10 text-primary shadow-sm scale-[1.02]"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      {item.emoji && <span className="mr-1">{item.emoji}</span>}
      {item.label}
    </button>
  );
}

export const PersonaSelector = ({ keywordCount, onConfirm, onSkip }: PersonaSelectorProps) => {
  const [gender, setGender] = useState<PersonaConfig['gender'] | null>(null);
  const [ageGroup, setAgeGroup] = useState<PersonaConfig['ageGroup'] | null>(null);
  const [toneStyle, setToneStyle] = useState<ToneStyle | null>(null);

  const isComplete = gender && ageGroup && toneStyle;

  const handleConfirm = () => {
    if (!isComplete) return;
    const writingStyle = deriveWritingStyle(keywordCount);
    onConfirm({ gender, ageGroup, writingStyle, toneStyle });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold">讓評論更像你</h3>
        <p className="text-sm text-muted-foreground">選一選，評論更自然</p>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">你是？</p>
        <div className="grid grid-cols-2 gap-2">
          {genderOptions.map((o) => (
            <CardOption key={o.value} item={o} selected={gender === o.value} onSelect={setGender} />
          ))}
        </div>
      </div>

      {/* Age Group */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">你的身份</p>
        <div className="grid grid-cols-4 gap-2">
          {ageGroupOptions.map((o) => (
            <CardOption key={o.value} item={o} selected={ageGroup === o.value} onSelect={setAgeGroup} />
          ))}
        </div>
      </div>

      {/* Tone Style — 10 options */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">你的寫作風格</p>
        <div className="grid grid-cols-2 gap-2">
          {toneStyleOptions.map((o) => (
            <CardOption
              key={o.value}
              item={o}
              selected={toneStyle === o.value}
              onSelect={setToneStyle}
              compact
            />
          ))}
        </div>
      </div>

      {/* Confirm */}
      <Button
        onClick={handleConfirm}
        disabled={!isComplete}
        className="w-full min-h-[48px] text-base font-semibold rounded-xl shadow-md"
      >
        確認，開始生成
      </Button>

      {/* Skip */}
      <div className="text-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          略過此步驟
        </button>
      </div>
    </div>
  );
};
