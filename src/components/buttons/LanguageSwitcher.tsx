import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="bg-mountain-100 hover:bg-mountain-200 dark:bg-mountain-900 dark:hover:bg-mountain-800 text-mountain-700 dark:text-mountain-50 flex h-8 w-18 items-center justify-center space-x-1 rounded-full p-1 px-4 hover:cursor-pointer">
          <Globe className="h-4 w-4" />
          <p className="text-sm">{language}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="dark:bg-mountain-900 border-mountain-200 dark:border-mountain-700 border">
        <DropdownMenuItem onClick={() => setLanguage('en')}>
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('vi')}>
          🇻🇳 Tiếng Việt
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
