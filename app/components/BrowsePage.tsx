"use client"

import React, { useState } from "react"
import { CatalogTree, CATALOG_DATA, type CatalogNode } from "./CatalogTree"
import { WorkspaceTree, WORKSPACE_DATA, type TreeNode } from "./WorkspaceTree"

/* ─── Types ──────────────────────────────────────────────────── */

type BrowseTab = "catalog" | "workspace"

interface SelectedItem {
  id: string
  name: string
  type: string
  source: BrowseTab
}

/* ─── Mock metadata ──────────────────────────────────────────── */

interface ColumnDef {
  name: string
  type: string
  nullable: boolean
  comment: string
}

interface TableMeta {
  description: string
  owner: string
  tags: string[]
  created: string
  modified: string
  location: string
  columns: ColumnDef[]
  sampleData: Record<string, string | number>[]
}

const TABLE_METADATA: Record<string, TableMeta> = {
  subscription_events: {
    description: "Raw subscription lifecycle events including sign-ups, upgrades, downgrades, and cancellations.",
    owner: "arjun.mehta",
    tags: ["pii", "churn", "production"],
    created: "2024-03-12",
    modified: "2025-05-24",
    location: "s3://databricks-prod/main/churn_analytics/subscription_events/",
    columns: [
      { name: "user_id", type: "BIGINT", nullable: false, comment: "Unique user identifier" },
      { name: "event_type", type: "STRING", nullable: false, comment: "signup | upgrade | downgrade | cancel" },
      { name: "event_ts", type: "TIMESTAMP", nullable: false, comment: "Event timestamp (UTC)" },
      { name: "plan", type: "STRING", nullable: true, comment: "Plan tier at time of event" },
      { name: "revenue", type: "DOUBLE", nullable: true, comment: "Monthly revenue impact ($)" },
      { name: "region", type: "STRING", nullable: true, comment: "Geographic region" },
    ],
    sampleData: [
      { user_id: 10421, event_type: "signup", event_ts: "2025-01-15 09:23:11", plan: "starter", revenue: 29.0, region: "us-west" },
      { user_id: 10421, event_type: "upgrade", event_ts: "2025-02-01 14:05:33", plan: "pro", revenue: 99.0, region: "us-west" },
      { user_id: 20887, event_type: "cancel", event_ts: "2025-03-10 17:41:02", plan: "starter", revenue: -29.0, region: "eu-central" },
      { user_id: 31502, event_type: "downgrade", event_ts: "2025-04-22 08:12:45", plan: "starter", revenue: -70.0, region: "ap-south" },
      { user_id: 44019, event_type: "signup", event_ts: "2025-05-01 11:30:00", plan: "pro", revenue: 99.0, region: "us-east" },
    ],
  },
  churn_features: {
    description: "Engineered feature set for churn prediction model v4. Updated daily via feature_pipeline.",
    owner: "arjun.mehta",
    tags: ["ml", "features", "daily"],
    created: "2024-06-01",
    modified: "2025-05-24",
    location: "s3://databricks-prod/main/churn_analytics/churn_features/",
    columns: [
      { name: "user_id", type: "BIGINT", nullable: false, comment: "Unique user identifier" },
      { name: "days_since_login", type: "INT", nullable: false, comment: "Days since last active session" },
      { name: "support_tickets_30d", type: "INT", nullable: false, comment: "Support tickets in last 30 days" },
      { name: "feature_usage_pct", type: "DOUBLE", nullable: false, comment: "% of features used in last 7d" },
      { name: "nps_score", type: "INT", nullable: true, comment: "Last NPS survey score (1-10)" },
      { name: "contract_months_left", type: "INT", nullable: false, comment: "Months until contract renewal" },
    ],
    sampleData: [
      { user_id: 10421, days_since_login: 2, support_tickets_30d: 0, feature_usage_pct: 0.85, nps_score: 9, contract_months_left: 8 },
      { user_id: 20887, days_since_login: 14, support_tickets_30d: 3, feature_usage_pct: 0.22, nps_score: 4, contract_months_left: 1 },
      { user_id: 31502, days_since_login: 7, support_tickets_30d: 1, feature_usage_pct: 0.55, nps_score: 6, contract_months_left: 4 },
      { user_id: 44019, days_since_login: 0, support_tickets_30d: 0, feature_usage_pct: 0.92, nps_score: 10, contract_months_left: 11 },
      { user_id: 55123, days_since_login: 21, support_tickets_30d: 5, feature_usage_pct: 0.08, nps_score: 2, contract_months_left: 0 },
    ],
  },
  churn_training: {
    description: "Labeled training dataset for churn model. Includes feature snapshot + actual churn outcome at 90-day horizon.",
    owner: "arjun.mehta",
    tags: ["ml", "training"],
    created: "2024-07-15",
    modified: "2025-05-20",
    location: "s3://databricks-prod/main/churn_analytics/churn_training/",
    columns: [
      { name: "user_id", type: "BIGINT", nullable: false, comment: "Unique user identifier" },
      { name: "snapshot_date", type: "DATE", nullable: false, comment: "Feature snapshot date" },
      { name: "churned", type: "BOOLEAN", nullable: false, comment: "Did user churn within 90 days?" },
      { name: "days_since_login", type: "INT", nullable: false, comment: "" },
      { name: "support_tickets_30d", type: "INT", nullable: false, comment: "" },
      { name: "revenue", type: "DOUBLE", nullable: true, comment: "MRR at snapshot time" },
    ],
    sampleData: [
      { user_id: 10421, snapshot_date: "2025-01-01", churned: "false", days_since_login: 1, support_tickets_30d: 0, revenue: 99.0 },
      { user_id: 20887, snapshot_date: "2025-01-01", churned: "true", days_since_login: 18, support_tickets_30d: 4, revenue: 29.0 },
      { user_id: 31502, snapshot_date: "2025-01-01", churned: "true", days_since_login: 9, support_tickets_30d: 2, revenue: 99.0 },
      { user_id: 44019, snapshot_date: "2025-02-01", churned: "false", days_since_login: 0, support_tickets_30d: 0, revenue: 99.0 },
      { user_id: 55123, snapshot_date: "2025-02-01", churned: "true", days_since_login: 25, support_tickets_30d: 6, revenue: 29.0 },
    ],
  },
  churn_v4_predictions: {
    description: "Production churn predictions from model v4. Scored daily at 06:00 UTC.",
    owner: "ml-platform",
    tags: ["production", "predictions"],
    created: "2025-01-10",
    modified: "2025-05-24",
    location: "s3://databricks-prod/gold/production/churn_v4_predictions/",
    columns: [
      { name: "user_id", type: "BIGINT", nullable: false, comment: "Unique user identifier" },
      { name: "score_date", type: "DATE", nullable: false, comment: "Prediction date" },
      { name: "churn_probability", type: "DOUBLE", nullable: false, comment: "Model P(churn) 0-1" },
      { name: "risk_tier", type: "STRING", nullable: false, comment: "low | medium | high | critical" },
      { name: "top_factor", type: "STRING", nullable: true, comment: "Highest SHAP feature" },
    ],
    sampleData: [
      { user_id: 10421, score_date: "2025-05-24", churn_probability: 0.08, risk_tier: "low", top_factor: "feature_usage_pct" },
      { user_id: 20887, score_date: "2025-05-24", churn_probability: 0.87, risk_tier: "critical", top_factor: "days_since_login" },
      { user_id: 31502, score_date: "2025-05-24", churn_probability: 0.45, risk_tier: "medium", top_factor: "support_tickets_30d" },
      { user_id: 44019, score_date: "2025-05-24", churn_probability: 0.03, risk_tier: "low", top_factor: "nps_score" },
      { user_id: 55123, score_date: "2025-05-24", churn_probability: 0.92, risk_tier: "critical", top_factor: "days_since_login" },
    ],
  },
}

