-- CreateEnum
CREATE TYPE "SnapshotStatus" AS ENUM ('draft', 'active', 'superseded', 'archived');

-- CreateEnum
CREATE TYPE "FreshnessState" AS ENUM ('fresh', 'stale', 'review');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('official_pricing', 'official_docs', 'third_party_benchmark', 'vendor_benchmark', 'internal_manual');

-- CreateEnum
CREATE TYPE "ModelCapability" AS ENUM ('chat', 'embedding', 'reranking', 'image');

-- CreateEnum
CREATE TYPE "ValidityState" AS ENUM ('active', 'stale', 'manual');

-- CreateEnum
CREATE TYPE "ScenarioKind" AS ENUM ('chat', 'rag', 'text_to_sql');

-- CreateEnum
CREATE TYPE "ScenarioStatus" AS ENUM ('draft', 'saved', 'archived', 'template');

-- CreateEnum
CREATE TYPE "BenchmarkKind" AS ENUM ('rag_retrieval', 'text_to_sql_accuracy', 'semantic_layer_accuracy');

-- CreateEnum
CREATE TYPE "LineItemCategory" AS ENUM ('input', 'output', 'cached_input', 'cache_write', 'embedding_ingestion', 'query_embedding', 'retrieved_context', 'warehouse_execution', 'storage');

-- CreateEnum
CREATE TYPE "SemanticLayerMode" AS ENUM ('none', 'headless', 'native');

