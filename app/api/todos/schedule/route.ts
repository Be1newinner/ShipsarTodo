import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

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

    const { todoId, scheduledDate, suggestedTime } = await request.json();

    const { db } = await connectToDatabase();
    const todosCollection = db.collection('todos');

    const todo = await todosCollection.findOneAndUpdate(
      {
        _id: new ObjectId(todoId),
        userId: user.userId,
      },
      {
        $set: {
          scheduledDate: new Date(scheduledDate),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!todo.value) {
      return NextResponse.json(
        { message: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(todo.value);
  } catch (error) {
    console.error('Schedule todo error:', error);
    return NextResponse.json(
      { message: 'Failed to schedule todo' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const { db } = await connectToDatabase();
    const todosCollection = db.collection('todos');

    const query: any = { userId: user.userId };

    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const todos = await todosCollection
      .find(query)
      .sort({ scheduledDate: 1 })
      .toArray();

    return NextResponse.json(todos);
  } catch (error) {
    console.error('Get scheduled todos error:', error);
    return NextResponse.json(
      { message: 'Failed to get scheduled todos' },
      { status: 500 }
    );
  }
}
