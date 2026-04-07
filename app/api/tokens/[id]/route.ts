import { NextRequest, NextResponse } from 'next/server';
import { getTokenById, updateToken, deleteToken, lockToken, unlockToken, getTokenVersions } from '@/lib/db';

export async function GET(
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
    
    const versions = await getTokenVersions(id);
    
    return NextResponse.json({ token, versions });
  } catch (error) {
    console.error('Failed to fetch token:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { value, metadata } = body;
    
    if (!value) {
      return NextResponse.json(
        { error: 'Value is required' },
        { status: 400 }
      );
    }
    
    const token = await updateToken(id, value, metadata);
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Failed to update token:', error);
    
    if (error instanceof Error && error.message === 'Cannot update locked token') {
      return NextResponse.json(
        { error: 'Cannot update locked token' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update token' },
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
    await deleteToken(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete token:', error);
    return NextResponse.json(
      { error: 'Failed to delete token' },
      { status: 500 }
    );
  }
}