interface WorkspaceFileMeta {
  path: string
  owner: string
  modified: string
  size: string
  preview: string
  permissions: { user: string; level: string }[]
}

const WORKSPACE_METADATA: Record<string, WorkspaceFileMeta> = {
  cohort_refresh: {
    path: "/Users/arjun/Churn forecasting/cohort_refresh.sql",
    owner: "arjun.mehta",
    modified: "2025-05-23 14:30",
    size: "2.1 KB",
    preview: `-- Refresh monthly cohort aggregates\nWITH base AS (\n  SELECT\n    user_id,\n    DATE_TRUNC('month', event_ts) AS cohort_month,\n    MIN(event_ts) AS first_event,\n    MAX(event_ts) AS last_event,\n    COUNT(*) AS event_count\n  FROM main.churn_analytics.subscription_events\n  WHERE event_ts >= DATEADD(month, -6, CURRENT_DATE())\n  GROUP BY user_id, cohort_month\n)\nSELECT\n  cohort_month,\n  COUNT(DISTINCT user_id) AS cohort_size,\n  AVG(event_count) AS avg_events,\n  SUM(CASE WHEN last_event < DATEADD(day, -30, CURRENT_DATE())\n    THEN 1 ELSE 0 END) AS churned_count\nFROM base\nGROUP BY cohort_month\nORDER BY cohort_month DESC;`,
    permissions: [
      { user: "arjun.mehta", level: "Owner" },
      { user: "data-eng", level: "Can Edit" },
      { user: "analysts", level: "Can Read" },
    ],
  },
  churn_eda: {
    path: "/Users/arjun/Churn forecasting/churn_eda.py",
    owner: "arjun.mehta",
    modified: "2025-05-22 09:15",
    size: "4.8 KB",
    preview: `# Churn Baseline EDA\nimport pandas as pd\nimport databricks.feature_engineering as fe\nfrom pyspark.sql import functions as F\n\n# Load subscription events\ndf = spark.table("main.churn_analytics.subscription_events")\n\n# Basic stats\nprint(f"Total events: {df.count():,}")\nprint(f"Unique users: {df.select('user_id').distinct().count():,}")\n\n# Churn rate by plan\nchurn_by_plan = (\n  df.filter(F.col("event_type") == "cancel")\n    .groupBy("plan")\n    .agg(F.count("*").alias("cancellations"))\n    .orderBy(F.desc("cancellations"))\n)\nchurn_by_plan.display()`,
    permissions: [
      { user: "arjun.mehta", level: "Owner" },
      { user: "data-science", level: "Can Edit" },
    ],
  },
  model_training: {
    path: "/Users/arjun/Churn forecasting/model_training.py",
    owner: "arjun.mehta",
    modified: "2025-05-18 16:42",
    size: "6.3 KB",
    preview: `# Churn Model v4 Training\nimport mlflow\nfrom sklearn.ensemble import GradientBoostingClassifier\nfrom sklearn.model_selection import cross_val_score\nimport numpy as np\n\nmlflow.set_experiment("/Users/arjun/churn-model-v4")\n\n# Load training data\ntrain_df = spark.table("main.churn_analytics.churn_training")\nX = train_df.drop("churned", "user_id", "snapshot_date").toPandas()\ny = train_df.select("churned").toPandas().values.ravel()\n\nwith mlflow.start_run(run_name="gbt-v4-final"):\n    model = GradientBoostingClassifier(\n        n_estimators=200,\n        max_depth=5,\n        learning_rate=0.1\n    )\n    scores = cross_val_score(model, X, y, cv=5, scoring="roc_auc")`,
    permissions: [
      { user: "arjun.mehta", level: "Owner" },
      { user: "ml-platform", level: "Can Edit" },
      { user: "data-science", level: "Can Read" },
    ],
  },
  weekly_report: {
    path: "/Users/arjun/Churn forecasting/weekly_report.lvdash.json",
    owner: "arjun.mehta",
    modified: "2025-05-21 08:00",
    size: "12.4 KB",
    preview: `{\n  "dashboard": "Weekly Revenue & Churn Report",\n  "refresh_schedule": "Mon 08:00 UTC",\n  "widgets": [\n    { "type": "counter", "title": "MRR", "query": "SELECT SUM(revenue)..." },\n    { "type": "line_chart", "title": "Churn Rate Trend" },\n    { "type": "table", "title": "Top At-Risk Accounts" },\n    { "type": "bar_chart", "title": "Revenue by Plan" }\n  ]\n}`,
    permissions: [
      { user: "arjun.mehta", level: "Owner" },
      { user: "leadership", level: "Can Read" },
      { user: "analysts", level: "Can Read" },
    ],
  },
  feature_pipeline: {
    path: "/Users/arjun/Churn forecasting/feature_pipeline.yaml",
    owner: "arjun.mehta",
    modified: "2025-05-20 11:30",
    size: "1.8 KB",
    preview: `# Feature Engineering Pipeline\nname: churn-feature-pipeline\nschedule: "0 5 * * *"\nclusters:\n  - name: feature-compute\n    spark_version: 14.3.x-scala2.12\n    num_workers: 4\n\nsteps:\n  - name: extract_events\n    notebook: /Users/arjun/Churn forecasting/cohort_refresh.sql\n  - name: compute_features\n    notebook: /Users/arjun/Churn forecasting/churn_eda.py\n    parameters:\n      mode: "pipeline"\n  - name: validate\n    expectations:\n      - "row_count > 1000"\n      - "null_pct(user_id) == 0"`,
    permissions: [
      { user: "arjun.mehta", level: "Owner" },
      { user: "data-eng", level: "Can Edit" },
    ],
  },
}

