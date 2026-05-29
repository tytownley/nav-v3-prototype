"use client"

import React, { useState } from "react"

/* ─── Data types ────────────────────────────────────────────── */

export type CatalogNodeType = "catalog" | "schema" | "table" | "view" | "volume"

export type CatalogNode = {
  id: string
  name: string
  type: CatalogNodeType
  children?: CatalogNode[]
}

/* ─── Hardcoded Unity Catalog hierarchy ─────────────────────── */

export const CATALOG_DATA: CatalogNode[] = [
  {
    id: "main", name: "main", type: "catalog", children: [
      {
        id: "churn_analytics", name: "churn_analytics", type: "schema", children: [
          { id: "subscription_events", name: "subscription_events", type: "table" },
          { id: "churn_features", name: "churn_features", type: "table" },
          { id: "churn_training", name: "churn_training", type: "table" },
          { id: "monthly_cohorts", name: "monthly_cohorts (view)", type: "view" },
          { id: "feature_snapshots", name: "feature_snapshots", type: "volume" },
        ]
      },
      {
        id: "default", name: "default", type: "schema", children: [
          { id: "raw_events", name: "raw_events", type: "table" },
          { id: "session_logs", name: "session_logs", type: "table" },
          { id: "user_profiles", name: "user_profiles", type: "table" },
        ]
      },
    ]
  },
  {
    id: "gold", name: "gold", type: "catalog", children: [
      {
        id: "production", name: "production", type: "schema", children: [
          { id: "churn_v4_predictions", name: "churn_v4_predictions", type: "table" },
          { id: "feature_importance", name: "feature_importance", type: "table" },
          { id: "model_metrics", name: "model_metrics (view)", type: "view" },
        ]
      },
      {
        id: "staging", name: "staging", type: "schema", children: [
          { id: "retrain_candidates", name: "retrain_candidates", type: "table" },
          { id: "drift_scores", name: "drift_scores", type: "table" },
        ]
      },
    ]
  },
]

/* ─── Component ─────────────────────────────────────────────── */

export function CatalogTree({ onOpenItem, collapsed, onToggle, hideHeader, selectedId, searchValue, onSearchChange }: {
  onOpenItem: (node: { id: string; name: string; type: string }) => void
  collapsed?: boolean
  onToggle?: () => void
  hideHeader?: boolean
  selectedId?: string | null
  searchValue?: string
  onSearchChange?: (v: string) => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["main", "churn_analytics"]))
  const [internalSelected, setInternalSelected] = useState<string | null>(null)
  const [internalSearch, setInternalSearch] = useState("")

  const selected = selectedId !== undefined ? selectedId : internalSelected
  const search = searchValue !== undefined ? searchValue : internalSearch
  const setSearch = onSearchChange || setInternalSearch

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleClick = (node: CatalogNode) => {
    if (node.children) {
      toggle(node.id)
    } else {
      if (selectedId === undefined) setInternalSelected(node.id)
      onOpenItem({ id: node.id, name: node.name, type: node.type })
    }
  }

  const filterTree = (nodes: CatalogNode[], query: string): CatalogNode[] => {
    if (!query) return nodes
    const lower = query.toLowerCase()
    return nodes.reduce<CatalogNode[]>((acc, node) => {
      if (node.name.toLowerCase().includes(lower)) {
        acc.push(node)
      } else if (node.children) {
        const filtered = filterTree(node.children, query)
        if (filtered.length > 0) acc.push({ ...node, children: filtered })
      }
      return acc
    }, [])
  }

  const visibleNodes = filterTree(CATALOG_DATA, search)

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb (clickable to collapse/expand) — hidden in embedded mode */}
      {!hideHeader && (
        <button
          className="group/cb flex items-center gap-[5px] shrink-0 w-full cursor-pointer text-left"
          style={{ padding: "6px 12px", background: "transparent", transition: "background 0.1s" }}
          onClick={onToggle}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.03)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n7)", flexShrink: 0 }}>
            <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" />
          </svg>
          <span className="text-[11px]" style={{ color: "var(--n6)" }}>/</span>
          <span className="text-[11px] font-medium" style={{ color: "var(--n10)" }}>All catalogs</span>
          <span className="flex-1" />
          <svg
            className="opacity-0 group-hover/cb:opacity-100"
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: "var(--n7)", transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.15s, opacity 0.1s", flexShrink: 0 }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}

      {/* Search + Tree (hidden when collapsed) */}
      {!collapsed && (
        <>
          {!hideHeader && (
            <div style={{ padding: "4px 12px 6px" }}>
              <div
                className="flex items-center gap-2 rounded-[6px]"
                style={{ padding: "4px 8px", background: "rgba(var(--overlay), 0.04)", border: "1px solid rgba(var(--overlay), 0.06)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--n7)", flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter tables..."
                  className="flex-1 min-w-0 bg-transparent text-[11px] outline-none"
                  style={{ color: "var(--n11)", height: 20 }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-auto-hide" style={{ padding: "0 4px 8px" }}>
            {visibleNodes.map(node => (
              <CatalogTreeItem key={node.id} node={node} depth={0} expanded={expanded} selected={selected} onClick={handleClick} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ─── Tree item ─────────────────────────────────────────────── */

function CatalogTreeItem({ node, depth, expanded, selected, onClick }: {
  node: CatalogNode
  depth: number
  expanded: Set<string>
  selected: string | null
  onClick: (node: CatalogNode) => void
}) {
  const isExpanded = expanded.has(node.id)
  const isContainer = !!node.children
  const isSelected = selected === node.id

  return (
    <>
      <button
        className="flex items-center gap-[6px] w-full rounded-[4px] text-left cursor-pointer transition-colors"
        style={{
          padding: "3px 8px",
          paddingLeft: 8 + depth * 16,
          background: isSelected ? "rgba(var(--overlay), 0.06)" : "transparent",
          color: isSelected ? "var(--n12)" : "var(--n10)",
        }}
        onClick={() => onClick(node)}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent" }}
      >
        {/* Chevron for containers */}
        <span className="flex items-center justify-center shrink-0" style={{ width: 12, height: 12 }}>
          {isContainer ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n7)", transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.1s" }}>
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : null}
        </span>

        {/* Icon */}
        <CatalogIcon type={node.type} />

        {/* Name */}
        <span className="text-[11px] truncate" style={{ fontWeight: isContainer ? 500 : 400 }}>
          {node.name}
        </span>
      </button>

      {/* Children */}
      {isContainer && isExpanded && node.children?.map(child => (
        <CatalogTreeItem key={child.id} node={child} depth={depth + 1} expanded={expanded} selected={selected} onClick={onClick} />
      ))}
    </>
  )
}

/* ─── Catalog icon ──────────────────────────────────────────── */

function CatalogIcon({ type }: { type: CatalogNodeType }) {
  const s = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, style: { color: "var(--n8)", flexShrink: 0 } }

  switch (type) {
    case "catalog":
      return <svg {...s}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg>
    case "schema":
      return <svg {...s}><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2" /></svg>
    case "table":
      return <svg {...s}><path d="M12 3v18" /><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /></svg>
    case "view":
      return <svg {...s}><path d="M12 3v18" /><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /></svg>
    case "volume":
      return <svg {...s}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /><circle cx="12" cy="13" r="1" /></svg>
    default:
      return <svg {...s}><circle cx="12" cy="12" r="10" /></svg>
  }
}
