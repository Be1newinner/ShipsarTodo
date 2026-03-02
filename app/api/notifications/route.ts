import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

    const { db } = await connectToDatabase();
    const notificationCollection = db.collection('notifications');

    const notifications = await notificationCollection
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { message: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = await request.json();

    const db = await getDb();
    const notificationCollection = db.collection('notifications');

    const updated = await notificationCollection.findOneAndUpdate(
      {
        _id: notificationId,
        userId: user.userId,
      },
      {
        $set: { read: true },
      },
      { returnDocument: 'after' }
    );

    return NextResponse.json(updated.value);
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { message: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
