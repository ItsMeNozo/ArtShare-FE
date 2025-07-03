// UI Components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Icons
import { RiChatAiLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import SuggestPrompt from "./SuggestPrompt";

const AIBotPopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button className="bg-white hover:bg-mountain-50 shadow-md ml-4 border border-mountain-300 rounded-full w-15 h-15 hover:cursor-pointer">
          <RiChatAiLine className="size-8 text-indigo-950" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="bg-white shadow-xl mb-4 p-0 border border-mountain-200 rounded-xl w-[400px] h-[600px]"
      >
        <div className="flex justify-between items-center p-3 border-mountain-100 border-b">
          <span className="font-semibold text-mountain-700 text-base">
            ArtShare AI Bot
          </span>
        </div>
        <div className="relative w-full h-full">
          <SuggestPrompt />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AIBotPopover;
