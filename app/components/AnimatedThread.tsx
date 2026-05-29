"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"

/* ─── Script types ──────────────────────────────────────────── */

type ScriptStep =
  | { type: "action-buttons"; options: string[] }
  | { type: "user-message"; text: string }
  | { type: "thinking"; duration: number }
  | { type: "agent-stream"; text: string }
  | { type: "plan-start"; steps: string[] }
  | { type: "plan-advance" }
  | { type: "tool-call"; icon: string; label: string; detail: string; duration: number }
  | { type: "mcp-card"; server: string; tool: string; icon: string; content: { label: string; value: string }[]; preview?: string }
  | { type: "plan-collapse" }
  | { type: "pause"; duration: number }
  | { type: "suggestion-chips"; chips: string[] }

/* ─── Script data ───────────────────────────────────────────── */

const PHASE_1: ScriptStep[] = [
  { type: "thinking", duration: 1500 },
  { type: "agent-stream", text: "I can kick off a retrain using the last 30 days of data. This will take about 20 minutes on the ml-retrain cluster and cost ~$2.80. Want me to go ahead?" },
  { type: "action-buttons", options: ["Yes, start the retrain", "Show me the config first"] },
  { type: "thinking", duration: 1000 },
  // Plan appears with step 1 running
  { type: "plan-start", steps: ["Check team context", "Submit retraining job", "Confirm submission"] },
  { type: "pause", duration: 600 },
  // Slack tool call starts spinning, then completes
  { type: "tool-call", icon: "slack", label: "channels.search", detail: "#ml-ops · drift discussion", duration: 1200 },
  // Only after tool-call finishes → show MCP result
  { type: "mcp-card", server: "Slack", tool: "channels.search", icon: "slack", preview: "#ml-ops · 1 result", content: [
    { label: "Channel", value: "#ml-ops" },
    { label: "From", value: "Priya Sharma" },
    { label: "Message", value: "Heads up — EU session tracking rollout changed login_frequency_30d on Monday. Expect downstream drift." },
  ]},
  { type: "pause", duration: 500 },
  // Plan step 1 done → step 2 running
  { type: "plan-advance" },
  { type: "pause", duration: 400 },
  // Jobs tool call starts spinning, then completes
  { type: "tool-call", icon: "play", label: "runs.submit", detail: "churn_v4-retrain · 30d window", duration: 1500 },
  // Only after tool-call finishes → show MCP result
  { type: "mcp-card", server: "Jobs", tool: "runs.submit", icon: "play", preview: "run-7f2a submitted", content: [
    { label: "Run ID", value: "run-7f2a9c01" },
    { label: "Status", value: "Submitted" },
    { label: "Cluster", value: "ml-retrain-4x" },
    { label: "ETA", value: "~20 min" },
  ]},
  { type: "pause", duration: 500 },
  // Plan step 2 done → step 3 running
  { type: "plan-advance" },
  { type: "pause", duration: 600 },
  // Plan step 3 done, then collapse
  { type: "plan-advance" },
  { type: "pause", duration: 400 },
  { type: "plan-collapse" },
  { type: "pause", duration: 300 },
  { type: "agent-stream", text: "Done. I confirmed with #ml-ops that Priya's EU tracking change is the root cause. Retrain is running — I'll ping you when it lands." },
]

const PHASE_2: ScriptStep[] = [
  { type: "pause", duration: 1500 },
  { type: "agent-stream", text: "Update: retrain completed. New model PSI dropped from 0.23 to 0.04 — well under your 0.15 threshold. The new model scores are stable across all three features. Want me to promote this to production?" },
  { type: "action-buttons", options: ["Promote to production", "Show me the comparison first"] },
  { type: "thinking", duration: 1000 },
  { type: "tool-call", icon: "upload", label: "models.deploy", detail: "churn_v4 · production", duration: 1200 },
  { type: "agent-stream", text: "Done — churn_v4 is now serving the retrained weights in production. Prediction drift resolved." },
]

