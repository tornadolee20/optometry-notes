import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PersonaConfig {
  gender: 'male' | 'female';
  ageGroup: 'student' | 'worker' | 'parent' | 'elder';
  writingStyle: 'concise' | 'narrative' | 'detailed';
}

interface PersonaSelectorProps {
  onConfirm: (persona: PersonaConfig) => void;
  onSkip: () => void;
}

interface OptionItem<T extends string> {
  value: T;
  label: string;
  sub?: string;
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

const writingStyleOptions: OptionItem<PersonaConfig['writingStyle']>[] = [
  { value: 'concise', label: '簡短', sub: '約 80 字' },
  { value: 'narrative', label: '自然', sub: '約 150 字' },
  { value: 'detailed', label: '詳細', sub: '約 250 字' },
];

function CardOption<T extends string>({
  item,
  selected,
  onSelect,
}: {
  item: OptionItem<T>;
  selected: boolean;
  onSelect: (v: T) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.value)}
      className={cn(
        "min-h-[52px] w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/10 text-primary shadow-sm scale-[1.02]"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      <span className="block font-semibold">{item.label}</span>
      {item.sub && (
        <span className={cn("block text-xs mt-0.5", selected ? "text-primary/70" : "text-muted-foreground")}>
          {item.sub}
        </span>
      )}
    </button>
  );
}

export const PersonaSelector = ({ onConfirm, onSkip }: PersonaSelectorProps) => {
  const [gender, setGender] = useState<PersonaConfig['gender'] | null>(null);
  const [ageGroup, setAgeGroup] = useState<PersonaConfig['ageGroup'] | null>(null);
  const [writingStyle, setWritingStyle] = useState<PersonaConfig['writingStyle'] | null>(null);

  const isComplete = gender && ageGroup && writingStyle;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold">讓評論更像你</h3>
        <p className="text-sm text-muted-foreground">3 秒選完，評論更自然</p>
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

      {/* Writing Style */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">評論長度</p>
        <div className="grid grid-cols-3 gap-2">
          {writingStyleOptions.map((o) => (
            <CardOption key={o.value} item={o} selected={writingStyle === o.value} onSelect={setWritingStyle} />
          ))}
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={() => isComplete && onConfirm({ gender, ageGroup, writingStyle })}
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
