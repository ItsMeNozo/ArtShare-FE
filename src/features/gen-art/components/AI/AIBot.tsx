// UI Components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Icons
import { RiChatAiLine, RiChatNewLine, RiRobot2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../../hook/useChat";
import { useSnackbar } from "@/hooks/useSnackbar";
import { CircularProgress, TextareaAutosize } from "@mui/material";
import { ArrowUp } from "lucide-react";

const AIBotPopover = () => {
  const [promptExpanded, setPromptExpanded] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  } = useChat();


  const { showSnackbar } = useSnackbar();

  const examplePrompts = [
    "A lonely astronaut on Mars",
    "Cyberpunk samurai walking in the rain",
    "Sunset over a pixel-art mountain"
  ];

  const handleGenerate = async () => {
    if (!userPrompt.trim() || isLoading) return;

    try {
      await sendMessage(userPrompt);
      setUserPrompt('');
      setPromptExpanded(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showSnackbar("Failed to send message", "error")
    }
  };

  const handleExampleClick = (prompt: string) => {
    setUserPrompt(prompt);
    setPromptExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handlePromptClick = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      showSnackbar('Prompt copied to clipboard!', 'success')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showSnackbar('Failed to copy prompt', 'error');
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textareaRef.current &&
        !textareaRef.current.contains(event.target as Node) &&
        !userPrompt.trim()) {
        setPromptExpanded(false);
      }
    };

    if (promptExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [promptExpanded, userPrompt]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="bg-white hover:bg-mountain-50 shadow-md ml-4 border border-mountain-300 rounded-full w-15 h-15 hover:cursor-pointer">
          <RiChatAiLine className="size-8 text-indigo-950" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="bg-white shadow-xl mb-4 p-0 border border-mountain-200 rounded-xl w-[400px] h-[600px]"
      >
        <div className="flex justify-between items-center p-3 border-mountain-100 border-b h-16">
          <span className="font-semibold text-mountain-700 text-base">
            ArtShare AI Bot
          </span>
          <Button
            onClick={() => {
              clearChat();
              showSnackbar('Started new chat');
            }}
            className='flex bg-indigo-50 hover:bg-indigo-100 text-indigo-950 cursor-pointer'
          >
            <RiChatNewLine />
            <p>New Chat</p>
          </Button>
        </div>
        <div className='relative flex flex-col items-center w-full h-[536px]'>
          <div
            ref={scrollRef}
            className='flex flex-col pb-24 w-full h-full overflow-y-auto custom-scrollbar'
          >

            {messages.length === 0 ? (
              <div className='flex flex-col items-center space-y-6 mt-20 text-xs'>
                <div className='flex flex-col justify-center items-center space-y-2'>
                  <div className='flex flex-col justify-center items-center space-y-4'>
                    <div className='flex justify-center items-center bg-mountain-950 bg-gradient-to-r shadow border border-mountain-300 rounded-xl w-15 h-15'>
                      <RiRobot2Line className='size-6 text-white' />
                    </div>
                    <p className='font-medium text-base'>Imagine Bot</p>
                  </div>
                  <p className='flex w-[360px] text-mountain-600 text-sm text-center'>
                    Spark your creativity with Imagine Bot! Generate unique prompts to inspire your next visual masterpiece.
                  </p>
                </div>
                <div className='flex flex-col items-center space-y-2'>
                  {examplePrompts.map((prompt, index) => (
                    <div
                      key={index}
                      onClick={() => handleExampleClick(prompt)}
                      className='flex hover:bg-mountain-50 p-2 px-4 border rounded-full w-fit text-mountain-600 hover:text-mountain-950 transition-colors hover:cursor-pointer'
                    >
                      <p>{prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='flex flex-col space-y-4 mt-8 px-4'>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] rounded-xl p-4 ${message.role === 'USER'
                      ? 'bg-indigo-600 text-mountain-50'
                      : 'bg-mountain-100'
                      }`}>
                      <p className='whitespace-pre-wrap'>{message.content}</p>

                      {message.role === 'ASSISTANT' && message.generatedPrompts && (
                        <div className='space-y-2'>
                          <p className='mb-2 text-mountain-500 text-xs'>
                            Click any prompt to copy:
                          </p>
                          {message.generatedPrompts.map((prompt, index) => (
                            <div
                              key={index}
                              onClick={() => handlePromptClick(prompt)}
                              className='group bg-white hover:shadow-md p-3 border border-mountain-200 hover:border-indigo-400 rounded-lg transition-all cursor-pointer'
                            >
                              <div className='flex justify-between items-center'>
                                <span className='opacity-0 group-hover:opacity-100 text-mountain-400 text-xs transition-opacity'>
                                  📋 Copy
                                </span>
                              </div>
                              <p className='mt-1 text-mountain-700 text-sm'>
                                {prompt}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className='flex justify-start'>
                    <div className='flex items-center space-x-2 bg-mountain-100 p-4 rounded-lg'>
                      <CircularProgress size={20} />
                      <span className='text-mountain-600 text-sm'>Generating ideas...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={`flex w-full rounded-b-xl border-t bg-mountain-50 border-mountain-100 py-2 px-4 z-50 backdrop-blur-md border shadow-md`}>
            <div className={`flex flex-col bg-white border border-mountain-200 shadow-md h-16 rounded-xl w-full relative`}>
              <TextareaAutosize
                value={userPrompt}
                ref={textareaRef}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="Type your idea..."
                disabled={isLoading}
                className='flex bg-white p-2 pr-24 focus:border-transparent rounded-xl outline-none focus:outline-none focus:ring-0 w-full h-full overflow-y-auto placeholder:text-mountain-400 text-sm resize-none custom-scrollbar'
              />
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !userPrompt.trim()}
                className={`right-4 -bottom-2 absolute flex items-center px-4 -translate-y-1/2 ${isLoading || !userPrompt.trim()
                  ? 'bg-mountain-200 text-mountain-950 cursor-not-allowed'
                  : 'bg-indigo-400 hover:bg-indigo-300 hover:cursor-pointer'
                  }`}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowUp />}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AIBotPopover;
