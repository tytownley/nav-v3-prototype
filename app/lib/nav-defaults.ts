import type { DbIconName } from "../components/DbIcon"

export const ICON_MAP: Record<string, DbIconName> = {
  PencilSquare: "plus",
  Search: "search",
  Libraries: "catalog",
  Activity: "chart-line",
  Notification: "notification",
  CloudDatabase: "cloud-database",
  Checklist: "checklist",
  Ingestion: "database-import",
  Robot: "play-circle-outlined",
  UserSparkle: "user-sparkle",
  CloudModel: "cloud-model",
  Beaker: "beaker",
  Layer: "layer",
  Models: "models",
  SparkleRectangle: "genie-code",
  QueryEditor: "query-editor",
  QueryList: "query-list",
  Dashboard: "dashboard",
  History: "history",
}

export interface NavItemDef {
  id: string
  label: string
  iconName: string
  originalSectionId: string
  pinnable: boolean
  shortcut?: string
  itemType?: ProjectChild["type"]
}

export interface ProjectChild {
  id: string
  label: string
  type: "notebook" | "query" | "dashboard" | "genie-chat" | "pipeline" | "experiment" | "agent" | "chat"
  timestamp?: string
  active?: boolean
  running?: boolean
  unread?: boolean
  iconName?: string
}

export interface ProjectSection {
  id: string
  name: string
  items: ProjectChild[]
  expanded: boolean
}

/* ─── Core nav items ──────────────────────────────────────────── */

export const CORE_NAV_ITEMS_PINNING: NavItemDef[] = [
  { id: "new", label: "New", iconName: "PencilSquare", originalSectionId: "core", pinnable: false },
  { id: "search", label: "Search", iconName: "Search", originalSectionId: "core", pinnable: false },
  { id: "library", label: "Library", iconName: "Libraries", originalSectionId: "core", pinnable: false },
  { id: "monitor", label: "Monitor", iconName: "Activity", originalSectionId: "core", pinnable: false },
  { id: "more", label: "More", iconName: "MoreHorizontal", originalSectionId: "core", pinnable: false },
]

/* ─── Default unpinned items (More flyout) ────────────────────── */

export const DEFAULT_UNPINNED_ITEMS: NavItemDef[] = [
  { id: "sql-editor", label: "SQL Editor", iconName: "QueryEditor", originalSectionId: "sql", pinnable: true },
  { id: "queries", label: "Queries", iconName: "QueryList", originalSectionId: "sql", pinnable: true },
  { id: "dashboards", label: "Dashboards", iconName: "Dashboard", originalSectionId: "sql", pinnable: true },
  { id: "genie-spaces", label: "Genie Spaces", iconName: "SparkleRectangle", originalSectionId: "sql", pinnable: true },
  { id: "alerts", label: "Alerts", iconName: "Notification", originalSectionId: "sql", pinnable: true },
  { id: "query-history", label: "Query History", iconName: "History", originalSectionId: "sql", pinnable: true },
  { id: "sql-warehouses", label: "SQL Warehouses", iconName: "CloudDatabase", originalSectionId: "sql", pinnable: true },
  { id: "runs", label: "Runs", iconName: "Checklist", originalSectionId: "data-engineering", pinnable: true },
  { id: "data-ingestion", label: "Data Ingestion", iconName: "Ingestion", originalSectionId: "data-engineering", pinnable: true },
  { id: "playground", label: "Playground", iconName: "Robot", originalSectionId: "ai-ml", pinnable: true },
  { id: "agents", label: "Agents", iconName: "UserSparkle", originalSectionId: "ai-ml", pinnable: true },
  { id: "ai-gateway", label: "AI Gateway", iconName: "CloudModel", originalSectionId: "ai-ml", pinnable: true },
  { id: "experiments", label: "Experiments", iconName: "Beaker", originalSectionId: "ai-ml", pinnable: true },
  { id: "features", label: "Features", iconName: "Layer", originalSectionId: "ai-ml", pinnable: true },
  { id: "models", label: "Models", iconName: "Models", originalSectionId: "ai-ml", pinnable: true },
  { id: "serving", label: "Serving", iconName: "CloudModel", originalSectionId: "ai-ml", pinnable: true },
]

/* ─── Pinned items ────────────────────────────────────────────── */

export const DEFAULT_PINNED_ITEMS: ProjectChild[] = [
  { id: "pin-nb", label: "Churn baseline EDA", type: "notebook" },
  { id: "pin-1", label: "Weekly revenue dashboard", type: "dashboard" },
  { id: "pin-5", label: "Pipelines", type: "pipeline" },
]

/* ─── Recent items ────────────────────────────────────────────── */

export const DEFAULT_RECENT_ITEMS: ProjectChild[] = [
  { id: "rec-1", label: "Feature drift investigation", type: "chat", timestamp: "5m" },
  { id: "rec-2", label: "Weekly revenue dashboard", type: "dashboard", timestamp: "1h" },
  { id: "rec-3", label: "Inventory anomaly check", type: "chat", timestamp: "3h" },
  { id: "rec-4", label: "cohort_refresh.sql", type: "query", timestamp: "1d" },
]

/* ─── Workspace projects ──────────────────────────────────────── */

export const DEFAULT_WORKSPACE_PROJECTS: ProjectSection[] = [
  {
    id: "ws-churn",
    name: "Churn forecasting",
    expanded: true,
    items: [
      { id: "ws-churn-c2", label: "Feature drift investigation", type: "chat", timestamp: "now" },
      { id: "ws-churn-c3", label: "Cohort table refresh", type: "chat", timestamp: "2h" },
      { id: "ws-churn-nb", label: "Cohort EDA", type: "notebook" },
      { id: "ws-churn-q", label: "feature_pipeline", type: "pipeline" },
      { id: "ws-churn-dash", label: "Weekly revenue dashboard", type: "dashboard" },
    ],
  },
  {
    id: "ws-supply",
    name: "Supply chain analytics",
    expanded: false,
    items: [
      { id: "ws-supply-c1", label: "Inventory anomaly check", type: "chat", timestamp: "5m" },
      { id: "ws-supply-nb", label: "demand_forecast.py", type: "notebook" },
      { id: "ws-supply-pipe", label: "Vendor ETL pipeline", type: "pipeline" },
    ],
  },
]

/* ─── Workspaces (unused) ─────────────────────────────────────── */

export const WORKSPACES: { name: string; region: string }[] = [
  { name: "e2-dogfood", region: "us-west-2" },
]
