import SMEDashboard from './Sme';

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;

  return <SMEDashboard />;
}