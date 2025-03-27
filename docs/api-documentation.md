# 测试用例管理系统 API 接口文档

## 基本信息

- **基础URL**: `http://localhost:3001/api`
- **内容类型**: `application/json`

## 1. 测试用例接口

### 1.1 获取所有测试用例

- **URL**: `/test-cases`
- **方法**: `GET`
- **描述**: 获取所有测试用例列表
- **响应**:
  - 状态码: `200 OK`
  - 内容:
    ```json
    [
      {
        "id": 1,
        "testId": "TC-001",
        "description": "验证用户使用有效凭据登录",
        "preconditions": "系统中存在用户账户",
        "steps": "1. 导航到登录页面\n2. 输入有效用户名\n3. 输入有效密码\n4. 点击登录按钮",
        "expectedResult": "用户成功登录并重定向到仪表板",
        "priority": "高",
        "status": "通过"
      },
      // 更多测试用例...
    ]
    ```

### 1.2 获取单个测试用例

- **URL**: `/test-cases/{id}`
- **方法**: `GET`
- **描述**: 根据ID获取单个测试用例
- **参数**:
  - `id`: 测试用例ID (路径参数)
- **响应**:
  - 状态码: `200 OK`
  - 内容:
    ```json
    {
      "id": 1,
      "testId": "TC-001",
      "description": "验证用户使用有效凭据登录",
      "preconditions": "系统中存在用户账户",
      "steps": "1. 导航到登录页面\n2. 输入有效用户名\n3. 输入有效密码\n4. 点击登录按钮",
      "expectedResult": "用户成功登录并重定向到仪表板",
      "priority": "高",
      "status": "通过"
    }
    ```
  - 状态码: `404 Not Found`
  - 内容:
    ```json
    {
      "message": "测试用例不存在"
    }
    ```

### 1.3 创建测试用例

- **URL**: `/test-cases`
- **方法**: `POST`
- **描述**: 创建新的测试用例
- **请求体**:
  ```json
  {
    "testId": "TC-006",
    "description": "验证用户注册功能",
    "preconditions": "用户未注册",
    "steps": "1. 导航到注册页面\n2. 填写注册表单\n3. 点击注册按钮",
    "expectedResult": "用户成功注册并收到确认邮件",
    "priority": "高",
    "status": "未测试"
  }


  ### 1.4 更新测试用例
- URL : /test-cases/{id}
- 方法 : PUT
- 描述 : 更新现有测试用例
- 参数 :
  - id : 测试用例ID (路径参数)
- 请求体 :
  ```json
  {
    "description": "验证用户使用有效凭据登录系统",
    "status": "失败"
  }
   ```
  ```
- 响应 :
  - 状态码: 200 OK
  - 内容:
    ```json
    {
      "id": 1,
      "testId": "TC-001",
      "description": "验证用户使用有效凭据登录系统",
      "preconditions": "系统中存在用户账户",
      "steps": "1. 导航到登录页面\n2. 输入有效用户名\n3. 输入有效密码\n4. 点击登录按钮",
      "expectedResult": "用户成功登录并重定向到仪表板",
      "priority": "高",
      "status": "失败"
    }
     ```
    ```
  - 状态码: 404 Not Found
  - 内容:
    ```json
    {
      "message": "测试用例不存在"
    }
     ```
### 1.5 删除测试用例
- URL : /test-cases/{id}
- 方法 : DELETE
- 描述 : 删除测试用例
- 参数 :
  - id : 测试用例ID (路径参数)
- 响应 :
  - 状态码: 204 No Content
  - 状态码: 404 Not Found
  - 内容:
    ```json
    {
      "message": "测试用例不存在"
    }
     ```
### 1.6 批量删除测试用例
- URL : /test-cases/batch
- 方法 : DELETE
- 描述 : 批量删除多个测试用例
- 请求体 :
  ```json
  {
    "ids": [1, 2, 3]
  }
   ```
- 响应 :
  - 状态码: 204 No Content
  - 状态码: 400 Bad Request
  - 内容:
    ```json
    {
      "message": "无效的请求数据",
      "errors": [
        "ids 必须是非空数组"
      ]
    }
     ```
### 1.7 导入测试用例
- URL : /test-cases/import
- 方法 : POST
- 描述 : 批量导入测试用例
- 请求体 :
  ```json
  [
    {
      "testId": "TC-007",
      "description": "验证密码修改功能",
      "preconditions": "用户已登录",
      "steps": "1. 导航到账户设置\n2. 点击修改密码\n3. 输入新密码\n4. 确认新密码",
      "expectedResult": "密码修改成功",
      "priority": "中",
      "status": "未测试"
    },
    {
      "testId": "TC-008",
      "description": "验证用户注销功能",
      "preconditions": "用户已登录",
      "steps": "1. 点击注销按钮\n2. 确认注销",
      "expectedResult": "用户成功注销并返回登录页面",
      "priority": "低",
      "status": "未测试"
    }
  ]
   ```
  ```
