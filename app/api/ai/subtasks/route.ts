import { NextRequest, NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const subtaskSchema = z.object({
  title: z.string().describe('Clear, actionable subtask title'),
  description: z.string().nullable().describe('Brief description of what needs to be done'),
  estimatedMinutes: z.number().nullable().describe('Estimated time in minutes'),
  order: z.number().describe('Order of subtask (1, 2, 3, ...)'),
});

const subtasksSchema = z.object({
  subtasks: z.array(subtaskSchema).describe('List of generated subtasks'),
  explanation: z.string().describe('Brief explanation of the subtask breakdown'),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { todoTitle, todoDescription, priority } = await request.json();

    if (!todoTitle) {
      return NextResponse.json(
        { message: 'Todo title is required' },
        { status: 400 }
      );
    }

    const prompt = `You are a task breakdown expert. Break down the following task into actionable subtasks.

Task: "${todoTitle}"
${todoDescription ? `Description: ${todoDescription}` : ''}
Priority: ${priority || 'medium'}

Generate 3-5 specific, actionable subtasks. For each subtask:
- Provide a clear title
- Add a brief description
- Estimate time needed (in minutes)
- Order them logically (1, 2, 3, etc.)

Focus on practical, sequential steps that build toward completing the main task.`;

    const result = await generateText({
      model: 'google/gemini-2.0-flash-001',
      prompt,
      output: Output.object({ schema: subtasksSchema }),
    });

    if (result.object) {
      return NextResponse.json(result.object);
    }

    return NextResponse.json(
      { message: 'Failed to generate subtasks' },
      { status: 500 }
    );
  } catch (error) {
    console.error('AI subtask generation error:', error);
    return NextResponse.json(
      { message: 'Failed to generate subtasks' },
      { status: 500 }
    );
  }
}
