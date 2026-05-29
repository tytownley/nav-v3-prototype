"use client"

import React, { useState, useRef, useCallback } from "react"
import { WorkspaceTree } from "./WorkspaceTree"
import { CatalogTree } from "./CatalogTree"
import { SparkleButton, AgentPopover } from "./AgentPopover"
import { DbIcon } from "./DbIcon"

/* ─── Types ─────────────────────────────────────────────────── */

type CanvasTab = {
  id: string
  label: string
  icon: "book-open" | "workflow" | "target" | "file" | "table" | "dashboard" | "sql"
  dirty?: boolean
  content?: string
}

type CanvasMode = "tabs" | "browse" | "split"

const DEFAULT_TABS: CanvasTab[] = [
  { id: "eda", label: "Cohort EDA", icon: "book-open" },
  { id: "pipeline", label: "feature_pipeline", icon: "workflow", dirty: true },
]

/* ─── Component ─────────────────────────────────────────────── */

export function CanvasPanel({ open, onToggle, initialTabs, chatVisible, onToggleChat }: { open: boolean; onToggle: () => void; initialTabs?: CanvasTab[]; chatVisible?: boolean; onToggleChat?: () => void }) {
  const startTabs = initialTabs || DEFAULT_TABS
  const [activeTab, setActiveTab] = useState(startTabs[0]?.id || "eda")
  const [tabs, setTabs] = useState<CanvasTab[]>(startTabs)
  const [mode, setMode] = useState<CanvasMode>("tabs")
  const [agentMode, setAgentMode] = useState(false)
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [popoverCell, setPopoverCell] = useState<{ id: string; pos?: { x: number; y: number } } | null>(null)

  const closeTab = (id: string) => {
    setTabs(prev => prev.filter(t => t.id !== id))
    if (activeTab === id) {
      const remaining = tabs.filter(t => t.id !== id)
      if (remaining.length > 0) setActiveTab(remaining[0].id)
    }
  }

  const handleBrowseClick = () => {
    if (mode === "browse" || mode === "split") setMode("tabs")
    else setMode("split")
  }

  const handleOpenItem = (item: { id: string; name: string; type: string }) => {
    const icon = getIconForType(item.type)
    const existing = tabs.find(t => t.id === item.id)
    if (!existing) {
      setTabs(prev => [...prev, { id: item.id, label: item.name, icon }])
    }
    setActiveTab(item.id)
  }

  const showTree = mode === "browse" || mode === "split"

  return (
    <div
      style={{
        flex: open ? "1 1 0%" : "0 0 0px",
        opacity: open ? 1 : 0,
        overflow: "hidden",
        transition: open
          ? "flex 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease-out 0.05s"
          : "flex 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s ease-in",
        borderLeft: open ? "1px solid rgba(var(--overlay), 0.08)" : "none",
        display: "flex",
        flexDirection: "column",
        background: "var(--n1)",
      }}
    >
      {/* Tab bar */}
      <div
        className="flex items-center shrink-0"
        style={{
          height: 40,
          padding: "0 8px",
          borderBottom: "1px solid rgba(var(--overlay), 0.08)",
          gap: 2,
        }}
      >
        {/* Tool buttons */}
        <ToolButton
          icon="folder"
          title="Browse"
          active={showTree}
          onClick={handleBrowseClick}
        />
        <ToolButton
          icon="sparkles"
          title="Agent"
          active={agentMode}
          onClick={() => { setAgentMode(prev => !prev); if (agentMode) { setSelectedCell(null); setPopoverCell(null) } }}
        />
        <ToolButton icon="git-merge" title="Source control" hasUpdate />

        {/* Separator */}
        <div style={{ width: 1, height: 16, background: "rgba(var(--overlay), 0.08)", margin: "0 6px", flexShrink: 0 }} />

        {/* Content tabs */}
        <div className="flex items-center flex-1 min-w-0 overflow-x-auto gap-[2px]" style={{ scrollbarWidth: "none" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className="flex items-center gap-[6px] shrink-0 rounded-[4px] transition-colors cursor-pointer"
              style={{
                padding: "4px 8px",
                height: 28,
                background: activeTab === tab.id ? "rgba(var(--overlay), 0.06)" : "transparent",
                color: activeTab === tab.id ? "var(--n12)" : "var(--n9)",
              }}
              onClick={() => { setActiveTab(tab.id) }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "transparent" }}
            >
              <TabIcon name={tab.icon} />
              <span className="text-[11px] whitespace-nowrap" style={{ fontWeight: activeTab === tab.id ? 500 : 400 }}>
                {tab.label}
              </span>
              {tab.dirty && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success-fg)", flexShrink: 0 }} />}
              <span
                className="flex items-center justify-center rounded-[3px] transition-colors cursor-pointer"
                style={{ width: 16, height: 16, color: "var(--n7)", flexShrink: 0 }}
                onClick={e => { e.stopPropagation(); closeTab(tab.id) }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)"; e.currentTarget.style.background = "rgba(var(--overlay), 0.08)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)"; e.currentTarget.style.background = "transparent" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </span>
            </button>
          ))}
          <ToolButton icon="plus" title="New tab" />
        </div>

        {/* Right-side tools */}
        {onToggleChat && (
          <ToolButton icon="message-circle" title={chatVisible ? "Hide chat" : "Show chat"} active={chatVisible} onClick={onToggleChat} />
        )}
        <ToolButton icon="more-horizontal" title="More" />
        <ToolButton icon="panel-right" title="Collapse panel" onClick={onToggle} />
      </div>

      {/* Canvas body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Browser drawer (slides in from left of content) */}
        {showTree && (
          <div
            style={{
              width: 240,
              minWidth: 200,
              borderRight: "1px solid rgba(var(--overlay), 0.06)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <StackedBrowser onOpenItem={handleOpenItem} />
          </div>
        )}

        {/* Content area (always visible) */}
        <div
          className="flex-1 min-w-0 overflow-y-auto"
          style={{ padding: 16 }}
          onClick={() => { setSelectedCell(null); setPopoverCell(null) }}
        >
          {activeTab === "eda" && <EDAContent agentMode={agentMode} selectedCell={selectedCell} popoverCell={popoverCell} onSelectCell={setSelectedCell} onSparkle={(id, pos) => setPopoverCell({ id, pos })} onClosePopover={() => setPopoverCell(null)} />}
          {activeTab === "pipeline" && <PipelineContent agentMode={agentMode} selectedCell={selectedCell} popoverCell={popoverCell} onSelectCell={setSelectedCell} onSparkle={(id, pos) => setPopoverCell({ id, pos })} onClosePopover={() => setPopoverCell(null)} />}
          {!["eda", "pipeline"].includes(activeTab) && <GenericPreview tabId={activeTab} tabs={tabs} agentMode={agentMode} selectedCell={selectedCell} popoverCell={popoverCell} onSelectCell={setSelectedCell} onSparkle={(id, pos) => setPopoverCell({ id, pos })} onClosePopover={() => setPopoverCell(null)} />}
        </div>
      </div>
    </div>
  )
}

