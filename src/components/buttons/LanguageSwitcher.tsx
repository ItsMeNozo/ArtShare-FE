import { useLanguage } from "@/context/LanguageProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex justify-center items-center space-x-1 bg-mountain-100 hover:bg-mountain-200 dark:bg-mountain-900 dark:hover:bg-mountain-800 px-4 rounded-lg w-18 hover:cursor-pointer">
                    <Globe className="w-4 h-4" />
                    <p className="text-sm">{language}</p>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-mountain-900 border dark:border-mountain-700">
                <DropdownMenuItem onClick={() => setLanguage("en")}>🇺🇸 English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("vi")}>🇻🇳 Tiếng Việt</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
