"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Save, X, ArrowUpDown, Search, FileDown, FileUp, PenLine } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
  DialogOverlay
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import FileSaver from "file-saver"
import * as XLSX from "xlsx"
import { TestCase } from "@/types/test-case"
// 移除后端服务导入
// import { fetchTestCases, createTestCase, updateTestCaseById, deleteTestCaseById, deleteMultipleTestCases } from "@/services/test-case-service"

// 模拟初始测试用例数据
const initialTestCases: TestCase[] = [
  {
    id: 1,
    testId: "TC-001",
    description: "验证用户使用有效凭据登录",
    preconditions: "系统中存在用户账户",
    steps: "1. 导航到登录页面\n2. 输入有效用户名\n3. 输入有效密码\n4. 点击登录按钮",
    expectedResult: "用户成功登录并重定向到仪表板",
    priority: "高",
    status: "通过"
  },
  {
    id: 2,
    testId: "TC-002",
    description: "验证用户使用无效凭据登录",
    preconditions: "系统中存在用户账户",
    steps: "1. 导航到登录页面\n2. 输入无效用户名或密码\n3. 点击登录按钮",
    expectedResult: "显示错误消息，用户无法登录",
    priority: "高",
    status: "通过"
  },
  {
    id: 3,
    testId: "TC-003",
    description: "验证用户密码重置功能",
    preconditions: "系统中存在用户账户",
    steps: "1. 导航到登录页面\n2. 点击忘记密码链接\n3. 输入注册邮箱\n4. 点击发送重置链接按钮",
    expectedResult: "重置密码链接发送到用户邮箱",
    priority: "中",
    status: "未测试"
  }
]

