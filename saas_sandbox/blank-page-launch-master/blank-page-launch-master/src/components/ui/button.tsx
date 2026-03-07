import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] hover:shadow-lg hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        // ✨ 全新品牌主按鈕 - 智慧綠漸層
        default: "bg-gradient-to-r from-brand-sage to-brand-sage-dark text-white hover:from-brand-sage-dark hover:to-brand-sage hover:shadow-brand-sage/30 focus:ring-brand-sage/50 shadow-md",
        
        // 破壞性操作 - 保持紅色但優化
        destructive: "bg-gradient-to-r from-error to-red-600 text-white hover:from-red-600 hover:to-error hover:shadow-error/30 focus:ring-error/50 shadow-md",
        
        // 輪廓按鈕 - 智慧綠邊框
        outline: "border-2 border-brand-sage bg-white text-brand-sage hover:border-brand-sage-dark hover:bg-brand-sage/5 hover:text-brand-sage-dark focus:ring-brand-sage/30",
        
        // 次要按鈕 - 淺綠漸層
        secondary: "bg-gradient-to-r from-brand-sage-light/20 to-brand-sage/20 text-brand-sage-dark hover:from-brand-sage-light/30 hover:to-brand-sage/30 hover:shadow-brand-sage-light/20 focus:ring-brand-sage/30",
        
        // 幽靈按鈕 - 智慧綠色調
        ghost: "text-brand-sage-dark hover:bg-brand-sage/10 hover:text-brand-sage focus:ring-brand-sage/30",
        
        // 連結按鈕 - 智慧綠
        link: "text-brand-sage underline-offset-4 hover:underline hover:text-brand-sage-dark",
        
        // 成功按鈕 - 使用成功綠
        success: "bg-gradient-to-r from-success to-green-600 text-white hover:from-green-600 hover:to-success hover:shadow-success/30 focus:ring-success/50 shadow-md",
        
        // 警告按鈕 - 使用品牌金色
        warning: "bg-gradient-to-r from-brand-gold to-yellow-600 text-white hover:from-yellow-600 hover:to-brand-gold hover:shadow-brand-gold/30 focus:ring-brand-gold/50 shadow-md",
        
        // ⭐ 新增：專屬品牌按鈕變體
        coral: "bg-gradient-to-r from-brand-coral to-pink-500 text-white hover:from-pink-500 hover:to-brand-coral hover:shadow-brand-coral/30 focus:ring-brand-coral/50 shadow-md",
        
        indigo: "bg-gradient-to-r from-brand-indigo to-purple-600 text-white hover:from-purple-600 hover:to-brand-indigo hover:shadow-brand-indigo/30 focus:ring-brand-indigo/50 shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
        xl: "h-14 rounded-xl px-10 text-lg font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
