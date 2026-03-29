import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";

interface IndustryTemplate {
  template_id: string;
  label: string;
  emoji: string;
  parent_id: string | null;
}

interface DemoIndustrySelectorProps {
  value: string | null;
  onChange: (templateId: string, label: string) => void;
}

const DemoIndustrySelector = ({ value, onChange }: DemoIndustrySelectorProps) => {
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("industry_templates")
        .select("template_id, label, emoji, parent_id")
        .eq("is_active", true)
        .order("sort_order");
      setTemplates(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const categories = useMemo(
    () => templates.filter((t) => !t.parent_id),
    [templates]
  );

  const childrenOf = (catId: string) =>
    templates.filter((t) => t.parent_id === catId);

  const selectedTemplate = templates.find((t) => t.template_id === value);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        載入產業類別…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">
        你是哪一種店？
      </label>

      {selectedTemplate && (
        <div className="flex items-center gap-2 text-sm bg-status-info-bg text-status-info-fg border border-status-info-border rounded-md px-3 py-2">
          <span>{selectedTemplate.emoji}</span>
          <span className="font-medium">{selectedTemplate.label}</span>
          <button
            onClick={() => {
              onChange("", "");
              setExpandedCategory(null);
            }}
            className="ml-auto text-xs underline underline-offset-2 opacity-70 hover:opacity-100"
          >
            重選
          </button>
        </div>
      )}

      {!value && (
        <div className="border border-border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
          {categories.map((cat) => {
            const children = childrenOf(cat.template_id);
            const isExpanded = expandedCategory === cat.template_id;

            return (
              <div key={cat.template_id}>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : cat.template_id)
                  }
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors",
                    isExpanded && "bg-accent/30"
                  )}
                >
                  <span>{cat.emoji}</span>
                  <span className="flex-1 text-left">{cat.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && children.length > 0 && (
                  <div className="bg-muted/30">
                    {children.map((child) => (
                      <button
                        key={child.template_id}
                        type="button"
                        onClick={() =>
                          onChange(child.template_id, child.label)
                        }
                        className="w-full flex items-center gap-2 pl-8 pr-3 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors"
                      >
                        <span>{child.emoji}</span>
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!value && (
        <p className="text-xs text-muted-foreground">
          選擇後，示範評論會更貼近你的產業用語。
        </p>
      )}
    </div>
  );
};

export default DemoIndustrySelector;