const PHASE_3: ScriptStep[] = [
  { type: "pause", duration: 1500 },
  { type: "agent-stream", text: "One more thing — this drift went unnoticed for 3 days. I'd recommend adding a weekly drift monitor so it gets flagged earlier next time. Should I set that up?" },
  { type: "action-buttons", options: ["Yes, schedule weekly check", "Not now"] },
  { type: "tool-call", icon: "clock", label: "monitors.create", detail: "churn_v4 · weekly PSI check", duration: 1000 },
  { type: "agent-stream", text: "Scheduled. I'll run a drift check every Monday at 6am and flag you if PSI exceeds 0.10. You're all set." },
  { type: "suggestion-chips", chips: ["Show me the cost breakdown", "What caused the spike?", "View monitor config"] },
]

const FULL_SCRIPT: ScriptStep[] = [...PHASE_1, ...PHASE_2, ...PHASE_3]

/* ─── Rendered message types ────────────────────────────────── */

type RenderedItem =
  | { kind: "user"; text: string }
  | { kind: "agent"; text: string; streaming?: boolean }
  | { kind: "thinking"; done: boolean }
  | { kind: "plan"; steps: { label: string; state: "pending" | "running" | "done" }[]; collapsed: boolean }
  | { kind: "tool-call"; icon: string; label: string; detail: string; state: "running" | "done"; duration?: string }
  | { kind: "mcp-card"; server: string; tool: string; icon: string; preview: string; content: { label: string; value: string }[] }
  | { kind: "action-buttons"; options: string[]; disabled: boolean }
  | { kind: "suggestion-chips"; chips: string[] }

/* ─── Component ─────────────────────────────────────────────── */

type PlanState = { steps: { label: string; state: "pending" | "running" | "done" }[]; visible: boolean } | null

