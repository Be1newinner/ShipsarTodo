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

    const { memberEmail } = await request.json();

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    const teamCollection = db.collection('teams');

    // Check if member exists
    const member = await usersCollection.findOne({ email: memberEmail });
    if (!member) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if team exists for this user
    let team = await teamCollection.findOne({ owner: user.userId });
    if (!team) {
      team = await teamCollection.insertOne({
        owner: user.userId,
        members: [
          {
            _id: user.userId,
            email: user.email,
            name: user.name,
            role: 'owner',
            joinedAt: new Date(),
          },
        ],
        createdAt: new Date(),
      });
    }

    // Check if member already in team
    const existingMember = team.members?.find(
      (m: any) => m._id === member._id
    );
    if (existingMember) {
      return NextResponse.json(
        { message: 'Member already in team' },
        { status: 400 }
      );
    }

    // Add member to team
    const updated = await teamCollection.findOneAndUpdate(
      { owner: user.userId },
      {
        $push: {
          members: {
            _id: member._id,
            email: member.email,
            name: member.name,
            role: 'member',
            joinedAt: new Date(),
          },
        },
      },
      { returnDocument: 'after' }
    );

    return NextResponse.json(updated.value);
  } catch (error) {
    console.error('Add team member error:', error);
    return NextResponse.json(
      { message: 'Failed to add team member' },
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
    const teamCollection = db.collection('teams');

    const team = await teamCollection.findOne({ owner: user.userId });

    if (!team) {
      return NextResponse.json({
        owner: user.userId,
        members: [
          {
            _id: user.userId,
            email: user.email,
            name: user.name,
            role: 'owner',
            joinedAt: new Date(),
          },
        ],
      });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json(
      { message: 'Failed to get team' },
      { status: 500 }
    );
  }
}