/* ─── Stacked browser (workspace + catalog) ─────────────────── */

const PINNED_ITEMS = [
  { id: "pin-cohort-refresh", name: "cohort_refresh.sql", type: "sql" },
  { id: "pin-churn-features", name: "churn_features", type: "table" },
  { id: "pin-pipeline-yaml", name: "feature_pipeline.yaml", type: "yaml" },
  { id: "pin-churn-training", name: "churn_training", type: "table" },
  { id: "pin-weekly-report", name: "weekly_report.lvdash.json", type: "dashboard" },
]

function StackedBrowser({ onOpenItem }: { onOpenItem: (item: { id: string; name: string; type: string }) => void }) {
  const [pinnedCollapsed, setPinnedCollapsed] = useState(false)
  const [workspaceCollapsed, setWorkspaceCollapsed] = useState(false)
  const [catalogCollapsed, setCatalogCollapsed] = useState(false)
  const [splitRatio, setSplitRatio] = useState(0.5)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    const startY = e.clientY
    const startRatio = splitRatio

    const onMove = (ev: MouseEvent) => {
      if (!containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const delta = ev.clientY - startY
      const deltaRatio = delta / containerRect.height
      const newRatio = Math.max(0.15, Math.min(0.85, startRatio + deltaRatio))
      setSplitRatio(newRatio)
    }
    const onUp = () => {
      isDragging.current = false
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }, [splitRatio])

  const bothExpanded = !workspaceCollapsed && !catalogCollapsed
  const workspaceHeight = workspaceCollapsed ? "auto" : catalogCollapsed ? "100%" : `${splitRatio * 100}%`
  const catalogHeight = catalogCollapsed ? "auto" : workspaceCollapsed ? "100%" : `${(1 - splitRatio) * 100}%`

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Pinned section (project-specific items) */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: pinnedCollapsed ? 0 : undefined, ...(pinnedCollapsed ? {} : { minHeight: 60 }) }}>
        <AccordionHeader
          label="Pinned"
          collapsed={pinnedCollapsed}
          onToggle={() => setPinnedCollapsed(prev => !prev)}
        />
        {!pinnedCollapsed && (
          <div className="overflow-y-auto scrollbar-thin scrollbar-auto-hide" style={{ padding: "0 4px 4px" }}>
            {PINNED_ITEMS.map(item => (
              <PinnedTreeItem key={item.id} item={item} onOpen={() => onOpenItem(item)} />
            ))}
          </div>
        )}
      </div>

      {/* Divider between pinned and workspace/catalog */}
      <div style={{ height: 1, background: "rgba(var(--overlay), 0.06)", flexShrink: 0 }} />

      {/* Workspace section */}
      <div style={{ height: workspaceHeight, minHeight: workspaceCollapsed ? undefined : 80, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {workspaceCollapsed ? (
          <WorkspaceTree onOpenItem={onOpenItem} collapsed onToggle={() => setWorkspaceCollapsed(false)} />
        ) : (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <WorkspaceTree onOpenItem={onOpenItem} collapsed={false} onToggle={() => setWorkspaceCollapsed(true)} />
          </div>
        )}
      </div>

      {/* Drag divider (only when both are expanded) */}
      {bothExpanded && (
        <div
          className="shrink-0 flex items-center justify-center cursor-row-resize group"
          style={{ height: 5, background: "transparent" }}
          onMouseDown={handleDragStart}
        >
          <div
            className="rounded-full transition-colors group-hover:bg-[rgba(var(--overlay),0.12)]"
            style={{ width: 32, height: 3, background: "rgba(var(--overlay), 0.06)" }}
          />
        </div>
      )}

      {/* Catalog section */}
      <div style={{ height: catalogHeight, minHeight: catalogCollapsed ? undefined : 80, display: "flex", flexDirection: "column", overflow: "hidden", borderTop: "1px solid rgba(var(--overlay), 0.06)" }}>
        {catalogCollapsed ? (
          <CatalogTree onOpenItem={onOpenItem} collapsed onToggle={() => setCatalogCollapsed(false)} />
        ) : (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <CatalogTree onOpenItem={onOpenItem} collapsed={false} onToggle={() => setCatalogCollapsed(true)} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Accordion header ──────────────────────────────────────── */

/* ─── Pinned tree item ──────────────────────────────────────── */

function PinnedTreeItem({ item, onOpen }: { item: { id: string; name: string; type: string }; onOpen: () => void }) {
  return (
    <button
      className="flex items-center gap-[6px] w-full rounded-[4px] text-left cursor-pointer"
      style={{ padding: "4px 8px", color: "var(--n10)", transition: "background var(--duration-instant), color var(--duration-instant)" }}
      onClick={onOpen}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)"; e.currentTarget.style.color = "var(--n12)" }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--n10)" }}
    >
      <PinnedItemTypeIcon type={item.type} />
      <span className="text-[11px] truncate flex-1 min-w-0">{item.name}</span>
      <span
        className="flex items-center justify-center shrink-0 rounded-[3px] opacity-0 transition-opacity"
        style={{ width: 14, height: 14, color: "var(--n7)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1" }}
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </span>
    </button>
  )
}

function PinnedItemTypeIcon({ type }: { type: string }) {
  const s = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, style: { color: "var(--n7)", flexShrink: 0 } }
  switch (type) {
    case "sql":
      return <svg {...s}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg>
    case "table":
      return <svg {...s}><path d="M12 3v18" /><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /></svg>
    case "yaml":
      return <svg {...s}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
    case "dashboard":
      return <svg {...s}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
    default:
      return <svg {...s}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
  }
}

