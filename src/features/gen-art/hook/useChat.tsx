// hooks/useChat.ts
import api from '@/api/baseApi';
import { useCallback, useRef, useState } from 'react';

// Types
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
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  clearError: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store conversation ID for the session
  const conversationIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'USER',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await api.post('/trending/messages', {
          content: content.trim(),
          conversationId: conversationIdRef.current,
        });

        const data = response.data;
        console.log('data chat', data);

        // Store conversation ID for subsequent messages
        if (!conversationIdRef.current) {
          conversationIdRef.current = data.conversationId;
        }

        // Add assistant message
        const assistantMessage: Message = {
          id: data.id,
          role: 'ASSISTANT',
          content: data.content,
          generatedPrompts: data.generatedPrompts,
          createdAt: data.createdAt,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setGeneratedPrompts(data.generatedPrompts || []);

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
