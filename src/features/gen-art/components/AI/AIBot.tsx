// UI Components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Icons
import { Button } from '@/components/ui/button';
import { useSnackbar } from '@/hooks/useSnackbar';
import { CircularProgress, TextareaAutosize } from '@mui/material';
import { ArrowUp } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { RiChatAiLine, RiChatNewLine, RiRobot2Line } from 'react-icons/ri';
import { useChat } from '../../hook/useChat';

interface AIBotProps {
  setCustomUserPrompt?: (prompt: string) => void;
}

const AIBotPopover: React.FC<AIBotProps> = ({ setCustomUserPrompt }) => {
  const [promptExpanded, setPromptExpanded] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { messages, isLoading, sendMessage, clearChat } = useChat();

  const { showSnackbar } = useSnackbar();

  const examplePrompts = [
    'A lonely astronaut on Mars',
    'Cyberpunk samurai walking in the rain',
    'Sunset over a pixel-art mountain',
  ];

  const handleGenerate = async () => {
    const trimmedPrompt = userPrompt.trim();
    if (!trimmedPrompt || isLoading) return;

    // Optimistically clear the input field
    setUserPrompt('');
    setPromptExpanded(false);

    try {
      await sendMessage(trimmedPrompt);
      // The message was sent successfully, nothing more to do here.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // If sending fails, show an error and restore the user's original prompt
      showSnackbar('Failed to send message', 'error');
      setUserPrompt(trimmedPrompt); // Restore the prompt
      setPromptExpanded(true); // Re-expand the input area
    }
  };

  const handleExampleClick = (prompt: string) => {
    setUserPrompt(prompt);
    setPromptExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handlePromptClick = async (prompt: string) => {
    if (setCustomUserPrompt) {
      try {
        setCustomUserPrompt(prompt);
        setIsOpen(false);
        return;
      } catch (err) {
        console.error('Failed to set custom user prompt:', err);
        showSnackbar('Failed to paste prompt', 'error');
      }
    }
    try {
      await navigator.clipboard.writeText(prompt);
      showSnackbar('Prompt copied to clipboard!', 'success');
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
      if (
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node) &&
        !userPrompt.trim()
      ) {
        setPromptExpanded(false);
      }
    };

    if (promptExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [promptExpanded, userPrompt]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="hover:bg-mountain-50 border-mountain-300 ml-4 h-15 w-15 rounded-full border bg-white shadow-md hover:cursor-pointer">
          <RiChatAiLine className="size-8 text-indigo-950" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="border-mountain-200 mb-4 h-128 w-[400px] rounded-xl border bg-white p-0 shadow-xl"
      >
        <div className="border-mountain-100 flex h-16 items-center justify-between border-b p-3">
          <span className="text-mountain-700 text-base font-semibold">
            Imagine Bot
          </span>
          <Button
            onClick={() => {
              clearChat();
              showSnackbar('Started new chat');
            }}
            className="flex cursor-pointer bg-indigo-50 text-indigo-950 hover:bg-indigo-100"
          >
            <RiChatNewLine />
            <p>New Chat</p>
          </Button>
        </div>
        <div className="relative flex h-112 w-full flex-col items-center">
          <div
            ref={scrollRef}
            className="custom-scrollbar flex h-full w-full flex-col overflow-y-auto pb-12"
          >
            {messages.length === 0 ? (
              <div className="mt-12 flex flex-col items-center space-y-6 text-xs">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-mountain-950 border-mountain-300 flex h-15 w-15 items-center justify-center rounded-xl border bg-gradient-to-r shadow">
                      <RiRobot2Line className="size-6 text-white" />
                    </div>
                    <p className="text-base font-medium">Imagine Bot</p>
                  </div>
                  <p className="text-mountain-600 flex w-[360px] text-center text-sm">
                    Spark your creativity with Imagine Bot! Generate unique
                    prompts to inspire your next visual masterpiece.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  {examplePrompts.map((prompt, index) => (
                    <div
                      key={index}
                      onClick={() => handleExampleClick(prompt)}
                      className="hover:bg-mountain-50 text-mountain-600 hover:text-mountain-950 flex w-fit rounded-full border p-2 px-4 transition-colors hover:cursor-pointer"
                    >
                      <p>{prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8 flex flex-col space-y-4 px-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-xl p-4 ${
                        message.role === 'USER'
                          ? 'text-mountain-50 bg-indigo-600'
                          : 'bg-mountain-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {message.role === 'ASSISTANT' &&
                        message.generatedPrompts && (
                          <div className="space-y-2">
                            <p className="text-mountain-500 mb-2 text-xs">
                              Click to use this prompt
                            </p>
                            {message.generatedPrompts.map((prompt, index) => (
                              <div
                                key={index}
                                onClick={() => handlePromptClick(prompt)}
                                className="group border-mountain-200 cursor-pointer rounded-lg border bg-white p-3 transition-all hover:border-indigo-400 hover:shadow-md"
                              >
                                <p className="text-mountain-700 text-sm">
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
                  <div className="flex justify-start">
                    <div className="bg-mountain-100 flex items-center space-x-2 rounded-lg p-4">
                      <CircularProgress size={20} />
                      <span className="text-mountain-600 text-sm">
                        Generating ideas...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            className={`bg-mountain-50 border-mountain-100 z-50 flex w-full rounded-b-xl border border-t px-4 py-2 shadow-md backdrop-blur-md`}
          >
            <div
              className={`border-mountain-200 relative flex h-16 w-full flex-col rounded-xl border bg-white shadow-md`}
            >
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
                className="placeholder:text-mountain-400 custom-scrollbar flex h-full w-full resize-none overflow-y-auto rounded-xl bg-white p-2 pr-24 text-sm outline-none focus:border-transparent focus:ring-0 focus:outline-none"
              />
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !userPrompt.trim()}
                className={`absolute right-4 -bottom-2 flex -translate-y-1/2 items-center px-4 ${
                  isLoading || !userPrompt.trim()
                    ? 'bg-mountain-200 text-mountain-950 cursor-not-allowed'
                    : 'bg-indigo-400 hover:cursor-pointer hover:bg-indigo-300'
                }`}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <ArrowUp />
                )}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AIBotPopover;
