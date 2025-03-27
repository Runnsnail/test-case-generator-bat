"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  Upload,
  Link,
  FileText,
  Download,
  PenLine,
  CheckCircle2,
  ChevronRight,
  BrainCircuit,
  Zap,
  Database,
  Code,
} from "lucide-react"
import DocumentUploader from "@/components/document-uploader"
import MindMapViewer from "@/components/mind-map-viewer"
import TestCaseTable from "@/components/test-case-table"
import { useToast } from "@/hooks/use-toast"
import { jsPDF } from "jspdf"
import { analyzeDocument, pollAnalysisStatus } from "@/services/analysis-service" // 添加导入

// 增强的动态背景组件
const DynamicBackground = () => {
  const cyberParticlesRef = useRef<HTMLDivElement>(null)
  const cyberLinesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 创建粒子效果
    if (cyberParticlesRef.current) {
      const container = cyberParticlesRef.current
      container.innerHTML = ""

      const particleCount = 50
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div")
        particle.className = "cyber-particle"

        // 随机位置和大小
        const size = Math.random() * 3 + 1
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        particle.style.left = `${Math.random() * 100}%`
        particle.style.top = `${Math.random() * 100}%`

        // 随机颜色
        const colors = [
          "rgba(14, 165, 233, 0.6)",
          "rgba(6, 182, 212, 0.6)",
          "rgba(79, 70, 229, 0.6)",
          "rgba(139, 92, 246, 0.6)",
        ]
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]

        // 随机动画
        const duration = 15 + Math.random() * 20
        const delay = Math.random() * 10
        particle.style.animation = `particleFloat ${duration}s infinite linear`
        particle.style.animationDelay = `${delay}s`

        container.appendChild(particle)
      }
    }

    // 创建线条效果
    if (cyberLinesRef.current) {
      const container = cyberLinesRef.current
      container.innerHTML = ""

      const lineCount = 10
      for (let i = 0; i < lineCount; i++) {
        const line = document.createElement("div")
        line.className = "cyber-line"

        // 随机位置
        line.style.top = `${Math.random() * 100}%`

        // 随机动画
        const duration = 8 + Math.random() * 10
        const delay = Math.random() * 5
        line.style.animation = `lineFloat ${duration}s infinite linear`
        line.style.animationDelay = `${delay}s`

        container.appendChild(line)
      }
    }
  }, [])

  // 修改 DynamicBackground 组件的返回值
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-black/90 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15),transparent_70%)] pointer-events-none"></div>
      <div className="tech-grid pointer-events-none"></div>
      <div className="tech-glow pointer-events-none"></div>
      <div ref={cyberParticlesRef} className="cyber-particles pointer-events-none"></div>
      <div ref={cyberLinesRef} className="cyber-lines pointer-events-none"></div>
  
      {/* 动态光斑效果也添加 pointer-events-none */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500/5 blur-3xl animate-pulse pointer-events-none"></div>
      <div
        className="absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full bg-cyan-500/5 blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-2/3 left-1/2 w-24 h-24 rounded-full bg-indigo-500/5 blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/3 right-1/4 w-36 h-36 rounded-full bg-purple-500/5 blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "3s" }}
      ></div>
    </div>
  )
}

