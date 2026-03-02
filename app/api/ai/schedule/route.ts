import { NextRequest, NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const scheduleSchema = z.object({
  recommendedDate: z.string().describe('Recommended date in YYYY-MM-DD format'),
  recommendedTime: z.string().describe('Recommended time in HH:MM format (24-hour)'),
  reasoning: z.string().describe('Brief explanation of why this time is recommended'),
  alternativeSlots: z.array(
    z.object({
      date: z.string().describe('Date in YYYY-MM-DD format'),
      time: z.string().describe('Time in HH:MM format'),
      reason: z.string().describe('Why this slot works'),
    })
  ).describe('2-3 alternative time slots'),
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

    const {
      todoTitle,
      estimatedMinutes,
      priority,
      upcomingTodos,
      workHoursStart = 9,
      workHoursEnd = 17,
    } = await request.json();

    if (!todoTitle || !estimatedMinutes) {
      return NextResponse.json(
        { message: 'Todo title and estimated minutes are required' },
        { status: 400 }
      );
    }

    const upcomingContext = upcomingTodos
      .map(
        (t: any) =>
          `- "${t.title}" on ${new Date(t.dueDate).toLocaleDateString()} at ${new Date(t.dueDate).toLocaleTimeString()}`
      )
      .join('\n');

    const prompt = `You are a productivity assistant. Suggest the optimal time to schedule the following task.

Task: "${todoTitle}"
Duration: ${estimatedMinutes} minutes
Priority: ${priority}
Work Hours: ${workHoursStart}:00 - ${workHoursEnd}:00
Today's Date: ${new Date().toLocaleDateString()}

Current upcoming tasks:
${upcomingContext || 'No conflicts'}

Recommend a specific date and time within the next 7 days that:
1. Falls within work hours (${workHoursStart}:00 - ${workHoursEnd}:00)
2. Avoids conflicts with existing tasks
3. Matches the priority level
4. Allows for proper focus time (no fragmentation)

Provide the primary recommendation and 2-3 alternatives. Consider task duration and priority when recommending time slots.`;

    const result = await generateText({
      model: 'google/gemini-2.0-flash-001',
      prompt,
      output: Output.object({ schema: scheduleSchema }),
    });

    if (result.object) {
      return NextResponse.json(result.object);
    }

    return NextResponse.json(
      { message: 'Failed to generate schedule' },
      { status: 500 }
    );
  } catch (error) {
    console.error('AI scheduling error:', error);
    return NextResponse.json(
      { message: 'Failed to generate schedule' },
      { status: 500 }
    );
  }
}
