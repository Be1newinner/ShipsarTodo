import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function withAuth(handler: (req: NextRequest, context: any) => Promise<Response>) {
  return async (req: NextRequest, context: any) => {
    const token = req.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Attach user to request context
    (req as any).user = payload;

    return handler(req, context);
  };
}