/* ─── Accordion header ──────────────────────────────────────── */

function AccordionHeader({ label, collapsed, onToggle }: { label: string; icon?: string; collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      className="group/acc flex items-center gap-1 w-full shrink-0 cursor-pointer transition-colors"
      style={{ padding: "6px 12px", background: "transparent" }}
      onClick={onToggle}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.03)" }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
    >
      {/* Label */}
      <span className="text-[11px] font-medium" style={{ color: "var(--n8)" }}>{label}</span>

      {/* Spacer pushes chevron to far right */}
      <span className="flex-1" />

      {/* Chevron (far right, visible on hover) */}
      <svg
        className="opacity-0 group-hover/acc:opacity-100"
        width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ color: "var(--n7)", transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.15s ease, opacity 0.1s" }}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

/* ─── Helper: get icon for file/catalog type ────────────────── */

function getIconForType(type: string): CanvasTab["icon"] {
  switch (type) {
    case "sql": return "sql"
    case "python": case "notebook": return "book-open"
    case "yaml": return "workflow"
    case "dashboard": return "dashboard"
    case "table": case "view": return "table"
    default: return "file"
  }
}

/* ─── Generic preview for dynamically opened items ──────────── */

function GenericPreview({ tabId, tabs, agentMode, selectedCell, popoverCell, onSelectCell, onSparkle, onClosePopover }: { tabId: string; tabs: CanvasTab[] } & CellProps) {
  const tab = tabs.find(t => t.id === tabId)
  if (!tab) return null

  const cellKey = `generic-${tabId}`
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2" style={{ padding: "8px 0" }}>
        <TabIcon name={tab.icon} />
        <span className="text-[12px] font-medium" style={{ color: "var(--n11)" }}>{tab.label}</span>
      </div>
      {tab.icon === "table" ? (
        <TablePreview name={tab.label} />
      ) : (
        <CanvasCell status="done" cellId={tab.label} contextType="default" agentMode={agentMode} selected={selectedCell === cellKey} popoverOpen={popoverCell?.id === cellKey} popoverPos={popoverCell?.id === cellKey ? popoverCell.pos : undefined} onSelect={() => onSelectCell(cellKey)} onSparkle={(pos) => onSparkle(cellKey, pos)} onClosePopover={onClosePopover}>{`-- Preview: ${tab.label}\n-- Content would load here from the workspace`}</CanvasCell>
      )}
    </div>
  )
}

