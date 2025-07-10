import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TabProps {
  text: string;
  selected: boolean;
  setSelected: (text: string) => void;
  discount?: boolean;
}

export function Tab({
  text,
  selected,
  setSelected,
  discount = false,
}: TabProps) {
  return (
    <button
      onClick={() => setSelected(text)}
      className={cn(
        'relative w-fit cursor-pointer px-4 py-2 text-sm font-medium capitalize',
        'text-foreground transition-colors',
        discount && 'flex items-center justify-center gap-2.5',
      )}
    >
      <span className="relative z-10">{text}</span>
      {selected && (
        <motion.span
          layoutId="tab"
          className="bg-background border-mountain-100 absolute inset-0 z-0 rounded-full border shadow-sm"
        />
      )}
      {discount && (
        <Badge
          variant="secondary"
          className={cn(
            'bg-muted text-mountain-400 relative z-10 whitespace-nowrap shadow-none',
            selected && 'text-mountain-600',
          )}
        >
          Save 20%
        </Badge>
      )}
    </button>
  );
}
