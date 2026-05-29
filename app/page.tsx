"use client"

import React, { useState, useRef, useEffect } from "react"
import { NavStateProvider, useNavState } from "./lib/nav-state"
import { SidebarNav } from "./components/SidebarNav"
import { ThreadRenderer } from "./components/AnimatedThread"
import { ChatWithCanvas } from "./components/ChatWithCanvas"
import { CanvasPanel } from "./components/CanvasPanel"
import { BrowsePage } from "./components/BrowsePage"
import { MonitorPage } from "./components/MonitorPage"
import { DEFAULT_PINNED_ITEMS } from "./lib/nav-defaults"
import { Sparkle } from "dbui/components/icons/Sparkle"
import { ChevronDown } from "dbui/components/icons/ChevronDown"

/* ─── Home page catch-up cards ────────────────────────────────── */

interface CatchUpCardData {
  category: string
  categoryIcon: "connector" | "model" | "pipeline"
  title: string
  description: string
  time: string
  action: string
  shimmerColor: string
}

const CATCHUP_CARDS: CatchUpCardData[] = [
  {
    category: "Connector",
    categoryIcon: "connector",
    title: "New Slack connector available",
    description: "Your admin enabled a Slack connector via MCP. Get notified and interact with agents from Slack.",
    time: "2h ago",
    action: "Explore connector",
    shimmerColor: "rgba(74, 21, 75, 0.10)",
  },
  {
    category: "Model health",
    categoryIcon: "model",
    title: "Churn model flagged drift",
    description: "Distribution drift detected on the `region` feature (0.12 PSI, threshold 0.1). A retraining run is staged.",
    time: "4h ago",
    action: "Show details",
    shimmerColor: "rgba(235, 107, 107, 0.12)",
  },
  {
    category: "Pipeline",
    categoryIcon: "pipeline",
    title: "Q2 pipeline finished with warnings",
    description: "Supply chain pipeline completed with 2 schema warnings on the vendor dimension table. No data loss.",
    time: "6h ago",
    action: "View warnings",
    shimmerColor: "rgba(232, 184, 74, 0.12)",
  },
]

