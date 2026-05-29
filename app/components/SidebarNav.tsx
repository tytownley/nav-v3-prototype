"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { ChevronDown } from "dbui/components/icons/ChevronDown"
import { MoreHorizontal } from "dbui/components/icons/MoreHorizontal"
import {
  ICON_MAP,
  CORE_NAV_ITEMS_PINNING,
  type ProjectChild,
  type ProjectSection,
} from "../lib/nav-defaults"
import { useNavState } from "../lib/nav-state"
import { DbIcon, ItemTypeIcon } from "./DbIcon"
import { MoreFlyout } from "./MoreFlyout"

const MIN_WIDTH = 180
const MAX_WIDTH = 400
const DEFAULT_WIDTH = 200
const COLLAPSED_WIDTH = 44

export function SidebarNav({ enhanced = true }: { enhanced?: boolean } = {}) {
  const { state, dispatch } = useNavState()
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [collapsed, setCollapsed] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const [projectExpanded, setProjectExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(state.workspaceProjects.map(p => [p.id, p.expanded]))
  )
  const [pinnedExpanded, setPinnedExpanded] = useState(true)
  const [projectsExpanded, setProjectsExpanded] = useState(true)
  const [recentExpanded, setRecentExpanded] = useState(true)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  const MAX_VISIBLE_PROJECTS = 4

  useEffect(() => {
    const saved = localStorage.getItem("nav-v3-width")
    if (saved) setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Number(saved))))
  }, [])

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    const startX = e.clientX
    const startWidth = width
    const onMove = (ev: MouseEvent) => setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + (ev.clientX - startX))))
    const onUp = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
      if (navRef.current) localStorage.setItem("nav-v3-width", String(navRef.current.offsetWidth))
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }, [width])

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : width

  const toggleProject = (id: string) => {
    setProjectExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const visibleProjects = showAllProjects
    ? state.workspaceProjects
    : state.workspaceProjects.slice(0, MAX_VISIBLE_PROJECTS)
  const hasMoreProjects = state.workspaceProjects.length > MAX_VISIBLE_PROJECTS

  const handlePin = useCallback((child: ProjectChild) => {
    dispatch({ type: "PIN_ITEM_TO_PINNED", item: child })
  }, [dispatch])

  return (
    <div
      className="relative shrink-0 flex"
      style={{ width: sidebarWidth, transition: "width 200ms cubic-bezier(0.22,1,0.36,1)" }}
    >
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden" style={{ background: "var(--n2)", borderRadius: "var(--radius-xl)", padding: 8 }}>
        <nav
          ref={navRef}
          className="nav-scrollbar relative flex-1 flex flex-col overflow-y-auto overflow-x-hidden"
        >
          {/* Branding */}
          <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`} style={{ padding: "4px 8px 4px 1px", marginBottom: 16 }}>
            {!collapsed ? (
              <>
                <button
                  className="flex items-center justify-center shrink-0 cursor-pointer"
                  style={{ width: 28, height: 28, borderRadius: "var(--radius-md)", background: "transparent", border: "none" }}
                  onClick={() => dispatch({ type: "SET_ACTIVE", itemId: "home" })}
                  title="Home"
                >
                  <img src="/databricks-logo.png" alt="Databricks" style={{ width: 28, height: 28, borderRadius: "var(--radius-md)", objectFit: "cover" }} />
                </button>
                <span className="flex-1 min-w-0 text-[12px] font-medium truncate" style={{ color: "var(--n12)", letterSpacing: "-0.005em", lineHeight: "14px" }}>
                  Databricks
                </span>
                <button
                  className="flex items-center justify-center shrink-0 rounded-[4px]"
                  style={{ width: 20, height: 20, color: "var(--n7)", background: "transparent", border: "none", cursor: "pointer", transition: "color var(--duration-instant)" }}
                  onClick={() => setCollapsed(true)}
                  aria-label="Collapse sidebar"
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)" }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <path d="M9 3v18"/>
                  </svg>
                </button>
              </>
            ) : (
              <button onClick={() => setCollapsed(false)} style={{ background: "transparent", border: "none", cursor: "pointer", opacity: 0.8, transition: "opacity var(--duration-instant)" }} aria-label="Expand sidebar"
                onMouseEnter={e => { e.currentTarget.style.opacity = "1" }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "0.8" }}
              >
                <span className="flex items-center justify-center shrink-0" style={{ width: 28, height: 28, borderRadius: "var(--radius-md)" }}>
                  <img src="/databricks-logo.png" alt="Databricks" style={{ width: 28, height: 28, borderRadius: "var(--radius-md)", objectFit: "cover" }} />
                </span>
              </button>
            )}
          </div>

          {/* Core nav items: New, Search, Library, Monitor, More */}
          <div className="flex flex-col">
            {CORE_NAV_ITEMS_PINNING.map(item => {
              if (item.id === "more") {
                if (!enhanced) return null
                return (
                  <div key={item.id} ref={moreRef}>
                    <NavItem
                      item={item}
                      isActive={moreOpen}
                      collapsed={collapsed}
                      badge={state.unpinnedItems.length > 0 ? state.unpinnedItems.length : undefined}
                      onClick={() => setMoreOpen(prev => !prev)}
                    />
                  </div>
                )
              }
              return (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={state.activeItem === item.id}
                  collapsed={collapsed}
                  onClick={() => {
                    if (item.id === "search") {
                      document.dispatchEvent(new CustomEvent("open-command-palette"))
                    } else {
                      dispatch({ type: "SET_ACTIVE", itemId: item.id })
                    }
                  }}
                />
              )
            })}
          </div>

          {enhanced && moreOpen && !collapsed && (
            <MoreFlyout anchorRef={moreRef} onClose={() => setMoreOpen(false)} />
          )}

          {/* Pinned section */}
          {!collapsed && state.pinnedItems.length > 0 && (
            <PinnedSection
              items={state.pinnedItems}
              expanded={pinnedExpanded}
              onToggle={() => setPinnedExpanded(prev => !prev)}
              activeItem={state.activeItem}
              onSelect={(id) => dispatch({ type: "SET_ACTIVE", itemId: id })}
              onUnpin={(id) => dispatch({ type: "UNPIN_FROM_PINNED", itemId: id })}
              onReorder={enhanced ? (itemId, targetIndex) => dispatch({ type: "REORDER_PINNED", itemId, targetIndex }) : undefined}
              enableContextMenu={enhanced}
            />
          )}

          {/* Projects section */}
          {!collapsed && (
            <div className="flex flex-col" style={{ marginTop: 20 }}>
              {/* Section header */}
              <div
                className="group/shdr flex items-center gap-1 cursor-pointer select-none"
                style={{ padding: "4px 8px 6px", lineHeight: 1 }}
                onClick={() => setProjectsExpanded(prev => !prev)}
              >
                <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: "var(--n8)" }}>
                  Projects
                </span>
                <ChevronDown
                  className={`shrink-0 ${projectsExpanded ? "opacity-0 group-hover/shdr:opacity-100" : "opacity-100 -rotate-90"}`}
                  size={10}
                  style={{ color: "var(--n8)", transition: "opacity var(--duration-fast), transform var(--duration-fast)" }}
                />
                <span className="flex-1" />
                <button
                  className="cursor-pointer"
                  style={{ fontSize: 10, color: "var(--n7)", background: "transparent", border: "none", transition: "color var(--duration-instant)" }}
                  onClick={e => { e.stopPropagation() }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--n10)" }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)" }}
                >
                  View all
                </button>
              </div>

              {/* Project list */}
              {projectsExpanded && visibleProjects.map((section, i) => (
                <ProjectSectionBlock
                  key={section.id}
                  section={section}
                  expanded={projectExpanded[section.id] !== undefined ? projectExpanded[section.id] : section.expanded}
                  onToggle={() => toggleProject(section.id)}
                  activeItem={state.activeItem}
                  onSelect={(id) => dispatch({ type: "SET_ACTIVE", itemId: id })}
                  onPin={handlePin}
                  isFirst={i === 0}
                />
              ))}

              {/* Show more / less */}
              {projectsExpanded && hasMoreProjects && (
                <button
                  className="cursor-pointer text-left"
                  style={{ padding: "4px 8px", fontSize: 11, color: "var(--n7)", background: "transparent", border: "none", transition: "color var(--duration-instant)" }}
                  onClick={() => setShowAllProjects(prev => !prev)}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--n10)" }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--n7)" }}
                >
                  {showAllProjects ? "Show less" : `Show ${state.workspaceProjects.length - MAX_VISIBLE_PROJECTS} more`}
                </button>
              )}
            </div>
          )}

          {/* Recent section */}
          {!collapsed && state.showRecents && state.recentItems.length > 0 && (
            <RecentSection
              items={state.recentItems}
              activeItem={state.activeItem}
              onSelect={(id) => dispatch({ type: "SET_ACTIVE", itemId: id })}
              onPin={handlePin}
              expanded={recentExpanded}
              onToggle={() => setRecentExpanded(prev => !prev)}
              onReorder={enhanced ? (childId, targetIndex) => dispatch({ type: "REORDER_RECENT", childId, targetIndex }) : undefined}
            />
          )}
        </nav>

        {/* User footer */}
        <div
          className="shrink-0"
          style={{ padding: "8px 4px 0", marginTop: 28, borderTop: "1px solid rgba(var(--overlay), 0.04)" }}
        >
          <UserFooter collapsed={collapsed} />
        </div>
      </div>

      {/* Resize handle */}
      {!collapsed && (
        <div
          className="w-1 shrink-0 cursor-col-resize transition-colors"
          style={{ background: isResizing ? "rgba(var(--overlay), 0.08)" : "transparent" }}
          onMouseDown={handleResizeStart}
          onMouseEnter={e => { if (!isResizing) e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
          onMouseLeave={e => { if (!isResizing) e.currentTarget.style.background = "transparent" }}
        />
      )}
    </div>
  )
}

/* ─── Helpers & icons ───────────────────────────────────────── */

function formatTimestamp(ts?: string): string | null {
  if (!ts) return null
  if (ts === "now") return "1m"
  if (ts === "yesterday") return "1d"
  if (ts === "today") return "1h"
  if (/^\d+\s*(minute|hour|day|week|month|year)s?\s*ago$/i.test(ts)) {
    const m = ts.match(/^(\d+)\s*(minute|hour|day|week|month|year)/i)
    if (m) {
      const abbr: Record<string, string> = { minute: "m", hour: "h", day: "d", week: "w", month: "mo", year: "y" }
      return `${m[1]}${abbr[m[2].toLowerCase()]}`
    }
  }
  return ts
}

function PinIcon() {
  return <DbIcon name="pin-outlined" size={12} />
}

function UnpinIcon() {
  return <DbIcon name="pin-off" size={12} />
}

function ArchiveBoxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  )
}

/* ─── Nav item ────────────────────────────────────────────── */

function NavItem({
  item,
  isActive,
  collapsed,
  onClick,
  badge,
}: {
  item: { id: string; label: string; iconName: string }
  isActive: boolean
  collapsed: boolean
  onClick: () => void
  badge?: number
}) {
  const [hovered, setHovered] = useState(false)
  const iconName = ICON_MAP[item.iconName]

  const textColor = isActive ? "var(--n12)" : hovered ? "var(--n11)" : "var(--n10)"
  const iconColor = isActive || hovered ? "var(--n10)" : "var(--n7)"
  const bg = isActive ? "rgba(var(--overlay), 0.08)" : hovered ? "rgba(var(--overlay), 0.04)" : "transparent"

  return (
    <div
      role="button"
      tabIndex={0}
      className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}
      style={{
        padding: "6px 8px",
        minHeight: 32,
        background: bg,
        color: textColor,
        fontWeight: isActive ? 500 : 400,
        fontSize: 13,
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        userSelect: "none",
        transition: "background var(--duration-instant), color var(--duration-instant)",
        border: "none",
        outline: "none",
        fontFamily: "Inter, sans-serif",
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={collapsed ? item.label : undefined}
    >
      <span
        className="flex items-center justify-center shrink-0"
        style={{ width: 14, height: 14, color: iconColor, transition: "color var(--duration-instant)" }}
      >
        {item.iconName === "MoreHorizontal" ? (
          <MoreHorizontal size={14} />
        ) : iconName ? (
          <DbIcon name={iconName} size={14} />
        ) : null}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
            {item.label}
          </span>
          {badge !== undefined && badge > 0 && (
            <span
              className="flex items-center justify-center shrink-0 rounded-full"
              style={{
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--n11)",
                background: "rgba(var(--overlay), 0.08)",
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </div>
  )
}

/* ─── Project section ───────────────────────────────────────── */

function ProjectSectionBlock({
  section,
  expanded,
  onToggle,
  activeItem,
  onSelect,
  onPin,
  isFirst,
}: {
  section: ProjectSection
  expanded: boolean
  onToggle: () => void
  activeItem: string
  onSelect: (id: string) => void
  onPin: (child: ProjectChild) => void
  isFirst: boolean
}) {
  const [headerHovered, setHeaderHovered] = useState(false)

  return (
    <div style={{ marginTop: isFirst ? 0 : 4 }}>
      <div
        className="group/shdr flex items-center gap-2 cursor-pointer select-none rounded-[6px]"
        style={{
          padding: "5px 8px",
          lineHeight: 1,
          background: headerHovered ? "rgba(var(--overlay), 0.04)" : "transparent",
          transition: "background var(--duration-instant)",
        }}
        onClick={onToggle}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
      >
        {/* Folder icon (default) / Chevron (on hover) */}
        <span className="flex items-center justify-center shrink-0" style={{ width: 14, height: 14, color: "var(--n7)" }}>
          {/* Chevron shown on hover, replaces folder */}
          <span className="hidden group-hover/shdr:flex items-center justify-center">
            <ChevronDown
              className={`shrink-0 ${expanded ? "" : "-rotate-90"}`}
              size={12}
              style={{ color: "var(--n7)", transition: "transform var(--duration-fast)" }}
            />
          </span>
          {/* Folder shown by default, hidden on hover */}
          <span className="flex group-hover/shdr:hidden items-center justify-center">
            <DbIcon name={expanded ? "folder-open" : "folder-filled"} size={14} />
          </span>
        </span>

        <span className="text-[13px] font-medium whitespace-nowrap" style={{ color: "var(--n9)" }}>
          {section.name}
        </span>
        <span className="flex-1" />
        <span
          className="flex items-center justify-center size-[18px] rounded-[4px] opacity-0 group-hover/shdr:opacity-100"
          style={{ color: "var(--n8)", transition: "opacity var(--duration-fast), background var(--duration-instant), color var(--duration-instant)" }}
          onClick={(e) => { e.stopPropagation() }}
          title="Add to project"
          onMouseEnter={e => { e.currentTarget.style.color = "var(--n11)"; e.currentTarget.style.background = "rgba(var(--overlay), 0.08)" }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--n8)"; e.currentTarget.style.background = "transparent" }}
        >
          <DbIcon name="plus" size={12} />
        </span>
      </div>
      {expanded && (
        <div className="flex flex-col" style={{ overflow: "hidden", transition: "max-height var(--duration-normal)", maxHeight: 800 }}>
          {section.items.map(child => (
            <SidebarItemRow
              key={child.id}
              child={child}
              isActive={activeItem === child.id}
              onSelect={() => onSelect(child.id)}
              padding="5px 8px 5px 22px"
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SidebarItemRow({
  child,
  isActive,
  onSelect,
  onPin,
  onUnpin,
  showPinOnHover = false,
  showUnpinOnHover = false,
  padding = "5px 8px",
  draggable = false,
  isDragging = false,
  showDropIndicatorAbove = false,
  showDropIndicatorBelow = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onContextMenu,
}: {
  child: ProjectChild
  isActive: boolean
  onSelect: () => void
  onPin?: () => void
  onUnpin?: () => void
  showPinOnHover?: boolean
  showUnpinOnHover?: boolean
  padding?: string
  draggable?: boolean
  isDragging?: boolean
  showDropIndicatorAbove?: boolean
  showDropIndicatorBelow?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
  onContextMenu?: (e: React.MouseEvent) => void
}) {
  const [hovered, setHovered] = useState(false)
  const timestamp = formatTimestamp(child.timestamp)

  const bg = isActive ? "rgba(var(--overlay), 0.08)" : hovered ? "rgba(var(--overlay), 0.04)" : "transparent"
  const color = isActive ? "var(--n12)" : hovered ? "var(--n11)" : "var(--n10)"

  const showPinIcon = hovered && showPinOnHover
  const showUnpinIcon = hovered && showUnpinOnHover

  return (
    <div className="relative">
      {showDropIndicatorAbove && (
        <div
          className="absolute left-2 right-2 z-10"
          style={{ top: 0, height: 2, background: "var(--n8)", borderRadius: 1 }}
        />
      )}
      <button
        className="relative flex w-full items-center gap-2 rounded-[6px] text-left"
        style={{
          padding,
          minHeight: 32,
          background: bg,
          color,
          fontWeight: isActive ? 500 : 400,
          fontSize: 13,
          fontFamily: "Inter, sans-serif",
          border: "none",
          outline: "none",
          cursor: draggable ? (isDragging ? "grabbing" : "grab") : "pointer",
          opacity: isDragging ? 0.4 : 1,
          transition: "background var(--duration-instant), color var(--duration-instant), opacity var(--duration-instant)",
        }}
        draggable={draggable}
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        onContextMenu={onContextMenu}
      >
        <span
          className="flex items-center justify-center shrink-0"
          style={{ width: 14, height: 14, color: "var(--n7)", cursor: (showPinIcon || showUnpinIcon) ? "pointer" : "default" }}
          onClick={(e) => {
            if (showUnpinIcon && onUnpin) {
              e.stopPropagation()
              onUnpin()
            } else if (showPinIcon && onPin) {
              e.stopPropagation()
              onPin()
            }
          }}
          title={showUnpinIcon ? "Unpin" : showPinIcon ? "Pin" : undefined}
        >
          {showUnpinIcon ? (
            <UnpinIcon />
          ) : showPinIcon ? (
            <PinIcon />
          ) : child.iconName && ICON_MAP[child.iconName] ? (
            <DbIcon name={ICON_MAP[child.iconName]} size={14} />
          ) : (
            <ItemTypeIcon type={child.type} />
          )}
        </span>

        <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
          {child.label}
        </span>

        {hovered && (
          <span className="flex items-center gap-1.5 shrink-0" style={{ color: "var(--n7)" }}>
            {timestamp && (
              <span style={{ fontSize: 13, lineHeight: 1 }}>{timestamp}</span>
            )}
            <span
              className="flex items-center justify-center"
              style={{ cursor: "pointer" }}
              onClick={(e) => e.stopPropagation()}
              title="Archive"
            >
              <ArchiveBoxIcon />
            </span>
          </span>
        )}
      </button>
      {showDropIndicatorBelow && (
        <div
          className="absolute left-2 right-2 z-10"
          style={{ bottom: 0, height: 2, background: "var(--n8)", borderRadius: 1 }}
        />
      )}
    </div>
  )
}

/* ─── Pinned section ───────────────────────────────────────── */

function PinnedSection({
  items,
  expanded,
  onToggle,
  activeItem,
  onSelect,
  onUnpin,
  onReorder,
  enableContextMenu = true,
}: {
  items: ProjectChild[]
  expanded: boolean
  onToggle: () => void
  activeItem: string
  onSelect: (id: string) => void
  onUnpin: (id: string) => void
  onReorder?: (itemId: string, targetIndex: number) => void
  enableContextMenu?: boolean
}) {
  const dragRef = useRef<{ itemId: string; index: number } | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropIndicator, setDropIndicator] = useState<{ index: number; position: "above" | "below" } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contextMenu) return
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null)
    }
    document.addEventListener("mousedown", onClickOutside)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onClickOutside)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [contextMenu])

  const handleDragStart = (index: number, itemId: string) => (e: React.DragEvent) => {
    dragRef.current = { itemId, index }
    setDraggingId(itemId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    const rect = e.currentTarget.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    const position = e.clientY < midpoint ? "above" : "below"
    setDropIndicator({ index, position })
  }

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    if (!dragRef.current) return
    const { itemId, index: fromIndex } = dragRef.current
    let targetIndex = index
    if (dropIndicator?.position === "below") targetIndex = index + 1
    if (fromIndex < targetIndex) targetIndex -= 1
    if (fromIndex !== targetIndex) {
      onReorder(itemId, targetIndex)
    }
    dragRef.current = null
    setDropIndicator(null)
  }

  const handleDragEnd = () => {
    dragRef.current = null
    setDraggingId(null)
    setDropIndicator(null)
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div
        className="group/shdr flex items-center gap-1 cursor-pointer select-none"
        style={{ padding: "4px 8px 6px", lineHeight: 1 }}
        onClick={onToggle}
      >
        <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: "var(--n8)" }}>
          Pinned
        </span>
        <ChevronDown
          className={`shrink-0 ${expanded ? "opacity-0 group-hover/shdr:opacity-100" : "opacity-100 -rotate-90"}`}
          size={10}
          style={{ color: "var(--n8)", transition: "opacity var(--duration-fast), transform var(--duration-fast)" }}
        />
      </div>
      {expanded && (
        <div className="flex flex-col" style={{ overflow: "hidden", transition: "max-height var(--duration-normal)", maxHeight: 800 }}>
          {items.map((child, index) => (
            <SidebarItemRow
              key={child.id}
              child={child}
              isActive={activeItem === child.id}
              onSelect={() => onSelect(child.id)}
              onUnpin={() => onUnpin(child.id)}
              showUnpinOnHover
              draggable={!!onReorder}
              isDragging={onReorder ? draggingId === child.id : false}
              showDropIndicatorAbove={onReorder ? dropIndicator?.index === index && dropIndicator.position === "above" : false}
              showDropIndicatorBelow={onReorder ? dropIndicator?.index === index && dropIndicator.position === "below" : false}
              onDragStart={onReorder ? handleDragStart(index, child.id) : undefined}
              onDragOver={onReorder ? handleDragOver(index) : undefined}
              onDrop={onReorder ? handleDrop(index) : undefined}
              onDragEnd={onReorder ? handleDragEnd : undefined}
              onContextMenu={enableContextMenu ? (e) => {
                e.preventDefault()
                setContextMenu({ x: e.clientX, y: e.clientY, itemId: child.id })
              } : undefined}
            />
          ))}
        </div>
      )}
      {enableContextMenu && contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            background: "var(--n2)",
            border: "1px solid rgba(var(--overlay), 0.08)",
            borderRadius: 8,
            padding: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,0.24)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <button
            className="w-full text-left rounded-[4px]"
            style={{
              padding: "0 8px",
              minHeight: 32,
              fontSize: 13,
              color: "var(--n11)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "Inter, sans-serif",
              transition: "background var(--duration-instant)",
            }}
            onClick={() => {
              onUnpin(contextMenu.itemId)
              setContextMenu(null)
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--overlay), 0.04)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
          >
            Remove from sidebar
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Recent section ────────────────────────────────────────── */

function RecentSection({
  items,
  activeItem,
  onSelect,
  onPin,
  expanded,
  onToggle,
  onReorder,
}: {
  items: ProjectChild[]
  activeItem: string
  onSelect: (id: string) => void
  onPin: (child: ProjectChild) => void
  expanded: boolean
  onToggle: () => void
  onReorder?: (childId: string, targetIndex: number) => void
}) {
  const dragRef = useRef<{ childId: string; index: number } | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropIndicator, setDropIndicator] = useState<{ index: number; position: "above" | "below" } | null>(null)

  const handleDragStart = (index: number, childId: string) => (e: React.DragEvent) => {
    dragRef.current = { childId, index }
    setDraggingId(childId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    const rect = e.currentTarget.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    const position = e.clientY < midpoint ? "above" : "below"
    setDropIndicator({ index, position })
  }

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    if (!dragRef.current || !onReorder) return
    const { childId, index: fromIndex } = dragRef.current
    let targetIndex = index
    if (dropIndicator?.position === "below") targetIndex = index + 1
    if (fromIndex < targetIndex) targetIndex -= 1
    if (fromIndex !== targetIndex) {
      onReorder(childId, targetIndex)
    }
    dragRef.current = null
    setDropIndicator(null)
  }

  const handleDragEnd = () => {
    dragRef.current = null
    setDraggingId(null)
    setDropIndicator(null)
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div
        className="group/shdr flex items-center gap-1 cursor-pointer select-none"
        style={{ padding: "4px 8px 6px", lineHeight: 1 }}
        onClick={onToggle}
      >
        <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: "var(--n8)" }}>
          Recent
        </span>
        <ChevronDown
          className={`shrink-0 ${expanded ? "opacity-0 group-hover/shdr:opacity-100" : "opacity-100 -rotate-90"}`}
          size={10}
          style={{ color: "var(--n8)", transition: "opacity var(--duration-fast), transform var(--duration-fast)" }}
        />
      </div>
      {expanded && <div className="flex flex-col">
        {items.map((child, index) => (
          <SidebarItemRow
            key={child.id}
            child={child}
            isActive={activeItem === child.id}
            onSelect={() => onSelect(child.id)}
            onPin={() => onPin(child)}
            showPinOnHover
            draggable={!!onReorder}
            isDragging={onReorder ? draggingId === child.id : false}
            showDropIndicatorAbove={onReorder ? dropIndicator?.index === index && dropIndicator.position === "above" : false}
            showDropIndicatorBelow={onReorder ? dropIndicator?.index === index && dropIndicator.position === "below" : false}
            onDragStart={onReorder ? handleDragStart(index, child.id) : undefined}
            onDragOver={onReorder ? handleDragOver(index) : undefined}
            onDrop={onReorder ? handleDrop(index) : undefined}
            onDragEnd={onReorder ? handleDragEnd : undefined}
          />
        ))}
      </div>}
    </div>
  )
}

/* ─── User footer ───────────────────────────────────────────── */

function UserFooter({ collapsed }: { collapsed?: boolean }) {
  useEffect(() => {
    const saved = localStorage.getItem("nav-v3-theme")
    if (saved === "light") document.documentElement.setAttribute("data-theme", "light")
  }, [])

  return (
    <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
      <span
        className="flex items-center justify-center shrink-0 rounded-full text-[10px] font-medium"
        style={{ width: 24, height: 24, background: "var(--n3)", color: "var(--n10)" }}
      >
        AP
      </span>
      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] truncate" style={{ color: "var(--n11)", lineHeight: "14px" }}>
            Arjun Patel
          </span>
          <span className="text-[10px] truncate" style={{ color: "var(--n8)", lineHeight: "14px" }}>
            Acme Corp
          </span>
        </div>
      )}
    </div>
  )
}
