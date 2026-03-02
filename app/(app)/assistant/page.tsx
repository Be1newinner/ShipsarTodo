'use client';

import { AIAssistant } from '@/components/ai-assistant';

export default function AssistantPage() {
  return (
    <div className="flex-1 flex flex-col h-full p-8 space-y-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">
          Chat with your AI assistant powered by Google Gemini Pro
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <AIAssistant />
      </div>
    </div>
  );
}
