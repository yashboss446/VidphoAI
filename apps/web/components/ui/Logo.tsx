import { Clapperboard } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Logo({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const iconBox = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  const iconSize = size === 'sm' ? 15 : size === 'lg' ? 22 : 18;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-gradient-brand shadow-glow-sm',
          iconBox,
        )}
      >
        <Clapperboard size={iconSize} className="text-white" strokeWidth={2.25} />
      </div>
      <span className={cn('font-display font-semibold tracking-tight text-ink', textSize)}>
        VidphoAI
      </span>
    </div>
  );
}
