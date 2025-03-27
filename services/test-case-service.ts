import { TestCase, CreateTestCaseDto, UpdateTestCaseDto } from "@/types/test-case"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// 获取所有测试用例
export async function fetchTestCases(): Promise<TestCase[]> {
  const response = await fetch(`${API_URL}/test-cases`)
  if (!response.ok) {
    throw new Error(`获取测试用例失败: ${response.statusText}`)
  }
  return response.json()
}

// 获取单个测试用例
export async function fetchTestCaseById(id: number): Promise<TestCase> {
  const response = await fetch(`${API_URL}/test-cases/${id}`)
  if (!response.ok) {
    throw new Error(`获取测试用例失败: ${response.statusText}`)
  }
  return response.json()
}

// 创建测试用例
export async function createTestCase(testCase: CreateTestCaseDto): Promise<TestCase> {
  const response = await fetch(`${API_URL}/test-cases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testCase),
  })
  if (!response.ok) {
    throw new Error(`创建测试用例失败: ${response.statusText}`)
  }
  return response.json()
}

// 更新测试用例
export async function updateTestCaseById(id: number, testCase: UpdateTestCaseDto): Promise<TestCase> {
  const response = await fetch(`${API_URL}/test-cases/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testCase),
  })
  if (!response.ok) {
    throw new Error(`更新测试用例失败: ${response.statusText}`)
  }
  return response.json()
}

// 删除测试用例
export async function deleteTestCaseById(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/test-cases/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error(`删除测试用例失败: ${response.statusText}`)
  }
}

// 批量删除测试用例
export async function deleteMultipleTestCases(ids: number[]): Promise<void> {
  const response = await fetch(`${API_URL}/test-cases/batch`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  })
  if (!response.ok) {
    throw new Error(`批量删除测试用例失败: ${response.statusText}`)
  }
}

// 导入测试用例
export async function importTestCases(testCases: CreateTestCaseDto[]): Promise<TestCase[]> {
  const response = await fetch(`${API_URL}/test-cases/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testCases),
  })
  if (!response.ok) {
    throw new Error(`导入测试用例失败: ${response.statusText}`)
  }
  return response.json()
}