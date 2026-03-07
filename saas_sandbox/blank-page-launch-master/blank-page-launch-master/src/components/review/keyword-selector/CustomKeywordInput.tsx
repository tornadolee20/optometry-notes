
import { Input } from "@/components/ui/input";

interface CustomKeywordInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
}

export const CustomKeywordInput = ({
  value,
  onChange,
  onAdd,
  onFocus,
  onBlur,
  isFocused,
}: CustomKeywordInputProps) => {
  return (
    <div className={`
      transition-all duration-300 relative
      ${isFocused ? "transform scale-[1.02]" : ""}
    `}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="用您自己的話描述感受"
        onKeyPress={(e) => e.key === 'Enter' && onAdd()}
        className="w-full px-4 py-3 text-center rounded-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
      />
      {value && (
        <button
          onClick={onAdd}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600"
        >
          新增
        </button>
      )}
    </div>
  );
};
