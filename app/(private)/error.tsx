'use client';

import { Button } from '@/components/ui/button';

// Segment error boundary for authenticated routes. Keeps a database outage or a
// missing DATABASE_URL from becoming a raw 500, showing a local, recoverable
// panel instead (DESIGN.md: error states stay local and actionable).
export default function PrivateError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <div className="grid place-items-center py-16">
      <div className="grid max-w-md gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <h2 className="font-heading text-xl font-semibold text-card-foreground">
          This view could not load
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          The pricing database may be unavailable or not yet configured. Confirm the database is
          running and try again.
        </p>
        <div className="flex justify-center">
          <Button onClick={() => reset()} variant="outline" type="button">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
