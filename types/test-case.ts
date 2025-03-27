export interface TestCase {
  id: number
  testId: string
  description: string
  preconditions: string
  steps: string
  expectedResult: string
  priority: string
  status: string
}

export interface CreateTestCaseDto {
  testId: string
  description: string
  preconditions: string
  steps: string
  expectedResult: string
  priority: string
  status: string
}

export interface UpdateTestCaseDto {
  testId?: string
  description?: string
  preconditions?: string
  steps?: string
  expectedResult?: string
  priority?: string
  status?: string
}