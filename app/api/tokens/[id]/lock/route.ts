import { NextRequest, NextResponse } from 'next/server';
import { getTokenById, lockToken, unlockToken } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getTokenById(id);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    await lockToken(token.site_id, id);
    return NextResponse.json({ success: true, locked: true });
  } catch (error) {
    console.error('Failed to lock token:', error);
    return NextResponse.json(
      { error: 'Failed to lock token' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await unlockToken(id);
    return NextResponse.json({ success: true, locked: false });
  } catch (error) {
    console.error('Failed to unlock token:', error);
    return NextResponse.json(
      { error: 'Failed to unlock token' },
      { status: 500 }
    );
  }
}
