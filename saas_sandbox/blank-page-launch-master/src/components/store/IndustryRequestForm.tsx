import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Info, Loader2 } from "lucide-react";

interface IndustryRequestFormProps {
  parentIndustryLabel: string;
  onSubmit: (data: { requestedName: string; description: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const IndustryRequestForm = ({
  parentIndustryLabel,
  onSubmit,
  onCancel,
  isSubmitting,
}: IndustryRequestFormProps) => {
  const { toast } = useToast();
  const [requestedName, setRequestedName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; desc?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    const trimName = requestedName.trim();
    const trimDesc = description.trim();

    if (trimName.length < 3 || trimName.length > 15) {
      e.name = "期望的產業名稱請介於 3–15 個字之間";
    }

    // 說明為選填：有填才檢查長度
    if (trimDesc.length > 0 && (trimDesc.length < 3 || trimDesc.length > 60)) {
      e.desc = "說明文字請介於 3–60 個字之間";
    }

    setErrors(e);

    if (Object.keys(e).length > 0) {
      toast({
        variant: "destructive",
        title: "表單尚未填寫完成",
        description: e.name || e.desc,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      requestedName: requestedName.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
      <h4 className="text-sm font-medium text-foreground">
        申請建立新子產業 — {parentIndustryLabel}
      </h4>

      {(errors.name || errors.desc) && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">
            {errors.name || errors.desc}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          期望的產業名稱 <span className="text-destructive">*</span>
        </label>
        <Input
          value={requestedName}
          onChange={(e) => setRequestedName(e.target.value)}
          placeholder="例如：寵物旅館"
          maxLength={15}
          disabled={isSubmitting}
        />
        <div className="mt-1 flex justify-between">
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          <p className="ml-auto text-xs text-muted-foreground">{requestedName.length}/15</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          簡短說明
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="例如：寵物旅館、貓狗安親"
          maxLength={60}
          rows={2}
          disabled={isSubmitting}
        />
        <div className="mt-1 flex justify-between">
          {errors.desc && <p className="text-xs text-destructive">{errors.desc}</p>}
          <p className="ml-auto text-xs text-muted-foreground">{description.length}/60</p>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground/70">
          選填：補充一句讓我們更懂這個產業在做什麼
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-xs">
          此資訊將送交系統管理員審核，協助為您建立對應的產業模板。
        </AlertDescription>
      </Alert>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
          取消
        </Button>
        <Button type="button" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              送出中...
            </>
          ) : (
            "送出需求"
          )}
        </Button>
      </div>
    </div>
  );
};
