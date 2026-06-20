import { Skeleton } from '@/components/ui/skeleton';

export default function TextToSqlLoading() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="grid gap-5">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}
