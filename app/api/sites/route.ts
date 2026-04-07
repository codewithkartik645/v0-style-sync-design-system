import { NextResponse } from 'next/server';
import { getRecentSites } from '@/lib/db';

export async function GET() {
  try {
    const sites = await getRecentSites(20);
    return NextResponse.json({ sites });
  } catch (error) {
    console.error('Failed to fetch sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}