/* ─── Lineage data ───────────────────────────────────────────── */

interface LineageNode {
  id: string
  label: string
  type: "table" | "view" | "model" | "dashboard"
}

interface LineageEdge {
  from: string
  to: string
}

const LINEAGE_MAP: Record<string, { nodes: LineageNode[]; edges: LineageEdge[] }> = {
  subscription_events: {
    nodes: [
      { id: "raw_events", label: "raw_events", type: "table" },
      { id: "subscription_events", label: "subscription_events", type: "table" },
      { id: "churn_features", label: "churn_features", type: "table" },
      { id: "monthly_cohorts", label: "monthly_cohorts", type: "view" },
    ],
    edges: [
      { from: "raw_events", to: "subscription_events" },
      { from: "subscription_events", to: "churn_features" },
      { from: "subscription_events", to: "monthly_cohorts" },
    ],
  },
  churn_features: {
    nodes: [
      { id: "subscription_events", label: "subscription_events", type: "table" },
      { id: "user_profiles", label: "user_profiles", type: "table" },
      { id: "churn_features", label: "churn_features", type: "table" },
      { id: "churn_v4_predictions", label: "churn_v4_predictions", type: "table" },
    ],
    edges: [
      { from: "subscription_events", to: "churn_features" },
      { from: "user_profiles", to: "churn_features" },
      { from: "churn_features", to: "churn_v4_predictions" },
    ],
  },
}