function useAnimatedThread() {
  const [items, setItems] = useState<RenderedItem[]>([
    { kind: "action-buttons", options: ["Retrain on last 30 days", "Exclude drifted features"], disabled: false }
  ])
  const [scriptIndex, setScriptIndex] = useState(-1)
  const [started, setStarted] = useState(false)
  const [waitingForClick, setWaitingForClick] = useState(true)
  const [streamingText, setStreamingText] = useState("")
  const [streamTarget, setStreamTarget] = useState("")
  const [activePlan, setActivePlan] = useState<PlanState>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const planRef = useRef<{ steps: { label: string; state: "pending" | "running" | "done" }[] }>({ steps: [] })

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  const scrollUserToTop = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          const container = scrollRef.current
          const userEls = container.querySelectorAll("[data-user-msg]")
          const el = userEls[userEls.length - 1]
          if (el) {
            const containerRect = container.getBoundingClientRect()
            const elRect = el.getBoundingClientRect()
            const scrollOffset = elRect.top - containerRect.top + container.scrollTop - 12
            container.scrollTo({ top: scrollOffset, behavior: "instant" as ScrollBehavior })
          }
        }
      })
    })
  }, [])

  const advanceScript = useCallback(() => {
    setScriptIndex(prev => prev + 1)
  }, [])

  const startAnimation = useCallback(() => {
    if (!started) {
      setStarted(true)
      setScriptIndex(0)
    }
  }, [started])

  // Process current script step
  useEffect(() => {
    if (scriptIndex < 0 || scriptIndex >= FULL_SCRIPT.length) return
    const step = FULL_SCRIPT[scriptIndex]

    switch (step.type) {
      case "action-buttons": {
        setItems(prev => [...prev, { kind: "action-buttons", options: step.options, disabled: false }])
        setWaitingForClick(true)
        setTimeout(scrollToBottom, 50)
        break
      }

      case "user-message": {
        setItems(prev => {
          const updated = [...prev]
          const lastBtnIdx = updated.findLastIndex(i => i.kind === "action-buttons")
          if (lastBtnIdx >= 0) updated[lastBtnIdx] = { ...updated[lastBtnIdx], disabled: true } as any
          return [...updated, { kind: "user", text: step.text }]
        })
        setTimeout(scrollToBottom, 50)
        timerRef.current = setTimeout(advanceScript, 400)
        break
      }

      case "thinking": {
        setItems(prev => [...prev, { kind: "thinking", done: false }])
        setTimeout(scrollToBottom, 50)
        timerRef.current = setTimeout(() => {
          setItems(prev => {
            const updated = [...prev]
            const idx = updated.findLastIndex(i => i.kind === "thinking" && !i.done)
            if (idx >= 0) updated[idx] = { kind: "thinking", done: true }
            return updated
          })
          advanceScript()
        }, step.duration)
        break
      }

      case "agent-stream": {
        setStreamTarget(step.text)
        setStreamingText("")
        setItems(prev => [...prev, { kind: "agent", text: "", streaming: true }])
        setTimeout(scrollToBottom, 50)
        break
      }

      case "plan-start": {
        const planSteps = step.steps.map((s, i) => ({ label: s, state: (i === 0 ? "running" : "pending") as "pending" | "running" | "done" }))
        planRef.current = { steps: planSteps }
        setActivePlan({ steps: planSteps, visible: true })
        timerRef.current = setTimeout(advanceScript, 600)
        break
      }

      case "plan-advance": {
        const plan = planRef.current
        const runningIdx = plan.steps.findIndex(s => s.state === "running")
        if (runningIdx >= 0) {
          plan.steps[runningIdx].state = "done"
          if (runningIdx + 1 < plan.steps.length) {
            plan.steps[runningIdx + 1].state = "running"
          }
        }
        setActivePlan({ steps: [...plan.steps.map(s => ({ ...s }))], visible: true })
        timerRef.current = setTimeout(advanceScript, 300)
        break
      }

      case "plan-collapse": {
        setActivePlan(null)
        timerRef.current = setTimeout(advanceScript, 300)
        break
      }

      case "tool-call": {
        setItems(prev => [...prev, { kind: "tool-call", icon: step.icon, label: step.label, detail: step.detail, state: "running" }])
        setTimeout(scrollToBottom, 50)
        timerRef.current = setTimeout(() => {
          setItems(prev => {
            const updated = [...prev]
            const idx = updated.findLastIndex(i => i.kind === "tool-call" && (i as any).state === "running")
            if (idx >= 0) updated[idx] = { ...updated[idx], state: "done", duration: (step.duration / 1000).toFixed(1) + "s" } as any
            return updated
          })
          advanceScript()
        }, step.duration)
        break
      }

      case "mcp-card": {
        setItems(prev => [...prev, { kind: "mcp-card", server: step.server, tool: step.tool, icon: step.icon, preview: step.preview || "", content: step.content }])
        setTimeout(scrollToBottom, 50)
        timerRef.current = setTimeout(advanceScript, 800)
        break
      }

      case "pause": {
        timerRef.current = setTimeout(advanceScript, step.duration)
        break
      }

      case "suggestion-chips": {
        setItems(prev => [...prev, { kind: "suggestion-chips", chips: step.chips }])
        setTimeout(scrollToBottom, 50)
        break
      }
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [scriptIndex, advanceScript, scrollToBottom])

  // Streaming text effect
  useEffect(() => {
    if (!streamTarget) return
    let i = 0
    const words = streamTarget.split(" ")
    const interval = setInterval(() => {
      i++
      const partial = words.slice(0, i).join(" ")
      setStreamingText(partial)
      setItems(prev => {
        const updated = [...prev]
        const idx = updated.findLastIndex(item => item.kind === "agent" && (item as any).streaming)
        if (idx >= 0) updated[idx] = { kind: "agent", text: partial, streaming: true }
        return updated
      })
      scrollToBottom()
      if (i >= words.length) {
        clearInterval(interval)
        setItems(prev => {
          const updated = [...prev]
          const idx = updated.findLastIndex(item => item.kind === "agent" && (item as any).streaming)
          if (idx >= 0) updated[idx] = { kind: "agent", text: streamTarget, streaming: false }
          return updated
        })
        setStreamTarget("")
        setStreamingText("")
        setTimeout(advanceScript, 300)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [streamTarget, advanceScript, scrollToBottom])

  const [transitioning, setTransitioning] = useState(false)

  const handleButtonClick = (option: string) => {
    if (!waitingForClick) return
    setWaitingForClick(false)
    const firstTime = !started
    if (firstTime) setStarted(true)

    // Animate existing content up and fade out
    setTransitioning(true)
    setTimeout(() => {
      // After the slide-up completes, reset to fresh scene
      setItems([{ kind: "user", text: option }])
      setTransitioning(false)
      if (scrollRef.current) scrollRef.current.scrollTop = 0
      if (firstTime) {
        setTimeout(() => setScriptIndex(0), 300)
      } else {
        setTimeout(advanceScript, 300)
      }
    }, 250)
  }

  return { items, scrollRef, handleButtonClick, waitingForClick, scriptIndex, started, startAnimation, transitioning, activePlan }
}

/* ─── Presentational components ─────────────────────────────── */

export function ThreadRenderer({ onAction }: { onAction?: (text: string) => void }) {
  const { items, scrollRef, handleButtonClick, waitingForClick, started, startAnimation, transitioning, activePlan } = useAnimatedThread()

  return (
    <div className="relative flex flex-col h-full">
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between"
        style={{ padding: "12px 24px", borderBottom: "1px solid rgba(var(--overlay), 0.08)", background: "var(--n1)" }}
      >
        <span className="text-[12px] font-medium" style={{ color: "var(--n11)" }}>Feature drift investigation</span>
        <span className="text-[11px]" style={{ color: "var(--n8)" }}>Cloud Agent · claude-4.6-opus</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="chat-scrollbar flex-1 overflow-y-auto" style={{ padding: "24px", paddingBottom: 160 }}>
        <div
          className="flex flex-col gap-4 max-w-[580px] mx-auto"
          style={{
            transition: transitioning ? "transform 0.25s ease-in, opacity 0.2s ease-in" : "none",
            transform: transitioning ? "translateY(-40px)" : "translateY(0)",
            opacity: transitioning ? 0 : 1,
          }}
        >
          {/* Static history — collapses once animation starts */}
          {!started && <StaticHistory />}

          {/* Dynamic animated items */}
          {items.map((item, i) => (
            <RenderItem key={i} item={item} onButtonClick={handleButtonClick} />
          ))}
        </div>
      </div>

      {/* Plan + Input bar pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{ padding: "0 24px 16px", background: "linear-gradient(to bottom, transparent, var(--n1) 30%)" }}>
        <div className="max-w-[580px] mx-auto">
          {/* Active plan floating above input */}
          {activePlan && (
            <div style={{ marginBottom: 8 }}>
              <FloatingPlan steps={activePlan.steps} />
            </div>
          )}

          <div
            className="flex items-center gap-[6px] w-full rounded-[9999px]"
            style={{ background: "var(--n1)", border: "1px solid rgba(var(--overlay), 0.08)", padding: "6px 6px 6px 16px" }}
          >
          <button className="flex items-center justify-center size-6 shrink-0 rounded-[4px]" style={{ color: "var(--n7)" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          <input
            type="text"
            readOnly
            placeholder="Message..."
            className="flex-1 min-w-0 h-7 bg-transparent text-[13px] outline-none"
            style={{ color: "var(--n11)" }}
          />
          <span className="text-[12px] font-medium" style={{ color: "var(--n10)" }}>
            claude-4.6-opus
          </span>
          <button className="flex items-center justify-center size-6 shrink-0 rounded-[4px]" style={{ color: "var(--n7)" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0v-4A2.5 2.5 0 0 0 8 1" fill="currentColor"/>
              <path d="M4 7a.75.75 0 0 0-1.5 0A5.5 5.5 0 0 0 7.25 12.45v1.8a.75.75 0 0 0 1.5 0v-1.8A5.5 5.5 0 0 0 13.5 7a.75.75 0 0 0-1.5 0 4 4 0 0 1-8 0" fill="currentColor"/>
            </svg>
          </button>
          <button className="flex items-center justify-center size-6 shrink-0 rounded-full" style={{ background: "var(--n12)", color: "var(--n1)" }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 13V3M8 3L4 7M8 3l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Static history (pre-existing conversation) ────────────── */

function StaticHistory() {
  return (
    <>
      {/* User message */}
      <div style={{ background: "var(--n3)", borderRadius: "var(--radius-lg)", padding: "12px 16px" }}>
        <p className="text-[13px] leading-[20px]" style={{ color: "var(--n11)" }}>
          Why is churn_v4 showing prediction drift? Can you check what changed?
        </p>
      </div>

      {/* Agent + tool calls */}
      <div className="flex flex-col gap-2">
        <p className="text-[13px] leading-[20px]" style={{ color: "var(--n10)" }}>
          Let me check the feature distributions and recent data changes.
        </p>
        <ToolCallRow icon="search" label="CompareDistributions" detail="churn_v4 · features · last 7d vs baseline" state="done" duration="0.4s" />
        <ToolCallRow icon="file" label="ReadFile" detail="/pipelines/feature-store/churn_features.yaml" state="done" duration="0.1s" />
      </div>

      {/* Agent findings */}
      <div className="flex flex-col gap-3">
        <p className="text-[13px] leading-[20px]" style={{ color: "var(--n11)" }}>
          Found it. Three features shifted significantly since Monday&apos;s data refresh:
        </p>
        <ul className="flex flex-col gap-1 pl-4">
          <li className="text-[13px] leading-[20px]" style={{ color: "var(--n11)" }}>
            <code className="text-[11px]" style={{ color: "var(--n10)", fontFamily: "var(--font-mono)" }}>login_frequency_30d</code> — mean dropped 22% (EU region rollout changed session tracking)
          </li>
          <li className="text-[13px] leading-[20px]" style={{ color: "var(--n11)" }}>
            <code className="text-[11px]" style={{ color: "var(--n10)", fontFamily: "var(--font-mono)" }}>cart_value_7d</code> — variance doubled (holiday promo started)
          </li>
          <li className="text-[13px] leading-[20px]" style={{ color: "var(--n11)" }}>
            <code className="text-[11px]" style={{ color: "var(--n10)", fontFamily: "var(--font-mono)" }}>support_tickets_14d</code> — null rate jumped from 2% to 18% (upstream schema change)
          </li>
        </ul>
        <p className="text-[13px] leading-[20px]" style={{ color: "var(--n11)" }}>
          The PSI for the combined feature set is 0.23, which crosses your 0.15 threshold.
        </p>
      </div>

      {/* Agent options */}
      <div className="flex flex-col gap-2">
        <p className="text-[13px] leading-[20px]" style={{ color: "var(--n11)" }}>
          Two options to fix this:
        </p>
        <p className="text-[13px] leading-[20px]" style={{ color: "var(--n11)" }}>
          1. <strong>Retrain on last 30 days</strong> — picks up the new distributions. Low risk, ~$2.80/run.
        </p>
        <p className="text-[13px] leading-[20px]" style={{ color: "var(--n11)" }}>
          2. <strong>Exclude the 3 drifted features</strong> and run with the remaining 12. Faster but loses signal.
        </p>
        <p className="text-[13px] leading-[20px]" style={{ color: "var(--n10)" }}>
          I&apos;d recommend option 1 — it handles future growth without losing signal. Which would you prefer?
        </p>
      </div>
    </>
  )
}

/* ─── Render a single item ──────────────────────────────────── */

function RenderItem({ item, onButtonClick }: { item: RenderedItem; onButtonClick: (opt: string) => void }) {
  switch (item.kind) {
    case "user":
      return (
        <div data-user-msg style={{ background: "var(--n3)", borderRadius: "var(--radius-lg)", padding: "12px 16px" }}>
          <p className="text-[13px] leading-[20px]" style={{ color: "var(--n11)" }}>{item.text}</p>
        </div>
      )

    case "agent":
      return (
        <div className="flex flex-col gap-1">
          <p className="text-[13px] leading-[20px]" style={{ color: "var(--n11)" }}>
            {item.text}
            {item.streaming && <span className="inline-block w-[2px] h-[14px] ml-0.5 align-middle" style={{ background: "var(--n8)", animation: "blink 1s step-end infinite" }} />}
          </p>
        </div>
      )

    case "thinking":
      return !item.done ? (
        <div className="flex items-center gap-2" style={{ padding: "6px 8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n8)" }}>
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
            <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
            <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
            <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
            <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
            <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
            <path d="M6 18a4 4 0 0 1-1.967-.516" />
            <path d="M19.967 17.484A4 4 0 0 1 18 18" />
          </svg>
          <span className="text-[11px] chat-thinking-shimmer" style={{ color: "var(--n8)" }}>Thinking…</span>
        </div>
      ) : null

    case "plan":
      return <PlanCard steps={item.steps} collapsed={item.collapsed} />

    case "tool-call":
      return <ToolCallRow icon={item.icon} label={item.label} detail={item.detail} state={item.state} duration={item.duration} />

    case "mcp-card":
      return <McpCard server={item.server} tool={item.tool} icon={item.icon} preview={item.preview} content={item.content} />

    case "action-buttons":
      return <ActionCard options={item.options} disabled={item.disabled} onSelect={onButtonClick} />

    case "suggestion-chips":
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {item.chips.map(chip => (
            <button
              key={chip}
              className="text-[12px] rounded-[9999px] transition-colors cursor-pointer"
              style={{ padding: "6px 14px", color: "var(--n10)", background: "transparent", border: "1px solid rgba(var(--overlay), 0.10)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.06)"; e.currentTarget.style.color = "var(--n11)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--n10)" }}
            >
              {chip}
            </button>
          ))}
        </div>
      )

    default:
      return null
  }
}

/* ─── Action chips (pill buttons) ───────────────────────────── */

function ActionCard({ options, disabled, onSelect }: { options: string[]; disabled: boolean; onSelect: (opt: string) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap" style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      {options.map(opt => (
        <button
          key={opt}
          className="text-[12px] rounded-[9999px] transition-all cursor-pointer"
          style={{
            padding: "6px 14px",
            color: "var(--n10)",
            background: "transparent",
            border: "1px solid rgba(var(--overlay), 0.10)",
          }}
          onClick={() => onSelect(opt)}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.06)"; e.currentTarget.style.color = "var(--n11)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--n10)" }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

/* ─── Floating plan (pinned above input) ────────────────────── */

function FloatingPlan({ steps }: { steps: { label: string; state: string }[] }) {
  const doneCount = steps.filter(s => s.state === "done").length
  const currentStep = steps.find(s => s.state === "running")

  return (
    <div style={{ border: "1px solid rgba(var(--overlay), 0.08)", borderRadius: "var(--radius-md)", background: "var(--n1)", padding: "8px 12px" }}>
      {/* Header row with progress */}
      <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n9)" }}>
          <path d="M11 18H3" /><path d="m15 18 2 2 4-4" /><path d="M16 12H3" /><path d="M16 6H3" />
        </svg>
        <span className="text-[11px] font-medium" style={{ color: "var(--n10)" }}>Plan</span>
        <span className="text-[10px] ml-auto" style={{ color: "var(--n7)", fontVariantNumeric: "tabular-nums" }}>{doneCount}/{steps.length}</span>
      </div>

      {/* Step list */}
      <div className="flex flex-col gap-[2px]">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2" style={{ padding: "2px 0" }}>
            <span className="flex items-center justify-center shrink-0" style={{ width: 12, height: 12 }}>
              {step.state === "done" ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--success-fg)" }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : step.state === "running" ? (
                <span style={{ width: 8, height: 8, border: "1.5px solid transparent", borderTopColor: "var(--n11)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              ) : (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--n5)" }} />
              )}
            </span>
            <span
              className="text-[11px]"
              style={{
                color: step.state === "running" ? "var(--n12)" : step.state === "done" ? "var(--n8)" : "var(--n7)",
                fontWeight: step.state === "running" ? 500 : 400,
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Plan card (legacy inline, unused) ─────────────────────── */

function PlanCard({ steps, collapsed }: { steps: { label: string; state: string }[]; collapsed: boolean }) {
  const currentStep = steps.find(s => s.state === "running") || steps[steps.length - 1]
  const doneCount = steps.filter(s => s.state === "done").length

  return (
    <div style={{ border: "1px solid rgba(var(--overlay), 0.08)", borderRadius: "var(--radius-md)", padding: 4 }}>
      <div className="flex items-center gap-2" style={{ padding: "6px 8px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n10)" }}>
          <path d="M11 18H3" /><path d="m15 18 2 2 4-4" /><path d="M16 12H3" /><path d="M16 6H3" />
        </svg>
        <span className="text-[11px]" style={{ color: "var(--n10)" }}>Plan</span>
      </div>

      {!collapsed && (
        <div className="flex flex-col" style={{ padding: "2px 8px 6px" }}>
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2" style={{ padding: "4px 0" }}>
              <span className="flex items-center justify-center shrink-0" style={{ width: 14, height: 14 }}>
                {step.state === "done" ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n7)" }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : step.state === "running" ? (
                  <span style={{ width: 10, height: 10, border: "1.5px solid transparent", borderTopColor: "var(--n12)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                ) : (
                  <span style={{ width: 10, height: 10, border: "1.5px solid var(--n9)", borderRadius: "50%" }} />
                )}
              </span>
              <span
                className="text-[12px]"
                style={{
                  color: step.state === "running" ? "var(--n12)" : step.state === "done" ? "var(--n7)" : "var(--n10)",
                  fontWeight: step.state === "running" ? 500 : 400,
                  textDecoration: step.state === "done" ? "line-through" : "none",
                  textDecorationColor: "var(--n6)",
                }}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {collapsed && (
        <div className="flex items-center gap-2" style={{ padding: "4px 8px 6px" }}>
          <span className="text-[11px]" style={{ color: "var(--n8)" }}>{currentStep?.label}</span>
          <span className="text-[11px] ml-auto" style={{ color: "var(--n7)", fontVariantNumeric: "tabular-nums" }}>{doneCount} / {steps.length}</span>
        </div>
      )}
    </div>
  )
}

/* ─── Tool call row ─────────────────────────────────────────── */

function ToolCallRow({ icon, label, detail, state, duration }: { icon: string; label: string; detail: string; state: "running" | "done"; duration?: string }) {
  return (
    <div
      className="flex items-center gap-2"
      style={{ padding: "8px 12px", border: "1px solid rgba(var(--overlay), 0.08)", borderRadius: "var(--radius-lg)" }}
    >
      {/* Status */}
      <span className="flex items-center justify-center shrink-0" style={{ width: 14, height: 14 }}>
        {state === "done" ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n11)" }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <span style={{ width: 10, height: 10, border: "1.5px solid transparent", borderTopColor: "var(--n11)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        )}
      </span>

      {/* Icon */}
      <ToolIcon name={icon} />

      {/* Label + detail */}
      <span className="text-[11px] font-medium" style={{ color: "var(--n10)" }}>{label}</span>
      <span className="text-[11px] flex-1 min-w-0 truncate" style={{ color: "var(--n8)" }}>{detail}</span>

      {/* Duration */}
      {duration && <span className="text-[11px] shrink-0" style={{ color: "var(--n7)", fontVariantNumeric: "tabular-nums" }}>{duration}</span>}

      {/* Chevron */}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--n7)", flexShrink: 0 }}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    </div>
  )
}

/* ─── MCP result card ───────────────────────────────────────── */

function McpCard({ server, tool, icon, preview, content }: { server: string; tool: string; icon: string; preview: string; content: { label: string; value: string }[] }) {
  return (
    <div style={{ border: "1px solid rgba(var(--overlay), 0.08)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      {/* Header */}
      <div className="flex items-center gap-2" style={{ padding: "8px 12px", borderBottom: "1px solid rgba(var(--overlay), 0.06)" }}>
        <ToolIcon name={icon} />
        <span className="text-[11px] font-medium" style={{ color: "var(--n11)" }}>{server}</span>
        <span className="text-[11px]" style={{ color: "var(--n7)" }}>·</span>
        <span className="text-[11px]" style={{ color: "var(--n8)" }}>{tool}</span>
        {preview && (
          <>
            <span className="flex-1" />
            <span className="text-[11px] truncate" style={{ color: "var(--n9)" }}>{preview}</span>
          </>
        )}
      </div>
      {/* Body - kv */}
      <div style={{ padding: "8px 12px" }}>
        {content.map((row, i) => (
          <div key={i} className="flex gap-3" style={{ padding: "3px 0" }}>
            <span className="text-[11px] shrink-0" style={{ color: "var(--n8)", width: 70 }}>{row.label}</span>
            <span className="text-[11px]" style={{ color: "var(--n11)" }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Tool icon helper ──────────────────────────────────────── */

function ToolIcon({ name }: { name: string }) {
  const s = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, style: { color: "var(--n8)" } }

  switch (name) {
    case "search":
      return <svg {...s}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    case "file":
      return <svg {...s}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
    case "play":
      return <svg {...s}><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" /></svg>
    case "upload":
      return <svg {...s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
    case "clock":
      return <svg {...s}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    case "slack":
      return <svg {...s} stroke="none"><image href="/slack-logo.png" width="24" height="24" /></svg>
    default:
      return <svg {...s}><circle cx="12" cy="12" r="10" /></svg>
  }
}
