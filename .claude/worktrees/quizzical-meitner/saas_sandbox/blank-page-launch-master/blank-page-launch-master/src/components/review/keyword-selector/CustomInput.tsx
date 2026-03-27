
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CustomInputProps {
  onSubmit: (value: string) => void;
}

export const CustomInput = ({ onSubmit }: CustomInputProps) => {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <div className={`transition-all duration-300 ${
      isFocused ? "scale-[1.02]" : ""
    }`}>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="用自己的話描述你的感受"
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        className="text-base md:text-lg py-6"
      />
    </div>
  );
};
