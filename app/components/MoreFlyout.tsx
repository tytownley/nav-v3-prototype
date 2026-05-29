"use client"

import React, { useState, useEffect, useRef } from "react"
import { ICON_MAP, type NavItemDef, type ProjectChild } from "../lib/nav-defaults"
import { useNavState } from "../lib/nav-state"
import { DbIcon, ItemTypeIcon } from "./DbIcon"

interface MoreFlyoutProps {
  anchorRef: React.RefObject<HTMLElement | null>
  onClose: () => void
}

function FlyoutItemIcon({ item }: { item: NavItemDef }) {
  if (item.itemType) {
    return <ItemTypeIcon type={item.itemType} />
  }
  const iconName = ICON_MAP[item.iconName]
  return iconName ? <DbIcon name={iconName} size={14} /> : null
}

export function MoreFlyout({ anchorRef, onClose }: MoreFlyoutProps) {
  const { state, dispatch } = useNavState()
  const [search, setSearch] = useState("")
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPosition({ top: rect.top, left: rect.right + 4 })
    }
    inputRef.current?.focus()
  }, [anchorRef])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  const filtered = state.unpinnedItems.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  )

  const sectionLabels: Record<string, string> = {
    sql: "SQL",
    "data-engineering": "Data Engineering",
    "ai-ml": "AI / ML",
  }

  const grouped = filtered.reduce<Record<string, NavItemDef[]>>((acc, item) => {
    const key = item.originalSectionId
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const groupEntries = Object.entries(grouped)

  const handlePin = (itemId: string) => {
    dispatch({ type: "PIN_TO_PINNED", itemId })
    if (state.unpinnedItems.length <= 1) onClose()
  }

  const handleReset = () => {
    dispatch({ type: "RESET_ALL" })
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "transparent" }}
        onClick={onClose}
      />
      <div
        className="fixed z-50 flex flex-col"
        style={{
          top: position.top,
          left: position.left,
          width: 220,
          background: "var(--n2)",
          border: "1px solid rgba(var(--overlay), 0.08)",
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.24)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ padding: "8px 8px 4px" }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              fontSize: 13,
              color: "var(--n11)",
              background: "rgba(var(--overlay), 0.04)",
              border: "1px solid rgba(var(--overlay), 0.08)",
              borderRadius: 6,
              outline: "none",
              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>

        <div className="flex flex-col" style={{ padding: "4px 4px 4px", maxHeight: "70vh", overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "12px 8px", fontSize: 13, color: "var(--n8)", textAlign: "center" }}>
              {state.unpinnedItems.length === 0 ? "All items are in the sidebar." : "No matching items."}
            </div>
          ) : (
            groupEntries.map(([sectionId, items], groupIdx) => (
              <div key={sectionId} className="group/sec" style={{ marginTop: groupIdx > 0 ? 20 : 0 }}>
                <div className="group/shdr flex items-center gap-1" style={{ padding: "4px 8px 6px", lineHeight: 1 }}>
                  <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: "var(--n8)" }}>
                    {sectionLabels[sectionId] ?? sectionId}
                  </span>
                  <span className="flex-1" />
                  <button
                    className="opacity-0 group-hover/sec:opacity-100 cursor-pointer"
                    style={{ fontSize: 10, color: "var(--n7)", background: "transparent", border: "none", transition: "opacity 0.1s, color 0.1s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--n10)" }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)" }}
                    onClick={() => { items.forEach(item => dispatch({ type: "PIN_TO_PINNED", itemId: item.id })) }}
                  >
                    Restore all
                  </button>
                </div>
                {items.map(item => (
                  <FlyoutRow key={item.id} item={item} onPin={() => handlePin(item.id)} />
                ))}
              </div>
            ))
          )}
        </div>

        {state.unpinnedItems.length > 0 && (
          <div style={{ padding: "4px 4px 8px", borderTop: "1px solid rgba(var(--overlay), 0.04)" }}>
            <button
              className="w-full text-left rounded-[4px]"
              style={{
                padding: "6px 8px",
                minHeight: 32,
                fontSize: 13,
                color: "var(--n8)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "background var(--duration-instant)",
              }}
              onClick={handleReset}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
            >
              Reset sidebar to default
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function FlyoutRow({ item, onPin }: { item: NavItemDef; onPin: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      className="flex w-full items-center gap-2 rounded-[4px] text-left"
      style={{
        padding: "5px 8px",
        minHeight: 32,
        fontSize: 13,
        color: hovered ? "var(--n11)" : "var(--n10)",
        background: hovered ? "rgba(var(--overlay), 0.04)" : "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
        transition: "background var(--duration-instant), color var(--duration-instant)",
      }}
      onClick={onPin}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="flex items-center justify-center shrink-0" style={{ width: 14, height: 14, color: "var(--n7)" }}>
        {hovered ? <DbIcon name="pin-outlined" size={12} /> : <FlyoutItemIcon item={item} />}
      </span>
      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
        {item.label}
      </span>
    </button>
  )
}
