"use client"

import React, { createContext, useContext, useReducer, useEffect } from "react"
import {
  type NavItemDef, type ProjectSection, type ProjectChild,
  DEFAULT_PINNED_ITEMS, DEFAULT_RECENT_ITEMS, DEFAULT_WORKSPACE_PROJECTS,
  DEFAULT_UNPINNED_ITEMS, CORE_NAV_ITEMS_PINNING,
} from "./nav-defaults"

export interface NavState {
  unpinnedItems: NavItemDef[]
  activeItem: string
  activeWorkspace: string
  pinnedItems: ProjectChild[]
  recentItems: ProjectChild[]
  showRecents: boolean
  useDatabricksLogo: boolean
  hiddenCoreItems: string[]
  workspaceProjects: ProjectSection[]
  coreOrder: string[]
  homeThreadActive: boolean
  homeThreadInput: string
}

export type NavAction =
  | { type: "SET_ACTIVE"; itemId: string }
  | { type: "SET_WORKSPACE"; name: string }
  | { type: "UNPIN_FROM_PINNED"; itemId: string }
  | { type: "PIN_TO_PINNED"; itemId: string }
  | { type: "PIN_ITEM_TO_PINNED"; item: ProjectChild }
  | { type: "REORDER_PINNED"; itemId: string; targetIndex: number }
  | { type: "REMOVE_RECENT"; childId: string }
  | { type: "REORDER_RECENT"; childId: string; targetIndex: number }
  | { type: "TOGGLE_RECENTS"; show: boolean }
  | { type: "TOGGLE_DATABRICKS_LOGO"; show: boolean }
  | { type: "HIDE_CORE_ITEM"; itemId: string }
  | { type: "RESTORE_CORE_ITEM"; itemId: string }
  | { type: "REORDER_CORE"; itemId: string; targetIndex: number }
  | { type: "START_HOME_THREAD"; input: string }
  | { type: "RESET_ALL" }

const STORAGE_KEY = "nav-v3-state-v3"

function buildDefaultState(): NavState {
  return {
    unpinnedItems: DEFAULT_UNPINNED_ITEMS,
    activeItem: "home",
    activeWorkspace: "e2-dogfood",
    pinnedItems: DEFAULT_PINNED_ITEMS,
    recentItems: DEFAULT_RECENT_ITEMS,
    showRecents: true,
    useDatabricksLogo: false,
    hiddenCoreItems: [],
    workspaceProjects: DEFAULT_WORKSPACE_PROJECTS,
    coreOrder: [],
    homeThreadActive: false,
    homeThreadInput: "",
  }
}

function loadState(): NavState {
  if (typeof window === "undefined") return buildDefaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...buildDefaultState(), ...parsed, workspaceProjects: DEFAULT_WORKSPACE_PROJECTS, recentItems: parsed.recentItems?.length ? parsed.recentItems : DEFAULT_RECENT_ITEMS, unpinnedItems: parsed.unpinnedItems?.length ? parsed.unpinnedItems : DEFAULT_UNPINNED_ITEMS, coreOrder: parsed.coreOrder ?? [], activeItem: "home", homeThreadActive: false, homeThreadInput: "" }
    }
  } catch { /* ignore */ }
  return buildDefaultState()
}

function saveState(state: NavState) {
  if (typeof window === "undefined") return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case "SET_ACTIVE":
      return { ...state, activeItem: action.itemId, homeThreadActive: action.itemId === "home" ? false : state.homeThreadActive, homeThreadInput: action.itemId === "home" ? "" : state.homeThreadInput }

    case "SET_WORKSPACE":
      return { ...state, activeWorkspace: action.name }

    case "UNPIN_FROM_PINNED": {
      const item = state.pinnedItems.find(i => i.id === action.itemId)
      if (!item) return state
      const navItem: NavItemDef = {
        id: item.id,
        label: item.label,
        iconName: "",
        originalSectionId: "pinned",
        pinnable: true,
        itemType: item.type,
      }
      return {
        ...state,
        pinnedItems: state.pinnedItems.filter(i => i.id !== action.itemId),
        unpinnedItems: [...state.unpinnedItems, navItem],
      }
    }

    case "PIN_TO_PINNED": {
      const item = state.unpinnedItems.find(i => i.id === action.itemId)
      if (!item) return state
      if (state.pinnedItems.some(i => i.id === action.itemId)) return state
      const child: ProjectChild = {
        id: item.id,
        label: item.label,
        type: item.itemType ?? "notebook",
        iconName: item.iconName,
      }
      return {
        ...state,
        unpinnedItems: state.unpinnedItems.filter(i => i.id !== action.itemId),
        pinnedItems: [...state.pinnedItems, child],
      }
    }

    case "PIN_ITEM_TO_PINNED": {
      if (state.pinnedItems.some(i => i.id === action.item.id)) return state
      return { ...state, pinnedItems: [...state.pinnedItems, { ...action.item, timestamp: undefined }] }
    }

    case "REORDER_PINNED": {
      const idx = state.pinnedItems.findIndex(i => i.id === action.itemId)
      if (idx === -1) return state
      const items = [...state.pinnedItems]
      const [moved] = items.splice(idx, 1)
      items.splice(action.targetIndex, 0, moved)
      return { ...state, pinnedItems: items }
    }

    case "TOGGLE_RECENTS":
      return { ...state, showRecents: action.show }

    case "TOGGLE_DATABRICKS_LOGO":
      return { ...state, useDatabricksLogo: action.show }

    case "HIDE_CORE_ITEM":
      return { ...state, hiddenCoreItems: [...state.hiddenCoreItems, action.itemId] }

    case "RESTORE_CORE_ITEM":
      return { ...state, hiddenCoreItems: state.hiddenCoreItems.filter(id => id !== action.itemId) }

    case "REMOVE_RECENT":
      return { ...state, recentItems: state.recentItems.filter(i => i.id !== action.childId) }

    case "REORDER_RECENT": {
      const idx = state.recentItems.findIndex(i => i.id === action.childId)
      if (idx === -1) return state
      const items = [...state.recentItems]
      const [moved] = items.splice(idx, 1)
      items.splice(action.targetIndex, 0, moved)
      return { ...state, recentItems: items }
    }

    case "REORDER_CORE": {
      let order = [...state.coreOrder]
      if (order.length === 0) {
        order = CORE_NAV_ITEMS_PINNING.filter(i => !state.hiddenCoreItems.includes(i.id)).map(i => i.id)
      }
      const fromIdx = order.indexOf(action.itemId)
      if (fromIdx !== -1) order.splice(fromIdx, 1)
      order.splice(action.targetIndex, 0, action.itemId)
      return { ...state, coreOrder: order }
    }

    case "START_HOME_THREAD":
      return { ...state, homeThreadActive: true, homeThreadInput: action.input }

    case "RESET_ALL": {
      if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY)
      return { ...buildDefaultState(), useDatabricksLogo: state.useDatabricksLogo }
    }

    default:
      return state
  }
}

interface NavContextValue { state: NavState; dispatch: React.Dispatch<NavAction> }
const NavContext = createContext<NavContextValue | null>(null)

export function NavStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(navReducer, undefined, loadState)
  useEffect(() => { saveState(state) }, [state])
  return <NavContext.Provider value={{ state, dispatch }}>{children}</NavContext.Provider>
}

export function useNavState() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error("useNavState must be used within NavStateProvider")
  return ctx
}