export default function TestCaseTable() {
  const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases)
  const [loading, setLoading] = useState(false) // 修改为默认false
  const [editMode, setEditMode] = useState<Record<number, boolean>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [selectedTestCases, setSelectedTestCases] = useState<number[]>([])
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [newTestCase, setNewTestCase] = useState({
    testId: "",
    description: "",
    preconditions: "",
    steps: "",
    expectedResult: "",
    priority: "中",
    status: "未测试",
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  // 获取测试用例数据
  useEffect(() => {
    const getTestCases = async () => {
      try {
        setLoading(true)
        // 尝试从服务器获取数据，如果失败则使用本地数据
        try {
          const data = await fetchTestCases()
          setTestCases(data)
        } catch (error) {
          console.warn("无法从服务器获取数据，使用本地数据")
          // 如果本地没有数据，则初始化一些示例数据
          if (testCases.length === 0) {
            setTestCases([
              {
                id: 1,
                testId: "TC-001",
                description: "验证用户登录功能",
                preconditions: "系统中存在有效用户账号",
                steps: "1. 打开登录页面\n2. 输入有效用户名和密码\n3. 点击登录按钮",
                expectedResult: "用户成功登录系统，跳转到首页",
                priority: "高",
                status: "通过"
              },
              {
                id: 2,
                testId: "TC-002",
                description: "验证无效用户登录",
                preconditions: "系统中不存在该用户账号",
                steps: "1. 打开登录页面\n2. 输入无效用户名和密码\n3. 点击登录按钮",
                expectedResult: "系统显示错误信息，提示用户名或密码错误",
                priority: "中",
                status: "通过"
              }
            ])
          }
        }
      } finally {
        setLoading(false)
      }
    }

    getTestCases()
  }, [])

  const toggleEditMode = (id: number) => {
    setEditMode((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // 移除 async 关键字
  const updateTestCase = (id: number, field: string, value: string) => {
  // 在本地更新
  const updatedTestCases = testCases.map((tc) => 
    tc.id === id ? { ...tc, [field]: value } : tc
  )
  setTestCases(updatedTestCases)
  
  // 如果是编辑模式结束，显示提示
  if (field === "_editComplete") {
    toast({
      title: "测试用例已更新",
      description: "测试用例已成功更新。",
      variant: "default",
    })
  }
  }

  const addNewTestCase = () => {
    // 生成新的ID
    const maxId = Math.max(...testCases.map(tc => tc.id), 0)
    const newId = maxId + 1
    
    // 创建新测试用例对象
    const testCaseToAdd = {
      id: newId,
      testId: newTestCase.testId || `TC-${String(newId).padStart(3, '0')}`,
      description: newTestCase.description,
      preconditions: newTestCase.preconditions,
      steps: newTestCase.steps,
      expectedResult: newTestCase.expectedResult,
      priority: newTestCase.priority,
      status: newTestCase.status,
    }

    // 直接更新状态
    setTestCases([...testCases, testCaseToAdd])
    setIsAddDialogOpen(false)

    // 重置表单
    setNewTestCase({
      testId: "",
      description: "",
      preconditions: "",
      steps: "",
      expectedResult: "",
      priority: "中",
      status: "未测试",
    })

    toast({
      title: "测试用例已添加",
      description: "新的测试用例已成功添加到列表中。",
      variant: "default",
    })
  }

  const deleteTestCase = (id: number) => {
    setTestCases((prev) => prev.filter((tc) => tc.id !== id))
    toast({
      title: "测试用例已删除",
      description: "测试用例已从列表中移除。",
      variant: "default",
    })
  }

  const deleteSelectedTestCases = () => {
    setTestCases((prev) => prev.filter((tc) => !selectedTestCases.includes(tc.id)))
    setSelectedTestCases([])
    toast({
      title: "批量删除完成",
      description: `已删除 ${selectedTestCases.length} 个测试用例。`,
      variant: "default",
    })
  }

  const toggleSelectAll = () => {
    if (selectedTestCases.length === filteredTestCases.length) {
      setSelectedTestCases([])
    } else {
      setSelectedTestCases(filteredTestCases.map((tc) => tc.id))
    }
  }

  const toggleSelectTestCase = (id: number) => {
    setSelectedTestCases((prev) => (prev.includes(id) ? prev.filter((tcId) => tcId !== id) : [...prev, id]))
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filter and sort test cases
  let filteredTestCases = testCases.filter((tc) => {
    const matchesSearch =
      searchTerm === "" ||
      tc.testId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === null || tc.status === statusFilter
    const matchesPriority = priorityFilter === null || tc.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Sort test cases
  if (sortField) {
    filteredTestCases = [...filteredTestCases].sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a]
      const fieldB = b[sortField as keyof typeof b]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }

  // 保留导出Excel功能
  const exportToExcel = () => {
    // 创建工作簿
    const workbook = XLSX.utils.book_new()

    // 准备数据
    const data = testCases.map((tc) => ({
      测试ID: tc.testId,
      描述: tc.description,
      前置条件: tc.preconditions,
      测试步骤: tc.steps,
      预期结果: tc.expectedResult,
      优先级: tc.priority,
      状态: tc.status,
    }))

    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(data)

    // 设置列宽
    const colWidths = [
      { wch: 10 }, // 测试ID
      { wch: 30 }, // 描述
      { wch: 25 }, // 前置条件
      { wch: 40 }, // 测试步骤
      { wch: 30 }, // 预期结果
      { wch: 10 }, // 优先级
      { wch: 10 }, // 状态
    ]
    worksheet["!cols"] = colWidths

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, "测试用例")

    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    FileSaver.saveAs(blob, "测试用例.xlsx")

    toast({
      title: "导出成功",
      description: "测试用例已成功导出为Excel文件。",
      variant: "default",
    })
  }

  // 保留导入Excel功能
  const importFromExcel = () => {
    // 创建文件输入元素
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".xlsx, .xls"
    fileInput.style.display = "none"
    document.body.appendChild(fileInput)

    // 监听文件选择
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]

      if (file) {
        const reader = new FileReader()

        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })

          // 获取第一个工作表
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]

          // 转换为JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          // 转换为测试用例格式
          const importedTestCases = jsonData.map((row: any, index) => ({
            id: Math.max(...testCases.map((tc) => tc.id), 0) + index + 1,
            testId: row["测试ID"] || `TC-00${index + 1}`,
            description: row["描述"] || "",
            preconditions: row["前置条件"] || "",
            steps: row["测试步骤"] || "",
            expectedResult: row["预期结果"] || "",
            priority: row["优先级"] || "中",
            status: row["状态"] || "未测试",
          }))

          // 更新测试用例
          setTestCases([...testCases, ...importedTestCases])

          toast({
            title: "导入成功",
            description: `已导入 ${importedTestCases.length} 个测试用例。`,
            variant: "default",
          })
        }

        reader.readAsArrayBuffer(file)
      }

      // 清理
      document.body.removeChild(fileInput)
    }

    // 触发文件选择
    fileInput.click()
  }

  // 添加事件监听器以响应导出请求
  useEffect(() => {
    const handleExportRequest = () => {
      exportToExcel()
    }

    window.addEventListener("export-test-cases", handleExportRequest)

    return () => {
      window.removeEventListener("export-test-cases", handleExportRequest)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-400" />
            <Input
              placeholder="搜索测试用例..."
              className="pl-8 w-[250px] tech-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
            <SelectTrigger className="w-[130px] tech-input">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent className="bg-blue-950/90 backdrop-blur-md text-white">
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value="通过">通过</SelectItem>
              <SelectItem value="失败">失败</SelectItem>
              <SelectItem value="未测试">未测试</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter || "all"} onValueChange={(value) => setPriorityFilter(value === "all" ? null : value)}>
            <SelectTrigger className="w-[130px] tech-input">
              <SelectValue placeholder="优先级筛选" />
            </SelectTrigger>
            <SelectContent className="bg-blue-950/90 backdrop-blur-md text-white">
              <SelectItem value="all">所有优先级</SelectItem>
              <SelectItem value="高">高</SelectItem>
              <SelectItem value="中">中</SelectItem>
              <SelectItem value="低">低</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1 tech-button-primary">
                <Plus className="h-4 w-4" />
                添加测试用例
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay className="fixed inset-0 bg-blue-950/30 backdrop-blur-sm z-40" />
              <DialogContent 
                className="fixed top-[5%] left-1/2 z-[100] sm:max-w-[600px] w-[95%] tech-card border-0 bg-blue-950/90 backdrop-blur-md text-white max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl border border-blue-500/30 p-6"
                style={{ 
                  marginTop: 0, 
                  transform: 'translateX(-50%)', 
                  transition: 'none',
                  position: 'fixed',
                  animation: 'none',
                  pointerEvents: 'auto'
                }}
              >
                <DialogHeader>
                  <DialogTitle className="text-gradient-blue">添加新测试用例</DialogTitle>
                  <DialogDescription className="text-blue-200/70">填写以下表单添加新的测试用例到列表中</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="testId" className="text-white">
                        测试用例ID
                      </Label>
                      <Input
                        id="testId"
                        placeholder="TC-XXX"
                        value={newTestCase.testId}
                        onChange={(e) => setNewTestCase({ ...newTestCase, testId: e.target.value })}
                        className="tech-input relative z-[101]"
                        style={{ pointerEvents: 'auto' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-white">
                        优先级
                      </Label>
                      <Select
                        value={newTestCase.priority}
                        onValueChange={(value) => setNewTestCase({ ...newTestCase, priority: value })}
                      >
                        <SelectTrigger id="priority" className="tech-input relative z-[101]" style={{ pointerEvents: 'auto' }}>
                          <SelectValue placeholder="选择优先级" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-950/90 backdrop-blur-md text-white z-[102]">
                          <SelectItem value="高">高</SelectItem>
                          <SelectItem value="中">中</SelectItem>
                          <SelectItem value="低">低</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">
                      描述
                    </Label>
                    <Input
                      id="description"
                      placeholder="测试用例描述"
                      value={newTestCase.description}
                      onChange={(e) => setNewTestCase({ ...newTestCase, description: e.target.value })}
                      className="tech-input relative z-[101]"
                      style={{ pointerEvents: 'auto' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preconditions" className="text-white">
                      前置条件
                    </Label>
                    <Input
                      id="preconditions"
                      placeholder="测试前置条件"
                      value={newTestCase.preconditions}
                      onChange={(e) => setNewTestCase({ ...newTestCase, preconditions: e.target.value })}
                      className="tech-input relative z-[101]"
                      style={{ pointerEvents: 'auto' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="steps" className="text-white">
                      测试步骤
                    </Label>
                    <Textarea
                      id="steps"
                      placeholder="1. 步骤一&#10;2. 步骤二&#10;3. 步骤三"
                      className="min-h-[100px] tech-input relative z-[101]"
                      style={{ pointerEvents: 'auto' }}
                      value={newTestCase.steps}
                      onChange={(e) => setNewTestCase({ ...newTestCase, steps: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedResult" className="text-white">
                      预期结果
                    </Label>
                    <Textarea
                      id="expectedResult"
                      placeholder="测试的预期结果"
                      className="tech-input relative z-[101]"
                      style={{ pointerEvents: 'auto' }}
                      value={newTestCase.expectedResult}
                      onChange={(e) => setNewTestCase({ ...newTestCase, expectedResult: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-white">
                      状态
                    </Label>
                    <Select
                      value={newTestCase.status}
                      onValueChange={(value) => setNewTestCase({ ...newTestCase, status: value })}
                    >
                      <SelectTrigger id="status" className="tech-input relative z-[101]" style={{ pointerEvents: 'auto' }}>
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-950/90 backdrop-blur-md text-white z-[102]">
                        <SelectItem value="通过">通过</SelectItem>
                        <SelectItem value="失败">失败</SelectItem>
                        <SelectItem value="未测试">未测试</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="tech-button-outline relative z-[101]" style={{ pointerEvents: 'auto' }}>
                    取消
                  </Button>
                  <Button onClick={addNewTestCase} className="tech-button-primary relative z-[101]" style={{ pointerEvents: 'auto' }}>
                    添加测试用例
                  </Button>
                </DialogFooter>
              </DialogContent>
            </DialogPortal>
          </Dialog>
          
          {selectedTestCases.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteSelectedTestCases}
              className="gap-1 secondary-button"
            >
              <Trash2 className="h-4 w-4" />
              删除选中 ({selectedTestCases.length})
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-1 tech-button-outline">
            <FileDown className="h-4 w-4" />
            导出Excel
          </Button>
          
          <Button variant="outline" size="sm" onClick={importFromExcel} className="gap-1 tech-button-outline">
            <FileUp className="h-4 w-4" />
            导入Excel
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden tech-card relative z-[50]" style={{ pointerEvents: 'auto' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedTestCases.length > 0 && selectedTestCases.length === filteredTestCases.length}
                  onCheckedChange={toggleSelectAll}
                  className="tech-checkbox relative z-[51]"
                  style={{ pointerEvents: 'auto' }}
                />
              </TableHead>
              <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort("testId")}>
                <div className="flex items-center">
                  测试ID
                  {sortField === "testId" && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("description")}>
                <div className="flex items-center">
                  描述
                  {sortField === "description" && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort("priority")}>
                <div className="flex items-center">
                  优先级
                  {sortField === "priority" && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort("status")}>
                <div className="flex items-center">
                  状态
                  {sortField === "status" && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[100px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2">加载中...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTestCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  未找到测试用例
                </TableCell>
              </TableRow>
            ) : (
              filteredTestCases.map((testCase) => (
                <TableRow key={testCase.id} className="tech-table-row">
                  <TableCell>
                    <Checkbox
                      checked={selectedTestCases.includes(testCase.id)}
                      onCheckedChange={() => toggleSelectTestCase(testCase.id)}
                      className="tech-checkbox relative z-[51]"
                      style={{ pointerEvents: 'auto' }}
                    />
                  </TableCell>
                  <TableCell className="font-mono">
                    {editMode[testCase.id] ? (
                      <Input
                        value={testCase.testId}
                        onChange={(e) => updateTestCase(testCase.id, "testId", e.target.value)}
                        className="tech-input h-8 relative z-[51]"
                        style={{ pointerEvents: 'auto' }}
                      />
                    ) : (
                      testCase.testId
                    )}
                  </TableCell>
                  <TableCell>
                    {editMode[testCase.id] ? (
                      <Input
                        value={testCase.description}
                        onChange={(e) => updateTestCase(testCase.id, "description", e.target.value)}
                        className="tech-input h-8 relative z-[51]"
                        style={{ pointerEvents: 'auto' }}
                      />
                    ) : (
                      testCase.description
                    )}
                  </TableCell>
                  <TableCell>
                    {editMode[testCase.id] ? (
                      <Select
                        value={testCase.priority}
                        onValueChange={(value) => updateTestCase(testCase.id, "priority", value)}
                      >
                        <SelectTrigger className="tech-input h-8 relative z-[51]" style={{ pointerEvents: 'auto' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-950/90 backdrop-blur-md text-white z-[52]">
                          <SelectItem value="高">高</SelectItem>
                          <SelectItem value="中">中</SelectItem>
                          <SelectItem value="低">低</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant={
                          testCase.priority === "高"
                            ? "destructive"
                            : testCase.priority === "中"
                            ? "default"
                            : "outline"
                        }
                        className="tech-badge"
                      >
                        {testCase.priority}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editMode[testCase.id] ? (
                      <Select
                        value={testCase.status}
                        onValueChange={(value) => updateTestCase(testCase.id, "status", value)}
                      >
                        <SelectTrigger className="tech-input h-8 relative z-[51]" style={{ pointerEvents: 'auto' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-950/90 backdrop-blur-md text-white z-[52]">
                          <SelectItem value="通过">通过</SelectItem>
                          <SelectItem value="失败">失败</SelectItem>
                          <SelectItem value="未测试">未测试</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant={
                          testCase.status === "通过"
                            ? "success"
                            : testCase.status === "失败"
                            ? "destructive"
                            : "outline"
                        }
                        className="tech-badge"
                      >
                        {testCase.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {editMode[testCase.id] ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            updateTestCase(testCase.id, "_editComplete", "")
                            toggleEditMode(testCase.id)
                          }}
                          className="h-8 w-8 tech-button-icon relative z-[51]"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleEditMode(testCase.id)}
                          className="h-8 w-8 tech-button-icon-destructive relative z-[51]"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleEditMode(testCase.id)}
                          className="h-8 w-8 tech-button-icon relative z-[51]"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <PenLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTestCase(testCase.id)}
                          className="h-8 w-8 tech-button-icon-destructive relative z-[51]"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">
        共 {filteredTestCases.length} 个测试用例 {selectedTestCases.length > 0 && `(已选择 ${selectedTestCases.length} 个)`}
      </div>
    </div>
  )
}

