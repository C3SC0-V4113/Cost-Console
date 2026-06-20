/* eslint-disable react-doctor/no-multi-comp -- intentional collection of shared, dumb form primitives (NumberField, Section, ModelSelect) used across the cost calculators */
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { ComponentProps, ReactNode } from 'react';

// Shared presentational building blocks for the cost calculators (chat, RAG, and
// text-to-SQL). Kept dumb and styling-only so each calculator composes the same
// dense, aligned form layout (DESIGN.md) without duplicating markup.

export type ModelOption = { id: string; provider: string; model: string };

// Preserve first-seen provider order so the grouped select is stable.
function groupByProvider(options: ModelOption[]): [string, ModelOption[]][] {
  const groups = new Map<string, ModelOption[]>();
  for (const option of options) {
    const list = groups.get(option.provider) ?? [];
    list.push(option);
    groups.set(option.provider, list);
  }
  return [...groups];
}

export function ModelSelect({
  id,
  label,
  value,
  options,
  placeholder,
  onChange,
}: Readonly<{
  id: string;
  label: string;
  value: string;
  options: ModelOption[];
  placeholder: string;
  onChange: (value: string) => void;
}>) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {groupByProvider(options).map(([provider, providerModels]) => (
            <SelectGroup key={provider}>
              <SelectLabel>{provider}</SelectLabel>
              {providerModels.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.model}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function toNonNegativeInt(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

// Numeric input field. Inherits every native input prop except the ones it owns
// (`type` is fixed to number; `value`/`onChange` are value-based), so callers can
// pass `disabled`, `min`, etc. without the wrapper re-declaring them.
type NumberFieldProps = Omit<ComponentProps<typeof Input>, 'type' | 'value' | 'onChange'> &
  Readonly<{
    label: string;
    help?: ReactNode;
    value: number;
    onChange: (value: number) => void;
  }>;

export function NumberField({ id, label, value, help, onChange, ...inputProps }: NumberFieldProps) {
  return (
    <div className="grid gap-1.5">
      <div className="flex min-h-5 items-center gap-1">
        <Label htmlFor={id} className={inputProps.disabled ? 'text-muted-foreground' : undefined}>
          {label}
        </Label>
        {help}
      </div>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(event) => onChange(toNonNegativeInt(event.target.value))}
        {...inputProps}
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
