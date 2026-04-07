import { NextRequest, NextResponse } from 'next/server';
import { getSiteById, getTokensBySiteId } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const site = await getSiteById(id);
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }
    
    const tokens = await getTokensBySiteId(id);
    
    return NextResponse.json({ site, tokens });
  } catch (error) {
    console.error('Failed to fetch site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site' },
      { status: 500 }
    );
  }
}