/* ─── Table preview (for catalog items) ─────────────────────── */

function TablePreview({ name }: { name: string }) {
  const columns = [
    { col: "customer_id", type: "STRING" },
    { col: "cohort_month", type: "DATE" },
    { col: "months_on_plan", type: "INT" },
    { col: "payment_failures_90d", type: "INT" },
    { col: "churned", type: "BOOLEAN" },
  ]

  return (
    <div style={{ background: "var(--n2)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div className="flex items-center gap-2" style={{ padding: "8px 12px", background: "var(--n3)", borderBottom: "1px solid rgba(var(--overlay), 0.06)" }}>
        <span className="text-[11px] font-medium" style={{ color: "var(--n10)" }}>Schema</span>
        <span className="text-[11px]" style={{ color: "var(--n8)" }}>·</span>
        <span className="text-[11px]" style={{ color: "var(--n8)" }}>{columns.length} columns</span>
      </div>
      <div>
        {columns.map((col, i) => (
          <div
            key={i}
            className="flex items-center justify-between"
            style={{ padding: "5px 12px", borderBottom: i < columns.length - 1 ? "1px solid rgba(var(--overlay), 0.04)" : "none" }}
          >
            <span className="text-[11px]" style={{ color: "var(--n11)", fontFamily: "var(--font-mono, monospace)" }}>{col.col}</span>
            <span className="text-[10px]" style={{ color: "var(--n7)" }}>{col.type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Canvas tab content ────────────────────────────────────── */

type PopoverState = { id: string; pos?: { x: number; y: number } } | null

type CellProps = {
  agentMode: boolean
  selectedCell: string | null
  popoverCell: PopoverState
  onSelectCell: (id: string | null) => void
  onSparkle: (id: string, pos?: { x: number; y: number }) => void
  onClosePopover: () => void
}

function EditorToolbar() {
  return (
    <div
      className="flex items-center shrink-0"
      style={{
        height: 28,
        padding: "0 4px",
        margin: "-12px -16px 0 -16px",
        background: "transparent",
        gap: 8,
        fontSize: 11,
      }}
    >
      {/* Left: menu cluster */}
      <div className="flex items-center" style={{ gap: 1 }}>
        {["File", "Edit", "View", "Run", "Help"].map(item => (
          <button
            key={item}
            className="inline-flex items-center rounded-[3px] cursor-pointer"
            style={{
              height: 24,
              padding: "0 8px",
              background: "transparent",
              border: "none",
              color: "var(--n10)",
              fontSize: 11,
              fontWeight: 400,
              whiteSpace: "nowrap",
              transition: "background 0.1s, color 0.1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)"; e.currentTarget.style.color = "var(--n11)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--n10)" }}
          >
            {item}
          </button>
        ))}
        {/* Divider */}
        <span style={{ width: 1, height: 16, background: "rgba(var(--overlay), 0.08)", margin: "0 6px", flexShrink: 0 }} />
        {/* Language selector */}
        <button
          className="inline-flex items-center gap-1 rounded-[3px] cursor-pointer"
          style={{ height: 24, padding: "0 8px", background: "transparent", border: "none", color: "var(--n10)", fontSize: 11, fontWeight: 400 }}
        >
          Python
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n7)" }}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {/* Meta */}
        <span
          className="cursor-pointer"
          style={{ height: 24, display: "inline-flex", alignItems: "center", padding: "0 8px", color: "var(--n8)", fontSize: 11, textDecoration: "underline", textDecorationColor: "rgba(var(--overlay), 0.20)", textUnderlineOffset: 2, whiteSpace: "nowrap" }}
        >
          Last edited 12 minutes ago
        </span>
      </div>

      {/* Right: action cluster */}
      <div className="flex items-center ml-auto shrink-0" style={{ gap: 4 }}>
        <button className="inline-flex items-center justify-center rounded-[4px] cursor-pointer" style={{ width: 24, height: 24, background: "transparent", border: "1px solid rgba(var(--overlay), 0.10)", color: "var(--n9)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 3v18" />
          </svg>
        </button>
        <button
          className="inline-flex items-center gap-[5px] rounded-[4px] cursor-pointer"
          style={{ height: 24, padding: "0 10px", background: "transparent", border: "1px solid rgba(var(--overlay), 0.10)", color: "var(--n10)", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
          Run all
        </button>
        <button
          className="inline-flex items-center gap-[5px] rounded-[4px] cursor-pointer"
          style={{ height: 24, padding: "0 10px", background: "transparent", border: "1px solid rgba(var(--overlay), 0.10)", color: "var(--n10)", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}
        >
          Schedule
        </button>
        <button
          className="inline-flex items-center gap-[5px] rounded-[4px] cursor-pointer"
          style={{ height: 24, padding: "0 10px", background: "transparent", border: "1px solid rgba(var(--overlay), 0.10)", color: "var(--n10)", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}
        >
          Share
        </button>
      </div>
    </div>
  )
}

function EDAContent({ agentMode, selectedCell, popoverCell, onSelectCell, onSparkle, onClosePopover }: CellProps) {
  return (
    <div className="flex flex-col">
      <EditorToolbar />
      <div className="flex flex-col gap-3" style={{ padding: "8px 0" }}>
      <CanvasCell status="done" cellId="Cohort query" contextType="eda" agentMode={agentMode} selected={selectedCell === "eda-1"} popoverOpen={popoverCell?.id === "eda-1"} popoverPos={popoverCell?.id === "eda-1" ? popoverCell.pos : undefined} onSelect={() => onSelectCell("eda-1")} onSparkle={(pos) => onSparkle("eda-1", pos)} onClosePopover={onClosePopover}>
{`SELECT
  date_trunc('month', event_date) AS cohort_month,
  plan_tier,
  COUNT(DISTINCT customer_id) AS cohort_size,
  SUM(CASE WHEN churned THEN 1 ELSE 0 END) AS churned,
  ROUND(SUM(CASE WHEN churned THEN 1 ELSE 0 END)::float
        / COUNT(DISTINCT customer_id), 4) AS churn_rate
FROM main.churn_analytics.subscription_events
WHERE event_date >= CURRENT_DATE - INTERVAL '18 months'
GROUP BY 1, 2
ORDER BY 1 DESC, 2;`}
      </CanvasCell>
      <CanvasCell status="done" cellId="Training refresh" contextType="eda" agentMode={agentMode} selected={selectedCell === "eda-2"} popoverOpen={popoverCell?.id === "eda-2"} popoverPos={popoverCell?.id === "eda-2" ? popoverCell.pos : undefined} onSelect={() => onSelectCell("eda-2")} onSparkle={(pos) => onSparkle("eda-2", pos)} onClosePopover={onClosePopover}>
{`-- Refresh labeled training set
INSERT OVERWRITE main.churn_analytics.churn_training
SELECT
  customer_id,
  cohort_month,
  months_on_plan,
  payment_failures_90d,
  support_tickets_90d,
  usage_decline_pct,
  last_login_days,
  churned AS label
FROM main.churn_analytics.churn_features
WHERE cohort_month >= '2025-01-01';`}
      </CanvasCell>
      <CanvasCell status="done" cellId="Validate rows" contextType="eda" agentMode={agentMode} selected={selectedCell === "eda-3"} popoverOpen={popoverCell?.id === "eda-3"} popoverPos={popoverCell?.id === "eda-3" ? popoverCell.pos : undefined} onSelect={() => onSelectCell("eda-3")} onSparkle={(pos) => onSparkle("eda-3", pos)} onClosePopover={onClosePopover}>
{`-- Validate row counts match expectations
SELECT
  cohort_month,
  COUNT(*) AS row_count
FROM main.churn_analytics.churn_training
GROUP BY 1
ORDER BY 1 DESC
LIMIT 6;`}
      </CanvasCell>
      </div>
    </div>
  )
}

function PipelineContent({ agentMode, selectedCell, popoverCell, onSelectCell, onSparkle, onClosePopover }: CellProps) {
  return (
    <div className="flex flex-col gap-3">
      <CanvasCell status="done" cellId="Pipeline config" lang="yaml" contextType="pipeline" agentMode={agentMode} selected={selectedCell === "pipe-1"} popoverOpen={popoverCell?.id === "pipe-1"} popoverPos={popoverCell?.id === "pipe-1" ? popoverCell.pos : undefined} onSelect={() => onSelectCell("pipe-1")} onSparkle={(pos) => onSparkle("pipe-1", pos)} onClosePopover={onClosePopover}>
{`name: cohort-refresh-weekly
schedule: "0 4 * * MON"   # 04:00 UTC every Monday
source: bronze.subscriptions
filters:
  - billing_cycle == "monthly"
  - trial == false
transforms:
  - deduplicate_by: [customer_id, event_date]
  - compute_features:
      - months_on_plan
      - payment_failures_90d
      - support_tickets_90d
      - usage_decline_pct
      - last_login_days
output: main.churn_analytics.churn_features
validation:
  - row_count > 100000
  - null_rate("customer_id") == 0`}
      </CanvasCell>
    </div>
  )
}

/* ─── Syntax highlighting ───────────────────────────────────── */

const SQL_KEYWORDS = /\b(SELECT|FROM|WHERE|GROUP|ORDER|BY|AS|INSERT|OVERWRITE|INTO|AND|OR|NOT|IN|IS|NULL|CASE|WHEN|THEN|ELSE|END|JOIN|LEFT|RIGHT|INNER|ON|HAVING|LIMIT|DISTINCT|DESC|ASC|INTERVAL|CURRENT_DATE|COUNT|SUM|ROUND|FLOAT|CREATE|ALTER|DROP|TABLE|VIEW|SET|UPDATE|DELETE|WITH|UNION|ALL|EXISTS|BETWEEN|LIKE|TRUE|FALSE)\b/gi
const SQL_FUNCTIONS = /\b(date_trunc|COUNT|SUM|ROUND|COALESCE|CAST|NVL|IFNULL|MAX|MIN|AVG|ROW_NUMBER|RANK|LAG|LEAD|FIRST_VALUE|LAST_VALUE|null_rate)\b/g
const SQL_STRINGS = /('[^']*')/g
const SQL_NUMBERS = /\b(\d+\.?\d*)\b/g
const SQL_COMMENTS = /(--.*$)/gm

type TokenType = "keyword" | "function" | "string" | "number" | "comment" | "plain"

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: "var(--n9)",
  function: "#7c6dd8",
  string: "#2a7ab5",
  number: "#b55a8a",
  comment: "var(--n7)",
  plain: "var(--n11)",
}

function tokenizeLine(line: string, lang: "sql" | "yaml"): { text: string; type: TokenType }[] {
  if (lang === "yaml") return tokenizeYaml(line)
  return tokenizeSql(line)
}

function tokenizeSql(line: string): { text: string; type: TokenType }[] {
  const commentMatch = line.match(/^(.*?)(--.*$)/)
  if (commentMatch) {
    const before = tokenizeSqlInner(commentMatch[1])
    return [...before, { text: commentMatch[2], type: "comment" }]
  }
  return tokenizeSqlInner(line)
}

function tokenizeSqlInner(line: string): { text: string; type: TokenType }[] {
  const tokens: { text: string; type: TokenType; start: number }[] = []

  let m: RegExpExecArray | null
  const stringRe = new RegExp(SQL_STRINGS.source, "g")
  while ((m = stringRe.exec(line)) !== null) {
    tokens.push({ text: m[0], type: "string", start: m.index })
  }

  const kwRe = new RegExp(SQL_KEYWORDS.source, "gi")
  while ((m = kwRe.exec(line)) !== null) {
    if (!tokens.some(t => m!.index >= t.start && m!.index < t.start + t.text.length)) {
      tokens.push({ text: m[0], type: "keyword", start: m.index })
    }
  }

  const fnRe = new RegExp(SQL_FUNCTIONS.source, "g")
  while ((m = fnRe.exec(line)) !== null) {
    if (!tokens.some(t => m!.index >= t.start && m!.index < t.start + t.text.length)) {
      tokens.push({ text: m[0], type: "function", start: m.index })
    }
  }

  const numRe = new RegExp(SQL_NUMBERS.source, "g")
  while ((m = numRe.exec(line)) !== null) {
    if (!tokens.some(t => m!.index >= t.start && m!.index < t.start + t.text.length)) {
      tokens.push({ text: m[0], type: "number", start: m.index })
    }
  }

  tokens.sort((a, b) => a.start - b.start)

  const result: { text: string; type: TokenType }[] = []
  let pos = 0
  for (const tok of tokens) {
    if (tok.start > pos) {
      result.push({ text: line.slice(pos, tok.start), type: "plain" })
    }
    result.push({ text: tok.text, type: tok.type })
    pos = tok.start + tok.text.length
  }
  if (pos < line.length) {
    result.push({ text: line.slice(pos), type: "plain" })
  }
  return result.length ? result : [{ text: line, type: "plain" }]
}

function tokenizeYaml(line: string): { text: string; type: TokenType }[] {
  const commentMatch = line.match(/^(.*?)(#.*$)/)
  if (commentMatch && !commentMatch[1].includes("'") && !commentMatch[1].includes('"')) {
    const before = tokenizeYamlInner(commentMatch[1])
    return [...before, { text: commentMatch[2], type: "comment" }]
  }
  return tokenizeYamlInner(line)
}

function tokenizeYamlInner(line: string): { text: string; type: TokenType }[] {
  const keyMatch = line.match(/^(\s*-?\s*)([a-zA-Z_][\w.]*)\s*(:)(.*)$/)
  if (keyMatch) {
    const result: { text: string; type: TokenType }[] = []
    if (keyMatch[1]) result.push({ text: keyMatch[1], type: "plain" })
    result.push({ text: keyMatch[2], type: "keyword" })
    result.push({ text: keyMatch[3], type: "plain" })
    const val = keyMatch[4]
    if (val.trim()) {
      const strMatch = val.match(/^(\s*)("[^"]*"|'[^']*')(.*)$/)
      if (strMatch) {
        if (strMatch[1]) result.push({ text: strMatch[1], type: "plain" })
        result.push({ text: strMatch[2], type: "string" })
        if (strMatch[3]) result.push({ text: strMatch[3], type: "plain" })
      } else if (/^\s*\d+/.test(val)) {
        const numMatch = val.match(/^(\s*)(\d+\.?\d*)(.*)$/)
        if (numMatch) {
          if (numMatch[1]) result.push({ text: numMatch[1], type: "plain" })
          result.push({ text: numMatch[2], type: "number" })
          if (numMatch[3]) result.push({ text: numMatch[3], type: "plain" })
        }
      } else if (/^\s*(true|false|null)\b/i.test(val)) {
        const boolMatch = val.match(/^(\s*)(true|false|null)(.*)$/i)
        if (boolMatch) {
          if (boolMatch[1]) result.push({ text: boolMatch[1], type: "plain" })
          result.push({ text: boolMatch[2], type: "number" })
          if (boolMatch[3]) result.push({ text: boolMatch[3], type: "plain" })
        }
      } else {
        result.push({ text: val, type: "string" })
      }
    }
    return result
  }

  if (line.trim().startsWith("- ")) {
    const dashMatch = line.match(/^(\s*-\s)(.*)$/)
    if (dashMatch) {
      return [
        { text: dashMatch[1], type: "plain" },
        { text: dashMatch[2], type: "string" },
      ]
    }
  }

  return [{ text: line, type: "plain" }]
}

function HighlightedLine({ text, lang }: { text: string; lang: "sql" | "yaml" }) {
  const tokens = tokenizeLine(text, lang)
  return (
    <>
      {tokens.map((tok, i) => (
        <span key={i} style={{ color: TOKEN_COLORS[tok.type] }}>{tok.text}</span>
      ))}
    </>
  )
}

/* ─── Agent code additions (injected when agent "applies") ─── */

const AGENT_CODE_ADDITIONS: Record<string, string[]> = {
  eda: [
    "",
    "-- Retention curve by plan tier",
    "SELECT",
    "  plan_tier,",
    "  cohort_month,",
    "  COUNT(DISTINCT customer_id) AS retained,",
    "  ROUND(COUNT(DISTINCT customer_id)::float",
    "        / FIRST(cohort_size), 4) AS retention_rate",
    "FROM main.churn_analytics.subscription_events",
    "GROUP BY 1, 2",
    "ORDER BY 1, 2;",
  ],
  pipeline: [
    "",
    "validation:",
    "  - row_count > 100000",
    "  - null_rate(\"customer_id\") == 0",
    "  - schema_drift == false",
  ],
  default: [
    "",
    "-- Optimized: added partition pruning",
    "WHERE event_date >= CURRENT_DATE - INTERVAL '6 months'",
  ],
}

/* ─── Canvas cell ───────────────────────────────────────────── */

function CanvasCell({ children, status, cellId, lang = "sql", agentMode, selected, popoverOpen, popoverPos, onSelect, onSparkle, onClosePopover, contextType }: {
  children: string
  status: "done" | "running"
  cellId?: string
  lang?: "sql" | "yaml"
  agentMode?: boolean
  selected?: boolean
  popoverOpen?: boolean
  popoverPos?: { x: number; y: number }
  onSelect?: () => void
  onSparkle?: (pos?: { x: number; y: number }) => void
  onClosePopover?: () => void
  contextType?: string
}) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)
  const [updated, setUpdated] = useState(false)
  const [extraLines, setExtraLines] = useState<string[]>([])
  const preRef = useRef<HTMLDivElement>(null)
  const cellRef = useRef<HTMLDivElement>(null)

  const isInspecting = agentMode && (hovered || selected)
  const showSparkle = (isInspecting || clicked || hasSelection) && !popoverOpen

  const lines = [...children.split("\n"), ...extraLines]

  const handleMouseUp = () => {
    const sel = window.getSelection()
    if (sel && sel.toString().trim().length > 0 && preRef.current?.contains(sel.anchorNode)) {
      setHasSelection(true)
    } else {
      setHasSelection(false)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (agentMode) {
      onSelect?.()
    } else {
      setClicked(true)
    }
  }

  const handleSparkleClick = (e: React.MouseEvent) => {
    onSparkle?.({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    if (agentMode && !popoverOpen) setHovered(false)
    if (!agentMode && !popoverOpen) { setClicked(false); setHasSelection(false) }
  }

  const borderColor = updated
    ? "rgba(34, 160, 90, 0.5)"
    : isInspecting
      ? "rgba(56, 120, 200, 0.4)"
      : (clicked || hasSelection)
        ? "rgba(var(--overlay), 0.14)"
        : "transparent"

  return (
    <div
      ref={cellRef}
      className="relative transition-all"
      style={{
        background: updated
          ? "rgba(34, 160, 90, 0.06)"
          : isInspecting
            ? "rgba(56, 120, 200, 0.04)"
            : (clicked || hasSelection)
              ? "rgba(var(--overlay), 0.02)"
              : "var(--n2)",
        borderRadius: "var(--radius-lg)",
        overflow: "visible",
        border: `1px solid ${borderColor}`,
        boxShadow: updated
          ? "0 0 0 2px rgba(34, 160, 90, 0.12)"
          : isInspecting ? "0 0 0 2px rgba(56, 120, 200, 0.12)" : "none",
        cursor: agentMode ? "crosshair" : "text",
        transition: "border 0.3s, background 0.3s, box-shadow 0.3s",
      }}
      onClick={handleClick}
      onMouseEnter={() => { if (agentMode) { setHovered(true); onSelect?.() } }}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ background: "var(--n3)", padding: "6px 12px", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }}
      >
        <div className="flex items-center gap-[6px]">
          <button
            className="flex items-center justify-center shrink-0 rounded-[3px]"
            style={{ width: 20, height: 20, background: "transparent", border: "none", color: "var(--n9)", cursor: "pointer" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
          {cellId && (
            <span className="text-[11px]" style={{ color: "var(--n8)" }}>{cellId}</span>
          )}
        </div>
        <span className="flex items-center justify-center shrink-0" style={{ width: 16, height: 16 }}>
          {status === "done" ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--success-fg)" }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <span style={{ width: 10, height: 10, border: "1.5px solid transparent", borderTopColor: "var(--n11)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
          )}
        </span>
      </div>

      {/* Body — code lines with line numbers */}
      <div ref={preRef} style={{ padding: "12px 0" }}>
        {lines.map((line, i) => {
          const isNew = extraLines.length > 0 && i >= (lines.length - extraLines.length)
          return (
            <div
              key={i}
              className="flex"
              style={{
                gap: 16,
                padding: "0 12px",
                background: isNew ? "rgba(34, 160, 90, 0.06)" : "transparent",
                borderLeft: isNew ? "2px solid var(--success-fg)" : "2px solid transparent",
                transition: "background 0.3s, border-color 0.3s",
              }}
            >
              <span className="shrink-0 text-right select-none" style={{ width: 24, fontSize: 12, lineHeight: "18px", color: isNew ? "var(--success-fg)" : "var(--n6)", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>
                {i + 1}
              </span>
              <span className="flex-1 min-w-0 select-text" style={{ fontSize: 12, lineHeight: "18px", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", whiteSpace: "pre" }}>
                <HighlightedLine text={line} lang={lang} />
              </span>
            </div>
          )
        })}
      </div>

      {/* Sparkle button — appears in agent mode (bold) or on click/selection (subtle) */}
      {showSparkle && onSparkle && (
        <SparkleButton onClick={handleSparkleClick} subtle={!agentMode} />
      )}

      {/* Agent popover — positioned near click */}
      {popoverOpen && onClosePopover && (
        <AgentPopover
          contextType={contextType || "default"}
          clickPosition={popoverPos}
          onClose={() => { onClosePopover(); setClicked(false); setHasSelection(false) }}
          onCellUpdate={() => {
            setUpdated(true)
            setExtraLines(AGENT_CODE_ADDITIONS[contextType || "default"] || AGENT_CODE_ADDITIONS.default)
            setTimeout(() => setUpdated(false), 3000)
          }}
        />
      )}
    </div>
  )
}

/* ─── Tool button ───────────────────────────────────────────── */

function ToolButton({ icon, title, hasUpdate, active, onClick }: { icon: string; title: string; hasUpdate?: boolean; active?: boolean; onClick?: () => void }) {
  return (
    <button
      className="relative flex items-center justify-center shrink-0 rounded-[4px] transition-colors cursor-pointer"
      style={{ width: 26, height: 26, color: active ? "var(--n12)" : "var(--n8)", background: active ? "rgba(var(--overlay), 0.06)" : "transparent" }}
      title={title}
      onClick={onClick}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "var(--n11)"; e.currentTarget.style.background = "rgba(var(--overlay), 0.06)" } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "var(--n8)"; e.currentTarget.style.background = "transparent" } }}
    >
      <ToolBarIcon name={icon} />
      {hasUpdate && (
        <span
          className="absolute"
          style={{ top: 4, right: 4, width: 5, height: 5, borderRadius: "50%", background: "var(--success-fg)" }}
        />
      )}
    </button>
  )
}

/* ─── Icon helpers ──────────────────────────────────────────── */

function TabIcon({ name }: { name: string }) {
  const s = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  switch (name) {
    case "book-open":
      return <DbIcon name="notebook" size={12} />
    case "workflow":
      return <DbIcon name="pipeline" size={12} />
    case "target":
      return <svg {...s}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
    case "table":
      return <svg {...s}><path d="M12 3v18" /><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /></svg>
    case "dashboard":
      return <svg {...s}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
    case "sql":
      return <svg {...s}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg>
    default:
      return <svg {...s}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
  }
}

function ToolBarIcon({ name }: { name: string }) {
  const s = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  switch (name) {
    case "folder":
      return <svg {...s}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>
    case "database":
      return <svg {...s}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg>
    case "git-merge":
      return <svg {...s}><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 21V9a9 9 0 0 0 9 9" /></svg>
    case "sparkles":
      return <svg {...s}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /></svg>
    case "plus":
      return <svg {...s}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    case "more-horizontal":
      return <svg {...s}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
    case "message-circle":
      return <svg {...s}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
    case "panel-right":
      return <svg {...s}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /></svg>
    default:
      return <svg {...s}><circle cx="12" cy="12" r="10" /></svg>
  }
}
