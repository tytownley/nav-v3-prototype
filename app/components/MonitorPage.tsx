"use client"

import React, { useState } from "react"

/* ─── Types ──────────────────────────────────────────────────── */

type MonitorCategory = "jobs" | "pipelines" | "agents" | "apps" | "serving" | "compute"

interface MonitorItem {
  id: string
  name: string
  status: "running" | "succeeded" | "failed" | "idle" | "deploying"
  lastRun?: string
  duration?: string
  owner?: string
}

/* ─── Mock data ──────────────────────────────────────────────── */

const MONITOR_DATA: Record<MonitorCategory, { label: string; icon: string; items: MonitorItem[] }> = {
  jobs: {
    label: "Jobs",
    icon: "clock",
    items: [
      { id: "j1", name: "cohort-refresh-weekly", status: "succeeded", lastRun: "2h ago", duration: "4m 12s", owner: "arjun.mehta" },
      { id: "j2", name: "feature-pipeline-daily", status: "running", lastRun: "now", duration: "2m 34s", owner: "arjun.mehta" },
      { id: "j3", name: "model-scoring-hourly", status: "succeeded", lastRun: "45m ago", duration: "1m 08s", owner: "ml-platform" },
      { id: "j4", name: "data-quality-check", status: "failed", lastRun: "1h ago", duration: "0m 42s", owner: "data-eng" },
      { id: "j5", name: "report-generation-weekly", status: "succeeded", lastRun: "1d ago", duration: "6m 55s", owner: "analytics" },
    ],
  },
  pipelines: {
    label: "Pipelines",
    icon: "pipeline",
    items: [
      { id: "p1", name: "Churn feature pipeline", status: "running", lastRun: "now", duration: "3m 20s", owner: "arjun.mehta" },
      { id: "p2", name: "Supply chain ETL", status: "succeeded", lastRun: "4h ago", duration: "8m 45s", owner: "data-eng" },
      { id: "p3", name: "Marketing events ingestion", status: "idle", lastRun: "2d ago", owner: "marketing-ops" },
    ],
  },
  agents: {
    label: "Agents",
    icon: "bot",
    items: [
      { id: "a1", name: "Churn investigation agent", status: "running", lastRun: "now", owner: "arjun.mehta" },
      { id: "a2", name: "Data quality reviewer", status: "idle", lastRun: "6h ago", owner: "data-eng" },
      { id: "a3", name: "Customer support bot", status: "running", lastRun: "now", owner: "support-team" },
    ],
  },
  apps: {
    label: "Apps",
    icon: "grid",
    items: [
      { id: "app1", name: "Revenue dashboard app", status: "running", lastRun: "always-on", owner: "analytics" },
      { id: "app2", name: "Model comparison tool", status: "idle", lastRun: "3d ago", owner: "ml-platform" },
    ],
  },
  serving: {
    label: "Model Serving",
    icon: "server",
    items: [
      { id: "s1", name: "churn-v4-endpoint", status: "running", lastRun: "always-on", duration: "p50: 42ms", owner: "ml-platform" },
      { id: "s2", name: "embedding-model-prod", status: "running", lastRun: "always-on", duration: "p50: 18ms", owner: "ml-platform" },
      { id: "s3", name: "recommendation-v2", status: "deploying", lastRun: "deploying...", owner: "ml-platform" },
    ],
  },
  compute: {
    label: "Compute",
    icon: "cloud",
    items: [
      { id: "c1", name: "arjun-interactive", status: "running", lastRun: "active", duration: "2h 15m", owner: "arjun.mehta" },
      { id: "c2", name: "shared-analytics", status: "running", lastRun: "active", duration: "18h 4m", owner: "data-eng" },
      { id: "c3", name: "ml-training-gpu", status: "idle", lastRun: "terminated 4h ago", owner: "ml-platform" },
    ],
  },
}

const CATEGORIES: MonitorCategory[] = ["jobs", "pipelines", "agents", "apps", "serving", "compute"]

/* ─── Component ──────────────────────────────────────────────── */

