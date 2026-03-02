'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Loader, Sparkles } from 'lucide-react';

export function AIAssistant() {
  const [input, setInput] = useState('');
  
  const { messages, sendMessage, isLoading, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
    }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setInput('');
    await sendMessage({ text: input });
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-4 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Start a conversation with your AI assistant</p>
                <p className="text-sm mt-2">Ask about organizing your tasks, scheduling, or productivity tips</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm">
                      {message.parts?.map((part: any, i: number) => (
                        <div key={i}>
                          {part.type === 'text' && part.text}
                          {part.type === 'tool-call' && (
                            <Badge variant="outline" className="mt-2">
                              {part.toolName}
                            </Badge>
                          )}
                          {part.type === 'tool-result' && (
                            <div className="text-xs bg-foreground/10 p-2 rounded mt-2">
                              {JSON.stringify(part.result, null, 2)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <Loader className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about your tasks..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="icon"
        >
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
