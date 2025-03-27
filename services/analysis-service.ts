const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// 分析文档接口
export async function analyzeDocument(data: {
  documentUrl?: string;
  documentText?: string;
  file?: File;
}) {
  // 创建FormData对象用于文件上传
  const formData = new FormData();
  
  // 添加文档URL（如果有）
  if (data.documentUrl) {
    formData.append("documentUrl", data.documentUrl);
  }
  
  // 添加文档文本（如果有）
  if (data.documentText) {
    formData.append("documentText", data.documentText);
  }
  
  // 添加文件（如果有）
  if (data.file) {
    formData.append("file", data.file);
  }
  
  // 发送请求
  const response = await fetch(`${API_URL}/documents/analyze`, {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`文档分析失败: ${response.statusText}`);
  }
  
  return response.json();
}

// 获取分析结果
export async function getAnalysisResult(analysisId: string) {
  const response = await fetch(`${API_URL}/documents/analysis/${analysisId}`);
  
  if (!response.ok) {
    throw new Error(`获取分析结果失败: ${response.statusText}`);
  }
  
  return response.json();
}

// 轮询分析结果状态
export async function pollAnalysisStatus(analysisId: string, onProgress: (progress: number) => void) {
  let completed = false;
  let progress = 0;
  
  while (!completed) {
    try {
      const result = await getAnalysisResult(analysisId);
      
      if (result.status === "completed") {
        completed = true;
        onProgress(100);
        return result;
      } else if (result.status === "failed") {
        throw new Error("分析失败: " + (result.error || "未知错误"));
      } else {
        // 更新进度
        progress = result.progress || progress;
        onProgress(progress);
        
        // 等待一段时间再次查询
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("轮询分析状态失败:", error);
      throw error;
    }
  }
}