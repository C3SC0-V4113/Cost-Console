// Shared formatting helpers. Dates arrive from the repository as ISO strings and
// are formatted in UTC so server-rendered output is deterministic.

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  return dateFormatter.format(new Date(iso));
}
