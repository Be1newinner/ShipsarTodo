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

    const { todoId, assignedTo, delegationMessage } = await request.json();

    const { db } = await connectToDatabase();
    const assignmentCollection = db.collection('assignments');
    const notificationCollection = db.collection('notifications');

    // Create assignment
    const assignment = await assignmentCollection.insertOne({
      todoId: new ObjectId(todoId),
      assignedBy: user.userId,
      assignedTo,
      status: 'pending',
      delegationMessage: delegationMessage || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create notification for assignee
    await notificationCollection.insertOne({
      userId: assignedTo,
      type: 'assignment',
      title: 'New Task Assignment',
      message: delegationMessage || 'You have been assigned a new task',
      read: false,
      relatedId: assignment.insertedId,
      createdAt: new Date(),
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    return NextResponse.json(
      { message: 'Failed to create assignment' },
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const db = await getDb();
    const assignmentCollection = db.collection('assignments');

    const query: any = { assignedTo: user.userId };
    if (status) {
      query.status = status;
    }

    const assignments = await assignmentCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    return NextResponse.json(
      { message: 'Failed to get assignments' },
      { status: 500 }
    );
  }
}
