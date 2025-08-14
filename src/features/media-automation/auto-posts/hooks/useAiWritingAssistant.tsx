import { nanoid } from 'nanoid';
import { useCallback, useRef, useState } from 'react';
import { editWithAi } from '../api/auto-posts.api';

export interface GeneratedPrompt {
  prompt: string;
  theme: string;
}

export interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  generatedPrompts?: string[];
  createdAt: string;
}

export interface UseChatReturn {
  messages: Message[];
  generatedPrompts: GeneratedPrompt[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (prompt: string, currentContent: string) => Promise<void>;
  clearChat: () => void;
  clearError: () => void;
}

export function useAiWritingAssistant(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store conversation ID for the session
  const conversationIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(
    async (prompt: string, currentContent: string) => {
      if (!prompt.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'USER',
        content: prompt.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const finalPrompt = `${prompt}\n\nCurrent content:\n${currentContent}`;
        const data = await editWithAi(finalPrompt);
        console.log('data chat', data);

        const conversationId = nanoid();

        // Store conversation ID for subsequent messages
        if (!conversationIdRef.current) {
          conversationIdRef.current = conversationId;
        }

        // Add assistant message
        const assistantMessage: Message = {
          id: nanoid(),
          role: 'ASSISTANT',
          content: '',
          generatedPrompts: [data],
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setGeneratedPrompts(data ? [{ prompt: data, theme: '' }] : []);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          'Failed to send message. Please try again.';
        setError(errorMessage);

        // Remove the temporary user message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setGeneratedPrompts([]);
    setError(null);
    conversationIdRef.current = null;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    generatedPrompts,
    isLoading,
    error,
    sendMessage,
    clearChat,
    clearError,
  };
}
