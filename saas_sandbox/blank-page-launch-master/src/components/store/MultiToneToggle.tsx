import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FlaskConical } from "lucide-react";

interface MultiToneToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const MultiToneToggle = ({ enabled, onToggle }: MultiToneToggleProps) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-accent to-muted rounded-lg border border-border">
      <FlaskConical className="w-4 h-4 text-primary flex-shrink-0" />
      <Label htmlFor="multi-tone" className="text-sm text-foreground cursor-pointer flex-1">
        🧪 測試多種語氣
        <span className="block text-xs text-muted-foreground font-normal mt-0.5">
          生成感性、簡短有力、專業嚴謹三種風格對比
        </span>
      </Label>
      <Switch
        id="multi-tone"
        checked={enabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
};
