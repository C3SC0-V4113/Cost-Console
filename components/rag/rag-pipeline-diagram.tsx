'use client';

import { Background, Controls, MarkerType, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFormatter, useTranslations } from 'next-intl';

import { buildRagPipeline } from './rag-pipeline-model';
import { RagPipelineNode } from './rag-pipeline-node';

import type { RagCalculatorInputs } from './rag-inputs';
import type { RagFlowNode } from './rag-pipeline-node';
import type { RagCostResult } from '@/lib/calc/rag-cost';
import type { Edge, NodeTypes, XYPosition } from '@xyflow/react';

const NODE_POSITIONS: Record<string, XYPosition> = {
  'source-documents': { x: 0, y: 0 },
  chunking: { x: 340, y: 0 },
  'embedding-ingestion': { x: 680, y: 0 },
  'vector-storage': { x: 680, y: 280 },
  'query-embedding': { x: 340, y: 280 },
  'vector-search': { x: 0, y: 280 },
  'retrieved-chunks': { x: 0, y: 560 },
  'llm-context': { x: 340, y: 560 },
  'generated-output': { x: 680, y: 560 },
};
const NODE_TYPES: NodeTypes = { pipeline: RagPipelineNode };

export function RagPipelineDiagram({
  inputs,
  result,
}: Readonly<{ inputs: RagCalculatorInputs; result: RagCostResult | null }>) {
  const t = useTranslations('rag.diagram');
  const format = useFormatter();
  const graph = buildRagPipeline(inputs, result);
  const nodes: RagFlowNode[] = graph.nodes.map((node) => ({
    id: node.id,
    type: 'pipeline',
    position: NODE_POSITIONS[node.id] ?? { x: 0, y: 0 },
    data: { ...node, currency: result?.currency ?? 'USD' },
    draggable: false,
    selectable: false,
  }));
  const edges: Edge[] = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    label: t('edgeValue', {
      label: t(`edges.${edge.labelKey}`),
      value: format.number(Number(edge.value)),
      unit: t(`units.${edge.kind}`),
    }),
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: 'var(--muted-foreground)' },
    labelStyle: { fill: 'var(--foreground)', fontSize: 11 },
    labelBgStyle: { fill: 'var(--background)', fillOpacity: 0.92 },
    selectable: false,
  }));

  if (!result) {
    return (
      <div className="flex h-[520px] w-full items-center justify-center rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        {t('empty')}
      </div>
    );
  }

  return (
    <div
      className="h-[520px] w-full overflow-hidden rounded-lg border border-border bg-card"
      aria-label={t('ariaLabel')}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--border)" gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
