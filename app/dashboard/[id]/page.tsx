import { notFound } from 'next/navigation';
import { getSiteById, getTokensBySiteId } from '@/lib/db';
import { DashboardClient } from '@/components/dashboard-client';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { id } = await params;
  
  const site = await getSiteById(id);
  if (!site) {
    notFound();
  }
  
  const tokens = await getTokensBySiteId(id);
  
  return <DashboardClient initialSite={site} initialTokens={tokens} />;
}
