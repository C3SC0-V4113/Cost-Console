import { requireAdminAccess } from '@/lib/auth';
import { pricingSnapshotFixtures } from '@/lib/pricing-snapshot-fixtures';

export async function GET(): Promise<Response> {
  const guard = await requireAdminAccess();

  if (guard) {
    return guard;
  }

  return Response.json({ data: pricingSnapshotFixtures });
}

export async function POST(): Promise<Response> {
  const guard = await requireAdminAccess();

  if (guard) {
    return guard;
  }

  return Response.json(
    {
      error: {
        code: 'SNAPSHOT_PERSISTENCE_NOT_IMPLEMENTED',
        message: 'Pricing snapshot persistence is not implemented yet.',
      },
    },
    { status: 501 }
  );
}
