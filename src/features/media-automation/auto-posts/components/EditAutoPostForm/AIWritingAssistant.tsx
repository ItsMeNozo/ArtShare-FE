// UI Components
import { Button } from '@/components/ui/button';
import { useSnackbar } from '@/hooks/useSnackbar';
import { CircularProgress, TextareaAutosize } from '@mui/material';
import { useFormikContext } from 'formik';
import { ArrowUp } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { RiAiGenerateText, RiChatNewLine } from 'react-icons/ri';
import { useAiWritingAssistant } from '../../hooks/useAiWritingAssistant';
import { AutoPostFormValues } from '../../types';

const AIWritingAssistant: React.FC = () => {
  const [promptExpanded, setPromptExpanded] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setFieldValue, values } = useFormikContext<AutoPostFormValues>();

  const { messages, isLoading, sendMessage, clearChat } =
    useAiWritingAssistant();

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
      await sendMessage(trimmedPrompt, values.content);
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

  const handleResultClick = (prompt: string) => {
    setFieldValue('content', prompt);
  };

  return (
    <div className="relative flex h-[calc(100vh-8rem)] w-full flex-col">
      {/* Messages */}
      <div className="custom-scrollbar relative flex h-full w-full flex-col items-center overflow-y-auto">
        <div
          ref={scrollRef}
          className="custom-scrollbar flex h-full w-full flex-col overflow-y-auto pb-24"
        >
          {messages.length === 0 ? (
            <div className="mt-12 flex flex-col items-center space-y-6 text-xs">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="border-mountain-300 flex h-15 w-15 items-center justify-center rounded-xl border bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow">
                    <RiAiGenerateText className="size-8 text-white" />
                  </div>
                  <p className="text-base font-medium">AI Writing Assistant</p>
                </div>
                <p className="text-mountain-600 flex w-[360px] text-center text-sm">
                  Get ideas, improve grammar, adjust tone, and create
                  high-quality drafts faster than ever.
                </p>
              </div>
              <div className="flex w-[360px] flex-col items-center space-y-2">
                {exampleFeature.map((sample, index) => (
                  <div
                    key={index}
                    onClick={() => handleExampleClick(sample)}
                    className="hover:bg-mountain-50 text-mountain-600 hover:text-mountain-950 flex w-fit rounded-full border bg-white p-2 px-4 transition-colors hover:cursor-pointer"
                  >
                    <p>{sample}</p>
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
                            Click to use this result
                          </p>
                          {message.generatedPrompts.map((prompt, index) => (
                            <div
                              key={index}
                              onClick={() => handleResultClick(prompt)}
                              className="group border-mountain-200 cursor-pointer rounded-lg border bg-white p-3 transition-all hover:border-indigo-400 hover:shadow-md"
                            >
                              <p className="text-mountain-700 max-w-full text-sm break-words whitespace-pre-line">
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
        {/* Input */}
        <div className="absolute bottom-0 z-50 flex w-full items-center justify-center space-x-2 rounded-t-xl border-t border-white/20 bg-white/30 px-4 py-2 shadow-md backdrop-blur-md">
          <Button
            type="button"
            onClick={() => {
              clearChat();
              showSnackbar('Started new chat');
            }}
            className="border-mountain-200 flex h-16 w-16 cursor-pointer flex-col gap-0 rounded-full border bg-white font-normal text-indigo-950"
          >
            <RiChatNewLine className="size-6" />
            <p className="text-xs">New</p>
          </Button>
          <div className="border-mountain-200 relative flex h-16 w-3/4 flex-col rounded-xl border bg-white shadow-md">
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
    </div>
  );
};

export default AIWritingAssistant;
