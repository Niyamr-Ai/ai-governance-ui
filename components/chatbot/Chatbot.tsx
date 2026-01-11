"use client";

/**
 * AI Governance Copilot Chatbot
 * 
 * Floating chat button and panel for the AI Governance Copilot.
 * Provides a chat interface that integrates with the chat API.
 */

import { useState, useRef, useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { backendFetch } from '@/utils/backend-fetch';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, Loader2, AlertCircle } from 'lucide-react';
import type { ChatMessage, PageContext, ChatResponse } from '@/types/chatbot';
import { supabase } from '@/utils/supabase/client';
import ReactMarkdown from 'react-markdown';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const params = useParams();

  // Check authentication status and listen for changes
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🤖 Chatbot auth check - session exists:', !!session);
        if (mounted) {
          setIsAuthenticated(!!session);
          setCheckingAuth(false);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        if (mounted) {
          setIsAuthenticated(false);
          setCheckingAuth(false);
        }
      }
    };

    // Initial check
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🤖 Chatbot auth state change:', event, !!session);
        if (mounted) {
          setIsAuthenticated(!!session);
          setCheckingAuth(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  /**
   * Get page context from current route
   */
  function getPageContext(): PageContext {
    const pageType = getPageTypeFromPath(pathname);
    const systemId = params?.id as string | undefined;

    return {
      pageType,
      systemId,
      additionalMetadata: {
        pathname,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Determine page type from pathname
   */
  function getPageTypeFromPath(path: string | null): PageContext['pageType'] {
    if (!path) return 'unknown';
    
    if (path.startsWith('/ai-systems/')) return 'ai-system';
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/compliance')) return 'compliance';
    if (path.startsWith('/discovery')) return 'discovery';
    if (path.startsWith('/documentation')) return 'documentation';
    if (path.startsWith('/policy-tracker')) return 'policy-tracker';
    if (path.startsWith('/red-teaming')) return 'red-teaming';
    if (path.startsWith('/assessment')) return 'assessment';
    
    return 'unknown';
  }

  /**
   * Send message to chat API
   */
  async function handleSendMessage() {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);

    // Add user message to chat
    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userChatMessage]);
    setIsLoading(true);

    try {
      const pageContext = getPageContext();

      const response = await backendFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMessage,
          pageContext,
          conversationHistory: messages
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data: ChatResponse = await response.json();

      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        mode: data.mode
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handle Enter key press
   */
  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  /**
   * Clear chat history
   */
  function handleClearChat() {
    setMessages([]);
    setError(null);
  }

  // Don't render if not authenticated
  if (checkingAuth || !isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-105 transition-transform bg-blue-600 text-white hover:bg-blue-600 hover:text-white"
        size="icon"
        variant="default"
        aria-label="Open AI Governance Copilot"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[600px] flex flex-col shadow-2xl z-50 border-2">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">AI Governance Copilot</h3>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="h-7 text-xs"
                >
                  Clear
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm mb-2">AI Governance Copilot</p>
                <p className="text-xs">
                  Ask me about regulations, analyze your systems, or get actionable next steps.
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <p className="font-medium">Try asking:</p>
                  <ul className="space-y-1 text-left">
                    <li>• "What is the EU AI Act?"</li>
                    <li>• "Is my system compliant?"</li>
                    <li>• "What should I do next?"</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex flex-col gap-2 ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-2" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-2" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1 mt-1" {...props} />,
                              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc mb-2 space-y-1 pl-6" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal mb-2 space-y-1 pl-6" {...props} />,
                              li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                              em: ({node, ...props}) => <em className="italic" {...props} />,
                              code: ({node, ...props}) => <code className="bg-secondary px-1 py-0.5 rounded text-xs" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-2 italic my-2" {...props} />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-2 bg-destructive/10 border-t">
              <div className="flex items-center gap-2 text-destructive text-xs">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

