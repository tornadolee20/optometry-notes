import { useIndustryTree, findParentId } from "@/hooks/useIndustryTree";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface IndustrySelectorProps {
  value: string | null | undefined;
  onChange: (childTemplateId: string) => void;
  onOtherRequest?: (parentId: string) => void;
  disabled?: boolean;
  hasPendingRequest?: boolean;
}

/**
 * 兩層行業別下拉選單：先選父層（大類），再選子層（子模板）
 * 最終回傳的是子層 template_id
 */
export const IndustrySelector = ({
  value,
  onChange,
  onOtherRequest,
  disabled,
  hasPendingRequest,
}: IndustrySelectorProps) => {
  const { data: tree = [], isLoading } = useIndustryTree();
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedChild, setSelectedChild] = useState(value || "");

  // When tree loads or value changes, derive parent from current child value
  useEffect(() => {
    if (tree.length > 0 && value) {
      const parentId = findParentId(tree, value);
      if (parentId) {
        setSelectedParent(parentId);
        setSelectedChild(value);
      }
    }
  }, [tree, value]);

  const currentParent = tree.find((p) => p.value === selectedParent);
  const children = currentParent?.children || [];

  const handleParentChange = (parentId: string) => {
    setSelectedParent(parentId);
    setSelectedChild(""); // Reset child when parent changes
  };

  const handleChildChange = (childId: string) => {
    if (childId === "__other__") {
      if (hasPendingRequest) {
        return; // Will be handled by parent showing a message
      }
      onOtherRequest?.(selectedParent);
      return;
    }
    setSelectedChild(childId);
    onChange(childId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        載入行業選項中...
      </div>
    );
  }

  const selectClass =
    "w-full px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-3">
      {/* Parent select */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">產業大類</label>
        <select
          value={selectedParent}
          onChange={(e) => handleParentChange(e.target.value)}
          className={selectClass}
          disabled={disabled}
        >
          <option value="">請選擇產業大類</option>
          {tree.map((p) => (
            <option key={p.value} value={p.value}>
              {p.emoji} {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Child select */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">產業子類（模板）</label>
        <select
          value={selectedChild}
          onChange={(e) => handleChildChange(e.target.value)}
          className={selectClass}
          disabled={disabled || !selectedParent}
        >
          <option value="">
            {selectedParent ? "請選擇產業子類" : "請先選擇產業大類"}
          </option>
          {children.map((c) => (
            <option key={c.value} value={c.value}>
              {c.emoji} {c.label}
            </option>
          ))}
          {selectedParent && (
            <option value="__other__">📋 其他（需要協助建立）</option>
          )}
        </select>
      </div>
    </div>
  );
};
