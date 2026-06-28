'use client';

import { Handle, Position } from '@xyflow/react';
import { useFormatter, useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrencyFormat } from '@/hooks/use-currency-format';

import type { PipelineMetric, PipelineNode, PipelineStatus } from './rag-pipeline-model';
import type { Node, NodeProps } from '@xyflow/react';

export type RagPipelineNodeData = PipelineNode & { currency: string } & Record<string, unknown>;
export type RagFlowNode = Node<RagPipelineNodeData, 'pipeline'>;

function statusVariant(status: PipelineStatus): 'default' | 'secondary' {
  return status === 'available' ? 'default' : 'secondary';
}

export function RagPipelineNode({ data }: NodeProps<RagFlowNode> & { data: RagPipelineNodeData }) {
  const t = useTranslations('rag.diagram');
  const format = useFormatter();
  const formatCurrency = useCurrencyFormat(data.currency);

  function formatMetric(metric: PipelineMetric): string {
    if (metric.kind === 'money') return formatCurrency(String(metric.value));
    if (metric.kind === 'percent') return `${format.number(Number(metric.value))}%`;
    if (metric.kind === 'tokens' || metric.kind === 'count')
      return format.number(Number(metric.value));
    if (
      metric.value === 'unavailable' ||
      metric.value === 'notConfigured' ||
      metric.value === 'vector'
    ) {
      return t(`values.${metric.value}`);
    }
    return String(metric.value);
  }

  return (
    <Card className="w-64 gap-3 rounded-lg py-4">
      <Handle type="target" position={Position.Left} className="border-border! bg-primary!" />
      <CardHeader className="gap-2 px-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={statusVariant(data.status)}>{t(`statuses.${data.status}`)}</Badge>
          <span className="text-xs text-muted-foreground">{t('stageLabel')}</span>
        </div>
        <CardTitle className="text-base leading-tight">{t(`stages.${data.stage}`)}</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <dl className="grid gap-1.5 text-xs">
          {data.metrics.map((metric) => (
            <div key={metric.labelKey} className="flex items-start justify-between gap-3">
              <dt className="text-muted-foreground">{t(`metrics.${metric.labelKey}`)}</dt>
              <dd className="max-w-32 text-right font-medium text-foreground tabular-nums">
                {formatMetric(metric)}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
      <Handle type="source" position={Position.Right} className="border-border! bg-primary!" />
    </Card>
  );
}
