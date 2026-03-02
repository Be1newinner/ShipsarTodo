import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const todosCollection = db.collection('todos');

    const todos = await todosCollection
      .find({ userId: payload.userId })
      .sort({ dueDate: 1 })
      .toArray();

    return NextResponse.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, dueDate, priority, estimatedTime } = body;

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const todosCollection = db.collection('todos');

    const newTodo = {
      userId: payload.userId,
      title,
      description: description || '',
      dueDate,
      priority: priority || 'medium',
      status: 'pending',
      estimatedTime: estimatedTime || 0,
      actualTime: 0,
      completionProbability: 50,
      subtasks: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await todosCollection.insertOne(newTodo);

    return NextResponse.json(
      { _id: result.insertedId, ...newTodo },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create todo error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
