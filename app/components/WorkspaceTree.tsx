"use client"

import React, { useState } from "react"

/* ─── Data types ────────────────────────────────────────────── */

export type FileType = "folder" | "notebook" | "python" | "sql" | "dashboard" | "library" | "yaml" | "git-folder"

export type TreeNode = {
  id: string
  name: string
  type: FileType
  children?: TreeNode[]
}

/* ─── Hardcoded workspace hierarchy ─────────────────────────── */

export const WORKSPACE_DATA: TreeNode[] = [
  {
    id: "users", name: "Users", type: "folder", children: [
      {
        id: "arjun", name: "arjun", type: "folder", children: [
          {
            id: "churn-proj", name: "Churn forecasting", type: "folder", children: [
              { id: "cohort_refresh", name: "cohort_refresh.sql", type: "sql" },
              { id: "feature_pipeline", name: "feature_pipeline.yaml", type: "yaml" },
              { id: "churn_eda", name: "churn_eda.py", type: "python" },
              { id: "model_training", name: "model_training.py", type: "python" },
              { id: "weekly_report", name: "weekly_report.lvdash.json", type: "dashboard" },
            ]
          },
          {
            id: "supply-chain", name: "Supply chain", type: "folder", children: [
              { id: "demand_forecast", name: "demand_forecast.py", type: "python" },
              { id: "inventory_check", name: "inventory_check.sql", type: "sql" },
            ]
          },
        ]
      },
    ]
  },
  {
    id: "shared", name: "Shared", type: "folder", children: [
      {
        id: "team-dashboards", name: "Team dashboards", type: "folder", children: [
          { id: "weekly_revenue", name: "Weekly revenue.lvdash.json", type: "dashboard" },
          { id: "ops_metrics", name: "Ops metrics.lvdash.json", type: "dashboard" },
        ]
      },
      {
        id: "common-libs", name: "Common libraries", type: "folder", children: [
          { id: "utils_whl", name: "utils.whl", type: "library" },
          { id: "ml_helpers", name: "ml_helpers.whl", type: "library" },
        ]
      },
    ]
  },
  {
    id: "repos", name: "Repos", type: "folder", children: [
      {
        id: "churn-model-repo", name: "arjun/churn-model", type: "git-folder", children: [
          {
            id: "repo-notebooks", name: "notebooks", type: "folder", children: [
              { id: "train_py", name: "train.py", type: "python" },
              { id: "evaluate_py", name: "evaluate.py", type: "python" },
            ]
          },
          {
            id: "repo-pipelines", name: "pipelines", type: "folder", children: [
              { id: "nightly_yaml", name: "nightly.yaml", type: "yaml" },
            ]
          },
        ]
      },
    ]
  },
]

/* ─── Component ─────────────────────────────────────────────── */

export function WorkspaceTree({ onOpenItem, collapsed, onToggle, hideHeader, selectedId, searchValue, onSearchChange }: {
  onOpenItem: (node: { id: string; name: string; type: string }) => void
  collapsed?: boolean
  onToggle?: () => void
  hideHeader?: boolean
  selectedId?: string | null
  searchValue?: string
  onSearchChange?: (v: string) => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["users", "arjun", "churn-proj"]))
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

  const handleClick = (node: TreeNode) => {
    if (node.children) {
      toggle(node.id)
    } else {
      if (selectedId === undefined) setInternalSelected(node.id)
      onOpenItem({ id: node.id, name: node.name, type: node.type })
    }
  }

  const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
    if (!query) return nodes
    const lower = query.toLowerCase()
    return nodes.reduce<TreeNode[]>((acc, node) => {
      if (node.name.toLowerCase().includes(lower)) {
        acc.push(node)
      } else if (node.children) {
        const filtered = filterTree(node.children, query)
        if (filtered.length > 0) acc.push({ ...node, children: filtered })
      }
      return acc
    }, [])
  }

  const visibleNodes = filterTree(WORKSPACE_DATA, search)

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb (clickable to collapse/expand) — hidden in embedded mode */}
      {!hideHeader && (
        <button
          className="group/wb flex items-center gap-[5px] shrink-0 w-full cursor-pointer text-left"
          style={{ padding: "6px 12px", background: "transparent", transition: "background 0.1s" }}
          onClick={onToggle}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.03)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n7)", flexShrink: 0 }}>
            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
          </svg>
          <span className="text-[11px]" style={{ color: "var(--n6)" }}>/</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--n7)", flexShrink: 0 }}>
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
          <span className="text-[11px]" style={{ color: "var(--n6)" }}>/</span>
          <span className="text-[11px] font-medium" style={{ color: "var(--n10)" }}>arjun</span>
          <span className="flex-1" />
          <svg
            className="opacity-0 group-hover/wb:opacity-100"
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
                  placeholder="Filter files..."
                  className="flex-1 min-w-0 bg-transparent text-[11px] outline-none"
                  style={{ color: "var(--n11)", height: 20 }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-auto-hide" style={{ padding: "0 4px 8px" }}>
            {visibleNodes.map(node => (
              <TreeItem key={node.id} node={node} depth={0} expanded={expanded} selected={selected} onToggle={toggle} onClick={handleClick} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ─── Tree item ─────────────────────────────────────────────── */

function TreeItem({ node, depth, expanded, selected, onToggle, onClick }: {
  node: TreeNode
  depth: number
  expanded: Set<string>
  selected: string | null
  onToggle: (id: string) => void
  onClick: (node: TreeNode) => void
}) {
  const isExpanded = expanded.has(node.id)
  const isFolder = !!node.children
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
        {/* Chevron for folders */}
        <span className="flex items-center justify-center shrink-0" style={{ width: 12, height: 12 }}>
          {isFolder ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n7)", transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.1s" }}>
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : null}
        </span>

        {/* Icon */}
        <FileIcon type={node.type} />

        {/* Name */}
        <span className="text-[11px] truncate" style={{ fontWeight: isFolder ? 500 : 400 }}>
          {node.name}
        </span>
      </button>

      {/* Children */}
      {isFolder && isExpanded && node.children?.map(child => (
        <TreeItem key={child.id} node={child} depth={depth + 1} expanded={expanded} selected={selected} onToggle={onToggle} onClick={onClick} />
      ))}
    </>
  )
}

/* ─── File icon ─────────────────────────────────────────────── */

function FileIcon({ type }: { type: FileType }) {
  const s = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, style: { color: "var(--n8)", flexShrink: 0 } }

  switch (type) {
    case "folder":
      return <svg {...s}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>
    case "git-folder":
      return <svg {...s}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /><circle cx="12" cy="13" r="2" /><path d="M12 11V9" /></svg>
    case "notebook":
      return <svg {...s}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
    case "python":
      return <svg {...s}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="m10 13-2 2 2 2" /><path d="m14 17 2-2-2-2" /></svg>
    case "sql":
      return <svg {...s}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg>
    case "dashboard":
      return <svg {...s}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
    case "library":
      return <svg {...s}><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
    case "yaml":
      return <svg {...s}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    default:
      return <svg {...s}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
  }
}