function CatchUpCardStack({ onAction }: { onAction: (text: string) => void }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const visibleCards = CATCHUP_CARDS.filter((_, i) => !dismissed.has(i))
  const totalVisible = visibleCards.length

  useEffect(() => {
    if (hovered || totalVisible <= 1) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % totalVisible)
    }, 5500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [hovered, totalVisible])

  if (totalVisible === 0) return null

  const safeIndex = activeIndex % totalVisible

  const categoryIcon = (type: string) => {
    const svgProps = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
    switch (type) {
      case "connector": return <svg {...svgProps}><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10M21 21v-2M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg>
      case "model": return <svg {...svgProps}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
      case "pipeline": return <svg {...svgProps}><rect width="8" height="8" x="3" y="3" rx="2" /><path d="M7 11v4a2 2 0 0 0 2 2h4" /><rect width="8" height="8" x="13" y="13" rx="2" /></svg>
      default: return <svg {...svgProps}><circle cx="12" cy="12" r="10" /></svg>
    }
  }

  const goNext = () => setActiveIndex((safeIndex + 1) % totalVisible)
  const goPrev = () => setActiveIndex((safeIndex - 1 + totalVisible) % totalVisible)
  const dismissCard = () => {
    const originalIndex = CATCHUP_CARDS.indexOf(visibleCards[safeIndex])
    setDismissed(prev => new Set(prev).add(originalIndex))
    setActiveIndex(prev => prev >= totalVisible - 1 ? 0 : prev)
  }

  return (
    <div
      className="relative mt-12"
      style={{ height: 150, width: "60%" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* All cards rendered in stack — Time Machine depth + crossfade */}
      {visibleCards.map((card, i) => {
        const offset = i - safeIndex
        const normalizedOffset = offset < 0 ? offset + totalVisible : offset
        const isActive = normalizedOffset === 0

        if (normalizedOffset > 2) return null

        return (
          <div
            key={`stack-${i}`}
            className={`absolute inset-x-0 rounded-[10px] ${isActive ? "card-shimmer" : ""}`}
            style={{
              background: "var(--n1)",
              border: "1px solid rgba(var(--overlay), 0.08)",
              height: isActive ? "auto" : 110,
              padding: isActive ? "12px 16px" : 0,
              top: normalizedOffset * 10,
              transform: `scale(${1 - normalizedOffset * 0.04})`,
              opacity: isActive ? 1 : normalizedOffset === 1 ? 0.6 : 0.3,
              transition: "opacity 600ms ease, top 500ms ease, transform 500ms ease",
              zIndex: 20 - normalizedOffset,
              transformOrigin: "top center",
              ["--shimmer-color" as string]: card.shimmerColor,
            }}
          >
            {isActive && (
              <div className="flex items-start gap-3">
                {/* Left visual */}
                <div className="shrink-0 flex items-center justify-center" style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: card.categoryIcon === "connector" ? "rgba(var(--overlay), 0.04)"
                    : card.categoryIcon === "model" ? "rgba(235, 107, 107, 0.1)"
                    : "rgba(232, 184, 74, 0.1)",
                }}>
                  {card.categoryIcon === "connector" && (
                    <img src="/slack-logo.png" alt="Slack" width={20} height={20} style={{ objectFit: "contain" }} />
                  )}
                  {card.categoryIcon === "model" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger-fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  )}
                  {card.categoryIcon === "pipeline" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning-fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Top row: category + hover controls */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5" style={{ color: "var(--n7)" }}>
                      {categoryIcon(card.categoryIcon)}
                      <span className="text-[11px]">{card.category}</span>
                    </div>
                    <div
                      className="flex items-center gap-1"
                      style={{ opacity: hovered ? 1 : 0, transition: "opacity 150ms" }}
                    >
                      {totalVisible > 1 && (
                        <>
                          <button
                            onClick={goPrev}
                            className="flex items-center justify-center size-5 rounded-[4px] transition-colors"
                            style={{ color: "var(--n8)" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
                            onMouseLeave={e => { e.currentTarget.style.color = "var(--n8)" }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
                          </button>
                          <button
                            onClick={goNext}
                            className="flex items-center justify-center size-5 rounded-[4px] transition-colors"
                            style={{ color: "var(--n8)" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
                            onMouseLeave={e => { e.currentTarget.style.color = "var(--n8)" }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
                          </button>
                        </>
                      )}
                      <button
                        onClick={dismissCard}
                        className="flex items-center justify-center size-5 rounded-[4px] transition-colors"
                        style={{ color: "var(--n8)" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--n8)" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* Title + description */}
                  <h3 className="text-[13px] font-medium" style={{ color: "var(--n12)" }}>
                    {card.title}
                  </h3>
                  <p className="text-[11px] leading-[16px] mt-0.5" style={{ color: "var(--n8)" }}>
                    {card.description}
                  </p>

                  {/* Primary action — bottom left */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      className="inline-flex items-center gap-1 h-6 px-3 text-[11px] font-medium rounded-[9999px]"
                      style={{ background: "var(--n12)", color: "var(--n1)" }}
                      onClick={() => onAction(card.action)}
                    >
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 8h10M10 5l3 3-3 3" /></svg>
                      {card.action}
                    </button>
                    {(card.categoryIcon === "model" || card.categoryIcon === "pipeline") && (
                      <button
                        className="inline-flex items-center gap-1 h-6 px-2.5 text-[11px] font-medium rounded-[9999px] transition-colors"
                        style={{ background: "transparent", color: "var(--n8)", opacity: hovered ? 1 : 0, transition: "opacity 150ms" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--n8)" }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                        Open
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Inbox data (thread feed, grouped by project) ────────────── */

interface InboxThread {
  id: string
  type: "decision" | "info" | "human"
  name: string
  avatar: "sparkle" | "database" | "activity" | "download" | string
  msg: string
  time: string
}

interface InboxThreadGroup {
  project: string
  threads: InboxThread[]
}

const INBOX_THREAD_GROUPS: InboxThreadGroup[] = [
  {
    project: "Churn forecasting",
    threads: [
      {
        id: "cf1", type: "decision", name: "Retraining Agent", avatar: "sparkle",
        msg: "AUC went from 0.82 to 0.87. Want me to promote it to staging?",
        time: "14m",
      },
      {
        id: "cf2", type: "decision", name: "Feature Store Agent", avatar: "database",
        msg: "I'd like to deprecate 3 features that haven't been used in 90 days. OK to proceed?",
        time: "3h",
      },
      {
        id: "cf3", type: "info", name: "Drift Monitor", avatar: "activity",
        msg: "Prediction drift crossed your PSI threshold (0.23). I can retrain on the last 30 days if you'd like.",
        time: "1h",
      },
    ],
  },
  {
    project: "Supply chain analytics",
    threads: [
      {
        id: "sc1", type: "info", name: "Ingestion Agent", avatar: "download",
        msg: "Nightly ingestion hit a schema drift but I recovered it. Quarantined 140 rows.",
        time: "2h",
      },
      {
        id: "sc2", type: "human", name: "Priya Sharma", avatar: "PS",
        msg: "Added the vendor breakdown you asked about.",
        time: "5h",
      },
    ],
  },
]

function CategoryChipIcon({ id, size = 12 }: { id: string; size?: number }) {
  const s = { width: size, height: size, viewBox: "0 0 16 16", fill: "currentColor" }
  switch (id) {
    case "create":
      return <svg {...s}><path d="M8 3v10M3 8h10" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" /></svg>
    case "analyze":
      return <svg {...s}><path fillRule="evenodd" clipRule="evenodd" d="M1 1V14.25C1 14.6642 1.33579 15 1.75 15H15V13.5H2.5V1H1ZM15.0303 5.03033L13.9697 3.96967L9.5 8.43934L7.53033 6.46967L7 5.93934L6.46967 6.46967L3.46967 9.46967L4.53033 10.5303L7 8.06066L8.96967 10.0303L9.5 10.5607L10.0303 10.0303L15.0303 5.03033Z" /></svg>
    case "automate":
      return <svg {...s}><path fillRule="evenodd" clipRule="evenodd" d="M8 0C8.41421 0 8.75 0.335786 8.75 0.75V3H14.25C14.6642 3 15 3.33579 15 3.75V6H15.25C15.6642 6 16 6.33579 16 6.75V11.25C16 11.6642 15.6642 12 15.25 12H15V14.25C15 14.6642 14.6642 15 14.25 15H1.75C1.33579 15 1 14.6642 1 14.25V12H0.75C0.335786 12 0 11.6642 0 11.25V6.75C0 6.33579 0.335786 6 0.75 6H1V3.75C1 3.33579 1.33579 3 1.75 3H7.25V0.75C7.25 0.335786 7.58579 0 8 0ZM2.5 4.5V13.5H13.5V4.5H2.5ZM5 9C5.55228 9 6 8.55229 6 8C6 7.44772 5.55228 7 5 7C4.44772 7 4 7.44772 4 8C4 8.55229 4.44772 9 5 9ZM12 8C12 8.55229 11.5523 9 11 9C10.4477 9 10 8.55229 10 8C10 7.44772 10.4477 7 11 7C11.5523 7 12 7.44772 12 8ZM5.75 10.25C5.33579 10.25 5 10.5858 5 11C5 11.4142 5.33579 11.75 5.75 11.75H10.25C10.6642 11.75 11 11.4142 11 11C11 10.5858 10.6642 10.25 10.25 10.25H5.75Z" /></svg>
    case "monitor":
      return <svg {...s}><path fillRule="evenodd" clipRule="evenodd" d="M1 1V14.25C1 14.6642 1.33579 15 1.75 15H15V13.5H2.5V1H1ZM15.0303 5.03033L13.9697 3.96967L9.5 8.43934L7.53033 6.46967L7 5.93934L6.46967 6.46967L3.46967 9.46967L4.53033 10.5303L7 8.06066L8.96967 10.0303L9.5 10.5607L10.0303 10.0303L15.0303 5.03033Z" /></svg>
    default:
      return null
  }
}

const HOME_CATEGORIES = [
  {
    id: "create",
    label: "Create",
    suggestions: [
      "Set up a new project",
      "Create a new notebook",
      "Create a pipeline",
      "Create a dashboard",
      "Create something in my project",
    ],
  },
  {
    id: "analyze",
    label: "Analyze",
    suggestions: [
      "Analyze my data",
      "Analyze churn in my cohort table",
      "Compare feature distributions over time",
      "Summarize last week's revenue dashboard",
      "Find anomalies in recent job runs",
    ],
  },
  {
    id: "automate",
    label: "Automate",
    suggestions: [
      "Schedule a notebook to run daily",
      "Set up an alert on query failures",
      "Build a CI/CD workflow for my pipeline",
      "Automate data ingestion from S3",
      "Create a refresh trigger for my dashboard",
    ],
  },
  {
    id: "monitor",
    label: "Monitor",
    suggestions: [
      "Check the status of cohort-refresh-weekly",
      "Show me failed jobs in the last 24 hours",
      "Review SQL warehouse utilization",
      "Debug the feature drift in churn_v4",
      "Show cluster cost trends this month",
    ],
  },
]

const TYPEAHEAD_SUGGESTIONS = [
  "how can i reduce churn in my cohort table?",
  "what caused the feature drift in churn_v4?",
  "show me the latest results from cohort-refresh-weekly",
  "summarize last week's revenue dashboard",
  "how can i create a new Delta Live Tables pipeline?",
  "how can i optimize my SQL warehouse performance?",
  "how can i schedule a notebook to run daily?",
  "how can i set up alerts on query failures?",
]

function HomePage() {
  const { dispatch } = useNavState()
  const [input, setInput] = useState("")
  const [showConnectorAd, setShowConnectorAd] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [projectOpen, setProjectOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { state } = useNavState()

  const filtered = input.length > 0
    ? TYPEAHEAD_SUGGESTIONS.filter(s => s.toLowerCase().includes(input.toLowerCase())).slice(0, 4)
    : []

  useEffect(() => {
    if (!projectOpen) return
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setProjectOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [projectOpen])

  const handleSubmit = (text?: string) => {
    const msg = text || input
    if (!msg.trim()) return
    dispatch({ type: "START_HOME_THREAD", input: msg })
  }

  return (
    <div className="flex flex-col items-center h-full px-6 pt-[10%]">
      <div className="w-full max-w-[580px] flex flex-col items-center">
        {/* Hero: Logo + Welcome + Project selector */}
        <span className="flex items-center justify-center size-10 mb-4" style={{ color: "var(--n12)" }}>
          <Sparkle size={36} />
        </span>
        <h1 className="text-[28px] font-semibold mb-2" style={{ color: "var(--n12)", letterSpacing: "-0.02em" }}>
          What&apos;s next, Arjun?
        </h1>
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-1 text-[14px] transition-colors cursor-pointer"
            style={{ color: "var(--n8)" }}
            onClick={() => setProjectOpen(!projectOpen)}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--n10)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--n8)" }}
          >
            {selectedProject ?? "Select a project"}
            <ChevronDown size={12} style={{ marginTop: 1 }} />
          </button>
          {projectOpen && (
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[220px] rounded-[8px] p-1 z-50"
              style={{ background: "var(--n2)", border: "1px solid rgba(var(--overlay), 0.08)", boxShadow: "var(--shadow-md)" }}
            >
              <button
                className="flex w-full items-center rounded-[6px] px-2 text-[12px] text-left transition-colors"
                style={{
                  padding: "6px 8px",
                  color: !selectedProject ? "var(--n12)" : "var(--n10)",
                  fontWeight: !selectedProject ? 500 : 400,
                  background: !selectedProject ? "rgba(var(--overlay), 0.08)" : "transparent",
                }}
                onClick={() => { setSelectedProject(null); setProjectOpen(false) }}
                onMouseEnter={e => { if (selectedProject) e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
                onMouseLeave={e => { if (selectedProject) e.currentTarget.style.background = "transparent" }}
              >
                All projects
              </button>
              {state.workspaceProjects.map(p => (
                <button
                  key={p.id}
                  className="flex w-full items-center rounded-[6px] px-2 text-[12px] text-left transition-colors"
                  style={{
                    padding: "6px 8px",
                    color: p.name === selectedProject ? "var(--n12)" : "var(--n10)",
                    fontWeight: p.name === selectedProject ? 500 : 400,
                    background: p.name === selectedProject ? "rgba(var(--overlay), 0.08)" : "transparent",
                  }}
                  onClick={() => { setSelectedProject(p.name); setProjectOpen(false) }}
                  onMouseEnter={e => { if (p.name !== selectedProject) e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
                  onMouseLeave={e => { if (p.name !== selectedProject) e.currentTarget.style.background = "transparent" }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Catch-up card stack */}
        <CatchUpCardStack onAction={handleSubmit} />

        {/* Input + chips area */}
        <div className="w-full flex flex-col gap-2 mt-16 relative">

          {/* Category panel (floats above input) */}
          {activeCategory && <div className="fixed inset-0 z-30" onClick={() => setActiveCategory(null)} />}
          {activeCategory && (() => {
            const cat = HOME_CATEGORIES.find(c => c.id === activeCategory)
            if (!cat) return null
            return (
              <div
                className="absolute left-0 right-0 bottom-full mb-2 rounded-[12px] overflow-hidden z-50"
                style={{
                  background: "var(--n2)",
                  border: "1px solid rgba(var(--overlay), 0.08)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                }}
              >
                <div className="flex items-center justify-between" style={{ padding: "10px 12px", borderBottom: "1px solid rgba(var(--overlay), 0.06)" }}>
                  <div className="flex items-center gap-2">
                    <CategoryChipIcon id={cat.id} size={14} />
                    <span className="text-[12px] font-medium" style={{ color: "var(--n9)" }}>{cat.label}</span>
                  </div>
                  <button
                    className="flex items-center justify-center size-5 rounded-[4px] transition-colors cursor-pointer"
                    style={{ color: "var(--n7)" }}
                    onClick={() => setActiveCategory(null)}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="flex flex-col">
                  {cat.suggestions.map((s, i) => (
                    <button
                      key={i}
                      className="w-full text-left cursor-pointer transition-colors"
                      style={{
                        padding: "10px 16px",
                        fontSize: 13,
                        color: "var(--n10)",
                        background: "transparent",
                        border: "none",
                        borderTop: i > 0 ? "1px solid rgba(var(--overlay), 0.04)" : "none",
                        fontFamily: "Inter, sans-serif",
                      }}
                      onClick={() => { handleSubmit(s); setActiveCategory(null) }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)"; e.currentTarget.style.color = "var(--n11)" }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--n10)" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-2 mb-2 relative z-40">
            {HOME_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className="home-chip-animate inline-flex items-center gap-1.5 text-[12px] rounded-[9999px] transition-colors cursor-pointer"
                style={{
                  padding: "6px 12px",
                  color: activeCategory === cat.id ? "var(--n11)" : "var(--n10)",
                  background: activeCategory === cat.id ? "rgba(var(--overlay), 0.06)" : "transparent",
                  border: "1px solid rgba(var(--overlay), 0.10)",
                  animationDelay: "400ms",
                }}
                onClick={() => setActiveCategory(prev => prev === cat.id ? null : cat.id)}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.06)"; e.currentTarget.style.color = "var(--n11)" }}
                onMouseLeave={e => { if (activeCategory !== cat.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--n10)" } }}
              >
                <CategoryChipIcon id={cat.id} size={12} />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div
            className="w-full overflow-hidden relative z-[1]"
            style={{
              background: "var(--n1)",
              border: "1px solid rgba(var(--overlay), 0.08)",
              borderRadius: 24,
            }}
          >
            <div className="flex items-center gap-[6px]" style={{ padding: "6px 6px 6px 16px" }}>
              <button
                className="flex items-center justify-center size-6 shrink-0 rounded-[4px] transition-colors"
                style={{ color: "var(--n7)" }}
                aria-label="Add"
                onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)" }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSubmit() }}
                placeholder="Message..."
                className="home-input flex-1 min-w-0 h-7 bg-transparent text-[13px] outline-none"
                style={{ color: "var(--n11)" }}
              />

              <button
                className="flex items-center gap-1 h-6 px-1 shrink-0 text-[12px] font-medium transition-colors"
                style={{ color: "var(--n10)", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--n10)" }}
              >
                claude-4.6-opus
                <ChevronDown size={10} />
              </button>

              <button
                className="flex items-center justify-center size-6 shrink-0 rounded-[4px] transition-colors"
                style={{ color: "var(--n7)" }}
                aria-label="Voice"
                onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)" }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0v-4A2.5 2.5 0 0 0 8 1" fill="currentColor"/>
                  <path d="M4 7a.75.75 0 0 0-1.5 0A5.5 5.5 0 0 0 7.25 12.45v1.8a.75.75 0 0 0 1.5 0v-1.8A5.5 5.5 0 0 0 13.5 7a.75.75 0 0 0-1.5 0 4 4 0 0 1-8 0" fill="currentColor"/>
                </svg>
              </button>

              <button
                className="flex items-center justify-center size-6 shrink-0 rounded-full transition-colors"
                style={{ background: "var(--n12)", color: "var(--n1)" }}
                aria-label="Send"
                onClick={() => handleSubmit()}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 13V3M8 3L4 7M8 3l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Type-ahead suggestions */}
            {filtered.length > 0 && (
              <div style={{ borderTop: "1px solid rgba(var(--overlay), 0.06)" }}>
                {filtered.map((suggestion, i) => {
                  const idx = suggestion.toLowerCase().indexOf(input.toLowerCase())
                  const before = suggestion.slice(0, idx)
                  const match = suggestion.slice(idx, idx + input.length)
                  const after = suggestion.slice(idx + input.length)
                  return (
                    <button
                      key={i}
                      className="w-full text-left cursor-pointer transition-colors"
                      style={{
                        padding: "10px 16px",
                        fontSize: 13,
                        color: "var(--n10)",
                        background: "transparent",
                        border: "none",
                        borderTop: i > 0 ? "1px solid rgba(var(--overlay), 0.04)" : "none",
                        fontFamily: "Inter, sans-serif",
                      }}
                      onClick={() => handleSubmit(suggestion)}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)"; e.currentTarget.style.color = "var(--n11)" }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--n10)" }}
                    >
                      <span>{before}</span>
                      <span>{match}</span>
                      <span style={{ fontWeight: 600 }}>{after}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Connector strip — drawer hanging below input */}
          {showConnectorAd && filtered.length === 0 && (
            <div
              className="w-full connector-strip-animate flex items-center justify-center gap-3 px-4 overflow-hidden"
              style={{
                background: "rgba(var(--overlay), 0.02)",
                borderRadius: "0 0 16px 16px",
                marginTop: -24,
                paddingTop: 32,
                paddingBottom: 14,
              }}
            >
              <span className="text-[11px] shrink-0" style={{ color: "var(--n7)" }}>Connect the apps you already use</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img src="/github-logo.png" alt="GitHub" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
                <img src="/gitlab-logo.png" alt="GitLab" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
                <img src="/dbt-logo.png" alt="dbt" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
                <img src="/huggingface-logo.png" alt="Hugging Face" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
                <img src="/powerbi-logo.png" alt="Power BI" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
                <img src="/gdrive-logo.png" alt="Google Drive" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
                <img src="/slack-logo.png" alt="Slack" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
                <img src="/pagerduty-logo.png" alt="PagerDuty" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
                <img src="/gsheets-logo.png" alt="Google Sheets" width={13} height={13} style={{ objectFit: "contain", borderRadius: 2 }} />
                <img src="/fivetran-logo.png" alt="Fivetran" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
                <img src="/atlassian-logo.png" alt="Atlassian" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
                <img src="/teams-logo.png" alt="Microsoft Teams" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
                <img src="/notion-logo.png" alt="Notion" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
                <img src="/linear-logo.png" alt="Linear" width={16} height={16} style={{ objectFit: "contain", borderRadius: 3 }} />
              </div>
              <button
                className="flex items-center justify-center size-4 shrink-0 transition-colors"
                style={{ color: "var(--n7)" }}
                onClick={() => setShowConnectorAd(false)}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          {/* Recent chats + Suggested — faded, expandable */}
          <RecentsSection dispatch={dispatch} handleSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}


/* ─── Recents + Suggested section ─────────────────────────────── */

const RECENT_ITEMS = [
  { label: "Weekly revenue dashboard", id: "pin-1", type: "dashboard" },
  { label: "Feature drift investigation", id: "ws-churn-c2", type: "chat" },
  { label: "Inventory anomaly check", id: "ws-supply-c1", type: "chat" },
  { label: "Cohort table refresh", id: "ws-churn-c3", type: "notebook" },
]

const SUGGESTED_ITEMS = [
  { label: "Build a churn prediction model", icon: "sparkle" },
  { label: "Analyze yesterday's pipeline logs", icon: "list" },
  { label: "Create a data quality dashboard", icon: "check" },
  { label: "Compare model versions", icon: "sparkle" },
]

function RecentItemIcon({ type }: { type: string }) {
  const s = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, style: { color: "var(--n7)", flexShrink: 0 } }
  switch (type) {
    case "dashboard":
      return <svg {...s}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
    case "pipeline":
      return <svg {...s}><rect width="8" height="8" x="3" y="3" rx="2" /><path d="M7 11v4a2 2 0 0 0 2 2h4" /><rect width="8" height="8" x="13" y="13" rx="2" /></svg>
    case "notebook":
      return <svg {...s}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
    default:
      return <svg {...s}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
  }
}

function RecentsSection({ dispatch, handleSubmit }: { dispatch: (action: any) => void; handleSubmit: (text: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (expanded) return
    const main = sectionRef.current?.closest("main")
    if (!main) return
    const onScroll = () => {
      if (main.scrollTop > 20) {
        setExpanded(true)
      }
    }
    main.addEventListener("scroll", onScroll, { passive: true })
    return () => main.removeEventListener("scroll", onScroll)
  }, [expanded])

  return (
    <div ref={sectionRef} className="w-full relative mt-24">
      <div className="relative">
        {/* Gradient fade overlay — fades items out toward the bottom */}
        {!expanded && (
          <div
            className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
            style={{ height: 80, background: "linear-gradient(to bottom, transparent 0%, var(--n1) 100%)" }}
          />
        )}

        <div
          style={{
            maxHeight: expanded ? 600 : 140,
            overflow: "hidden",
            transition: "max-height 400ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium mb-2" style={{ color: "var(--n7)" }}>Recents</span>
            {RECENT_ITEMS.map(item => (
              <button
                key={item.id}
                className="flex items-center gap-2 rounded-[6px] text-left text-[13px] transition-colors"
                style={{ padding: "6px 8px", color: "var(--n10)", background: "transparent" }}
                onClick={() => dispatch({ type: "SET_ACTIVE", itemId: item.id })}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)"; e.currentTarget.style.color = "var(--n11)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--n10)" }}
              >
                <RecentItemIcon type={item.type} />
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium mb-2" style={{ color: "var(--n7)" }}>Suggested</span>
            {SUGGESTED_ITEMS.map(item => (
              <button
                key={item.label}
                className="flex items-center gap-2 rounded-[6px] text-left text-[13px] transition-colors"
                style={{ padding: "6px 8px", color: "var(--n10)", background: "transparent" }}
                onClick={() => handleSubmit(item.label)}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)"; e.currentTarget.style.color = "var(--n11)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--n10)" }}
              >
                {item.icon === "sparkle" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n7)", flexShrink: 0 }}>
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  </svg>
                )}
                {item.icon === "list" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n7)", flexShrink: 0 }}>
                    <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
                    <path d="M15 3v4a2 2 0 0 0 2 2h4" />
                    <path d="M10 9H8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                  </svg>
                )}
                {item.icon === "check" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n7)", flexShrink: 0 }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                )}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* View more link */}
      {!expanded && (
        <div className="flex justify-center mt-3">
          <button
            className="text-[11px] transition-colors"
            style={{ color: "var(--n7)", background: "transparent", border: "none", cursor: "pointer" }}
            onClick={() => setExpanded(true)}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--n10)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)" }}
          >
            View more
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Inbox Page ──────────────────────────────────────────────── */

function ThreadAvatar({ avatar }: { avatar: string }) {
  const svgProps = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  const isInitials = avatar.length <= 3 && !["sparkle", "database", "activity", "download"].includes(avatar)

  return (
    <div
      className="shrink-0 inline-flex items-center justify-center"
      style={{ width: 24, height: 24, borderRadius: "9999px", background: "var(--n3)", color: "var(--n7)", fontSize: 10, fontWeight: 500 }}
    >
      {isInitials ? avatar : (
        avatar === "sparkle" ? (
          <svg {...svgProps}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" /></svg>
        ) : avatar === "database" ? (
          <svg {...svgProps}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" /></svg>
        ) : avatar === "activity" ? (
          <svg {...svgProps}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
        ) : avatar === "download" ? (
          <svg {...svgProps}><path d="M12 17V3" /><path d="m6 11 6 6 6-6" /><path d="M19 21H5" /></svg>
        ) : (
          <svg {...svgProps}><circle cx="12" cy="12" r="10" /></svg>
        )
      )}
    </div>
  )
}

function ThreadActionRow({ type }: { type: "decision" | "info" | "human" }) {
  const ghostBtn = "inline-flex items-center justify-center h-6 px-2 text-[11px] font-medium rounded-[4px]"
  const ghostStyle = { background: "transparent", color: "var(--n9)", border: "none", transition: "background var(--duration-instant), color var(--duration-instant)" }

  return (
    <div className="flex items-center justify-end gap-1">
      {type === "decision" && (
        <>
          <button
            className={ghostBtn}
            style={{ background: "var(--n12)", color: "var(--n1)", border: "none", transition: "opacity var(--duration-instant)" }}
          >
            Approve
          </button>
          <button
            className={ghostBtn}
            style={ghostStyle}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)"; e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--n9)"; e.currentTarget.style.background = "transparent" }}
          >
            Dismiss
          </button>
        </>
      )}
      {(type === "info" || type === "human") && (
        <button
          className={ghostBtn}
          style={ghostStyle}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)"; e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--n9)"; e.currentTarget.style.background = "transparent" }}
        >
          Reply
        </button>
      )}
      <button
        className={ghostBtn}
        style={ghostStyle}
        onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)"; e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
        onMouseLeave={e => { e.currentTarget.style.color = "var(--n9)"; e.currentTarget.style.background = "transparent" }}
      >
        Archive
      </button>
    </div>
  )
}

function InboxThreadCard({ thread }: { thread: InboxThread }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="cursor-pointer relative"
      style={{
        background: hovered ? "rgba(var(--overlay), 0.04)" : "var(--n2)",
        border: "1px solid rgba(var(--overlay), 0.08)",
        borderRadius: "var(--radius-lg)",
        padding: "12px 16px",
        transition: "background var(--duration-instant)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-3">
        <ThreadAvatar avatar={thread.avatar} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium truncate" style={{ color: "var(--n11)" }}>
              {thread.name}
            </span>
            <span className="shrink-0 text-[10px] ml-2" style={{ color: "var(--n7)" }}>
              {thread.time}
            </span>
          </div>
          <div className="text-[12px] leading-[18px] mt-0.5" style={{ color: "var(--n8)" }}>
            {thread.msg}
          </div>
        </div>
      </div>
      {hovered && (
        <div className="absolute right-3 bottom-2">
          <ThreadActionRow type={thread.type} />
        </div>
      )}
    </div>
  )
}

function InboxThreadGroupSection({ group }: { group: InboxThreadGroup }) {
  const [expanded, setExpanded] = useState(true)
  const count = group.threads.length

  return (
    <div className="mb-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        style={{ padding: "8px 16px", borderBottom: "1px solid rgba(var(--overlay), 0.08)" }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "transform var(--duration-fast)", transform: expanded ? "rotate(0deg)" : "rotate(-90deg)" }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          <span className="text-[12px] font-medium" style={{ color: "var(--n11)" }}>
            {group.project}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px]" style={{ color: "var(--n8)" }}>
            {count} {count === 1 ? "thread" : "threads"}
          </span>
          <button
            className="inline-flex items-center justify-center h-6 px-2 text-[11px] font-medium rounded-[4px]"
            style={{
              background: "transparent", color: "var(--n11)",
              border: "1px solid rgba(var(--overlay), 0.08)",
              transition: "background var(--duration-instant)",
            }}
            onClick={e => { e.stopPropagation() }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
          >
            Mark as Read
          </button>
        </div>
      </div>
      {expanded && (
        <div className="flex flex-col gap-2 pt-2">
          {group.threads.map(thread => (
            <InboxThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}
    </div>
  )
}

function InboxPage() {
  return (
    <div className="h-full overflow-y-auto" style={{ padding: "24px 32px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-[16px] font-medium"
          style={{ color: "var(--n12)", letterSpacing: "-0.005em", lineHeight: "24px" }}
        >
          Inbox
        </h1>
        <div className="flex items-center gap-1">
          <button
            className="inline-flex items-center justify-center h-6 px-2 text-[11px] font-medium rounded-[4px]"
            style={{
              background: "transparent", color: "var(--n11)",
              border: "1px solid rgba(var(--overlay), 0.08)",
              transition: "background var(--duration-instant)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
          >
            Filter
          </button>
          <button
            className="inline-flex items-center justify-center h-6 px-2 text-[11px] font-medium rounded-[4px]"
            style={{
              background: "transparent", color: "var(--n11)",
              border: "1px solid rgba(var(--overlay), 0.08)",
              transition: "background var(--duration-instant)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
          >
            Mark all read
          </button>
          <button
            className="inline-flex items-center justify-center rounded-[4px]"
            style={{
              width: 24, height: 24, background: "transparent", color: "var(--n8)", border: "none",
              transition: "color var(--duration-instant)",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--n8)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Thread groups */}
      {INBOX_THREAD_GROUPS.map(group => (
        <InboxThreadGroupSection key={group.project} group={group} />
      ))}
    </div>
  )
}

/* ─── Chat Thread View ────────────────────────────────────────── */

function ToolCard({ icon, label, detail }: { icon: string; label: string; detail: string }) {
  const svgProps = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  return (
    <div
      className="flex items-center gap-3"
      style={{ background: "var(--n2)", border: "1px solid rgba(var(--overlay), 0.08)", borderRadius: "var(--radius-lg)", padding: "8px 12px" }}
    >
      <span style={{ color: "var(--n7)" }}>
        {icon === "search" ? (
          <svg {...svgProps}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        ) : icon === "file" ? (
          <svg {...svgProps}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
        ) : icon === "play" ? (
          <svg {...svgProps}><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" /></svg>
        ) : (
          <svg {...svgProps}><circle cx="12" cy="12" r="10" /></svg>
        )}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-medium" style={{ color: "var(--n10)" }}>{label}</span>
        <span className="text-[11px] ml-2" style={{ color: "var(--n8)" }}>{detail}</span>
      </div>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--n7)" }}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    </div>
  )
}

function StandaloneNotebook() {
  return (
    <div className="flex h-full">
      <CanvasPanel open={true} onToggle={() => {}} initialTabs={[{ id: "eda", label: "Cohort EDA", icon: "book-open" }]} />
    </div>
  )
}

function PinnedItemView({ itemId }: { itemId: string }) {
  const item = DEFAULT_PINNED_ITEMS.find(p => p.id === itemId)
  if (!item) return <HomePage />

  if (item.type === "chat") {
    return <ChatThreadView />
  }

  if (item.type === "notebook") {
    return <StandaloneNotebook />
  }

  const typeLabels: Record<string, string> = {
    pipeline: "Pipeline",
    dashboard: "Dashboard",
    agent: "Agent",
    query: "Query",
    experiment: "Experiment",
    "genie-chat": "Genie Chat",
  }

  return (
    <div className="flex flex-col items-center justify-center h-full" style={{ color: "var(--n8)" }}>
      <div className="text-[13px] font-medium" style={{ color: "var(--n11)", marginBottom: 4 }}>{item.label}</div>
      <div className="text-[12px]">{typeLabels[item.type] || item.type}</div>
    </div>
  )
}

function ChatThreadView({ seedMessages, useAnimated }: { seedMessages?: { role: "agent" | "user"; text: string }[]; useAnimated?: boolean }) {
  const [input, setInput] = useState("")
  const isSeeded = seedMessages && seedMessages.length > 0

  if (useAnimated) {
    return <ThreadRenderer />
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between"
        style={{ padding: "12px 24px", borderBottom: "1px solid rgba(var(--overlay), 0.08)", background: "var(--n1)" }}
      >
        <span className="text-[12px] font-medium" style={{ color: "var(--n11)" }}>{isSeeded ? "Databricks Assistant" : "Drift Monitor"}</span>
        <span className="text-[11px]" style={{ color: "var(--n8)" }}>{isSeeded ? "Cloud Agent · claude-4.6-opus" : "Cloud Agent · gpt-4"}</span>
      </div>

      {/* Messages */}
      <div className="chat-scrollbar flex-1 overflow-y-auto" style={{ padding: "24px", paddingBottom: 80 }}>
        <div className="flex flex-col gap-4 max-w-[580px] mx-auto">
          {isSeeded ? (
            <>
              {seedMessages.map((msg, i) => (
                msg.role === "user" ? (
                  <div key={i} style={{ background: "var(--n3)", borderRadius: "var(--radius-lg)", padding: "12px 16px" }}>
                    <p className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>{msg.text}</p>
                  </div>
                ) : (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="shrink-0 inline-flex items-center justify-center"
                      style={{ width: 24, height: 24, borderRadius: "9999px", background: "var(--n3)", color: "var(--n7)" }}
                    >
                      <Sparkle size={14} />
                    </div>
                    <p className="text-[12px] leading-[20px] pt-0.5" style={{ color: "var(--n10)" }}>{msg.text}</p>
                  </div>
                )
              ))}
            </>
          ) : (
            <>
              {/* User message 1 */}
              <div style={{ background: "var(--n3)", borderRadius: "var(--radius-lg)", padding: "12px 16px" }}>
                <p className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                  Why is churn_v4 showing prediction drift? Can you check what changed?
                </p>
              </div>

              {/* Agent message 1 */}
              <div className="flex flex-col gap-2">
                <p className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                  Let me check the feature distributions and recent data changes.
                </p>
                <ToolCard icon="search" label="CompareDistributions" detail="churn_v4 · features · last 7d vs baseline" />
                <ToolCard icon="file" label="ReadFile" detail="/pipelines/feature-store/churn_features.yaml" />
              </div>

              {/* Agent message 2 */}
              <div className="flex flex-col gap-3">
                <p className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                  Found it. Three features shifted significantly since Monday's data refresh:
                </p>
                <ul className="flex flex-col gap-1 pl-4">
                  <li className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                    <code className="text-[11px]" style={{ color: "var(--n10)", fontFamily: "var(--font-mono)" }}>login_frequency_30d</code> — mean dropped 22% (EU region rollout changed session tracking)
                  </li>
                  <li className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                    <code className="text-[11px]" style={{ color: "var(--n10)", fontFamily: "var(--font-mono)" }}>cart_value_7d</code> — variance doubled (holiday promo started)
                  </li>
                  <li className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                    <code className="text-[11px]" style={{ color: "var(--n10)", fontFamily: "var(--font-mono)" }}>support_tickets_14d</code> — null rate jumped from 2% to 18% (upstream schema change)
                  </li>
                </ul>
                <p className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                  The PSI for the combined feature set is 0.23, which crosses your 0.15 threshold.
                </p>

                {/* Code block */}
                <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                  <div className="flex items-center justify-between" style={{ background: "var(--n3)", padding: "8px 12px" }}>
                    <span className="text-[11px]" style={{ color: "var(--n8)" }}>drift_summary.json</span>
                  </div>
                  <div style={{ background: "var(--n2)", padding: "12px", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: "18px", color: "var(--n11)" }}>
                    <div>{`{`}</div>
                    <div style={{ paddingLeft: 16 }}>{`"model": "churn_v4",`}</div>
                    <div style={{ paddingLeft: 16 }}>{`"psi_total": 0.23,`}</div>
                    <div style={{ paddingLeft: 16 }}>{`"threshold": 0.15,`}</div>
                    <div style={{ paddingLeft: 16 }}>{`"drifted_features": [`}</div>
                    <div style={{ paddingLeft: 32 }}>{`{ "name": "login_frequency_30d", "psi": 0.12 },`}</div>
                    <div style={{ paddingLeft: 32 }}>{`{ "name": "cart_value_7d", "psi": 0.07 },`}</div>
                    <div style={{ paddingLeft: 32 }}>{`{ "name": "support_tickets_14d", "psi": 0.04 }`}</div>
                    <div style={{ paddingLeft: 16 }}>{`]`}</div>
                    <div>{`}`}</div>
                  </div>
                </div>
              </div>

              {/* Agent message 3 */}
              <div className="flex flex-col gap-2">
                <p className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                  Two options to fix this:
                </p>
                <p className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                  1. <strong>Retrain on last 30 days</strong> — picks up the new distributions. Low risk.
                </p>
                <p className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                  2. <strong>Exclude the 3 drifted features</strong> and run with the remaining 12. Faster but loses signal.
                </p>
                <p className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                  I'd recommend option 1 — it handles future growth without losing signal. Want me to kick off a retraining run?
                </p>
              </div>

              {/* User message 2 */}
              <div style={{ background: "var(--n3)", borderRadius: "var(--radius-lg)", padding: "12px 16px" }}>
                <p className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                  Yes, go with option 1. Retrain on last 30 days.
                </p>
              </div>

              {/* Agent message 4 + tool */}
              <div className="flex flex-col gap-2">
                <ToolCard icon="play" label="TriggerRun" detail="churn_v4-retrain · 30d window" />
                <p className="text-[12px] leading-[18px]" style={{ color: "var(--n11)" }}>
                  Done. Retraining job submitted. You should see results in about 20 minutes. I'll notify you when it completes.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Input bar — floating above content */}
      <div className="absolute bottom-0 left-0 right-0" style={{ padding: "12px 24px 16px", background: "linear-gradient(to bottom, transparent, var(--n1) 40%)" }}>
        <div className="max-w-[580px] mx-auto">
        <div
          className="flex items-center gap-[6px] w-full rounded-[9999px]"
          style={{ background: "var(--n1)", border: "1px solid rgba(var(--overlay), 0.08)", padding: "6px 6px 6px 16px" }}
        >
          <button
            className="flex items-center justify-center size-6 shrink-0 rounded-[4px] transition-colors"
            style={{ color: "var(--n7)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Message..."
            className="flex-1 min-w-0 h-7 bg-transparent text-[13px] outline-none"
            style={{ color: "var(--n11)" }}
          />
          <button
            className="flex items-center gap-1 h-6 px-1 shrink-0 text-[12px] font-medium transition-colors"
            style={{ color: "var(--n10)", background: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--n10)" }}
          >
            claude-4.6-opus
            <ChevronDown size={10} />
          </button>
          <button
            className="flex items-center justify-center size-6 shrink-0 rounded-[4px] transition-colors"
            style={{ color: "var(--n7)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0v-4A2.5 2.5 0 0 0 8 1" fill="currentColor"/>
              <path d="M4 7a.75.75 0 0 0-1.5 0A5.5 5.5 0 0 0 7.25 12.45v1.8a.75.75 0 0 0 1.5 0v-1.8A5.5 5.5 0 0 0 13.5 7a.75.75 0 0 0-1.5 0 4 4 0 0 1-8 0" fill="currentColor"/>
            </svg>
          </button>
          <button
            className="flex items-center justify-center size-6 shrink-0 rounded-full transition-colors"
            style={{ background: "var(--n12)", color: "var(--n1)" }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 13V3M8 3L4 7M8 3l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}

function PrototypeSettingsFab({ framePadding, setFramePadding, enhancedNav, setEnhancedNav }: { framePadding: boolean; setFramePadding: (v: boolean) => void; enhancedNav: boolean; setEnhancedNav: (v: boolean) => void }) {
  const { state, dispatch } = useNavState()
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark")
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light")
  }

  return (
    <div className="fixed bottom-2 right-2 z-[300]">
      {open && (
        <div
          className="absolute bottom-12 right-0 w-[220px] rounded-[8px] p-4"
          style={{ background: "var(--n1)", border: "1px solid rgba(var(--overlay), 0.08)", boxShadow: "var(--shadow-lg)" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--n8)" }}>
            Prototype Settings
          </p>
          <div className="flex flex-col gap-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[12px]" style={{ color: "var(--n11)" }}>Frame padding</span>
              <button
                className="relative w-8 h-[18px] rounded-full transition-colors"
                style={{ background: framePadding ? "var(--n11)" : "var(--n5)" }}
                onClick={() => setFramePadding(!framePadding)}
              >
                <span
                  className="absolute top-[2px] size-[14px] rounded-full transition-[left] duration-150"
                  style={{ left: framePadding ? 15 : 2, background: framePadding ? "var(--n1)" : "var(--n8)" }}
                />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[12px]" style={{ color: "var(--n11)" }}>Databricks logo</span>
              <button
                className="relative w-8 h-[18px] rounded-full transition-colors"
                style={{ background: state.useDatabricksLogo ? "var(--n11)" : "var(--n5)" }}
                onClick={() => dispatch({ type: "TOGGLE_DATABRICKS_LOGO", show: !state.useDatabricksLogo })}
              >
                <span
                  className="absolute top-[2px] size-[14px] rounded-full transition-[left] duration-150"
                  style={{ left: state.useDatabricksLogo ? 15 : 2, background: state.useDatabricksLogo ? "var(--n1)" : "var(--n8)" }}
                />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[12px]" style={{ color: "var(--n11)" }}>Dark mode</span>
              <button
                className="relative w-8 h-[18px] rounded-full transition-colors"
                style={{ background: isDark ? "var(--n11)" : "var(--n5)" }}
                onClick={toggleTheme}
              >
                <span
                  className="absolute top-[2px] size-[14px] rounded-full transition-[left] duration-150"
                  style={{ left: isDark ? 15 : 2, background: isDark ? "var(--n1)" : "var(--n8)" }}
                />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[12px]" style={{ color: "var(--n11)" }}>Enhanced nav</span>
              <button
                className="relative w-8 h-[18px] rounded-full transition-colors"
                style={{ background: enhancedNav ? "var(--n11)" : "var(--n5)" }}
                onClick={() => setEnhancedNav(!enhancedNav)}
              >
                <span
                  className="absolute top-[2px] size-[14px] rounded-full transition-[left] duration-150"
                  style={{ left: enhancedNav ? 15 : 2, background: enhancedNav ? "var(--n1)" : "var(--n8)" }}
                />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[12px]" style={{ color: "var(--n11)" }}>Show recents</span>
              <button
                className="relative w-8 h-[18px] rounded-full transition-colors"
                style={{ background: state.showRecents ? "var(--n11)" : "var(--n5)" }}
                onClick={() => dispatch({ type: "TOGGLE_RECENTS", show: !state.showRecents })}
              >
                <span
                  className="absolute top-[2px] size-[14px] rounded-full transition-[left] duration-150"
                  style={{ left: state.showRecents ? 15 : 2, background: state.showRecents ? "var(--n1)" : "var(--n8)" }}
                />
              </button>
            </label>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center rounded-full transition-colors"
        style={{ width: 24, height: 24, background: "rgba(0,0,0,0.15)", border: "none", color: "#999", boxShadow: "none" }}
        title="Prototype settings"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M6.5 1.5L6.85 3.08C7.14 3.17 7.42 3.29 7.67 3.45L9.18 2.82L10.68 5.42L9.39 6.38C9.42 6.58 9.44 6.79 9.44 7C9.44 7.21 9.42 7.42 9.39 7.62L10.68 8.58L9.18 11.18L7.67 10.55C7.42 10.71 7.14 10.83 6.85 10.92L6.5 12.5H3.5L3.15 10.92C2.86 10.83 2.58 10.71 2.33 10.55L0.82 11.18L-0.68 8.58L0.61 7.62C0.58 7.42 0.56 7.21 0.56 7C0.56 6.79 0.58 6.58 0.61 6.38L-0.68 5.42L0.82 2.82L2.33 3.45C2.58 3.29 2.86 3.17 3.15 3.08L3.5 1.5H6.5ZM5 5C3.9 5 3 5.9 3 7C3 8.1 3.9 9 5 9C6.1 9 7 8.1 7 7C7 5.9 6.1 5 5 5Z" transform="translate(3, 1)" fill="currentColor"/>
        </svg>
      </button>
    </div>
  )
}

function buildHomeThreadMessages(userInput: string): { role: "agent" | "user"; text: string }[] {
  const agentCatchUp = "Since you've been away, your admin enabled a Salesforce connector and the churn model flagged drift on the `region` feature. The Q2 supply chain pipeline also finished with 2 schema warnings."
  const agentReply = userInput.toLowerCase().includes("salesforce")
    ? "Great choice. The Salesforce connector is ready to go — I can pull in account data, opportunity history, and support tickets. Want me to set up a sync to your lakehouse, or would you prefer to explore the schema first?"
    : userInput.toLowerCase().includes("drift")
    ? "On it. Let me pull up the drift details for the churn model. The `region` feature shifted significantly — PSI of 0.12 against a 0.1 threshold. I've staged a retraining run if you'd like to approve it."
    : userInput.toLowerCase().includes("priya")
    ? "Priya asked whether to proceed with the retraining job on churn_v4. She's waiting on your go-ahead. Want me to approve it on your behalf, or would you like to reply directly?"
    : userInput.toLowerCase().includes("new project")
    ? "Let's get started. What kind of project are you thinking — data analysis, ML model, pipeline, or something else? I can scaffold the workspace and pull in relevant data sources."
    : "Got it. Let me look into that for you. Give me a moment to gather the relevant context and I'll have an update shortly."

  return [
    { role: "agent", text: agentCatchUp },
    { role: "user", text: userInput },
    { role: "agent", text: agentReply },
  ]
}

/* ─── Command Palette ──────────────────────────────────────── */

const CMD_ITEMS = [
  { icon: "search", label: "Search notebooks and queries...", hint: "" },
  { icon: "file", label: "Cohort EDA.py", hint: "Workspace" },
  { icon: "play", label: "cohort-refresh-weekly", hint: "Jobs" },
  { icon: "table", label: "main.churn_analytics.churn_training", hint: "Catalog" },
  { icon: "git", label: "feature_pipeline", hint: "Workspace" },
  { icon: "chart", label: "weekly_report.lvdash.json", hint: "Dashboard" },
  { icon: "message", label: "Feature drift investigation", hint: "Chat" },
  { icon: "spark", label: "Ask AI anything...", hint: "⌘ + I" },
]

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery("")
      setActiveIdx(0)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowDown") setActiveIdx(i => Math.min(i + 1, CMD_ITEMS.length - 1))
      if (e.key === "ArrowUp") setActiveIdx(i => Math.max(i - 1, 0))
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 flex items-start justify-center"
      style={{ zIndex: 999, paddingTop: "18vh" }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "cmd-backdrop-in 0.2s ease-out forwards",
        }}
      />

      {/* Panel */}
      <div
        className="relative flex flex-col"
        style={{
          width: 560,
          maxHeight: "60vh",
          background: "var(--n1)",
          borderRadius: "var(--radius-xl, 16px)",
          border: "1px solid rgba(var(--overlay), 0.10)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(var(--overlay), 0.04)",
          overflow: "hidden",
          animation: "cmd-panel-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input area */}
        <div className="flex items-center gap-3" style={{ padding: "16px 20px", borderBottom: "1px solid rgba(var(--overlay), 0.08)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n8)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search or jump to..."
            className="flex-1 min-w-0 bg-transparent outline-none"
            style={{ fontSize: 15, color: "var(--n12)", fontWeight: 400 }}
          />
          <kbd
            className="shrink-0 flex items-center justify-center"
            style={{
              padding: "2px 6px",
              fontSize: 11,
              color: "var(--n7)",
              background: "rgba(var(--overlay), 0.06)",
              borderRadius: 4,
              border: "1px solid rgba(var(--overlay), 0.08)",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "8px" }}>
          {CMD_ITEMS.filter(item => !query || item.label.toLowerCase().includes(query.toLowerCase())).map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-[8px] cursor-pointer"
              style={{
                padding: "10px 12px",
                background: i === activeIdx ? "rgba(var(--overlay), 0.06)" : "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <CmdIcon name={item.icon} active={i === activeIdx} />
              <span className="flex-1 min-w-0 truncate text-[13px]" style={{ color: i === activeIdx ? "var(--n12)" : "var(--n10)", fontWeight: i === activeIdx ? 500 : 400 }}>
                {item.label}
              </span>
              {item.hint && (
                <span className="shrink-0 text-[11px]" style={{ color: "var(--n7)" }}>{item.hint}</span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between" style={{ padding: "10px 20px", borderTop: "1px solid rgba(var(--overlay), 0.06)" }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--n7)" }}>
              <kbd style={{ padding: "1px 4px", fontSize: 10, background: "rgba(var(--overlay), 0.06)", borderRadius: 3, border: "1px solid rgba(var(--overlay), 0.08)" }}>↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--n7)" }}>
              <kbd style={{ padding: "1px 4px", fontSize: 10, background: "rgba(var(--overlay), 0.06)", borderRadius: 3, border: "1px solid rgba(var(--overlay), 0.08)" }}>↵</kbd>
              Open
            </span>
          </div>
          <span className="text-[11px]" style={{ color: "var(--n7)" }}>Databricks</span>
        </div>
      </div>
    </div>
  )
}

function CmdIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "var(--n11)" : "var(--n8)"
  const s = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, style: { color, flexShrink: 0 } }
  switch (name) {
    case "search": return <svg {...s}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    case "file": return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></svg>
    case "play": return <svg {...s}><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" /></svg>
    case "table": return <svg {...s}><path d="M12 3v18" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /></svg>
    case "git": return <svg {...s}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
    case "chart": return <svg {...s}><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
    case "message": return <svg {...s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    case "spark": return <svg {...s}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /></svg>
    default: return <svg {...s}><circle cx="12" cy="12" r="10" /></svg>
  }
}

function PageContent() {
  const { state } = useNavState()
  const [framePadding, setFramePadding] = useState(false)
  const [enhancedNav, setEnhancedNav] = useState(true)
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen(v => !v)
      }
    }
    const handleOpen = () => setCmdOpen(true)
    document.addEventListener("keydown", handleKey)
    document.addEventListener("open-command-palette", handleOpen)
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.removeEventListener("open-command-palette", handleOpen)
    }
  }, [])

  return (
    <div className={`h-screen overflow-hidden ${framePadding ? "p-[40px]" : ""}`} style={{ background: framePadding ? "#f3f3f3" : "transparent" }}>
      <div
        className={`relative flex h-full overflow-hidden rounded-lg mx-auto`}
        style={{
          background: "var(--n2)",
          border: framePadding ? "1px solid rgba(var(--overlay), 0.04)" : "none",
          fontFamily: "var(--font-sans)",
          maxWidth: 1600,
        }}
      >
        <SidebarNav enhanced={enhancedNav} />
        <main
          className="flex-1 min-w-0 min-h-0 overflow-y-scroll scrollbar-thin rounded-lg m-2 ml-0"
          style={{ background: "var(--n1)", border: "1px solid rgba(var(--overlay), 0.04)" }}
        >
          {state.activeItem === "library" ? <BrowsePage /> : state.activeItem === "monitor" ? <MonitorPage /> : state.activeItem === "inbox" ? <InboxPage /> : state.activeItem === "ws-churn-c2" ? <ChatThreadView useAnimated /> : state.activeItem === "ws-churn-c3" ? <ChatWithCanvas /> : state.activeItem.startsWith("ws-") && state.activeItem.includes("-c") ? <ChatThreadView /> : state.activeItem.startsWith("pin-") ? <PinnedItemView itemId={state.activeItem} /> : state.homeThreadActive ? <ChatThreadView seedMessages={buildHomeThreadMessages(state.homeThreadInput)} /> : <HomePage />}
        </main>
        <PrototypeSettingsFab framePadding={framePadding} setFramePadding={setFramePadding} enhancedNav={enhancedNav} setEnhancedNav={setEnhancedNav} />
      </div>

      {/* Command Palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  )
}

export default function Home() {
  return (
    <NavStateProvider>
      <PageContent />
    </NavStateProvider>
  )
}
