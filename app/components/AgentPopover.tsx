"use client"

import React, { useState, useRef, useEffect } from "react"

/* ─── Sparkle Button ────────────────────────────────────────── */

export function SparkleButton({ onClick, subtle }: { onClick: (e: React.MouseEvent) => void; subtle?: boolean }) {
  const size = subtle ? 20 : 24
  const iconSize = subtle ? 11 : 14
  return (
    <button
      className={`absolute flex items-center justify-center rounded-full cursor-pointer ${subtle ? "sparkle-fade-in" : "sparkle-scale-in"}`}
      style={{
        top: subtle ? 4 : -10,
        right: subtle ? 4 : -10,
        width: size,
        height: size,
        background: "var(--n1)",
        border: "1px solid rgba(var(--overlay), 0.10)",
        boxShadow: subtle ? "0 1px 3px rgba(0,0,0,0.06)" : "0 2px 6px rgba(0,0,0,0.08)",
        color: "var(--n8)",
        zIndex: 10,
        opacity: subtle ? 0.7 : 1,
        transition: "color 0.1s, transform 0.1s, box-shadow 0.1s, opacity 0.15s",
      }}
      onClick={e => { e.stopPropagation(); onClick(e) }}
      onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)"; e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.opacity = "1"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.12)" }}
      onMouseLeave={e => { e.currentTarget.style.color = "var(--n8)"; e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = subtle ? "0.7" : "1"; e.currentTarget.style.boxShadow = subtle ? "0 1px 3px rgba(0,0,0,0.06)" : "0 2px 6px rgba(0,0,0,0.08)" }}
      title="Ask agent about this"
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        <path d="M20 3v4" /><path d="M22 5h-4" />
      </svg>
    </button>
  )
}

/* ─── Agent Popover ─────────────────────────────────────────── */

type DemoPhase = "idle" | "suggesting" | "running" | "done"

const DEMO_SUGGESTIONS: Record<string, { suggestion: string; result: string }> = {
  eda: { suggestion: "Add retention curve by plan tier", result: "Added retention breakdown — 3 new columns" },
  pipeline: { suggestion: "Add row-count validation step", result: "Validation gate inserted after transforms" },
  table: { suggestion: "Add a computed churn_risk score", result: "Column added — uses payment_failures + usage_decline" },
  default: { suggestion: "Optimize this query", result: "Done — reduced scan by 40%" },
}

export function AgentPopover({ contextType, onClose, clickPosition, onCellUpdate }: {
  contextLabel?: string
  contextType: string
  onClose: () => void
  clickPosition?: { x: number; y: number }
  onCellUpdate?: () => void
}) {
  const [phase, setPhase] = useState<DemoPhase>("idle")
  const [inputValue, setInputValue] = useState("")
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoFillTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typeInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const userTyped = useRef(false)

  const demo = DEMO_SUGGESTIONS[contextType] || DEMO_SUGGESTIONS.default

  useEffect(() => {
    if (clickPosition) {
      const maxTop = window.innerHeight - 200
      const maxLeft = window.innerWidth - 320
      setPos({
        top: Math.max(8, Math.min(clickPosition.y + 4, maxTop)),
        left: Math.max(8, Math.min(clickPosition.x - 150, maxLeft)),
      })
    }
  }, [clickPosition])

  useEffect(() => {
    inputRef.current?.focus()

    autoFillTimer.current = setTimeout(() => {
      if (userTyped.current) return
      autoTypeAndSubmit()
    }, 3000)

    return () => {
      if (autoFillTimer.current) clearTimeout(autoFillTimer.current)
      if (typeInterval.current) clearInterval(typeInterval.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const autoTypeAndSubmit = () => {
    const text = demo.suggestion
    let idx = 0
    typeInterval.current = setInterval(() => {
      idx++
      setInputValue(text.slice(0, idx))
      if (idx >= text.length) {
        if (typeInterval.current) clearInterval(typeInterval.current)
        setTimeout(() => {
          setInputValue("")
          runDemo()
        }, 400)
      }
    }, 40)
  }

  const runDemo = () => {
    setPhase("suggesting")
    setTimeout(() => {
      setPhase("running")
      setTimeout(() => {
        setPhase("done")
        onCellUpdate?.()
      }, 1800)
    }, 1000)
  }

  const handleUserSubmit = () => {
    if (!inputValue.trim()) return
    if (autoFillTimer.current) clearTimeout(autoFillTimer.current)
    if (typeInterval.current) clearInterval(typeInterval.current)
    setInputValue("")
    runDemo()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    userTyped.current = true
    if (autoFillTimer.current) clearTimeout(autoFillTimer.current)
    if (typeInterval.current) clearInterval(typeInterval.current)
    setInputValue(e.target.value)
  }

  return (
    <div
      ref={containerRef}
      className="popover-fade-in"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: 300,
        background: "var(--n1)",
        border: "1px solid rgba(var(--overlay), 0.10)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 100,
      }}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Agent status area — appears after triggered */}
      {phase !== "idle" && (
        <div style={{ padding: "10px 12px 6px", borderBottom: phase === "done" ? "none" : "1px solid rgba(var(--overlay), 0.06)" }}>
          {phase === "suggesting" && (
            <div className="flex items-center gap-[6px]">
              <span style={{ width: 10, height: 10, border: "1.5px solid transparent", borderTopColor: "var(--n9)", borderRadius: "50%", animation: "spin 0.6s linear infinite", flexShrink: 0 }} />
              <span className="text-[11px] chat-thinking-shimmer" style={{ color: "var(--n9)" }}>Analyzing cell...</span>
            </div>
          )}
          {phase === "running" && (
            <div className="flex flex-col gap-[6px]">
              <p className="text-[12px] leading-[17px]" style={{ color: "var(--n11)" }}>{demo.suggestion}</p>
              <div className="flex items-center gap-[6px]">
                <span style={{ width: 10, height: 10, border: "1.5px solid transparent", borderTopColor: "var(--n9)", borderRadius: "50%", animation: "spin 0.6s linear infinite", flexShrink: 0 }} />
                <span className="text-[11px]" style={{ color: "var(--n8)" }}>Applying...</span>
              </div>
            </div>
          )}
          {phase === "done" && (
            <div className="flex items-center gap-[6px]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--success-fg)", flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[12px]" style={{ color: "var(--n10)" }}>{demo.result}</span>
            </div>
          )}
        </div>
      )}

      {/* Input — always at the bottom */}
      <div className="flex items-center gap-1 shrink-0" style={{ padding: "8px 8px 8px 12px" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--n7)", flexShrink: 0 }}>
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          readOnly={phase === "suggesting" || phase === "running"}
          onKeyDown={e => {
            if (e.key === "Escape") onClose()
            if (e.key === "Enter") handleUserSubmit()
          }}
          onChange={handleChange}
          placeholder={phase === "done" ? "Ask a follow-up..." : "Describe your idea..."}
          className="flex-1 min-w-0 bg-transparent text-[12px] outline-none"
          style={{ color: "var(--n11)", height: 22 }}
        />
        {inputValue ? (
          <button
            className="flex items-center justify-center shrink-0 rounded-[3px] cursor-pointer"
            style={{ width: 22, height: 22, color: "var(--n9)", transition: "color 0.1s" }}
            onClick={handleUserSubmit}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--n9)" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            className="flex items-center justify-center shrink-0 rounded-[3px] cursor-pointer"
            style={{ width: 22, height: 22, color: "var(--n7)", transition: "color 0.1s" }}
            onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        )}
      </div>
    </div>
  )
}
