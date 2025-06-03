import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RepeatCountGridProps = {
  currentRepeatCount: number;
  onRepeatCountChange: (count: number) => void;
  className?: string;
};

const REPEAT_OPTIONS = [1, 2, 3, 4, 5, 10];

export default function RepeatCountGrid({
  currentRepeatCount,
  onRepeatCountChange,
  className,
}: RepeatCountGridProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)} dir="rtl">
      {REPEAT_OPTIONS.map((count) => (
        <Button
          key={count}
          onClick={() => onRepeatCountChange(count)}
          className={cn(
            "h-10 text-center cursor-pointer transition-all duration-200",
            "hover:scale-105 hover:shadow-sm font-medium",
            currentRepeatCount === count
              ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-sm"
              : "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border-border"
          )}
          variant={currentRepeatCount === count ? "default" : "outline"}
          size="sm"
        >
          {count}
        </Button>
      ))}
    </div>
  );
}