-- CreateTable
CREATE TABLE "project_scope" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_scope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_reference" (
    "id" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceDate" TIMESTAMP(3),
    "retrievedAt" TIMESTAMP(3) NOT NULL,
    "provider" TEXT,
    "toolOrDataset" TEXT,
    "metricName" TEXT,
    "metricDefinition" TEXT,
    "assumptions" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_snapshot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "SnapshotStatus" NOT NULL DEFAULT 'draft',
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "freshnessState" "FreshnessState" NOT NULL DEFAULT 'fresh',
    "sourceReferenceId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_catalog" (
    "id" TEXT NOT NULL,
    "pricingSnapshotId" TEXT NOT NULL,
    "sourceReferenceId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "capability" "ModelCapability" NOT NULL,
    "contextWindowTokens" INTEGER,
    "currency" TEXT NOT NULL,
    "priceUnit" TEXT NOT NULL,
    "inputPrice" DECIMAL(18,8),
    "outputPrice" DECIMAL(18,8),
    "cachedInputReadPrice" DECIMAL(18,8),
    "cacheWritePrice" DECIMAL(18,8),
    "embeddingPrice" DECIMAL(18,8),
    "validityState" "ValidityState" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario" (
    "id" TEXT NOT NULL,
    "projectScopeId" TEXT NOT NULL,
    "pricingSnapshotId" TEXT NOT NULL,
    "kind" "ScenarioKind" NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT,
    "status" "ScenarioStatus" NOT NULL DEFAULT 'draft',
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_cost_scenario" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "interactionsPerDay" INTEGER NOT NULL,
    "daysPerMonth" INTEGER NOT NULL,
    "systemPromptTokens" INTEGER NOT NULL,
    "userInputTokens" INTEGER NOT NULL,
    "historyContextTokens" INTEGER NOT NULL,
    "cachedInputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "promptCacheHitPercentage" DECIMAL(5,2) NOT NULL,
    "assumptions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_cost_scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rag_cost_scenario" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "documentCount" INTEGER NOT NULL,
    "averageDocumentTokens" INTEGER NOT NULL,
    "cleanupRatio" DECIMAL(5,4) NOT NULL,
    "chunkSizeTokens" INTEGER NOT NULL,
    "chunkOverlapTokens" INTEGER NOT NULL,
    "embeddingProvider" TEXT NOT NULL,
    "embeddingModel" TEXT NOT NULL,
    "expectedChunks" INTEGER,
    "totalEmbeddingTokens" INTEGER,
    "ingestionBatchAssumptions" JSONB,
    "vectorStoreProvider" TEXT,
    "vectorDimensions" INTEGER,
    "storageUnit" TEXT,
    "storageCost" DECIMAL(18,8),
    "storageSourceReferenceId" TEXT,
    "queriesPerDay" INTEGER NOT NULL,
    "daysPerMonth" INTEGER NOT NULL,
    "averageQueryTokens" INTEGER NOT NULL,
    "queryEmbeddingModel" TEXT NOT NULL,
    "topK" INTEGER NOT NULL,
    "averageRetrievedChunkTokens" INTEGER NOT NULL,
    "scoreThreshold" DECIMAL(5,4),
    "hybridSemanticWeight" DECIMAL(5,4),
    "hybridTextWeight" DECIMAL(5,4),
    "finalLlmProvider" TEXT NOT NULL,
    "finalLlmModel" TEXT NOT NULL,
    "systemPromptTokens" INTEGER NOT NULL,
    "retrievedContextTokens" INTEGER NOT NULL,
    "expectedOutputTokens" INTEGER NOT NULL,
    "promptCacheHitPercentage" DECIMAL(5,2) NOT NULL,
    "assumptions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rag_cost_scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_to_sql_scenario" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "questionsPerDay" INTEGER NOT NULL,
    "daysPerMonth" INTEGER NOT NULL,
    "questionTokens" INTEGER NOT NULL,
    "schemaContextTokens" INTEGER NOT NULL,
    "semanticMetadataTokens" INTEGER NOT NULL,
    "sqlOutputTokens" INTEGER NOT NULL,
    "validationPromptTokens" INTEGER NOT NULL,
    "averageRetryAttempts" DECIMAL(6,2) NOT NULL,
    "promptCacheHitPercentage" DECIMAL(5,2) NOT NULL,
    "semanticLayerMode" "SemanticLayerMode" NOT NULL DEFAULT 'none',
    "semanticDefinitionsIncluded" JSONB,
    "semanticLayerSourceReferenceId" TEXT,
    "benchmarkPreset" TEXT,
    "accuracyMetricType" TEXT,
    "baselineAccuracy" DECIMAL(6,4),
    "semanticLayerAccuracy" DECIMAL(6,4),
    "accuracySourceReferenceId" TEXT,
    "warehouseProvider" TEXT,
    "warehousePriceUnit" TEXT,
    "averageWarehouseExecutionCost" DECIMAL(18,8),
    "warehouseSourceReferenceId" TEXT,
    "assumptions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "text_to_sql_scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark_result" (
    "id" TEXT NOT NULL,
    "sourceReferenceId" TEXT NOT NULL,
    "benchmarkKind" "BenchmarkKind" NOT NULL,
    "provider" TEXT,
    "model" TEXT,
    "datasetOrScenario" TEXT,
    "metricType" TEXT NOT NULL,
    "metricValue" DECIMAL(12,4) NOT NULL,
    "metricUnit" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "benchmark_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculation_result" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "pricingSnapshotId" TEXT NOT NULL,
    "resultVersion" INTEGER NOT NULL DEFAULT 1,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL,
    "costPerInteraction" DECIMAL(18,8),
    "dailyCost" DECIMAL(18,8),
    "monthlyCost" DECIMAL(18,8),
    "yearlyCost" DECIMAL(18,8),
    "oneTimeCost" DECIMAL(18,8),
    "totalMonthlyEstimate" DECIMAL(18,8),
    "totalYearlyEstimate" DECIMAL(18,8),
    "inputHash" TEXT NOT NULL,
    "summary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculation_line_item" (
    "id" TEXT NOT NULL,
    "calculationResultId" TEXT NOT NULL,
    "category" "LineItemCategory" NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(20,4) NOT NULL,
    "unitPrice" DECIMAL(18,8) NOT NULL,
    "cost" DECIMAL(18,8) NOT NULL,
    "sourceReferenceId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_scope_slug_key" ON "project_scope"("slug");

-- CreateIndex
CREATE INDEX "source_reference_sourceType_idx" ON "source_reference"("sourceType");

-- CreateIndex
CREATE INDEX "pricing_snapshot_status_idx" ON "pricing_snapshot"("status");

-- CreateIndex
CREATE INDEX "pricing_catalog_pricingSnapshotId_idx" ON "pricing_catalog"("pricingSnapshotId");

-- CreateIndex
CREATE INDEX "pricing_catalog_provider_model_idx" ON "pricing_catalog"("provider", "model");

-- CreateIndex
CREATE INDEX "scenario_kind_idx" ON "scenario"("kind");

-- CreateIndex
CREATE INDEX "scenario_projectScopeId_idx" ON "scenario"("projectScopeId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_cost_scenario_scenarioId_key" ON "chat_cost_scenario"("scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "rag_cost_scenario_scenarioId_key" ON "rag_cost_scenario"("scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "text_to_sql_scenario_scenarioId_key" ON "text_to_sql_scenario"("scenarioId");

-- CreateIndex
CREATE INDEX "benchmark_result_benchmarkKind_idx" ON "benchmark_result"("benchmarkKind");

-- CreateIndex
CREATE INDEX "calculation_result_scenarioId_idx" ON "calculation_result"("scenarioId");

-- CreateIndex
CREATE INDEX "calculation_line_item_calculationResultId_idx" ON "calculation_line_item"("calculationResultId");

-- AddForeignKey
ALTER TABLE "pricing_snapshot" ADD CONSTRAINT "pricing_snapshot_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "source_reference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_catalog" ADD CONSTRAINT "pricing_catalog_pricingSnapshotId_fkey" FOREIGN KEY ("pricingSnapshotId") REFERENCES "pricing_snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_catalog" ADD CONSTRAINT "pricing_catalog_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "source_reference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_projectScopeId_fkey" FOREIGN KEY ("projectScopeId") REFERENCES "project_scope"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_pricingSnapshotId_fkey" FOREIGN KEY ("pricingSnapshotId") REFERENCES "pricing_snapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_cost_scenario" ADD CONSTRAINT "chat_cost_scenario_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rag_cost_scenario" ADD CONSTRAINT "rag_cost_scenario_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_to_sql_scenario" ADD CONSTRAINT "text_to_sql_scenario_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_result" ADD CONSTRAINT "benchmark_result_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "source_reference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_result" ADD CONSTRAINT "calculation_result_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_result" ADD CONSTRAINT "calculation_result_pricingSnapshotId_fkey" FOREIGN KEY ("pricingSnapshotId") REFERENCES "pricing_snapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_line_item" ADD CONSTRAINT "calculation_line_item_calculationResultId_fkey" FOREIGN KEY ("calculationResultId") REFERENCES "calculation_result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_line_item" ADD CONSTRAINT "calculation_line_item_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "source_reference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