/* ─── Helper: find path in tree ──────────────────────────────── */

function findCatalogPath(nodes: CatalogNode[], targetId: string, path: string[] = []): string[] | null {
  for (const node of nodes) {
    const current = [...path, node.name]
    if (node.id === targetId) return current
    if (node.children) {
      const found = findCatalogPath(node.children, targetId, current)
      if (found) return found
    }
  }
  return null
}

function findWorkspacePath(nodes: TreeNode[], targetId: string, path: string[] = []): string[] | null {
  for (const node of nodes) {
    const current = [...path, node.name]
    if (node.id === targetId) return current
    if (node.children) {
      const found = findWorkspacePath(node.children, targetId, current)
      if (found) return found
    }
  }
  return null
}

/* ─── Component ──────────────────────────────────────────────── */

export function BrowsePage() {
  const [activeTab, setActiveTab] = useState<BrowseTab>("catalog")
  const [selected, setSelected] = useState<SelectedItem | null>(null)
  const [detailTab, setDetailTab] = useState<string>("overview")
  const [search, setSearch] = useState("")

  const handleSelectCatalog = (node: { id: string; name: string; type: string }) => {
    setSelected({ ...node, source: "catalog" })
    setDetailTab("overview")
  }

  const handleSelectWorkspace = (node: { id: string; name: string; type: string }) => {
    setSelected({ ...node, source: "workspace" })
    setDetailTab("overview")
  }

  const breadcrumb = selected
    ? selected.source === "catalog"
      ? findCatalogPath(CATALOG_DATA, selected.id) || [selected.name]
      : findWorkspacePath(WORKSPACE_DATA, selected.id) || [selected.name]
    : null

  const tableMeta = selected && selected.source === "catalog" ? TABLE_METADATA[selected.id] : null
  const fileMeta = selected && selected.source === "workspace" ? WORKSPACE_METADATA[selected.id] : null
  const lineage = selected ? LINEAGE_MAP[selected.id] : null

  const catalogTabs = ["overview", "schema", "sample data", "lineage"]
  const workspaceTabs = ["overview", "preview", "permissions"]
  const tabs = selected?.source === "catalog" ? catalogTabs : workspaceTabs

  return (
    <div className="flex h-full">
      {/* ─── Left Panel ─────────────────────────────────── */}
      <div
        className="flex flex-col shrink-0"
        style={{
          width: 280,
          borderRight: "1px solid rgba(var(--overlay), 0.06)",
          background: "var(--n1)",
        }}
      >
        {/* Search */}
        <div style={{ padding: "12px 12px 8px" }}>
          <div
            className="flex items-center gap-2 rounded-[var(--radius-md)]"
            style={{
              padding: "6px 10px",
              background: "rgba(var(--overlay), 0.04)",
              border: "1px solid rgba(var(--overlay), 0.06)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--n7)", flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="flex-1 min-w-0 bg-transparent text-[12px] outline-none"
              style={{ color: "var(--n11)", height: 22 }}
            />
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex shrink-0" style={{ padding: "0 12px 8px", gap: 4 }}>
          {(["catalog", "workspace"] as BrowseTab[]).map(tab => (
            <button
              key={tab}
              className="cursor-pointer"
              style={{
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: activeTab === tab ? 500 : 400,
                color: activeTab === tab ? "var(--n12)" : "var(--n8)",
                background: activeTab === tab ? "rgba(var(--overlay), 0.06)" : "transparent",
                borderRadius: "var(--radius-md)",
                transition: "all var(--duration-instant)",
                textTransform: "capitalize",
                border: "none",
              }}
              onClick={() => setActiveTab(tab)}
              onMouseEnter={e => { if (activeTab !== tab) e.currentTarget.style.color = "var(--n10)" }}
              onMouseLeave={e => { if (activeTab !== tab) e.currentTarget.style.color = "var(--n8)" }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tree */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === "catalog" ? (
            <CatalogTree
              onOpenItem={handleSelectCatalog}
              hideHeader
              selectedId={selected?.source === "catalog" ? selected.id : null}
              searchValue={search}
              onSearchChange={setSearch}
            />
          ) : (
            <WorkspaceTree
              onOpenItem={handleSelectWorkspace}
              hideHeader
              selectedId={selected?.source === "workspace" ? selected.id : null}
              searchValue={search}
              onSearchChange={setSearch}
            />
          )}
        </div>
      </div>

      {/* ─── Right Panel ────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {!selected ? (
          <EmptyState />
        ) : (
          <>
            {/* Breadcrumb */}
            {breadcrumb && (
              <div className="flex items-center gap-1 shrink-0" style={{ padding: "12px 24px 0" }}>
                {breadcrumb.map((seg, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span style={{ color: "var(--n6)", fontSize: 11 }}>/</span>}
                    <span
                      style={{
                        fontSize: 11,
                        color: i === breadcrumb.length - 1 ? "var(--n11)" : "var(--n8)",
                        fontWeight: i === breadcrumb.length - 1 ? 500 : 400,
                      }}
                    >
                      {seg}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Header */}
            <div className="shrink-0" style={{ padding: "12px 24px 0" }}>
              <div className="flex items-center gap-3">
                <TypeBadge type={selected.type} />
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--n12)", margin: 0 }}>
                  {selected.name}
                </h2>
              </div>
              {(tableMeta || fileMeta) && (
                <div className="flex items-center gap-4 mt-2" style={{ fontSize: 11, color: "var(--n8)" }}>
                  <span>Owner: <strong style={{ color: "var(--n10)", fontWeight: 500 }}>{tableMeta?.owner || fileMeta?.owner}</strong></span>
                  <span>Modified: {tableMeta?.modified || fileMeta?.modified}</span>
                  {tableMeta?.tags && tableMeta.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      {tableMeta.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            padding: "1px 6px",
                            fontSize: 10,
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(var(--overlay), 0.05)",
                            color: "var(--n9)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Detail tabs */}
            <div className="flex shrink-0" style={{ padding: "16px 24px 0", gap: 0, borderBottom: "1px solid rgba(var(--overlay), 0.06)" }}>
              {tabs.map(tab => (
                <button
                  key={tab}
                  className="cursor-pointer"
                  style={{
                    padding: "6px 14px 10px",
                    fontSize: 12,
                    fontWeight: detailTab === tab ? 500 : 400,
                    color: detailTab === tab ? "var(--n12)" : "var(--n8)",
                    background: "transparent",
                    border: "none",
                    borderBottom: detailTab === tab ? "2px solid var(--n12)" : "2px solid transparent",
                    transition: "color var(--duration-instant), border-color var(--duration-instant)",
                    textTransform: "capitalize",
                    marginBottom: -1,
                  }}
                  onClick={() => setDetailTab(tab)}
                  onMouseEnter={e => { if (detailTab !== tab) e.currentTarget.style.color = "var(--n10)" }}
                  onMouseLeave={e => { if (detailTab !== tab) e.currentTarget.style.color = "var(--n8)" }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Detail content */}
            <div className="flex-1 overflow-y-auto" style={{ padding: "20px 24px" }}>
              {selected.source === "catalog" && tableMeta && (
                <CatalogDetail item={selected} meta={tableMeta} activeTab={detailTab} lineage={lineage} />
              )}
              {selected.source === "workspace" && fileMeta && (
                <WorkspaceDetail item={selected} meta={fileMeta} activeTab={detailTab} />
              )}
              {!tableMeta && !fileMeta && (
                <div style={{ color: "var(--n8)", fontSize: 13 }}>
                  No detailed metadata available for this item.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Empty State ────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center" style={{ color: "var(--n7)" }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
      </svg>
      <p className="mt-3" style={{ fontSize: 13, fontWeight: 500 }}>Select an item to view details</p>
      <p className="mt-1" style={{ fontSize: 11, color: "var(--n6)" }}>Browse the catalog or workspace tree on the left</p>
    </div>
  )
}

/* ─── Type badge ─────────────────────────────────────────────── */

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    table: "rgba(59, 130, 246, 0.1)",
    view: "rgba(147, 51, 234, 0.1)",
    volume: "rgba(234, 179, 8, 0.1)",
    sql: "rgba(59, 130, 246, 0.1)",
    python: "rgba(34, 197, 94, 0.1)",
    notebook: "rgba(147, 51, 234, 0.1)",
    dashboard: "rgba(249, 115, 22, 0.1)",
    yaml: "rgba(107, 114, 128, 0.1)",
  }
  const textColors: Record<string, string> = {
    table: "rgb(59, 130, 246)",
    view: "rgb(147, 51, 234)",
    volume: "rgb(234, 179, 8)",
    sql: "rgb(59, 130, 246)",
    python: "rgb(34, 197, 94)",
    notebook: "rgb(147, 51, 234)",
    dashboard: "rgb(249, 115, 22)",
    yaml: "rgb(107, 114, 128)",
  }

  return (
    <span
      style={{
        padding: "2px 8px",
        fontSize: 10,
        fontWeight: 500,
        borderRadius: "var(--radius-sm)",
        background: colors[type] || "rgba(var(--overlay), 0.05)",
        color: textColors[type] || "var(--n9)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {type}
    </span>
  )
}

/* ─── Catalog Detail ─────────────────────────────────────────── */

function CatalogDetail({ item, meta, activeTab, lineage }: {
  item: SelectedItem
  meta: TableMeta
  activeTab: string
  lineage: { nodes: LineageNode[]; edges: LineageEdge[] } | null
}) {
  if (activeTab === "overview") {
    return (
      <div className="flex flex-col gap-5">
        <DetailSection title="Description">
          <p style={{ fontSize: 13, color: "var(--n10)", lineHeight: 1.5, margin: 0 }}>{meta.description}</p>
        </DetailSection>
        <DetailSection title="Properties">
          <div className="grid gap-3" style={{ gridTemplateColumns: "140px 1fr" }}>
            <PropRow label="Owner" value={meta.owner} />
            <PropRow label="Created" value={meta.created} />
            <PropRow label="Last modified" value={meta.modified} />
            <PropRow label="Storage location" value={meta.location} />
            <PropRow label="Format" value="Delta" />
          </div>
        </DetailSection>
        {meta.tags.length > 0 && (
          <DetailSection title="Tags">
            <div className="flex gap-2 flex-wrap">
              {meta.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    padding: "3px 10px",
                    fontSize: 11,
                    borderRadius: "var(--radius-md)",
                    background: "rgba(var(--overlay), 0.05)",
                    color: "var(--n10)",
                    border: "1px solid rgba(var(--overlay), 0.06)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </DetailSection>
        )}
      </div>
    )
  }

  if (activeTab === "schema") {
    return (
      <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid rgba(var(--overlay), 0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--n2)" }}>
              <th style={thStyle}>Column</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Nullable</th>
              <th style={thStyle}>Comment</th>
            </tr>
          </thead>
          <tbody>
            {meta.columns.map((col, i) => (
              <tr
                key={col.name}
                style={{ borderTop: i > 0 ? "1px solid rgba(var(--overlay), 0.04)" : "none", transition: "background var(--duration-instant)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.02)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
              >
                <td style={tdStyle}>
                  <span style={{ fontWeight: 500, color: "var(--n11)" }}>{col.name}</span>
                </td>
                <td style={tdStyle}>
                  <code style={{ fontSize: 11, color: "var(--n9)", background: "rgba(var(--overlay), 0.04)", padding: "1px 5px", borderRadius: 3 }}>{col.type}</code>
                </td>
                <td style={tdStyle}>
                  <span style={{ color: col.nullable ? "var(--n8)" : "var(--n10)" }}>{col.nullable ? "Yes" : "No"}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ color: "var(--n8)" }}>{col.comment || "—"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (activeTab === "sample data") {
    const cols = meta.columns.map(c => c.name)
    return (
      <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid rgba(var(--overlay), 0.06)" }}>
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "var(--n2)" }}>
                {cols.map(col => (
                  <th key={col} style={{ ...thStyle, fontSize: 11, whiteSpace: "nowrap" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meta.sampleData.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderTop: i > 0 ? "1px solid rgba(var(--overlay), 0.04)" : "none", transition: "background var(--duration-instant)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.02)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                >
                  {cols.map(col => (
                    <td key={col} style={{ ...tdStyle, fontSize: 11, whiteSpace: "nowrap" }}>
                      <span style={{ color: "var(--n10)" }}>{String(row[col] ?? "null")}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (activeTab === "lineage") {
    if (!lineage) {
      return <div style={{ color: "var(--n8)", fontSize: 13 }}>No lineage data available for this table.</div>
    }
    return <LineageDiagram nodes={lineage.nodes} edges={lineage.edges} currentId={item.id} />
  }

  return null
}

/* ─── Workspace Detail ───────────────────────────────────────── */

function WorkspaceDetail({ item, meta, activeTab }: {
  item: SelectedItem
  meta: WorkspaceFileMeta
  activeTab: string
}) {
  if (activeTab === "overview") {
    return (
      <div className="flex flex-col gap-5">
        <DetailSection title="Properties">
          <div className="grid gap-3" style={{ gridTemplateColumns: "140px 1fr" }}>
            <PropRow label="File type" value={item.type.toUpperCase()} />
            <PropRow label="Path" value={meta.path} />
            <PropRow label="Owner" value={meta.owner} />
            <PropRow label="Last modified" value={meta.modified} />
            <PropRow label="Size" value={meta.size} />
          </div>
        </DetailSection>
      </div>
    )
  }

  if (activeTab === "preview") {
    return (
      <div
        style={{
          background: "var(--n2)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid rgba(var(--overlay), 0.06)",
          padding: "16px 20px",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 11,
          lineHeight: 1.7,
          color: "var(--n10)",
          whiteSpace: "pre-wrap",
          overflow: "auto",
          maxHeight: 500,
        }}
      >
        {meta.preview}
      </div>
    )
  }

  if (activeTab === "permissions") {
    return (
      <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid rgba(var(--overlay), 0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--n2)" }}>
              <th style={thStyle}>User / Group</th>
              <th style={thStyle}>Permission Level</th>
            </tr>
          </thead>
          <tbody>
            {meta.permissions.map((p, i) => (
              <tr key={p.user} style={{ borderTop: i > 0 ? "1px solid rgba(var(--overlay), 0.04)" : "none" }}>
                <td style={tdStyle}>
                  <span style={{ fontWeight: 500, color: "var(--n11)" }}>{p.user}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ color: "var(--n9)" }}>{p.level}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return null
}

/* ─── Lineage Diagram ────────────────────────────────────────── */

function LineageDiagram({ nodes, edges, currentId }: { nodes: LineageNode[]; edges: LineageEdge[]; currentId: string }) {
  const nodeWidth = 160
  const nodeHeight = 36
  const gapX = 80
  const gapY = 20

  const upstream = nodes.filter(n => edges.some(e => e.to === currentId && e.from === n.id))
  const current = nodes.find(n => n.id === currentId)
  const downstream = nodes.filter(n => edges.some(e => e.from === currentId && e.to === n.id))

  const columns = [upstream, current ? [current] : [], downstream]
  const maxRows = Math.max(...columns.map(c => c.length))
  const svgWidth = 3 * nodeWidth + 2 * gapX + 40
  const svgHeight = maxRows * (nodeHeight + gapY) + 40

  const getPos = (colIdx: number, rowIdx: number, colLen: number) => {
    const x = 20 + colIdx * (nodeWidth + gapX)
    const totalHeight = colLen * nodeHeight + (colLen - 1) * gapY
    const startY = (svgHeight - totalHeight) / 2
    const y = startY + rowIdx * (nodeHeight + gapY)
    return { x, y }
  }

  return (
    <div style={{ overflow: "auto" }}>
      <svg width={svgWidth} height={svgHeight} style={{ display: "block" }}>
        {/* Edges */}
        {edges.map((edge, i) => {
          const fromCol = columns.findIndex(col => col.some(n => n.id === edge.from))
          const fromRow = columns[fromCol]?.findIndex(n => n.id === edge.from) ?? 0
          const toCol = columns.findIndex(col => col.some(n => n.id === edge.to))
          const toRow = columns[toCol]?.findIndex(n => n.id === edge.to) ?? 0

          if (fromCol === -1 || toCol === -1) return null

          const fromPos = getPos(fromCol, fromRow, columns[fromCol].length)
          const toPos = getPos(toCol, toRow, columns[toCol].length)

          const x1 = fromPos.x + nodeWidth
          const y1 = fromPos.y + nodeHeight / 2
          const x2 = toPos.x
          const y2 = toPos.y + nodeHeight / 2

          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} C ${x1 + gapX / 2} ${y1}, ${x2 - gapX / 2} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="rgba(var(--overlay), 0.2)"
                strokeWidth="1.5"
              />
              <polygon
                points={`${x2} ${y2}, ${x2 - 6} ${y2 - 3}, ${x2 - 6} ${y2 + 3}`}
                fill="rgba(var(--overlay), 0.3)"
              />
            </g>
          )
        })}

        {/* Nodes */}
        {columns.map((col, colIdx) =>
          col.map((node, rowIdx) => {
            const { x, y } = getPos(colIdx, rowIdx, col.length)
            const isCurrent = node.id === currentId
            return (
              <g key={node.id}>
                <rect
                  x={x}
                  y={y}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx={6}
                  fill={isCurrent ? "rgba(59, 130, 246, 0.08)" : "var(--n2)"}
                  stroke={isCurrent ? "rgba(59, 130, 246, 0.4)" : "rgba(var(--overlay), 0.1)"}
                  strokeWidth={isCurrent ? 1.5 : 1}
                />
                <text
                  x={x + nodeWidth / 2}
                  y={y + nodeHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: 11,
                    fontWeight: isCurrent ? 600 : 400,
                    fill: isCurrent ? "rgb(59, 130, 246)" : "var(--n10)",
                  }}
                >
                  {node.label}
                </text>
              </g>
            )
          })
        )}
      </svg>
    </div>
  )
}

/* ─── Shared helpers ─────────────────────────────────────────── */

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontSize: 12, fontWeight: 600, color: "var(--n11)", margin: "0 0 10px" }}>{title}</h3>
      {children}
    </div>
  )
}

function PropRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span style={{ fontSize: 12, color: "var(--n8)" }}>{label}</span>
      <span style={{ fontSize: 12, color: "var(--n10)", wordBreak: "break-all" }}>{value}</span>
    </>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--n9)",
  borderBottom: "1px solid rgba(var(--overlay), 0.06)",
}

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
  verticalAlign: "top",
}
