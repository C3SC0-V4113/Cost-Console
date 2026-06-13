import { requireAdminAccess } from '@/lib/auth';
import { getPricingSnapshotFixtureById } from '@/lib/pricing-snapshot-fixtures';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ snapshotId: string }> }
): Promise<Response> {
  void request;
  const guard = await requireAdminAccess();

  if (guard) {
    return guard;
  }

  const { snapshotId } = await params;
  const snapshot = getPricingSnapshotFixtureById(snapshotId);

  if (!snapshot) {
    return Response.json(
      { error: { code: 'SNAPSHOT_NOT_FOUND', message: 'Pricing snapshot was not found.' } },
      { status: 404 }
    );
  }

  return Response.json({ data: snapshot });
}
