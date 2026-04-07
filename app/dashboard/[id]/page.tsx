import { notFound } from 'next/navigation';
import { getSiteWithTokens } from '@/lib/db';
import { DashboardClient } from '@/components/dashboard-client';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { id } = await params;
  
  const result = await getSiteWithTokens(id);
  if (!result) {
    notFound();
  }
  
  return <DashboardClient initialSite={result.site} initialTokens={result.tokens} />;
}
