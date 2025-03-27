"use client"

import type React from "react"

import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, File, X, Check, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

// 在组件定义中添加 onFileUploaded 属性
interface DocumentUploaderProps {
  onFileUploaded?: (file: File) => void;
}

export default function DocumentUploader({ onFileUploaded }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const { toast } = useToast()

  // 在文件上传完成后调用回调函数
  useEffect(() => {
    if (uploadComplete && file && onFileUploaded) {
      onFileUploaded(file);
    }
  }, [uploadComplete, file, onFileUploaded]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      handleFileSelection(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      handleFileSelection(selectedFile)
    }
  }

  const handleFileSelection = (selectedFile: File) => {
    
    const allowedTypes = [".pdf", ".docx", ".txt", ".doc", ".md"]
    const fileExtension = "." + selectedFile.name.split(".").pop()?.toLowerCase()

    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "不支持的文件类型",
        description: "请上传PDF、DOCX、DOC、TXT或MD文件。",
        variant: "destructive",
      })
      return
    }

    
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "文件大小不能超过10MB。",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    simulateUpload()
  }

  const simulateUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadComplete(false)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadComplete(true)
          toast({
            title: "上传成功",
            description: "文件已成功上传，可以继续进行分析。",
            variant: "default",
          })
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const removeFile = () => {
    setFile(null)
    setUploadComplete(false)
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors backdrop-blur-sm relative z-10 ${
              isDragging ? "border-blue-400/50 bg-blue-900/20" : "border-blue-500/20 bg-blue-950/30"
            } neon-border highlight-effect`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div
                className={`p-4 rounded-full ${isDragging ? "bg-blue-900/30" : "bg-blue-950/20"} transition-colors pulse-animation float-effect`}
              >
                <Upload className={`h-10 w-10 ${isDragging ? "text-blue-400" : "text-blue-300"} transition-colors`} />
              </div>
              <h3 className="text-lg font-semibold text-white neon-text">将文件拖放到此处</h3>
              <p className="text-gray-300 font-medium">支持PDF、DOCX、TXT、DOC、MD格式（最大10MB）</p>
              
              {/* 修改这部分代码，确保点击按钮能够触发文件选择 */}
              <div className="mt-2 relative z-20">
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt,.doc,.md"
                  onChange={handleFileChange}
                />
                <Button 
                  variant="outline" 
                  className="tech-button-outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  浏览文件
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border border-cyan-500/20 rounded-md p-6 min-h-[400px] bg-blue-950/20 backdrop-blur-sm tech-card neon-border-cyan"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/30 pulse-animation rounded-lg float-effect">
                  <File className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold text-white neon-text-cyan">{file.name}</p>
                  <p className="text-sm text-gray-300">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile()}
                className="hover:bg-red-900/30 hover:text-red-400 transition-colors tech-button-outline relative z-20"
                style={{ pointerEvents: 'auto' }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="h-2 bg-black/50 rounded-full overflow-hidden neon-border-cyan">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>上传进度</span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
              </div>
            )}

            {uploadComplete && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-400 font-medium neon-text">
                <Check className="h-4 w-4" />
                <span>文件上传成功，可以继续进行分析</span>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 border border-cyan-500/30 rounded-lg bg-blue-950/40 neon-border-cyan highlight-effect">
                <h4 className="text-sm font-semibold mb-2 text-white neon-text-cyan">文件详情</h4>
                <ul className="text-xs space-y-2 text-gray-300">
                  <li className="flex justify-between">
                    <span>文件名称:</span>
                    <span className="font-mono text-white">{file.name}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>文件大小:</span>
                    <span className="font-mono text-white">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </li>
                  <li className="flex justify-between">
                    <span>文件类型:</span>
                    <span className="font-mono text-white">{file.type || "未知"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>上传时间:</span>
                    <span className="font-mono text-white">{new Date().toLocaleTimeString()}</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 border border-blue-500/20 rounded-lg bg-blue-950/30 neon-border highlight-effect">
                <h4 className="text-sm font-medium mb-2 neon-text">处理选项</h4>
                <ul className="text-xs space-y-2 text-white/70">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-blue-500" />
                    <span>智能文档分析</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-blue-500" />
                    <span>自动生成测试需求</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-blue-500" />
                    <span>思维导图可视化</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-blue-500" />
                    <span>测试用例生成</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-sm flex items-start gap-2 text-gray-300 bg-blue-950/30 p-3 rounded-lg backdrop-blur-sm border border-purple-500/30 neon-border-purple">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-400" />
        <p className="font-medium">上传文件或提供URL后，AI将分析文档内容并生成测试分析、思维导图和测试用例。</p>
      </div>
    </div>
  )

}