export function MonitorPage() {
  const [activeCategory, setActiveCategory] = useState<MonitorCategory>("jobs")
  const data = MONITOR_DATA[activeCategory]

  return (
    <div className="flex h-full">
      {/* Left: category list */}
      <div
        className="flex flex-col shrink-0"
        style={{
          width: 200,
          borderRight: "1px solid rgba(var(--overlay), 0.06)",
          padding: "16px 8px",
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--n12)", margin: "0 8px 12px", padding: 0 }}>
          Monitor
        </h2>
        {CATEGORIES.map(cat => {
          const catData = MONITOR_DATA[cat]
          const runningCount = catData.items.filter(i => i.status === "running" || i.status === "deploying").length
          return (
            <button
              key={cat}
              className="flex items-center gap-2 w-full rounded-[var(--radius-md)] text-left cursor-pointer"
              style={{
                padding: "7px 10px",
                fontSize: 12,
                fontWeight: activeCategory === cat ? 500 : 400,
                color: activeCategory === cat ? "var(--n12)" : "var(--n10)",
                background: activeCategory === cat ? "rgba(var(--overlay), 0.06)" : "transparent",
                border: "none",
                transition: "all var(--duration-instant)",
              }}
              onClick={() => setActiveCategory(cat)}
              onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.background = "rgba(var(--overlay), 0.03)" }}
              onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.background = "transparent" }}
            >
              <CategoryIcon type={cat} />
              <span className="flex-1">{catData.label}</span>
              {runningCount > 0 && (
                <span
                  className="flex items-center justify-center rounded-full text-[10px] font-medium"
                  style={{ minWidth: 18, height: 18, padding: "0 5px", background: "rgba(34, 197, 94, 0.1)", color: "rgb(34, 197, 94)" }}
                >
                  {runningCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Right: item list */}
      <div className="flex-1 min-w-0 overflow-y-auto" style={{ padding: "16px 24px" }}>
        <div className="flex items-center gap-3 mb-4">
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--n12)", margin: 0 }}>{data.label}</h3>
          <span style={{ fontSize: 12, color: "var(--n8)" }}>{data.items.length} items</span>
        </div>

        {/* Table */}
        <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid rgba(var(--overlay), 0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--n2)" }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Last Run</th>
                <th style={thStyle}>Duration</th>
                <th style={thStyle}>Owner</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr
                  key={item.id}
                  style={{ borderTop: i > 0 ? "1px solid rgba(var(--overlay), 0.04)" : "none", transition: "background var(--duration-instant)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.02)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                >
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 500, color: "var(--n11)" }}>{item.name}</span>
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={item.status} />
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "var(--n9)" }}>{item.lastRun || "—"}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "var(--n9)" }}>{item.duration || "—"}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "var(--n8)" }}>{item.owner || "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Status badge ───────────────────────────────────────────── */

function StatusBadge({ status }: { status: MonitorItem["status"] }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    running: { bg: "rgba(34, 197, 94, 0.1)", color: "rgb(34, 197, 94)", label: "Running" },
    succeeded: { bg: "rgba(59, 130, 246, 0.1)", color: "rgb(59, 130, 246)", label: "Succeeded" },
    failed: { bg: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)", label: "Failed" },
    idle: { bg: "rgba(var(--overlay), 0.05)", color: "var(--n8)", label: "Idle" },
    deploying: { bg: "rgba(234, 179, 8, 0.1)", color: "rgb(234, 179, 8)", label: "Deploying" },
  }

  const c = config[status] || config.idle

  return (
    <span
      className="inline-flex items-center gap-1"
      style={{
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 500,
        borderRadius: "var(--radius-sm)",
        background: c.bg,
        color: c.color,
      }}
    >
      {(status === "running" || status === "deploying") && (
        <span
          className="rounded-full"
          style={{ width: 5, height: 5, background: c.color, animation: "pulse 2s infinite" }}
        />
      )}
      {c.label}
    </span>
  )
}

/* ─── Category icon ──────────────────────────────────────────── */

function CategoryIcon({ type }: { type: MonitorCategory }) {
  const s = { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, style: { color: "var(--n7)", flexShrink: 0 } }

  switch (type) {
    case "jobs":
      return <svg {...s}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    case "pipelines":
      return <svg {...s}><rect width="8" height="8" x="3" y="3" rx="2" /><path d="M7 11v4a2 2 0 0 0 2 2h4" /><rect width="8" height="8" x="13" y="13" rx="2" /></svg>
    case "agents":
      return <svg {...s}><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
    case "apps":
      return <svg {...s}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /></svg>
    case "serving":
      return <svg {...s}><rect width="20" height="8" x="2" y="2" rx="2" ry="2" /><rect width="20" height="8" x="2" y="14" rx="2" ry="2" /><line x1="6" x2="6.01" y1="6" y2="6" /><line x1="6" x2="6.01" y1="18" y2="18" /></svg>
    case "compute":
      return <svg {...s}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>
    default:
      return <svg {...s}><circle cx="12" cy="12" r="10" /></svg>
  }
}

/* ─── Table styles ───────────────────────────────────────────── */

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--n9)",
  borderBottom: "1px solid rgba(var(--overlay), 0.06)",
}

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  verticalAlign: "middle",
}
