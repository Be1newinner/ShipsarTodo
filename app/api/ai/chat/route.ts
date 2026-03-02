import { NextRequest } from 'next/server';
import { streamText, tool } from 'ai';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    const user = verifyToken(token);

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages } = await request.json();

    const { db } = await connectToDatabase();
    const todosCollection = db.collection('todos');
    const userTodos = await todosCollection
      .find({ userId: user.userId })
      .toArray();

    const result = streamText({
      model: 'google/gemini-2.0-flash-001',
      system: `You are an AI assistant helping users manage their tasks and productivity. You have access to their current todos and can help them:
- Organize and prioritize tasks
- Break down complex tasks into subtasks
- Suggest optimal scheduling
- Provide time management tips
- Answer questions about their task management

Current user's todos:
${userTodos.map((t: any) => `- "${t.title}" (${t.status}, ${t.priority} priority)`).join('\n')}

Be helpful, concise, and actionable in your responses.`,
      messages,
      tools: {
        getTodoStats: tool({
          description: 'Get statistics about the user\'s todos',
          parameters: z.object({}),
          execute: async () => {
            const total = userTodos.length;
            const completed = userTodos.filter((t: any) => t.status === 'completed').length;
            const pending = userTodos.filter((t: any) => t.status === 'pending').length;
            const inProgress = userTodos.filter((t: any) => t.status === 'in_progress').length;
            
            return {
              total,
              completed,
              pending,
              inProgress,
              completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            };
          },
        }),
        searchTodos: tool({
          description: 'Search for todos by title or keyword',
          parameters: z.object({
            query: z.string().describe('Search query'),
          }),
          execute: async ({ query }) => {
            return userTodos
              .filter((t: any) =>
                t.title.toLowerCase().includes(query.toLowerCase()) ||
                t.description?.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5);
          },
        }),
        getPriorityBreakdown: tool({
          description: 'Get breakdown of todos by priority',
          parameters: z.object({}),
          execute: async () => {
            return {
              high: userTodos.filter((t: any) => t.priority === 'high').length,
              medium: userTodos.filter((t: any) => t.priority === 'medium').length,
              low: userTodos.filter((t: any) => t.priority === 'low').length,
            };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('AI chat error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
