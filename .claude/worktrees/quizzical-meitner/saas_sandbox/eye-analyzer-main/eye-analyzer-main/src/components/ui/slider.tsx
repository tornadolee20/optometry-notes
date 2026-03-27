import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

/**
 * Phase 2: Mobile-optimized Slider component
 * - Thumb: 44px on mobile, 24px on desktop
 * - Track: 8px on mobile, 6px on desktop
 * - Touch hitbox: 56px
 */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      "h-14 md:h-10", // Touch hitbox: 56px mobile, 40px desktop
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 md:h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className={cn(
        "block rounded-full border-2 border-primary bg-background shadow-md",
        "ring-offset-background transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-95",
        "h-11 w-11 md:h-6 md:w-6" // 44px mobile, 24px desktop
      )} 
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
