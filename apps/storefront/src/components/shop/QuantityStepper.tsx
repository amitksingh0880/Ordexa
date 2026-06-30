import { Minus, Plus } from "lucide-react";
import { Button } from "@ui/components/ui/button";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export function QuantityStepper({ value, onChange, min = 1 }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-surface-container px-2 py-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6 rounded-full text-ink-soft hover:bg-transparent hover:text-ink"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="w-5 text-center font-body text-sm tabular-nums">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6 rounded-full text-ink-soft hover:bg-transparent hover:text-ink"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