// Space background component with stars
const SpaceBackground = () => {
  const starsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!starsRef.current) return

    const container = starsRef.current
    container.innerHTML = ""

    // Create stars
    const starCount = 150
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div")
      const size = Math.random()

      if (size < 0.5) {
        star.className = "star small"
      } else if (size < 0.8) {
        star.className = "star medium"
      } else {
        star.className = "star large"
      }

      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`

      // Add twinkling animation
      star.style.animation = `pulse-glow ${3 + Math.random() * 4}s infinite ease-in-out`
      star.style.animationDelay = `${Math.random() * 5}s`

      container.appendChild(star)
    }
  }, [])

  // 修改 SpaceBackground 组件的返回值
  return <div ref={starsRef} className="stars pointer-events-none"></div>
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [documentUrl, setDocumentUrl] = useState("")
  const [documentText, setDocumentText] = useState("") // 添加文档文本状态
  const [uploadedFile, setUploadedFile] = useState<File | null>(null) // 添加上传文件状态
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [testAnalysis, setTestAnalysis] = useState("")
  const [progress, setProgress] = useState(0)
  const [analysisId, setAnalysisId] = useState<string | null>(null) // 添加分析ID状态
  const [analysisData, setAnalysisData] = useState<any>(null) // 添加分析数据状态
  const { toast } = useToast()

  // 添加处理文件上传的函数
  const handleFileUploaded = (file: File) => {
    setUploadedFile(file);
    toast({
      title: "文件已上传",
      description: `文件 "${file.name}" 已成功上传，准备分析。`,
      variant: "default",
    });
  };
  
  // 添加处理文档文本变更的函数
  const handleDocumentTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocumentText(e.target.value);
  };

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 150)

      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  useEffect(() => {
    if (progress === 100 && isAnalyzing) {
      setTimeout(() => {
        setIsAnalyzing(false)
        setAnalysisComplete(true)
        setTestAnalysis(
          "这是一个基于您上传的需求文档生成的测试分析文档。在实际实现中，这将由AI模型根据上传的文档或URL生成。\n\n## 功能测试\n\n1. 用户上传功能测试\n2. 文档解析功能测试\n3. 思维导图生成功能测试\n4. 测试用例生成功能测试\n5. 导出功能测试\n\n## 性能测试\n\n1. 大文件上传性能测试\n2. AI分析响应时间测试\n3. 导出大量测试用例性能测试\n\n## 兼容性测试\n\n1. 不同浏览器兼容性测试\n2. 移动设备响应式设计测试\n3. 不同文档格式兼容性测试",
        )
        setActiveTab("analysis")
        toast({
          title: "分析完成",
          description: "需求文档分析已完成，可以查看测试分析结果。",
          variant: "default",
        })
      }, 500)
    }
  }, [progress, isAnalyzing, toast])

  const handleAnalyzeDocument = async () => {
    // 检查是否有文档来源
    if (!documentUrl && !documentText && !uploadedFile) {
      toast({
        title: "缺少文档",
        description: "请上传文档、提供URL或输入文档文本",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    
    toast({
      title: "开始分析",
      description: "正在分析您的需求文档，请稍候...",
      variant: "default",
    });
  
    try {
      // 准备请求数据
      const requestData = {
        documentUrl: documentUrl || undefined,
        documentText: documentText || undefined,
        file: uploadedFile || undefined,
      };
  
      // 在实际项目中，这里会调用API
      // const response = await analyzeDocument(requestData);
      // setAnalysisId(response.id);
      
      // 模拟API调用
      // 实际项目中应删除此模拟代码，使用上面注释的真实API调用
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    } catch (error: any) {
      console.error("分析请求失败:", error);
      setIsAnalyzing(false);
      
      toast({
        title: "分析失败",
        description: error.message || "无法完成文档分析，请重试。",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAnalysis = () => {
    // 创建PDF文档
    const doc = new jsPDF()

    // 添加标题
    doc.setFontSize(16)
    doc.text("测试分析文档", 105, 20, { align: "center" })

    // 添加内容
    doc.setFontSize(12)

    // 将HTML内容转换为纯文本
    const plainText = testAnalysis.replace(/## /g, "").replace(/\n\n/g, "\n").replace(/\n/g, "\n")

    // 分割文本为行
    const lines = doc.splitTextToSize(plainText, 180)

    // 添加文本到PDF
    doc.text(lines, 15, 30)

    // 保存PDF
    doc.save("测试分析文档.pdf")

    toast({
      title: "下载成功",
      description: "测试分析文档已成功下载。",
      variant: "default",
    })
  }

  // 在Home组件内添加以下函数
  const handleEditMindMap = () => {
    // 获取MindMapViewer组件的引用并调用编辑功能
    if (typeof window !== "undefined") {
      // 显示编辑对话框的提示
      toast({
        title: "编辑模式已激活",
        description: "您现在可以通过双击节点来编辑思维导图内容。",
        variant: "default",
      })

      // 模拟选择一个节点以激活编辑模式
      const mindMapCanvas = document.querySelector("canvas")
      if (mindMapCanvas) {
        // 创建并分发点击事件
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
        mindMapCanvas.dispatchEvent(clickEvent)
      }
    }
  }

  const handleDownloadMindMap = () => {
    // 获取MindMapViewer组件的引用并调用下载功能
    if (typeof window !== "undefined") {
      // 查找canvas元素
      const canvas = document.querySelector("canvas")
      if (canvas) {
        // 将canvas转换为图片并下载
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "思维导图.png"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast({
              title: "下载成功",
              description: "思维导图已成功下载为PNG格式。",
              variant: "default",
            })
          }
        }, "image/png")
      } else {
        toast({
          title: "下载失败",
          description: "无法找到思维导图画布。",
          variant: "destructive",
        })
      }
    }
  }

  // 在测试用例部分添加导出Excel功能
  const handleExportTestCases = () => {
    // 调用TestCaseTable组件中的导出功能
    if (typeof window !== "undefined") {
      // 创建一个自定义事件来触发TestCaseTable中的导出功能
      const exportEvent = new CustomEvent("export-test-cases")
      window.dispatchEvent(exportEvent)

      toast({
        title: "导出成功",
        description: "测试用例已成功导出为Excel文件。",
        variant: "default",
      })
    }
  }

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <main className="min-h-screen py-8 px-4 relative overflow-hidden bg-black">
      {/* 增强的动态背景 */}
      <DynamicBackground />
      <SpaceBackground />

      <div className="container mx-auto relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center mb-12">
          <motion.h1 variants={itemVariants} className="text-5xl font-bold mb-3 text-white tracking-tight">
            AI <span className="text-gradient-blue font-extrabold">测试用例生成器</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-blue-100/80 font-medium max-w-2xl mx-auto">
            利用人工智能自动分析需求文档，生成测试分析、思维导图和测试用例
          </motion.p>

          <motion.div variants={itemVariants} className="flex justify-center gap-3 mt-6">
            <div className="flex items-center gap-2 bg-blue-950/30 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/20 neon-border">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-100/90 font-medium">AI 驱动</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-950/30 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-500/20 neon-border-purple">
              <Database className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-100/90 font-medium">自动生成</span>
            </div>
            <div className="flex items-center gap-2 bg-cyan-950/30 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/20 neon-border-cyan">
              <Code className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-cyan-100/90 font-medium">高效测试</span>
            </div>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="upload" className="max-w-5xl mx-auto" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8 w-full max-w-2xl mx-auto tech-tabs">
            <TabsTrigger value="upload" className={`tech-tab ${activeTab === "upload" ? "active" : ""}`}>
              <Upload className="h-4 w-4 mr-2" />
              上传需求
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              disabled={!analysisComplete}
              className={`tech-tab ${activeTab === "analysis" ? "active" : ""}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              测试分析
            </TabsTrigger>
            <TabsTrigger
              value="mindmap"
              disabled={!analysisComplete}
              className={`tech-tab ${activeTab === "mindmap" ? "active" : ""}`}
            >
              <BrainCircuit className="h-4 w-4 mr-2" />
              思维导图
            </TabsTrigger>
            <TabsTrigger
              value="testcases"
              disabled={!analysisComplete}
              className={`tech-tab ${activeTab === "testcases" ? "active" : ""}`}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              测试用例
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="upload">
                <Card className="tech-card">
                  <CardHeader className="tech-card-header">
                    <CardTitle className="flex items-center text-white font-semibold neon-text">上传需求文档</CardTitle>
                    <CardDescription className="text-blue-200/70 font-medium">
                      上传需求文档或提供文档URL，AI将自动分析并生成测试用例
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                  
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center text-white">
                        <span className="flex items-center justify-center bg-gradient-to-r from-blue-600/40 to-cyan-600/40 text-white rounded-full w-6 h-6 mr-2 text-sm">
                          1
                        </span>
                        上传文档
                      </h3>
                      <div className="relative z-20" style={{ pointerEvents: 'auto' }}>
                        <DocumentUploader onFileUploaded={handleFileUploaded} />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center text-white/90">
                        <span className="flex items-center justify-center bg-gradient-to-r from-purple-600/40 to-blue-600/40 text-white rounded-full w-6 h-6 mr-2 text-sm">
                          2
                        </span>
                        提供文档URL
                      </h3>
                      <div className="flex space-x-2 relative z-20" style={{ pointerEvents: 'auto' }}>
                        <Input
                          placeholder="https://example.com/requirements.pdf"
                          value={documentUrl}
                          onChange={(e) => setDocumentUrl(e.target.value)}
                          className="tech-input"
                        />
                        <Button variant="outline" size="icon" className="tech-button-outline">
                          <Link className="h-4 w-4 text-blue-400" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center text-white/90">
                        <span className="flex items-center justify-center bg-gradient-to-r from-cyan-600/40 to-purple-600/40 text-white rounded-full w-6 h-6 mr-2 text-sm">
                          3
                        </span>
                        粘贴需求文本
                      </h3>
                      <div className="relative z-20" style={{ pointerEvents: 'auto' }}>
                        <Textarea 
                          placeholder="在此粘贴您的需求文本..." 
                          className="tech-input min-h-[200px]"
                          value={documentText}
                          onChange={handleDocumentTextChange}
                        />
                      </div>
                    </div>

                    {isAnalyzing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-white/80">
                          <span>分析进度</span>
                          <span className="font-mono">{progress}%</span>
                        </div>
                        <div className="h-2 bg-blue-950/50 rounded-full overflow-hidden neon-border">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 transition-all duration-300 bg-size-200"
                            style={{ width: `${progress}%`, backgroundPosition: `${progress}% 0` }}
                          ></div>
                        </div>
                        <p className="text-sm text-blue-200/70 animate-pulse neon-text">
                          AI正在分析您的需求文档，请稍候...
                        </p>
                      </div>
                    )}

                    <Button
                      className="w-full tech-button-primary relative z-20"
                      onClick={() => handleAnalyzeDocument()}
                      disabled={isAnalyzing}
                      size="lg"
                      style={{ pointerEvents: 'auto' }}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          正在分析文档...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          分析需求文档
                        </>
                      )}
                    </Button>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="tech-feature-card p-4 text-center highlight-effect">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center float-effect">
                          <Zap className="h-6 w-6 text-blue-400" />
                        </div>
                        <h4 className="text-sm font-semibold mb-1 text-blue-300 neon-text">全面分析</h4>
                        <p className="text-xs text-blue-200/70">深入分析需求文档的各个方面</p>
                      </div>
                      <div className="tech-feature-card p-4 text-center highlight-effect">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center float-effect-slow">
                          <Database className="h-6 w-6 text-purple-400" />
                        </div>
                        <h4 className="text-sm font-semibold mb-1 text-purple-300 neon-text-purple">安全可靠</h4>
                        <p className="text-xs text-purple-200/70">保障文档数据安全，结果精准可靠</p>
                      </div>
                      <div className="tech-feature-card p-4 text-center highlight-effect">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-600/20 to-blue-600/20 flex items-center justify-center float-effect-fast">
                          <Code className="h-6 w-6 text-cyan-400" />
                        </div>
                        <h4 className="text-sm font-semibold mb-1 text-cyan-300 neon-text-cyan">高效处理</h4>
                        <p className="text-xs text-cyan-200/70">快速处理大型文档，节省宝贵时间</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-analysis`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: activeTab === "analysis" ? 1 : 0, y: activeTab === "analysis" ? 0 : 10 }}
              transition={{ duration: 0.3 }}
              className={activeTab !== "analysis" ? "hidden" : ""}
            >
              <TabsContent value="analysis">
                <Card className="tech-card">
                  <CardHeader className="tech-card-header">
                    <CardTitle className="flex items-center text-white">测试分析文档</CardTitle>
                    <CardDescription className="text-blue-200/70">查看基于您的需求生成的测试分析文档</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="border border-blue-500/20 rounded-md p-6 min-h-[400px] bg-blue-950/20 backdrop-blur-sm prose prose-sm max-w-none prose-invert neon-border relative z-20" style={{ pointerEvents: 'auto' }}>
                      <div
                        className="whitespace-pre-line"
                        dangerouslySetInnerHTML={{
                          __html:
                            testAnalysis
                              .replace(/\n## /g, "<h2 class='text-gradient-blue font-bold text-xl mt-6 mb-4'>")
                              .replace(/\n\n/g, "</h2><p class='text-blue-100/80 mb-4'>")
                              .replace(/\n/g, "</p><p class='text-blue-100/80 mb-4'>") + "</p>",
                        }}
                      />
                    </div>
                    <div className="flex justify-between pt-4 relative z-20" style={{ pointerEvents: 'auto' }}>
                      <Button variant="outline" className="tech-button-outline">
                        <PenLine className="mr-2 h-4 w-4 text-blue-400" />
                        编辑分析
                      </Button>
                      <Button className="tech-button-primary" onClick={handleDownloadAnalysis}>
                        <Download className="mr-2 h-4 w-4" />
                        下载分析文档
                      </Button>
                    </div>
                    <div className="flex justify-end pt-2 relative z-20" style={{ pointerEvents: 'auto' }}>
                      <Button
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        onClick={() => setActiveTab("mindmap")}
                      >
                        下一步：查看思维导图
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-mindmap`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: activeTab === "mindmap" ? 1 : 0, y: activeTab === "mindmap" ? 0 : 10 }}
              transition={{ duration: 0.3 }}
              className={activeTab !== "mindmap" ? "hidden" : ""}
            >
              <TabsContent value="mindmap">
                <Card className="tech-card">
                  <CardHeader className="tech-card-header">
                    <CardTitle className="flex items-center text-white">测试策略思维导图</CardTitle>
                    <CardDescription className="text-blue-200/70">可视化查看和编辑测试策略思维导图</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div
                      className="border border-purple-500/20 rounded-md bg-blue-950/20 backdrop-blur-sm shadow-sm w-full neon-border-purple relative z-20"
                      style={{ height: "600px", pointerEvents: 'auto' }}
                    >
                      <MindMapViewer />
                    </div>
                    <div className="flex justify-between pt-4 mt-4 relative z-20" style={{ pointerEvents: 'auto' }}>
                      <Button variant="outline" className="tech-button-outline" onClick={handleEditMindMap}>
                        <PenLine className="mr-2 h-4 w-4 text-blue-400" />
                        编辑思维导图
                      </Button>
                      <Button className="tech-button-primary" onClick={handleDownloadMindMap}>
                        <Download className="mr-2 h-4 w-4" />
                        下载思维导图
                      </Button>
                    </div>
                    <div className="flex justify-end pt-2 relative z-20" style={{ pointerEvents: 'auto' }}>
                      <Button
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        onClick={() => setActiveTab("testcases")}
                      >
                        下一步：查看测试用例
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-testcases`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: activeTab === "testcases" ? 1 : 0, y: activeTab === "testcases" ? 0 : 10 }}
              transition={{ duration: 0.3 }}
              className={activeTab !== "testcases" ? "hidden" : ""}
            >
              <TabsContent value="testcases">
                <Card className="tech-card">
                  <CardHeader className="tech-card-header">
                    <CardTitle className="flex items-center text-white">生成的测试用例</CardTitle>
                    <CardDescription className="text-blue-200/70">查看、编辑和导出生成的测试用例</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="relative z-20" style={{ pointerEvents: 'auto' }}>
                      <TestCaseTable />
                    </div>
                    <div className="flex justify-end pt-4 relative z-20" style={{ pointerEvents: 'auto' }}>
                      <Button className="tech-button-primary" onClick={handleExportTestCases}>
                        <Download className="mr-2 h-4 w-4" />
                        导出到Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* 底部信息 */}
        <div className="mt-12 text-center">
          <p className="text-blue-300/40 text-sm font-medium">
            AI 测试用例生成器 • 版本 1.0.0 • © 2025 All Rights Reserved
          </p>
        </div>
      </div>
    </main>
  )
}

