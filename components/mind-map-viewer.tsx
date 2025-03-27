"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Flag, Clock, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import FileSaver from "file-saver"
import JSZip from "jszip"
import {
  ZoomIn,
  ZoomOut,
  MousePointer,
  Hand,
  Plus,
  FileDown,
  RotateCcw,
  Settings,
  Trash2,
  Edit,
  Maximize,
  Minimize,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define node types and interfaces
interface MindMapNode {
  id: string
  text: string
  parentId: string | null
  children: string[]
  collapsed: boolean
  notes?: string
  style: {
    backgroundColor: string
    textColor: string
    borderColor: string
    shape: "rectangle" | "rounded" | "ellipse" | "diamond"
  }
  tags: string[]
  priority?: "high" | "medium" | "low" | null
  progress?: number | null
  icons: string[]
}

interface Position {
  x: number
  y: number
}

interface NodePositions {
  [key: string]: Position
}

type LayoutType = "mind-map" | "org-chart" | "fishbone" | "timeline" | "logic"

// Sample initial data for the mind map
const initialNodes: { [key: string]: MindMapNode } = {
  root: {
    id: "root",
    text: "测试策略",
    parentId: null,
    children: ["func", "perf", "security", "ui", "compat"],
    collapsed: false,
    notes: "这是测试策略的主要节点，包含了所有测试类型。",
    style: {
      backgroundColor: "hsl(var(--primary))",
      textColor: "white",
      borderColor: "hsl(var(--primary))",
      shape: "rounded",
    },
    tags: ["策略", "测试"],
    priority: null,
    progress: null,
    icons: [],
  },
  func: {
    id: "func",
    text: "功能测试",
    parentId: "root",
    children: ["login", "upload", "export"],
    collapsed: false,
    notes: "验证系统的各项功能是否按照需求正常工作。",
    style: {
      backgroundColor: "hsl(var(--secondary))",
      textColor: "hsl(var(--secondary-foreground))",
      borderColor: "hsl(var(--secondary))",
      shape: "rounded",
    },
    tags: ["功能"],
    priority: "high",
    progress: 75,
    icons: ["CheckCircle2"],
  },
  perf: {
    id: "perf",
    text: "性能测试",
    parentId: "root",
    children: ["response", "concurrency"],
    collapsed: false,
    notes: "测试系统在不同负载条件下的性能表现。",
    style: {
      backgroundColor: "hsl(var(--secondary))",
      textColor: "hsl(var(--secondary-foreground))",
      borderColor: "hsl(var(--secondary))",
      shape: "rounded",
    },
    tags: ["性能"],
    priority: "medium",
    progress: 50,
    icons: ["Clock"],
  },
  security: {
    id: "security",
    text: "安全测试",
    parentId: "root",
    children: ["validation", "auth"],
    collapsed: false,
    notes: "验证系统的安全性和数据保护能力。",
    style: {
      backgroundColor: "hsl(var(--secondary))",
      textColor: "hsl(var(--secondary-foreground))",
      borderColor: "hsl(var(--secondary))",
      shape: "rounded",
    },
    tags: ["安全"],
    priority: "high",
    progress: 30,
    icons: ["AlertCircle"],
  },
  ui: {
    id: "ui",
    text: "用户界面测试",
    parentId: "root",
    children: [],
    collapsed: false,
    notes: "测试用户界面的可用性和响应性。",
    style: {
      backgroundColor: "hsl(var(--secondary))",
      textColor: "hsl(var(--secondary-foreground))",
      borderColor: "hsl(var(--secondary))",
      shape: "rounded",
    },
    tags: ["UI"],
    priority: "medium",
    progress: 60,
    icons: [],
  },
  compat: {
    id: "compat",
    text: "兼容性测试",
    parentId: "root",
    children: [],
    collapsed: false,
    notes: "测试系统在不同环境和设备上的兼容性。",
    style: {
      backgroundColor: "hsl(var(--secondary))",
      textColor: "hsl(var(--secondary-foreground))",
      borderColor: "hsl(var(--secondary))",
      shape: "rounded",
    },
    tags: ["兼容性"],
    priority: "low",
    progress: 20,
    icons: [],
  },
  login: {
    id: "login",
    text: "登录功能",
    parentId: "func",
    children: [],
    collapsed: false,
    notes: "测试用户登录功能的各种场景。",
    style: {
      backgroundColor: "hsl(var(--accent))",
      textColor: "hsl(var(--accent-foreground))",
      borderColor: "hsl(var(--accent))",
      shape: "rounded",
    },
    tags: ["登录"],
    priority: "high",
    progress: 100,
    icons: ["CheckCircle2"],
  },
  upload: {
    id: "upload",
    text: "上传功能",
    parentId: "func",
    children: [],
    collapsed: false,
    notes: "测试文件上传功能的各种场景。",
    style: {
      backgroundColor: "hsl(var(--accent))",
      textColor: "hsl(var(--accent-foreground))",
      borderColor: "hsl(var(--accent))",
      shape: "rounded",
    },
    tags: ["上传"],
    priority: "medium",
    progress: 80,
    icons: [],
  },
  export: {
    id: "export",
    text: "导出功能",
    parentId: "func",
    children: [],
    collapsed: false,
    notes: "测试数据导出功能的各种场景。",
    style: {
      backgroundColor: "hsl(var(--accent))",
      textColor: "hsl(var(--accent-foreground))",
      borderColor: "hsl(var(--accent))",
      shape: "rounded",
    },
    tags: ["导出"],
    priority: "medium",
    progress: 60,
    icons: [],
  },
  response: {
    id: "response",
    text: "响应时间",
    parentId: "perf",
    children: [],
    collapsed: false,
    notes: "测试系统响应时间在不同负载下的表现。",
    style: {
      backgroundColor: "hsl(var(--accent))",
      textColor: "hsl(var(--accent-foreground))",
      borderColor: "hsl(var(--accent))",
      shape: "rounded",
    },
    tags: ["响应时间"],
    priority: "high",
    progress: 40,
    icons: ["Clock"],
  },
  concurrency: {
    id: "concurrency",
    text: "并发用户",
    parentId: "perf",
    children: [],
    collapsed: false,
    notes: "测试系统在多用户并发访问时的性能。",
    style: {
      backgroundColor: "hsl(var(--accent))",
      textColor: "hsl(var(--accent-foreground))",
      borderColor: "hsl(var(--accent))",
      shape: "rounded",
    },
    tags: ["并发"],
    priority: "medium",
    progress: 30,
    icons: [],
  },
  validation: {
    id: "validation",
    text: "数据验证",
    parentId: "security",
    children: [],
    collapsed: false,
    notes: "测试系统对输入数据的验证和过滤。",
    style: {
      backgroundColor: "hsl(var(--accent))",
      textColor: "hsl(var(--accent-foreground))",
      borderColor: "hsl(var(--accent))",
      shape: "rounded",
    },
    tags: ["验证"],
    priority: "high",
    progress: 50,
    icons: ["AlertCircle"],
  },
  auth: {
    id: "auth",
    text: "权限控制",
    parentId: "security",
    children: [],
    collapsed: false,
    notes: "测试系统的权限控制和访问限制。",
    style: {
      backgroundColor: "hsl(var(--accent))",
      textColor: "hsl(var(--accent-foreground))",
      borderColor: "hsl(var(--accent))",
      shape: "rounded",
    },
    tags: ["权限"],
    priority: "high",
    progress: 40,
    icons: [],
  },
}

// Color palette for nodes
const colorPalette = [
  { bg: "hsl(var(--primary))", text: "white", border: "hsl(var(--primary))" },
  { bg: "hsl(var(--secondary))", text: "hsl(var(--secondary-foreground))", border: "hsl(var(--secondary))" },
  { bg: "hsl(var(--accent))", text: "hsl(var(--accent-foreground))", border: "hsl(var(--accent))" },
  { bg: "#e11d48", text: "white", border: "#be123c" },
  { bg: "#6366f1", text: "white", border: "#4f46e5" },
  { bg: "#06b6d4", text: "white", border: "#0891b2" },
  { bg: "#84cc16", text: "white", border: "#65a30d" },
  { bg: "#eab308", text: "white", border: "#ca8a04" },
  { bg: "#f97316", text: "white", border: "#ea580c" },
  { bg: "#8b5cf6", text: "white", border: "#7c3aed" },
  { bg: "#ec4899", text: "white", border: "#db2777" },
  { bg: "#f43f5e", text: "white", border: "#e11d48" },
  { bg: "#ffffff", text: "#000000", border: "#d1d5db" },
  { bg: "#f3f4f6", text: "#111827", border: "#d1d5db" },
  { bg: "#1e293b", text: "#ffffff", border: "#0f172a" },
  { bg: "#18181b", text: "#ffffff", border: "#09090b" },
]

// Available icons for nodes
const availableIcons = [
  { name: "Flag", component: Flag },
  { name: "Clock", component: Clock },
  { name: "CheckCircle2", component: CheckCircle2 },
  { name: "AlertCircle", component: AlertCircle },
  { name: "HelpCircle", component: HelpCircle },
]

export default function MindMapViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [tool, setTool] = useState<"select" | "pan" | "add">("select")
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [nodes, setNodes] = useState<{ [key: string]: MindMapNode }>(initialNodes)
  const [nodePositions, setNodePositions] = useState<NodePositions>({})
  const [layout, setLayout] = useState<LayoutType>("mind-map")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editingNodeText, setEditingNodeText] = useState("")
  const [editingNodeNotes, setEditingNodeNotes] = useState("")
  const [showNodeDialog, setShowNodeDialog] = useState(false)
  const [newNodeParentId, setNewNodeParentId] = useState<string | null>(null)
  const [newNodeText, setNewNodeText] = useState("")
  const [history, setHistory] = useState<{ nodes: { [key: string]: MindMapNode }[] }>({ nodes: [initialNodes] })
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState("png")
  const [showLayoutDialog, setShowLayoutDialog] = useState(false)
  const { toast } = useToast()
  const [isEditingNode, setIsEditingNode] = useState(false)
  const [canvasInitialized, setCanvasInitialized] = useState(false)
  const [renderTrigger, setRenderTrigger] = useState(0)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [contextMenuNodeId, setContextMenuNodeId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null)

  // Fixed calculateNodePositions function
  const calculateNodePositions = useCallback(() => {
    const positions: NodePositions = {}
    const nodeWidth = 150 // Base width for layout calculations
    const nodeHeight = 50 // Base height for layout calculations
    const horizontalGap = 200 // Horizontal spacing between nodes
    const verticalGap = 100 // Vertical spacing between sibling nodes

    // Helper function to calculate positions recursively
    const calculatePositionsRecursive = (
      nodeId: string,
      level: number,
      index: number,
      totalSiblings: number,
      parentX = 0,
      parentY = 0,
    ) => {
      const node = nodes[nodeId]
      if (!node) return

      let x = 0
      let y = 0

      // Calculate position based on layout type
      switch (layout) {
        case "mind-map":
          // Root at center, level 1 to the right, deeper levels cascade right
          if (level === 0) {
            x = 0
            y = 0
          } else {
            x = parentX + horizontalGap
            // Distribute siblings vertically
            const siblingOffset = ((totalSiblings - 1) * verticalGap) / 2
            y = parentY - siblingOffset + index * verticalGap
          }
          break

        case "org-chart":
          // Root at top, children below
          if (level === 0) {
            x = 0
            y = 0
          } else {
            // Centers parent above children
            x = parentX + (index - (totalSiblings - 1) / 2) * horizontalGap
            y = parentY + verticalGap
          }
          break

        case "fishbone":
          // Central horizontal line with branches up and down
          if (level === 0) {
            x = 0
            y = 0
          } else if (level === 1) {
            // Alternate branches above and below
            x = horizontalGap * (1 + Math.floor(index / 2))
            y = (index % 2 === 0 ? -1 : 1) * verticalGap
          } else {
            // Branch from parent in same direction
            x = parentX + horizontalGap / 2
            const direction = parentY < 0 ? -1 : 1
            y = parentY + direction * verticalGap * (0.5 + index * 0.3)
          }
          break

        case "timeline":
          // Horizontal timeline, items above and below
          if (level === 0) {
            x = 0
            y = 0
          } else {
            x = level * horizontalGap
            y = (index % 2 === 0 ? -1 : 1) * verticalGap
          }
          break

        case "logic":
          // Radial layout
          if (level === 0) {
            x = 0
            y = 0
          } else {
            const radius = (level * horizontalGap) / 2
            const angle = (index / totalSiblings) * 2 * Math.PI
            x = radius * Math.cos(angle)
            y = radius * Math.sin(angle)
          }
          break
      }

      // Store the calculated position
      positions[nodeId] = { x, y }

      // Process children if node is not collapsed
      if (!node.collapsed && node.children.length > 0) {
        const visibleChildren = node.children.filter((id) => !!nodes[id])
        visibleChildren.forEach((childId, childIndex) => {
          calculatePositionsRecursive(childId, level + 1, childIndex, visibleChildren.length, x, y)
        })
      }
    }

    // Start the recursive calculation from the root
    calculatePositionsRecursive("root", 0, 0, 1)
    return positions
  }, [nodes, layout])

  // Initialize node positions
  useEffect(() => {
    const positions = calculateNodePositions()
    setNodePositions(positions)
  }, [calculateNodePositions, layout, nodes])

  // Draw function with improved logging
  const drawMindMap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas ref is null")
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Canvas context is null")
      return
    }

    // Set canvas dimensions with proper scaling for HiDPI displays
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    // Canvas dimensions should match CSS dimensions * dpr for HiDPI
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    // Scale the context to ensure correct drawing dimensions
    ctx.scale(dpr, dpr)

    // Reset CSS sizing to maintain consistent display size
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background grid for visual aid
    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 1

    const gridSize = 20 * zoom
    const offsetX = (offset.x * zoom) % gridSize
    const offsetY = (offset.y * zoom) % gridSize

    // Draw vertical grid lines
    for (let x = offsetX; x < canvas.width / dpr; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height / dpr)
      ctx.stroke()
    }

    // Draw horizontal grid lines
    for (let y = offsetY; y < canvas.height / dpr; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width / dpr, y)
      ctx.stroke()
    }

    // Calculate center of canvas for centering the mind map
    const centerX = canvas.width / (2 * dpr)
    const centerY = canvas.height / (2 * dpr)

    // Draw connections first (so they appear behind nodes)
    Object.entries(nodes).forEach(([id, node]) => {
      if (node.parentId && nodePositions[node.parentId] && nodePositions[id]) {
        // Only draw if parent isn't collapsed
        if (nodes[node.parentId] && !nodes[node.parentId].collapsed) {
          const parent = nodePositions[node.parentId]
          const current = nodePositions[id]

          const fromX = centerX + (parent.x + offset.x) * zoom
          const fromY = centerY + (parent.y + offset.y) * zoom
          const toX = centerX + (current.x + offset.x) * zoom
          const toY = centerY + (current.y + offset.y) * zoom

          // Draw connection style based on layout
          // Draw connection style based on layout with enhanced styling
          const isParentHovered = hoveredNode === node.parentId
          const isChildHovered = hoveredNode === id
          const isParentSelected = selectedNode === node.parentId
          const isChildSelected = selectedNode === id

          // Enhanced connection styling
          if (isParentHovered || isChildHovered || isParentSelected || isChildSelected) {
            ctx.strokeStyle = "rgba(99, 179, 237, 0.8)"
            ctx.lineWidth = 3 * zoom
          } else {
            ctx.strokeStyle = "rgba(99, 179, 237, 0.4)"
            ctx.lineWidth = 2 * zoom
          }

          // Different connection styles for different layouts
          if (layout === "mind-map") {
            // Curved connection for mind map
            const midX = (fromX + toX) / 2

            ctx.beginPath()
            ctx.moveTo(fromX, fromY)
            ctx.bezierCurveTo(midX, fromY, midX, toY, toX, toY)
            ctx.stroke()
          } else if (layout === "org-chart") {
            // Right-angled connection for org chart
            ctx.beginPath()
            ctx.moveTo(fromX, fromY)
            ctx.lineTo(fromX, (fromY + toY) / 2)
            ctx.lineTo(toX, (fromY + toY) / 2)
            ctx.lineTo(toX, toY)
            ctx.stroke()
          } else {
            // Default straight line for other layouts
            ctx.beginPath()
            ctx.moveTo(fromX, fromY)
            ctx.lineTo(toX, toY)
            ctx.stroke()
          }
        }
      }
    })

    // Draw nodes
    Object.entries(nodes).forEach(([id, node]) => {
      if (!nodePositions[id]) return

      const pos = nodePositions[id]
      const x = centerX + (pos.x + offset.x) * zoom
      const y = centerY + (pos.y + offset.y) * zoom

      // Prepare text measurement
      ctx.font = `${14 * zoom}px system-ui, sans-serif`
      const textWidth = ctx.measureText(node.text).width
      const padding = 20 * zoom
      const width = Math.max(100 * zoom, textWidth + padding * 2)
      const height = 40 * zoom

      // Draw node background
      // Draw node background with enhanced styling
      const isHovered = hoveredNode === id
      const isSelected = selectedNode === id

      // Add glow effect for hovered/selected nodes
      if (isHovered || isSelected) {
        ctx.shadowColor = isSelected ? "rgba(99, 179, 237, 0.8)" : "rgba(99, 179, 237, 0.5)"
        ctx.shadowBlur = 15 * zoom
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }

      // Use enhanced colors for better visual appeal
      ctx.fillStyle = isHovered || isSelected ? "rgba(99, 179, 237, 0.8)" : node.style.backgroundColor
      ctx.strokeStyle = isHovered || isSelected ? "rgba(124, 58, 237, 0.8)" : node.style.borderColor
      ctx.lineWidth = (isHovered || isSelected ? 3 : 2) * zoom

      // Draw shape based on node style
      switch (node.style.shape) {
        case "rectangle":
          ctx.beginPath()
          ctx.rect(x - width / 2, y - height / 2, width, height)
          ctx.fill()
          ctx.stroke()
          break
        case "rounded":
          const radius = 10 * zoom
          ctx.beginPath()
          ctx.moveTo(x - width / 2 + radius, y - height / 2)
          ctx.arcTo(x + width / 2, y - height / 2, x + width / 2, y + height / 2, radius)
          ctx.arcTo(x + width / 2, y + height / 2, x - width / 2, y + height / 2, radius)
          ctx.arcTo(x - width / 2, y + height / 2, x - width / 2, y - height / 2, radius)
          ctx.arcTo(x - width / 2, y - height / 2, x + width / 2, y - height / 2, radius)
          ctx.fill()
          ctx.stroke()
          break
        case "ellipse":
          ctx.beginPath()
          ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          break
        case "diamond":
          ctx.beginPath()
          ctx.moveTo(x, y - height / 2)
          ctx.lineTo(x + width / 2, y)
          ctx.lineTo(x, y + height / 2)
          ctx.lineTo(x - width / 2, y)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          break
      }

      // Highlight selected or hovered node
      if (hoveredNode === id || selectedNode === id) {
        ctx.save()
        ctx.strokeStyle = selectedNode === id ? "#f00" : "#00f"
        ctx.lineWidth = 3 * zoom
        ctx.setLineDash([5, 5])

        // Draw highlight around the node
        switch (node.style.shape) {
          case "rectangle":
          case "rounded":
            ctx.strokeRect(x - width / 2 - 5, y - height / 2 - 5, width + 10, height + 10)
            break
          case "ellipse":
            ctx.beginPath()
            ctx.ellipse(x, y, width / 2 + 5, height / 2 + 5, 0, 0, Math.PI * 2)
            ctx.stroke()
            break
          case "diamond":
            ctx.beginPath()
            ctx.moveTo(x, y - height / 2 - 10)
            ctx.lineTo(x + width / 2 + 10, y)
            ctx.lineTo(x, y + height / 2 + 10)
            ctx.lineTo(x - width / 2 - 10, y)
            ctx.closePath()
            ctx.stroke()
            break
        }
        ctx.restore()
      }

      // Draw node text with enhanced readability
      ctx.fillStyle = node.style.textColor
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = `bold ${14 * zoom}px system-ui, sans-serif`

      // Add shadow for better contrast
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
      ctx.shadowBlur = 2 * zoom
      ctx.shadowOffsetX = 1 * zoom
      ctx.shadowOffsetY = 1 * zoom

      ctx.fillText(node.text, x, y)

      // Reset shadow for other elements
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw icons if any
      if (node.icons && node.icons.length > 0) {
        const iconSize = 16 * zoom
        const spacing = 4 * zoom
        let iconX = x - (node.icons.length * iconSize + (node.icons.length - 1) * spacing) / 2

        // Draw each icon
        node.icons.forEach((iconName) => {
          ctx.fillStyle = "#fff"
          ctx.strokeStyle = "#888"
          ctx.beginPath()
          ctx.arc(iconX + iconSize / 2, y - height / 2 - iconSize / 2, iconSize / 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()

          // Placeholder for icon (we draw first letter as a simple representation)
          ctx.fillStyle = "#000"
          ctx.font = `bold ${10 * zoom}px system-ui, sans-serif`
          ctx.fillText(iconName.charAt(0), iconX + iconSize / 2, y - height / 2 - iconSize / 2)

          iconX += iconSize + spacing
        })
      }

      // Draw progress bar if node has progress
      if (node.progress !== null && node.progress !== undefined) {
        const barWidth = width * 0.8
        const barHeight = 6 * zoom
        const barX = x - barWidth / 2
        const barY = y + height / 2 + 5 * zoom

        // Bar background
        ctx.fillStyle = "rgba(0,0,0,0.1)"
        ctx.beginPath()
        ctx.rect(barX, barY, barWidth, barHeight)
        ctx.fill()

        // Bar progress
        const progressColor = node.progress >= 100 ? "#10b981" : "#3b82f6"
        ctx.fillStyle = progressColor
        ctx.beginPath()
        ctx.rect(barX, barY, barWidth * (node.progress / 100), barHeight)
        ctx.fill()
      }

      // Draw priority indicator
      if (node.priority) {
        const prioritySize = 8 * zoom
        const priorityX = x - width / 2 - prioritySize - 2 * zoom
        const priorityY = y

        let priorityColor
        switch (node.priority) {
          case "high":
            priorityColor = "#ef4444"
            break
          case "medium":
            priorityColor = "#f59e0b"
            break
          case "low":
            priorityColor = "#10b981"
            break
        }

        ctx.fillStyle = priorityColor
        ctx.beginPath()
        ctx.arc(priorityX, priorityY, prioritySize, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw collapse/expand indicator for nodes with children
      if (node.children.length > 0) {
        const indicatorSize = 10 * zoom
        const indicatorX = x + width / 2 + indicatorSize
        const indicatorY = y

        ctx.fillStyle = "#888"
        ctx.beginPath()
        ctx.arc(indicatorX, indicatorY, indicatorSize, 0, Math.PI * 2)
        ctx.fill()

        // Draw + or - symbol
        ctx.strokeStyle = "#fff"
        ctx.lineWidth = 2 * zoom

        // Horizontal line (for both + and -)
        ctx.beginPath()
        ctx.moveTo(indicatorX - indicatorSize / 2 + 2, indicatorY)
        ctx.lineTo(indicatorX + indicatorSize / 2 - 2, indicatorY)
        ctx.stroke()

        // Vertical line (only for +)
        if (node.collapsed) {
          ctx.beginPath()
          ctx.moveTo(indicatorX, indicatorY - indicatorSize / 2 + 2)
          ctx.lineTo(indicatorX, indicatorY + indicatorSize / 2 - 2)
          ctx.stroke()
        }
      }
    })

    // Draw tooltip for hovered node
    if (hoveredNode && nodePositions[hoveredNode]) {
      const node = nodes[hoveredNode]
      const pos = nodePositions[hoveredNode]
      const x = centerX + (pos.x + offset.x) * zoom
      const y = centerY + (pos.y + offset.y) * zoom

      // Prepare tooltip text
      const tooltipText = node.notes || "双击编辑节点"
      ctx.font = `${12 * zoom}px system-ui, sans-serif`
      const tooltipWidth = ctx.measureText(tooltipText).width + 20 * zoom
      const tooltipHeight = 30 * zoom

      // Draw tooltip background
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)"
      ctx.strokeStyle = "rgba(99, 179, 237, 0.4)"
      ctx.lineWidth = 1 * zoom

      const tooltipX = x - tooltipWidth / 2
      const tooltipY = y - 60 * zoom

      // Rounded rectangle for tooltip
      const radius = 5 * zoom
      ctx.beginPath()
      ctx.moveTo(tooltipX + radius, tooltipY)
      ctx.lineTo(tooltipX + tooltipWidth - radius, tooltipY)
      ctx.quadraticCurveTo(tooltipX + tooltipWidth, tooltipY, tooltipX + tooltipWidth, tooltipY + radius)
      ctx.lineTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight - radius)
      ctx.quadraticCurveTo(
        tooltipX + tooltipWidth,
        tooltipY + tooltipHeight,
        tooltipX + tooltipWidth - radius,
        tooltipY + tooltipHeight,
      )

      // Draw tooltip pointer
      ctx.lineTo(tooltipX + tooltipWidth / 2 + 10 * zoom, tooltipY + tooltipHeight)
      ctx.lineTo(tooltipX + tooltipWidth / 2, tooltipY + tooltipHeight + 10 * zoom)
      ctx.lineTo(tooltipX + tooltipWidth / 2 - 10 * zoom, tooltipY + tooltipHeight)

      ctx.lineTo(tooltipX + radius, tooltipY + tooltipHeight)
      ctx.quadraticCurveTo(tooltipX, tooltipY + tooltipHeight, tooltipX, tooltipY + tooltipHeight - radius)
      ctx.lineTo(tooltipX, tooltipY + radius)
      ctx.quadraticCurveTo(tooltipX, tooltipY, tooltipX + radius, tooltipY)
      ctx.closePath()

      ctx.fill()
      ctx.stroke()

      // Draw tooltip text
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(tooltipText, x, tooltipY + tooltipHeight / 2)
    }

    // Set flag for successful initialization
    if (!canvasInitialized) {
      setCanvasInitialized(true)
    }
  }, [nodes, nodePositions, hoveredNode, selectedNode, zoom, offset, layout, canvasInitialized])

  // Initial mounting and resize handling
  useEffect(() => {
    // Function to handle resize events
    const handleResize = () => {
      // Ensure canvas fills its container
      if (canvasRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        canvasRef.current.width = rect.width
        canvasRef.current.height = rect.height
        canvasRef.current.style.width = `${rect.width}px`
        canvasRef.current.style.height = `${rect.height}px`

        // Redraw after resize
        drawMindMap()
      }
    }

    // Ensure canvas is properly sized initially
    handleResize()

    // Add resize event listener
    window.addEventListener("resize", handleResize)

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [drawMindMap])

  // Redraw on position changes
  useEffect(() => {
    drawMindMap()
  }, [drawMindMap, renderTrigger])

  // Force periodic re-renders during initialization to ensure display
  useEffect(() => {
    if (!canvasInitialized) {
      const initialRenderTimer = setInterval(() => {
        setRenderTrigger((prev) => prev + 1)
      }, 100)

      // Stop forcing renders once initialized
      if (canvasInitialized) {
        clearInterval(initialRenderTimer)
      }

      // Cleanup interval on unmount
      return () => clearInterval(initialRenderTimer)
    }
  }, [canvasInitialized])

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    // Hide context menu on mouse down
    setShowContextMenu(false)

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    if (tool === "pan") {
      setIsDragging(true)
      setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    } else if (tool === "select") {
      // Check for node selection
      const clickedNode = getNodeAtPosition(mouseX, mouseY)
      setSelectedNode(clickedNode)

      // Handle double click for editing
      if (clickedNode && e.detail === 2) {
        const node = nodes[clickedNode]
        setEditingNodeText(node.text)
        setEditingNodeNotes(node.notes || "")
        setIsEditingNode(true)
        e.preventDefault() // 防止双击选中文本
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    if (isDragging) {
      setOffset({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      })
    } else if (tool === "select") {
      // Update hover state
      const nodeUnderMouse = getNodeAtPosition(mouseX, mouseY)
      setHoveredNode(nodeUnderMouse)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setHoveredNode(null)
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const nodeId = getNodeAtPosition(mouseX, mouseY)

    if (nodeId) {
      setContextMenuNodeId(nodeId)
      setContextMenuPosition({ x: e.clientX, y: e.clientY })
      setShowContextMenu(true)
    } else {
      setShowContextMenu(false)
    }
  }

  // Helper function to find a node at given position
  const getNodeAtPosition = (mouseX: number, mouseY: number): string | null => {
    if (!canvasRef.current) return null

    const canvas = canvasRef.current
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    for (const [id, pos] of Object.entries(nodePositions)) {
      const node = nodes[id]
      const x = centerX + (pos.x + offset.x) * zoom
      const y = centerY + (pos.y + offset.y) * zoom

      // Approximate node dimensions
      const width = 120 * zoom
      const height = 40 * zoom

      // Check if mouse is within node bounds (simple rectangle check)
      if (mouseX >= x - width / 2 && mouseX <= x + width / 2 && mouseY >= y - height / 2 && mouseY <= y + height / 2) {
        return id
      }
    }

    return null
  }

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Node operations
  const handleAddNode = () => {
    if (!newNodeParentId) return

    // Generate unique ID
    const newId = `node_${Date.now()}`

    // Create new node
    const newNode: MindMapNode = {
      id: newId,
      text: newNodeText || "新节点",
      parentId: newNodeParentId,
      children: [],
      collapsed: false,
      notes: "",
      style: {
        backgroundColor: "hsl(var(--accent))",
        textColor: "hsl(var(--accent-foreground))",
        borderColor: "hsl(var(--accent))",
        shape: "rounded",
      },
      tags: [],
      priority: null,
      progress: null,
      icons: [],
    }

    // Update nodes state with new node
    setNodes((prev) => ({
      ...prev,
      [newId]: newNode,
      [newNodeParentId]: {
        ...prev[newNodeParentId],
        children: [...prev[newNodeParentId].children, newId],
      },
    }))

    // Update history
    setHistory((prev) => ({
      nodes: [
        ...prev.nodes.slice(0, historyIndex + 1),
        {
          ...nodes,
          [newId]: newNode,
          [newNodeParentId]: {
            ...nodes[newNodeParentId],
            children: [...nodes[newNodeParentId].children, newId],
          },
        },
      ],
    }))
    setHistoryIndex((prev) => prev + 1)

    // Close dialog and select new node
    setShowNodeDialog(false)
    setSelectedNode(newId)

    toast({
      title: "节点已添加",
      description: "新节点已成功添加到思维导图中。",
      variant: "default",
    })
  }

  const handleUpdateNode = () => {
    if (!selectedNode) return

    // Update node text and notes
    setNodes((prev) => ({
      ...prev,
      [selectedNode]: {
        ...prev[selectedNode],
        text: editingNodeText,
        notes: editingNodeNotes,
      },
    }))

    // Update history
    setHistory((prev) => ({
      nodes: [
        ...prev.nodes.slice(0, historyIndex + 1),
        {
          ...nodes,
          [selectedNode]: {
            ...nodes[selectedNode],
            text: editingNodeText,
            notes: editingNodeNotes,
          },
        },
      ],
    }))
    setHistoryIndex((prev) => prev + 1)

    // Close edit dialog
    setIsEditingNode(false)

    toast({
      title: "节点已更新",
      description: "节点内容已成功更新。",
      variant: "default",
    })
  }

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === "root") {
      toast({
        title: "无法删除根节点",
        description: "根节点不能被删除。",
        variant: "destructive",
      })
      return
    }

    const node = nodes[nodeId]
    if (!node) return

    // Recursive function to get all descendant node IDs
    const getDescendantIds = (id: string): string[] => {
      const node = nodes[id]
      if (!node || !node.children.length) return [id]

      return [id, ...node.children.flatMap((childId) => getDescendantIds(childId))]
    }

    // Get all nodes to delete
    const nodesToDelete = getDescendantIds(nodeId)

    // Create new nodes object without the deleted nodes
    const newNodes = { ...nodes }
    nodesToDelete.forEach((id) => {
      delete newNodes[id]
    })

    // Update parent's children array
    if (node.parentId && newNodes[node.parentId]) {
      newNodes[node.parentId] = {
        ...newNodes[node.parentId],
        children: newNodes[node.parentId].children.filter((id) => id !== nodeId),
      }
    }

    // Update nodes state
    setNodes(newNodes)

    // Update history
    setHistory((prev) => ({
      nodes: [...prev.nodes.slice(0, historyIndex + 1), newNodes],
    }))
    setHistoryIndex((prev) => prev + 1)

    // Clear selection if the selected node was deleted
    if (selectedNode === nodeId || nodesToDelete.includes(selectedNode || "")) {
      setSelectedNode(null)
    }

    toast({
      title: "节点已删除",
      description: `已删除节点及其子节点（共 ${nodesToDelete.length} 个）。`,
      variant: "default",
    })
  }

  const handleCollapseToggle = (nodeId: string) => {
    if (!nodes[nodeId]) return

    setNodes((prev) => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        collapsed: !prev[nodeId].collapsed,
      },
    }))

    // Update history
    setHistory((prev) => ({
      nodes: [
        ...prev.nodes.slice(0, historyIndex + 1),
        {
          ...nodes,
          [nodeId]: {
            ...nodes[nodeId],
            collapsed: !nodes[nodeId].collapsed,
          },
        },
      ],
    }))
    setHistoryIndex((prev) => prev + 1)
  }

  // Export functionality
  const handleExport = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current

    switch (exportFormat) {
      case "png":
        // Export as PNG
        canvas.toBlob((blob) => {
          if (blob) {
            FileSaver.saveAs(blob, "思维导图.png")
            toast({
              title: "导出成功",
              description: "思维导图已导出为PNG格式。",
              variant: "default",
            })
          }
        })
        break

      case "xmind":
        try {
          // Create XMind file structure
          const zip = new JSZip()

          // Add content.xml
          const contentXml = generateXMindContent()
          zip.file("content.xml", contentXml)

          // Add meta.xml
          const metaXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<meta xmlns="urn:xmind:xmap:xmlns:meta:2.0" version="2.0">
  <Creator>
    <Name>AI测试用例生成器</Name>
    <Version>1.0</Version>
  </Creator>
  <Create>
    <Time>${new Date().toISOString()}</Time>
  </Create>
</meta>`
          zip.file("meta.xml", metaXml)

          // Add styles.xml
          const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xmap-styles xmlns="urn:xmind:xmap:xmlns:style:2.0" xmlns:fo="http://www.w3.org/1999/XSL/Format" version="2.0">
  <styles>
    <style id="default" name="默认" type="topic">
      <topic-properties border-line-color="#2D70B3" border-line-width="1pt" fo:fontFamily="Microsoft YaHei" fo:fontSize="10pt" fo:fontStyle="normal" fo:fontWeight="normal" fo:textDecoration="none" line-class="org.xmind.branchConnection.curve" line-color="#2D70B3" line-width="1pt" shape-class="org.xmind.topicShape.roundedRect" svg:fill="#EDF5FE" svg:opacity="100%" text-align="center"/>
    </style>
  </styles>
</xmap-styles>`
          zip.file("styles.xml", stylesXml)

          // Add manifest.xml
          zip.file(
            "META-INF/manifest.xml",
            `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<manifest xmlns="urn:xmind:xmap:xmlns:manifest:1.0">
  <file-entry full-path="content.xml" media-type="text/xml"/>
  <file-entry full-path="meta.xml" media-type="text/xml"/>
  <file-entry full-path="styles.xml" media-type="text/xml"/>
</manifest>`,
          )

          // Generate and download zip
          zip.generateAsync({ type: "blob" }).then((content) => {
            FileSaver.saveAs(content, "思维导图.xmind")
            toast({
              title: "导出成功",
              description: "思维导图已导出为XMind格式。",
              variant: "default",
            })
          })
        } catch (err) {
          console.error("XMind export error:", err)
          toast({
            title: "导出失败",
            description: "导出XMind格式时发生错误。",
            variant: "destructive",
          })
        }
        break
    }
  }

  // Helper to generate XMind content XML
  const generateXMindContent = () => {
    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:svg="http://www.w3.org/2000/svg" version="2.0">
  <sheet id="1">
    <topic id="root">
      <title>${escapeXml(nodes.root.text)}</title>`

    // Add children recursively
    function addChildrenXml(nodeId: string, indent: number) {
      const node = nodes[nodeId]
      if (!node.children.length) return ""

      const spaces = " ".repeat(indent)
      let childrenXml = `\n${spaces}<children>`
      childrenXml += `\n${spaces}  <topics type="attached">`

      for (const childId of node.children) {
        const child = nodes[childId]
        if (!child) continue

        childrenXml += `\n${spaces}    <topic id="${childId}">`
        childrenXml += `\n${spaces}      <title>${escapeXml(child.text)}</title>`

        // Add notes if present
        if (child.notes) {
          childrenXml += `\n${spaces}      <notes><plain>${escapeXml(child.notes)}</plain></notes>`
        }

        // Add markers for priority and progress
        if (child.priority || child.progress !== null) {
          childrenXml += `\n${spaces}      <markers>`

          if (child.priority) {
            const priorityValue = child.priority === "high" ? "1" : child.priority === "medium" ? "2" : "3"
            childrenXml += `\n${spaces}        <marker-ref marker-id="priority-${priorityValue}"/>`
          }

          if (child.progress !== null) {
            const progressValue = Math.floor(child.progress / 25)
            childrenXml += `\n${spaces}        <marker-ref marker-id="task-${progressValue}"/>`
          }

          childrenXml += `\n${spaces}      </markers>`
        }

        // Add this node's children
        childrenXml += addChildrenXml(childId, indent + 6)

        childrenXml += `\n${spaces}    </topic>`
      }

      childrenXml += `\n${spaces}  </topics>`
      childrenXml += `\n${spaces}</children>`

      return childrenXml
    }

    // Add root's children
    xml += addChildrenXml("root", 6)

    // Close main elements
    xml += `
    </topic>
    <title>思维导图</title>
  </sheet>
</xmap-content>`

    return xml
  }

  // Helper to escape XML special chars
  const escapeXml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
  }

  // Handle layout change
  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout)
    setShowLayoutDialog(false)
    toast({
      title: "布局已更新",
      description: `思维导图布局已更改为${getLayoutName(newLayout)}。`,
      variant: "default",
    })
  }

  // Get layout name in Chinese
  const getLayoutName = (layout: LayoutType): string => {
    switch (layout) {
      case "mind-map":
        return "思维导图"
      case "org-chart":
        return "组织结构图"
      case "fishbone":
        return "鱼骨图"
      case "timeline":
        return "时间线"
      case "logic":
        return "逻辑图"
      default:
        return "思维导图"
    }
  }

  // 添加事件监听器以响应外部编辑请求
  useEffect(() => {
    const handleEditRequest = (e: MouseEvent) => {
      // 如果点击了canvas，尝试选择根节点
      if (e.target instanceof HTMLCanvasElement) {
        setSelectedNode("root")
        setTool("select")
      }
    }

    // 将事件监听器添加到canvas元素
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener("click", handleEditRequest)
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("click", handleEditRequest)
      }
    }
  }, [])

  return (
    <div
      className={cn(
        "w-full h-full border rounded-md bg-blue-900/10 backdrop-blur-md border-blue-500/20 flex flex-col",
        isFullscreen ? "fixed inset-0 z-50" : "relative",
      )}
      ref={containerRef}
      style={{ minHeight: "600px", height: "100%" }}
    >
      {/* Simplified Toolbar */}
      <div className="border-b border-blue-500/20 bg-blue-900/30 flex items-center justify-between p-2">
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "select" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setTool("select")}
                  className="hover:bg-blue-900/30 hover:text-blue-400 h-8 w-8 p-0"
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>选择工具</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "pan" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setTool("pan")}
                  className="hover:bg-blue-900/30 hover:text-blue-400 h-8 w-8 p-0"
                >
                  <Hand className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>平移工具</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setTool("add")
                    setNewNodeParentId(selectedNode || "root")
                    setNewNodeText("")
                    setShowNodeDialog(true)
                  }}
                  className="hover:bg-blue-900/30 hover:text-blue-400 h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>添加节点</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="h-4 mx-1 border-r border-blue-500/20"></div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  className="hover:bg-blue-900/30 hover:text-blue-400 h-8 w-8 p-0"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>缩小</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-blue-100/70 w-12 text-center text-xs">{Math.round(zoom * 100)}%</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  className="hover:bg-blue-900/30 hover:text-blue-400 h-8 w-8 p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>放大</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResetZoom}
                  className="hover:bg-blue-900/30 hover:text-blue-400 h-8 w-8 p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>重置视图</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-blue-900/30 hover:text-blue-400 h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-blue-900/80 backdrop-blur-md border-blue-500/20 text-blue-100"
            >
              <DropdownMenuLabel>布局选项</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleLayoutChange("mind-map")}>
                思维导图 {layout === "mind-map" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLayoutChange("org-chart")}>
                组织结构图 {layout === "org-chart" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLayoutChange("fishbone")}>
                鱼骨图 {layout === "fishbone" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLayoutChange("timeline")}>
                时间线 {layout === "timeline" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLayoutChange("logic")}>
                逻辑图 {layout === "logic" && "✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowExportDialog(true)}
                  className="hover:bg-blue-900/30 hover:text-blue-400 h-8 w-8 p-0"
                >
                  <FileDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>导出思维导图</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="hover:bg-blue-900/30 hover:text-blue-400 h-8 w-8 p-0"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? "退出全屏" : "全屏模式"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 relative w-full h-full overflow-hidden" style={{ minHeight: "500px" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full absolute inset-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onContextMenu={handleContextMenu}
          style={{
            cursor: tool === "select" ? "default" : tool === "pan" ? (isDragging ? "grabbing" : "grab") : "crosshair",
            background: "#0f172a",
          }}
        />

        {/* Quick action buttons for selected node */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 bg-blue-900/70 backdrop-blur-sm p-2 rounded-md border border-blue-500/20 flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const node = nodes[selectedNode]
                      setEditingNodeText(node.text)
                      setEditingNodeNotes(node.notes || "")
                      setIsEditingNode(true)
                    }}
                    className="h-8 w-8 p-0 hover:bg-blue-800/50"
                  >
                    <Edit className="h-4 w-4 text-blue-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>编辑节点</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setTool("add")
                      setNewNodeParentId(selectedNode)
                      setNewNodeText("")
                      setShowNodeDialog(true)
                    }}
                    className="h-8 w-8 p-0 hover:bg-blue-800/50"
                  >
                    <Plus className="h-4 w-4 text-blue-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>添加子节点</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {nodes[selectedNode]?.children.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCollapseToggle(selectedNode)}
                      className="h-8 w-8 p-0 hover:bg-blue-800/50"
                    >
                      {nodes[selectedNode]?.collapsed ? (
                        <ZoomIn className="h-4 w-4 text-blue-300" />
                      ) : (
                        <ZoomOut className="h-4 w-4 text-blue-300" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{nodes[selectedNode]?.collapsed ? "展开子节点" : "折叠子节点"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {selectedNode !== "root" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setNodeToDelete(selectedNode)
                        setShowDeleteConfirm(true)
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-900/50"
                    >
                      <Trash2 className="h-4 w-4 text-red-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>删除节点</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        {/* Help text */}
        <div className="absolute bottom-4 left-4 bg-blue-900/30 backdrop-blur-sm p-2 rounded-md border border-blue-500/20 text-xs text-blue-100/70">
          <p>提示: 右键点击节点可以打开上下文菜单，双击节点可以编辑</p>
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && contextMenuNodeId && (
        <div
          className="fixed z-50 bg-blue-900/90 backdrop-blur-md border border-blue-500/30 rounded-md shadow-lg py-1 w-48"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-blue-800/50"
            onClick={() => {
              const node = nodes[contextMenuNodeId]
              setEditingNodeText(node.text)
              setEditingNodeNotes(node.notes || "")
              setIsEditingNode(true)
              setShowContextMenu(false)
            }}
          >
            <Edit className="h-4 w-4 inline-block mr-2" /> 编辑节点
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-blue-800/50"
            onClick={() => {
              setTool("add")
              setNewNodeParentId(contextMenuNodeId)
              setNewNodeText("")
              setShowNodeDialog(true)
              setShowContextMenu(false)
            }}
          >
            <Plus className="h-4 w-4 inline-block mr-2" /> 添加子节点
          </button>
          {nodes[contextMenuNodeId]?.children.length > 0 && (
            <button
              className="w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-blue-800/50"
              onClick={() => {
                handleCollapseToggle(contextMenuNodeId)
                setShowContextMenu(false)
              }}
            >
              {nodes[contextMenuNodeId]?.collapsed ? (
                <>
                  <ZoomIn className="h-4 w-4 inline-block mr-2" /> 展开子节点
                </>
              ) : (
                <>
                  <ZoomOut className="h-4 w-4 inline-block mr-2" /> 折叠子节点
                </>
              )}
            </button>
          )}
          {contextMenuNodeId !== "root" && (
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-900/50"
              onClick={() => {
                setNodeToDelete(contextMenuNodeId)
                setShowDeleteConfirm(true)
                setShowContextMenu(false)
              }}
            >
              <Trash2 className="h-4 w-4 inline-block mr-2" /> 删除节点
            </button>
          )}
        </div>
      )}

      {/* Edit node dialog */}
      <Dialog open={isEditingNode} onOpenChange={setIsEditingNode}>
        <DialogContent className="sm:max-w-[400px] bg-blue-900/80 backdrop-blur-md border-blue-500/20 text-blue-100">
          <DialogHeader>
            <DialogTitle className="text-blue-400">编辑节点</DialogTitle>
            <DialogDescription className="text-blue-100/70">修改节点的文本和备注信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="node-text" className="text-blue-100">
                节点文本
              </Label>
              <Input
                id="node-text"
                value={editingNodeText}
                onChange={(e) => setEditingNodeText(e.target.value)}
                className="bg-blue-900/30 border-blue-500/20 text-blue-100"
                placeholder="输入节点文本"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-notes" className="text-blue-100">
                备注
              </Label>
              <Textarea
                id="node-notes"
                value={editingNodeNotes}
                onChange={(e) => setEditingNodeNotes(e.target.value)}
                rows={4}
                className="bg-blue-900/30 border-blue-500/20 text-blue-100"
                placeholder="输入节点备注信息"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingNode(false)}>
              取消
            </Button>
            <Button
              onClick={handleUpdateNode}
              className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[400px] bg-blue-900/80 backdrop-blur-md border-blue-500/20 text-blue-100">
          <DialogHeader>
            <DialogTitle className="text-blue-400">导出思维导图</DialogTitle>
            <DialogDescription className="text-blue-100/70">选择导出格式</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">导出格式</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format" className="bg-blue-900/30 border-blue-500/20 text-blue-100">
                  <SelectValue placeholder="选择格式" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900/80 backdrop-blur-md">
                  <SelectItem value="png">PNG 图片</SelectItem>
                  <SelectItem value="xmind">XMind 文件</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleExport}
              className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              导出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add new node dialog */}
      <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
        <DialogContent className="sm:max-w-[400px] bg-blue-900/80 backdrop-blur-md border-blue-500/20 text-blue-100">
          <DialogHeader>
            <DialogTitle className="text-blue-400">添加新节点</DialogTitle>
            <DialogDescription className="text-blue-100/70">创建新的思维导图节点</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="parent-node" className="text-blue-100">
                父节点
              </Label>
              <Select value={newNodeParentId || "root"} onValueChange={(value) => setNewNodeParentId(value)}>
                <SelectTrigger id="parent-node" className="bg-blue-900/30 border-blue-500/20 text-blue-100">
                  <SelectValue placeholder="选择父节点" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900/80 backdrop-blur-md text-blue-100">
                  {Object.entries(nodes).map(([id, node]) => (
                    <SelectItem key={id} value={id}>
                      {node.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-node-text" className="text-blue-100">
                节点文本
              </Label>
              <Input
                id="new-node-text"
                value={newNodeText}
                onChange={(e) => setNewNodeText(e.target.value)}
                className="bg-blue-900/30 border-blue-500/20 text-blue-100"
                placeholder="输入新节点文本"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNodeDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleAddNode}
              className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              添加节点
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px] bg-blue-900/80 backdrop-blur-md border-blue-500/20 text-blue-100">
          <DialogHeader>
            <DialogTitle className="text-red-400">确认删除</DialogTitle>
            <DialogDescription className="text-blue-100/70">
              确定要删除此节点及其所有子节点吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (nodeToDelete) {
                  handleDeleteNode(nodeToDelete)
                  setNodeToDelete(null)
                  setShowDeleteConfirm(false)
                }
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

