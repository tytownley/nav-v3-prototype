"use client"

import React, { useState } from "react"
import { CanvasPanel } from "./CanvasPanel"

export function ChatWithCanvas() {
  const [canvasOpen, setCanvasOpen] = useState(true)
  const [chatVisible, setChatVisible] = useState(true)
  const [input, setInput] = useState("")

  return (
    <div className="relative flex h-full">
      {/* Chat pane — ~36% when canvas open, full width when collapsed, hidden when chatVisible is false */}
      <div className="relative flex flex-col min-w-0" style={{ flex: !chatVisible ? "0 0 0px" : canvasOpen ? "0 0 36%" : "1 1 100%", minWidth: chatVisible && canvasOpen ? 320 : undefined, opacity: chatVisible ? 1 : 0, overflow: chatVisible ? undefined : "hidden", transition: "flex 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease" }}>
        {/* Header with breadcrumb */}
        <div
          className="shrink-0 flex items-center justify-between"
          style={{ height: 40, padding: "0 12px", background: "var(--n1)" }}
        >
          <div className="flex items-center gap-[6px]">
            {/* Ellipsis breadcrumb */}
            <button className="flex items-center justify-center rounded-[4px] cursor-pointer" style={{ width: 22, height: 22, color: "var(--n8)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
              </svg>
            </button>
            <span className="text-[11px]" style={{ color: "var(--n7)" }}>/</span>
            <span className="text-[12px] font-medium" style={{ color: "var(--n11)" }}>Cohort table refresh</span>
          </div>

        </div>

        {/* Chat messages */}
        <div className="chat-scrollbar flex-1 overflow-y-auto" style={{ padding: "24px", paddingBottom: 120 }}>
          <div className="flex flex-col gap-4" style={{ maxWidth: canvasOpen ? "100%" : 580, margin: canvasOpen ? 0 : "0 auto" }}>
            <CohortChatContent />
          </div>
        </div>

        {/* Input bar */}
        <div className="absolute bottom-0 left-0 right-0" style={{ padding: "12px 16px 16px", background: "linear-gradient(to bottom, transparent, var(--n1) 40%)" }}>
          <div style={{ maxWidth: canvasOpen ? "100%" : 580, margin: canvasOpen ? 0 : "0 auto" }}>
            <div
              className="flex items-center gap-[6px] w-full rounded-[9999px]"
              style={{ background: "var(--n1)", border: "1px solid rgba(var(--overlay), 0.08)", padding: "6px 6px 6px 16px" }}
            >
              <button className="flex items-center justify-center size-6 shrink-0 rounded-[4px]" style={{ color: "var(--n7)" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Message..."
                className="flex-1 min-w-0 h-7 bg-transparent text-[13px] outline-none"
                style={{ color: "var(--n11)" }}
              />
              <span className="text-[12px] font-medium" style={{ color: "var(--n10)" }}>claude-4.6-opus</span>
              <button className="flex items-center justify-center size-6 shrink-0 rounded-full" style={{ background: "var(--n12)", color: "var(--n1)" }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 13V3M8 3L4 7M8 3l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas panel */}
      <CanvasPanel open={canvasOpen} onToggle={() => setCanvasOpen(false)} chatVisible={chatVisible} onToggleChat={() => setChatVisible(v => !v)} />

      {/* Persistent panel toggle — stays in same position regardless of canvas state */}
      {!canvasOpen && (
        <button
          className="absolute flex items-center justify-center rounded-[4px] cursor-pointer"
          style={{
            top: 10,
            right: 10,
            width: 26,
            height: 26,
            color: "var(--n8)",
            background: "transparent",
            border: "none",
            zIndex: 5,
            transition: "color 0.1s",
          }}
          onClick={() => setCanvasOpen(true)}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)"; e.currentTarget.style.background = "rgba(var(--overlay), 0.06)" }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--n8)"; e.currentTarget.style.background = "transparent" }}
          title="Open canvas panel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M15 3v18" />
          </svg>
        </button>
      )}
    </div>
  )
}

/* ─── Placeholder chat content for Cohort table refresh ─────── */

function CohortChatContent() {
  return (
    <>
      {/* User message — .chat-msg.user-msg */}
      <div style={{ background: "var(--n2)", borderRadius: "var(--radius-lg)", padding: "10px 12px" }}>
        <p className="text-[13px] leading-[20px]" style={{ color: "var(--n11)", fontWeight: 500 }}>
          Can you refresh the cohort training table? I want to make sure we have the latest 18 months of subscription data before the Monday forecast run.
        </p>
      </div>

      {/* Thinking — .chat-thinking data-state="done" */}
      <div style={{ borderRadius: "var(--radius-sm)" }}>
        <button
          className="flex items-center gap-[6px] w-full cursor-pointer"
          style={{ padding: "6px 8px", background: "transparent", border: "none", borderRadius: "var(--radius-sm)", transition: "background var(--duration-instant)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
        >
          {/* Brain icon (Lucide) */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n8)", flexShrink: 0 }}>
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
          </svg>
          <span className="text-[11px]" style={{ color: "var(--n8)" }}>Thought for 4s</span>
          {/* Chevron — rotated -90deg for collapsed */}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--n7)", flexShrink: 0, transform: "rotate(-90deg)", transition: "transform var(--duration-fast)" }}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Agent response — .chat-msg-text */}
      <div className="flex flex-col gap-1">
        <p className="text-[13px] leading-[18px]" style={{ color: "var(--n10)", fontWeight: 500 }}>
          I&apos;ll refresh the cohort training table with the latest 18 months. Let me check the current state and run the update.
        </p>
      </div>

      {/* Tool calls — .chat-tool-use.is-done */}
      <div className="flex flex-col gap-0">
        <ToolCallRow icon="search" label="QueryTable" detail="main.churn_analytics.churn_training · row count" state="done" duration="0.3s" />
        <ToolCallRow icon="play" label="RunSQL" detail="INSERT OVERWRITE main.churn_analytics.churn_training" state="done" duration="2.8s" />
        <ToolCallRow icon="search" label="ValidateRows" detail="main.churn_analytics.churn_training · 6 months" state="done" duration="1.1s" />
      </div>

      {/* MCP Card — Jobs */}
      <JobsMcpCard />

      {/* Agent follow-up — .chat-msg-text */}
      <div className="flex flex-col gap-1">
        <p className="text-[13px] leading-[18px]" style={{ color: "var(--n10)", fontWeight: 500 }}>
          All done. The refresh completed in 3m 12s — 1.24M rows across 18 monthly cohorts. Validation passed. You&apos;re set for Monday&apos;s forecast run.
        </p>
        <p className="text-[13px] leading-[18px]" style={{ color: "var(--n10)", fontWeight: 500 }}>
          Want me to also update the feature pipeline schedule?
        </p>
      </div>

      {/* Action chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          className="text-[12px] rounded-[9999px] transition-all cursor-pointer"
          style={{ padding: "6px 14px", color: "var(--n10)", background: "transparent", border: "1px solid rgba(var(--overlay), 0.10)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)"; e.currentTarget.style.color = "var(--n11)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--n10)" }}
        >
          Yes, update the schedule
        </button>
        <button
          className="text-[12px] rounded-[9999px] transition-all cursor-pointer"
          style={{ padding: "6px 14px", color: "var(--n10)", background: "transparent", border: "1px solid rgba(var(--overlay), 0.10)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)"; e.currentTarget.style.color = "var(--n11)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--n10)" }}
        >
          Show me the row counts first
        </button>
      </div>
    </>
  )
}

/* ─── Tool call row (reused pattern) ───────────────────────── */

function ToolCallRow({ icon, label, detail, state, duration }: { icon: string; label: string; detail: string; state: "running" | "done"; duration?: string }) {
  return (
    <div
      className="flex items-center gap-[6px]"
      style={{
        padding: "5px 10px",
        borderRadius: "var(--radius-md)",
        border: state === "done" ? "1px solid rgba(var(--overlay), 0.08)" : "1px solid rgba(var(--overlay), 0.10)",
        transition: "background var(--duration-instant)",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.03)" }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
    >
      {/* Status slot — 14×14, same vocabulary as plan items */}
      <span className="flex items-center justify-center shrink-0" style={{ width: 14, height: 14 }}>
        {state === "done" ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n7)" }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <span style={{ width: 10, height: 10, border: "1.5px solid transparent", borderTopColor: "var(--n11)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        )}
      </span>
      {/* Tool icon */}
      <MiniIcon name={icon} />
      {/* Tool name */}
      <span className="text-[11px] font-medium" style={{ color: "var(--n11)" }}>{label}</span>
      {/* Detail / preview */}
      <span className="text-[11px] flex-1 min-w-0 truncate" style={{ color: "var(--n8)" }}>{detail}</span>
      {/* Duration — shown on done/failed, omitted on running */}
      {duration && <span className="text-[11px] shrink-0" style={{ color: "var(--n7)", fontVariantNumeric: "tabular-nums" }}>{duration}</span>}
      {/* Chevron */}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--n7)", flexShrink: 0 }}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    </div>
  )
}

function MiniIcon({ name }: { name: string }) {
  const s = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, style: { color: "var(--n8)" } }
  switch (name) {
    case "search":
      return <svg {...s}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    case "play":
      return <svg {...s}><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" /></svg>
    default:
      return <svg {...s}><circle cx="12" cy="12" r="10" /></svg>
  }
}

/* ─── Jobs MCP Card ──────────────────────────────────────────── */

const RUN_HISTORY: Array<{ id: number; duration: string; status: "success" | "failed" | "warning" }> = [
  { id: 481, duration: "3m 02s", status: "success" },
  { id: 482, duration: "3m 11s", status: "success" },
  { id: 483, duration: "3m 08s", status: "success" },
  { id: 484, duration: "2m 58s", status: "success" },
  { id: 485, duration: "0m 18s", status: "failed" },
  { id: 486, duration: "3m 22s", status: "success" },
  { id: 487, duration: "3m 05s", status: "success" },
  { id: 488, duration: "3m 14s", status: "success" },
  { id: 489, duration: "3m 09s", status: "success" },
  { id: 490, duration: "2m 55s", status: "success" },
  { id: 491, duration: "3m 01s", status: "success" },
  { id: 492, duration: "3m 18s", status: "success" },
  { id: 493, duration: "3m 07s", status: "success" },
  { id: 494, duration: "3m 12s", status: "success" },
]

type DagStatus = "success" | "running" | "failed" | "pending" | "skipped"

const DAG_NODES: Array<{ label: string; status: DagStatus; x: number }> = [
  { label: "ingest", status: "success", x: 12 },
  { label: "filter", status: "success", x: 92 },
  { label: "features", status: "success", x: 172 },
  { label: "write", status: "success", x: 262 },
]

const STATUS_COLORS: Record<string, string> = {
  success: "var(--success-fg)",
  failed: "var(--danger-fg)",
  warning: "var(--warning-fg)",
  running: "var(--n11)",
  pending: "var(--n5)",
}

function JobsMcpCard() {
  return (
    <div
      style={{
        position: "relative",
        border: "1px solid rgba(var(--overlay), 0.08)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      {/* Status accent strip — 2px green left edge */}
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 2, background: "var(--success-fg)", borderRadius: "var(--radius-md) 0 0 var(--radius-md)" }} />

      {/* Header — .chat-mcp-card-header */}
      <button
        className="flex items-center gap-[6px] w-full cursor-pointer"
        style={{ padding: "8px 12px", borderBottom: "1px solid rgba(var(--overlay), 0.06)", background: "transparent", border: "none", borderBlockEnd: "1px solid rgba(var(--overlay), 0.06)", textAlign: "left" }}
      >
        {/* Server icon — neutral 14×14 */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n8)", flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
        </svg>
        {/* Server name — --n11, 500wt */}
        <span className="text-[11px]" style={{ color: "var(--n11)", fontWeight: 500 }}>Jobs</span>
        {/* Separator */}
        <span className="text-[11px]" style={{ color: "var(--n7)" }}>·</span>
        {/* Tool name — --n8, 400wt */}
        <span className="text-[11px]" style={{ color: "var(--n8)", fontWeight: 400 }}>runs.get</span>
        {/* Preview — --n9, truncates, separated by subtle border */}
        <span
          className="text-[11px] flex-1 min-w-0 truncate"
          style={{ color: "var(--n9)", paddingLeft: 6, marginLeft: 2, borderLeft: "1px solid rgba(var(--overlay), 0.08)" }}
        >
          cohort-refresh-weekly succeeded
        </span>
        {/* Duration — --n7, tabular nums */}
        <span className="text-[11px] shrink-0" style={{ color: "var(--n7)", fontVariantNumeric: "tabular-nums" }}>0.3s</span>
        {/* Chevron — rotated 90deg for expanded */}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--n7)", flexShrink: 0, transform: "rotate(90deg)", transition: "transform var(--duration-fast)" }}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* DAG Hero — task pipeline visualization */}
      <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid rgba(var(--overlay), 0.06)" }}>
        <svg viewBox="0 0 340 44" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: 44 }}>
          {/* Edges */}
          {DAG_NODES.slice(0, -1).map((node, i) => (
            <path
              key={`edge-${i}`}
              d={`M ${node.x + 60} 22 L ${DAG_NODES[i + 1].x} 22`}
              stroke={STATUS_COLORS[node.status]}
              strokeWidth="1.5"
              fill="none"
              opacity={0.6}
            />
          ))}
          {/* Nodes */}
          {DAG_NODES.map((node, i) => (
            <g key={i}>
              <rect
                x={node.x}
                y={10}
                width={56}
                height={24}
                rx={4}
                fill="transparent"
                stroke={STATUS_COLORS[node.status]}
                strokeWidth={1.5}
                opacity={0.8}
              />
              <text
                x={node.x + 28}
                y={26}
                textAnchor="middle"
                fontSize={9}
                fontFamily="var(--font-mono, monospace)"
                fill={node.status === "pending" ? "var(--n7)" : "var(--n11)"}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Body — KV pairs */}
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <KvRow label="Run ID" value="run-7f2a91d4" mono />
        <KvRow label="Status" value="Succeeded" />
        <KvRow label="Duration" value="3m 12s" />
        <KvRow label="Cluster" value="ml-cluster-prod-02" mono />
        <KvRow label="Rows written" value="1,243,891" />
      </div>

      {/* Run history strip */}
      <div className="flex items-center gap-[6px]" style={{ padding: "8px 12px", borderTop: "1px solid rgba(var(--overlay), 0.06)" }}>
        <span className="text-[10px]" style={{ color: "var(--n8)", whiteSpace: "nowrap" }}>Last 14 runs</span>
        <div className="flex items-center gap-[2px]">
          {RUN_HISTORY.map((run, i) => (
            <span
              key={i}
              title={`Run #${run.id} · ${run.duration} · ${run.status}`}
              style={{
                width: 4,
                height: 14,
                borderRadius: 1,
                background: STATUS_COLORS[run.status],
                opacity: 0.8,
              }}
            />
          ))}
        </div>
        <span className="text-[10px]" style={{ color: "var(--n8)" }}>
          <strong style={{ fontWeight: 600 }}>13</strong>/14 success
        </span>
      </div>

      {/* Footer — .chat-mcp-view-in */}
      <div className="flex justify-end" style={{ padding: "6px 12px", borderTop: "1px solid rgba(var(--overlay), 0.06)" }}>
        <a
          className="flex items-center gap-1 text-[11px] cursor-pointer"
          style={{ color: "var(--n8)", transition: "color var(--duration-instant)" }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--n8)" }}
        >
          View in Jobs
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  )
}

function KvRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center">
      <span className="text-[11px] shrink-0" style={{ color: "var(--n8)", width: 90 }}>{label}</span>
      <span className="text-[11px]" style={{ color: "var(--n11)", fontFamily: mono ? "var(--font-mono, monospace)" : "inherit" }}>{value}</span>
    </div>
  )
}
