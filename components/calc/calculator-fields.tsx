import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { ReactNode } from 'react';

// Shared presentational building blocks for the cost calculators (chat, RAG, and
// later text-to-SQL). Kept dumb and styling-only so each calculator composes the
// same dense, aligned form layout (DESIGN.md) without duplicating markup.

function toNonNegativeInt(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function NumberField({
  id,
  label,
  value,
  help,
  onChange,
}: Readonly<{
  id: string;
  label: string;
  value: number;
  help?: ReactNode;
  onChange: (value: number) => void;
}>) {
  return (
    <div className="grid gap-1.5">
      <div className="flex min-h-5 items-center gap-1">
        <Label htmlFor={id}>{label}</Label>
        {help}
      </div>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(event) => onChange(toNonNegativeInt(event.target.value))}
      />
    </div>
  );
}

export function Section({
  title,
  help,
  children,
}: Readonly<{ title: string; help?: ReactNode; children: ReactNode }>) {
  return (
    <section className="grid gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex min-h-5 items-center gap-1">
        <h3 className="text-sm font-semibold tracking-wide text-card-foreground uppercase">
          {title}
        </h3>
        {help}
      </div>
      {children}
    </section>
  );
}
