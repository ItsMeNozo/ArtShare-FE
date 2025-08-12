// UI Components
import { Button } from '@/components/ui/button';
import { useSnackbar } from '@/hooks/useSnackbar';
import { CircularProgress, TextareaAutosize } from '@mui/material';
import { ArrowUp } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { RiAiGenerateText, RiChatNewLine } from 'react-icons/ri';
import { useChat } from '../../../../gen-art/hook/useChat';

const AIWritingAssistant: React.FC = () => {
  const [promptExpanded, setPromptExpanded] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const { showSnackbar } = useSnackbar();

  const exampleFeature = [
    'Rewriting, paraphrasing',
    'Grammar, style suggestions',
    'Content enhancement',
  ];

  const handleGenerate = async () => {
    const trimmedPrompt = userPrompt.trim();
    if (!trimmedPrompt || isLoading) return;

    setUserPrompt('');
    setPromptExpanded(false);

    try {
      await sendMessage(trimmedPrompt);
    } catch {
      showSnackbar('Failed to send message', 'error');
      setUserPrompt(trimmedPrompt);
      setPromptExpanded(true);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setUserPrompt(prompt);
    setPromptExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  // Click outside to collapse input if empty
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
    <div className="relative flex flex-col w-full h-[calc(100vh-8rem)]">
      {/* Messages */}
      <div className="relative flex flex-col items-center w-full h-full overflow-y-auto custom-scrollbar">
        <div
          ref={scrollRef}
          className="flex flex-col pb-24 w-full h-full overflow-y-auto custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center space-y-6 mt-12 text-xs">
              <div className="flex flex-col justify-center items-center space-y-2">
                <div className="flex flex-col justify-center items-center space-y-4">
                  <div className="flex justify-center items-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow border border-mountain-300 rounded-xl w-15 h-15">
                    <RiAiGenerateText className="size-8 text-white" />
                  </div>
                  <p className="font-medium text-base">AI Writing Assistant</p>
                </div>
                <p className="flex w-[360px] text-mountain-600 text-sm text-center">
                  Get ideas, improve grammar, adjust tone, and create high-quality drafts faster than ever.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 w-[360px]">
                {exampleFeature.map((sample, index) => (
                  <div
                    key={index}
                    onClick={() => handleExampleClick(sample)}
                    className="flex bg-white hover:bg-mountain-50 p-2 px-4 border rounded-full w-fit text-mountain-600 hover:text-mountain-950 transition-colors hover:cursor-pointer"
                  >
                    <p>{sample}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 mt-8 px-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl p-4 ${message.role === 'USER'
                      ? 'text-mountain-50 bg-indigo-600'
                      : 'bg-mountain-100'
                      }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {message.role === 'ASSISTANT' &&
                      message.generatedPrompts && (
                        <div className="space-y-2">
                          <p className="mb-2 text-mountain-500 text-xs">
                            Click to use this result
                          </p>
                          {message.generatedPrompts.map((prompt, index) => (
                            <div
                              key={index}
                              onClick={() => setUserPrompt(prompt)}
                              className="group bg-white hover:shadow-md p-3 border border-mountain-200 hover:border-indigo-400 rounded-lg transition-all cursor-pointer"
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
                  <div className="flex items-center space-x-2 bg-mountain-100 p-4 rounded-lg">
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
        {/* Input */}
        <div className="bottom-0 z-50 absolute flex justify-center items-center space-x-2 bg-white/30 shadow-md backdrop-blur-md px-4 py-2 border-white/20 border-t rounded-t-xl w-full">
          <Button
            onClick={() => {
              clearChat();
              showSnackbar('Started new chat');
            }}
            className="flex flex-col gap-0 bg-white border border-mountain-200 rounded-full w-16 h-16 font-normal text-indigo-950 cursor-pointer"
          >
            <RiChatNewLine className='size-6' />
            <p className='text-xs'>New</p>
          </Button>
          <div className="relative flex flex-col bg-white shadow-md border border-mountain-200 rounded-xl w-3/4 h-16">
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
              className="flex bg-white p-2 pr-24 focus:border-transparent rounded-xl outline-none focus:outline-none focus:ring-0 w-full h-full overflow-y-auto placeholder:text-mountain-400 text-sm resize-none custom-scrollbar"
            />
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !userPrompt.trim()}
              className={`absolute right-4 -bottom-2 flex -translate-y-1/2 items-center px-4 ${isLoading || !userPrompt.trim()
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
    </div>
  );
};

export default AIWritingAssistant;
