import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  // next-themes
  // const { resolvedTheme, setTheme } = useTheme()
  // const theme = resolvedTheme === "dark"
  // onClick={() => setTheme(theme ? "light" : "dark")}

  return (
    <div
      className={cn(
        'flex h-8 w-16 cursor-pointer rounded-full p-1 transition-all duration-300',
        theme === 'dark'
          ? 'bg-mountain-950 border-mountain-800 border'
          : 'border-mountain-200 border bg-white',
        className,
      )}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
    >
      <div className="flex w-full items-center justify-between">
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300',
            theme === 'dark'
              ? 'bg-mountain-800 translate-x-0 transform'
              : 'bg-mountain-100 translate-x-8 transform',
          )}
        >
          {theme === 'dark' ? (
            <Moon className="h-4 w-4 text-white" strokeWidth={1.5} />
          ) : (
            <Sun className="text-mountain-700 h-4 w-4" strokeWidth={1.5} />
          )}
        </div>
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300',
            theme === 'dark' ? 'bg-transparent' : '-translate-x-8 transform',
          )}
        >
          {theme === 'dark' ? (
            <Sun className="text-mountain-500 h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Moon className="h-4 w-4 text-black" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  );
}
