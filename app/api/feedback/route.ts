import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

    const { todoId, timeSpent, difficulty, completed, notes } =
      await request.json();

    const { db } = await connectToDatabase();
    const feedbackCollection = db.collection('completionFeedback');

    const feedback = await feedbackCollection.insertOne({
      userId: user.userId,
      todoId,
      timeSpent,
      difficulty,
      completed,
      notes: notes || '',
      createdAt: new Date(),
    });

    // Update todo with completion probability based on feedback
    if (completed) {
      const todosCollection = db.collection('todos');
      
      // Get similar todos to calculate average difficulty
      const similarTodos = await feedbackCollection
        .find({ userId: user.userId })
        .toArray();

      const avgTimeSpent =
        similarTodos.reduce((sum, f) => sum + f.timeSpent, 0) /
        similarTodos.length;
      
      // Calculate probability (simple heuristic)
      const completionProbability = Math.min(
        1,
        0.5 + (difficulty === 'easy' ? 0.3 : difficulty === 'medium' ? 0.2 : 0)
      );

      await todosCollection.updateOne(
        { _id: todoId },
        {
          $set: {
            status: 'completed',
            completionProbability,
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Create feedback error:', error);
    return NextResponse.json(
      { message: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const feedbackCollection = db.collection('completionFeedback');

    const feedback = await feedbackCollection
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    return NextResponse.json(
      { message: 'Failed to get feedback' },
      { status: 500 }
    );
  }
}