- 响应 :
  - 状态码: 201 Created
  - 内容:
    ```json
    [
      {
        "id": 7,
        "testId": "TC-007",
        "description": "验证密码修改功能",
        "preconditions": "用户已登录",
        "steps": "1. 导航到账户设置\n2. 点击修改密码\n3. 输入新密码\n4. 确认新密码",
        "expectedResult": "密码修改成功",
        "priority": "中",
        "status": "未测试"
      },
      {
        "id": 8,
        "testId": "TC-008",
        "description": "验证用户注销功能",
        "preconditions": "用户已登录",
        "steps": "1. 点击注销按钮\n2. 确认注销",
        "expectedResult": "用户成功注销并返回登录页面",
        "priority": "低",
        "status": "未测试"
      }
    ]
     ```
    ```
  - 状态码: 400 Bad Request
  - 内容:
    ```json
    {
      "message": "无效的测试用例数据",
      "errors": [
        "请求体必须是测试用例数组"
      ]
    }
     ```
## 2. 错误处理
所有API端点在发生错误时将返回标准HTTP错误代码和JSON格式的错误消息：

- 400 Bad Request : 请求数据无效
- 404 Not Found : 请求的资源不存在
- 500 Internal Server Error : 服务器内部错误
错误响应格式：

```json
{
  "message": "错误描述",
  "errors": ["详细错误信息1", "详细错误信息2"]
}
 ```

## 3. 认证与授权
当前版本的API不需要认证。未来版本可能会添加基于JWT的认证机制。

## 4. 数据模型
### 测试用例 (TestCase) 字段 类型 描述 id

number

唯一标识符 testId

string

测试用例ID (如 TC-001) description

string

测试用例描述 preconditions

string

测试前置条件 steps

string

测试步骤 expectedResult

string

预期结果 priority

string

优先级 (高/中/低) status

string

状态 (通过/失败/未测试)


## 5. 文档分析接口

### 5.1 分析文档

- **URL**: `/documents/analyze`
- **方法**: `POST`
- **描述**: 上传并分析需求文档，生成测试分析、测试用例和思维导图
- **请求体**: `multipart/form-data`
  - `file`: 要分析的文档文件 (可选)
  - `documentUrl`: 文档URL (可选)
  - `documentText`: 文档文本内容 (可选)
- **响应**:
  - 状态码: `200 OK`
  - 内容:
    ```json
    {
      "id": "analysis-123",
      "status": "processing",
      "progress": 0,
      "message": "文档分析已开始"
    }
    ```
  - 状态码: `400 Bad Request`
  - 内容:
    ```json
    {
      "message": "文档分析失败",
      "errors": [
        "未提供文档",
        "不支持的文件类型"
      ]
    }
    ```

### 5.2 获取分析结果

- **URL**: `/documents/analysis/{analysisId}`
- **方法**: `GET`
- **描述**: 获取文档分析结果
- **参数**:
  - `analysisId`: 分析ID (路径参数)
- **响应**:
  - 状态码: `200 OK`
  - 内容:
    ```json
    {
      "id": "analysis-123",
      "status": "completed",
      "progress": 100,
      "createdAt": "2023-06-15T10:30:00Z",
      "document": {
        "name": "需求规格说明书.docx",
        "size": 1024567,
        "type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      },
      "results": {
        "testAnalysis": "这是一个基于需求文档生成的测试分析文档...",
        "functionalTests": [
          "验证用户登录功能",
          "验证用户注册功能",
          "验证密码重置功能"
        ],
        "performanceTests": [
          "验证系统在高负载下的响应时间",
          "验证系统在并发用户访问时的稳定性"
        ],
        "compatibilityTests": [
          "验证系统在不同浏览器中的兼容性",
          "验证系统在不同设备上的响应式设计"
        ],
        "testCases": [
          {
            "testId": "TC-001",
            "description": "验证用户使用有效凭据登录",
            "preconditions": "系统中存在用户账户",
            "steps": "1. 导航到登录页面\n2. 输入有效用户名\n3. 输入有效密码\n4. 点击登录按钮",
            "expectedResult": "用户成功登录并重定向到仪表板",
            "priority": "高",
            "status": "未测试"
          }
        ],
        "mindMap": {
          "nodes": [
            {
              "id": "root",
              "text": "测试需求",
              "children": [
                {
                  "id": "functional",
                  "text": "功能测试",
                  "children": []
                },
                {
                  "id": "performance",
                  "text": "性能测试",
                  "children": []
                }
              ]
            }
          ]
        }
      }
    }
    ```
  - 状态码: `202 Accepted`
  - 内容:
    ```json
    {
      "id": "analysis-123",
      "status": "processing",
      "progress": 65,
      "message": "文档分析正在进行中"
    }
    ```
  - 状态码: `404 Not Found`
  - 内容:
    ```json
    {
      "message": "分析结果不存在"
    }
    ```

### 5.3 导出分析结果

- **URL**: `/documents/analysis/{analysisId}/export`
- **方法**: `GET`
- **描述**: 导出分析结果为PDF、Word或Markdown格式
- **参数**:
  - `analysisId`: 分析ID (路径参数)
  - `format`: 导出格式 (查询参数, 可选值: "pdf", "docx", "markdown", 默认为 "pdf")
- **响应**:
  - 状态码: `200 OK`
  - 内容类型: 根据请求的格式而定
  - 内容: 文件内容
  - 状态码: `404 Not Found`
  - 内容:
    ```json
    {
      "message": "分析结果不存在"
    }
    ```

### 5.4 生成测试用例

- **URL**: `/documents/analysis/{analysisId}/test-cases`
- **方法**: `POST`
- **描述**: 基于分析结果生成测试用例并保存到系统中
- **参数**:
  - `analysisId`: 分析ID (路径参数)
- **请求体**:
  ```json
  {
    "count": 10,
    "priority": "all",
    "includeEdgeCases": true
  }