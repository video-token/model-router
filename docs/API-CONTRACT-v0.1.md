# Model Router API Contract v0.1

Status: Draft  
Version: 0.1

---

## 1. 目标

Model Router 对上层 AI 应用提供统一 API。

上层应用包括但不限于：

- ArcReel
- xiaofei
- AIYT9
- OpenMontage
- AI Agent
- AI 图片应用
- AI 视频应用
- 第三方 SaaS

这些应用不需要直接适配 EasyRouter、Provider A、Provider B 等不同 Provider。

统一调用关系：

```text
ArcReel / xiaofei / AIYT9 / OpenMontage
                    ↓
              Model Router API
                    ↓
               Routing
                    ↓
                 Channel
                    ↓
                Provider
```

---

## 2. 核心原则

上层应用只需要知道：

```text
MODEL_ROUTER_URL
MODEL_ROUTER_TOKEN
Canonical Model ID
```

例如：

```text
MODEL_ROUTER_URL=http://127.0.0.1:3900
MODEL_ROUTER_TOKEN=mr_xxxxxxxxx
```

应用不需要知道：

```text
Provider API Key
Provider Base URL
Provider upstream model ID
具体使用哪一个 Channel
失败后切换到哪个 Provider
```

这些全部由 Model Router 管理。

---

## 3. API Base URL

默认：

```text
http://127.0.0.1:3900
```

API 前缀：

```text
/v1
```

完整示例：

```text
http://127.0.0.1:3900/v1
```

---

## 4. Authentication

所有生产 API 默认使用 Model Router Access Token。

Header：

```http
Authorization: Bearer mr_xxxxxxxxx
```

注意：

这个 Token 是：

```text
AI Application → Model Router
```

之间使用的 Token。

它不是任何第三方 Provider 的 API Key。

---

## 5. Request ID

应用可以主动传入：

```http
X-Request-Id: req_xxxxxxxxx
```

如果应用没有提供，Model Router 自动生成。

每一次请求必须拥有唯一：

```text
request_id
```

用于：

- 日志
- 调试
- Provider 请求追踪
- Retry
- Failover
- 错误定位

---

# 6. Health API

## GET /v1/health

用于检测 Model Router 是否可以正常访问。

请求：

```http
GET /v1/health
Authorization: Bearer mr_xxxxxxxxx
```

成功响应：

```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

状态可以是：

```text
ok
degraded
unavailable
```

---

# 7. Models API

## GET /v1/models

返回当前 Router 可以使用的 Canonical Models。

示例：

```json
{
  "data": [
    {
      "id": "minimax-h3",
      "capabilities": [
        "video-generation"
      ],
      "available": true
    },
    {
      "id": "seedance-2-0",
      "capabilities": [
        "video-generation"
      ],
      "available": true
    },
    {
      "id": "gpt-image-2",
      "capabilities": [
        "image-generation",
        "image-edit"
      ],
      "available": true
    }
  ]
}
```

上层应用应该优先使用 Canonical Model ID。

---

# 8. Routing

所有生成 API 都可以携带：

```json
{
  "routing": {
    "strategy": "balanced"
  }
}
```

支持：

```text
fixed
cheapest
fastest
stable
balanced
```

---

## fixed

固定使用某一个 Channel：

```json
{
  "routing": {
    "strategy": "fixed",
    "channel_id": "channel_abc123"
  }
}
```

---

## cheapest

优先选择满足当前请求条件下价格最低的可用 Channel：

```json
{
  "routing": {
    "strategy": "cheapest"
  }
}
```

---

## fastest

优先选择最近速度表现最好的 Channel：

```json
{
  "routing": {
    "strategy": "fastest"
  }
}
```

---

## stable

优先选择近期成功率与稳定性较高的 Channel：

```json
{
  "routing": {
    "strategy": "stable"
  }
}
```

---

## balanced

综合考虑：

```text
价格
速度
成功率
Provider Health
可用状态
近期错误
```

示例：

```json
{
  "routing": {
    "strategy": "balanced"
  }
}
```

`balanced` 建议作为默认策略。

---

# 9. Text Generation

## POST /v1/text/generations

请求：

```json
{
  "model": "example-text-model",
  "input": "Write a short story about a robot.",
  "routing": {
    "strategy": "balanced"
  }
}
```

成功响应：

```json
{
  "request_id": "req_123",
  "status": "succeeded",
  "model": "example-text-model",
  "output": {
    "text": "..."
  },
  "usage": {
    "input_tokens": 120,
    "output_tokens": 560
  }
}
```

---

# 10. Image Generation

## POST /v1/images/generations

请求：

```json
{
  "model": "gpt-image-2",
  "prompt": "A cinematic rainy street at night.",
  "size": "1024x1024",
  "count": 1,
  "routing": {
    "strategy": "balanced"
  }
}
```

推荐响应：

```json
{
  "request_id": "req_123",
  "task_id": "task_img_123",
  "status": "queued",
  "model": "gpt-image-2"
}
```

图片任务可以异步执行。

---

# 11. Image Edit

## POST /v1/images/edits

请求：

```json
{
  "model": "gpt-image-2",
  "prompt": "Replace the background with a rainy Tokyo street.",
  "input_images": [
    {
      "url": "https://example.com/input.jpg"
    }
  ],
  "routing": {
    "strategy": "balanced"
  }
}
```

响应：

```json
{
  "request_id": "req_456",
  "task_id": "task_img_456",
  "status": "queued",
  "model": "gpt-image-2"
}
```

---

# 12. Video Generation

## POST /v1/videos/generations

视频生成统一采用异步任务模式。

请求示例：

```json
{
  "model": "minimax-h3",
  "prompt": "A woman walking through a rainy neon street.",
  "duration_seconds": 10,
  "resolution": "2K",
  "routing": {
    "strategy": "balanced"
  }
}
```

响应：

```json
{
  "request_id": "req_789",
  "task_id": "task_vid_789",
  "status": "queued",
  "model": "minimax-h3"
}
```

---

## 参考图视频

可以增加：

```json
{
  "model": "minimax-h3",
  "prompt": "The character slowly turns toward the camera.",
  "input_images": [
    {
      "url": "https://example.com/reference.jpg"
    }
  ],
  "duration_seconds": 10,
  "routing": {
    "strategy": "balanced"
  }
}
```

`input_images` 是参考图。

是否代表：

```text
Reference Image
First Frame
Last Frame
Character Reference
Scene Reference
```

由后续 Media Contract 单独定义。

V0.1 不混淆这些语义。

---

# 13. Async Task

图片与视频等长任务统一返回：

```text
task_id
```

任务状态统一为：

```text
queued
running
succeeded
failed
```

---

## GET /v1/tasks/{task_id}

例如：

```http
GET /v1/tasks/task_vid_789
Authorization: Bearer mr_xxxxxxxxx
```

运行中：

```json
{
  "task_id": "task_vid_789",
  "status": "running",
  "progress": 52
}
```

成功：

```json
{
  "task_id": "task_vid_789",
  "status": "succeeded",
  "result": {
    "url": "https://storage.example.com/video.mp4"
  }
}
```

失败：

```json
{
  "task_id": "task_vid_789",
  "status": "failed",
  "error": {
    "code": "PROVIDER_UNAVAILABLE",
    "message": "No available channel could complete the request."
  }
}
```

---

# 14. Task Status Contract

任务状态只允许：

```text
queued
running
succeeded
failed
```

不允许 Provider 自己的状态直接泄漏给应用。

例如某 Provider 返回：

```text
pending
processing
creating
completed
error
```

Model Router 必须转换为统一状态：

```text
queued
running
succeeded
failed
```

---

# 15. Error Contract

所有错误统一结构：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "request_id": "req_123"
  }
}
```

---

## 基础错误码

V0.1 至少包括：

```text
AUTH_FAILED
INVALID_REQUEST
MODEL_NOT_FOUND
NO_AVAILABLE_CHANNEL
CHANNEL_UNAVAILABLE
PROVIDER_AUTH_FAILED
PROVIDER_RATE_LIMITED
PROVIDER_TIMEOUT
PROVIDER_NETWORK_ERROR
PROVIDER_ERROR
ROUTING_FAILED
TASK_NOT_FOUND
TASK_FAILED
INTERNAL_ERROR
```

---

# 16. Provider Error Normalization

不同 Provider 的错误必须转换成 Model Router 标准错误。

例如：

```text
Provider A:
HTTP 429

Provider B:
rate_limit_exceeded

Provider C:
too_many_requests
```

统一转换为：

```text
PROVIDER_RATE_LIMITED
```

这样 ArcReel、xiaofei、AIYT9、OpenMontage 不需要分别理解几十家 Provider 的错误格式。

---

# 17. Failover

例如：

```text
请求 minimax-h3
        ↓
Channel A
        ↓ timeout
Channel B
        ↓ HTTP 500
Channel C
        ↓ success
```

应用最终只收到：

```json
{
  "status": "succeeded"
}
```

同时 Router 本地日志记录：

```text
Channel A → timeout
Channel B → 500
Channel C → succeeded
```

---

# 18. Response Metadata

成功响应可以包含：

```json
{
  "meta": {
    "provider_id": "easyrouter",
    "channel_id": "channel_123",
    "routing_strategy": "balanced",
    "retry_count": 1,
    "failover_count": 1
  }
}
```

但默认情况下不应返回：

```text
Provider API Key
完整 Credential
Provider Secret
敏感 Header
```

---

# 19. Privacy Mode

Router 可以提供：

```text
expose_provider_metadata
```

默认：

```text
false
```

关闭时，上层应用只看到：

```text
Canonical Model
Task Status
Result
Error
```

不需要知道具体 Provider。

---

# 20. Local Administration API

Provider、Credential、Channel 等配置属于管理接口。

例如未来可以有：

```text
/v1/admin/providers
/v1/admin/credentials
/v1/admin/channels
/v1/admin/routes
/v1/admin/logs
```

这些接口不得与普通生成 API 使用相同权限。

V0.1 应区分：

```text
Application Token
Admin Token
```

---

# 21. Credential Boundary

第三方 Provider Credential 只保存在 Model Router 中。

例如：

```text
Provider:
EasyRouter

Credential:
sk-xxxxxxxx
```

ArcReel、xiaofei、AIYT9、OpenMontage 不直接读取这个 Credential。

它们只持有：

```text
MODEL_ROUTER_TOKEN
```

---

# 22. Registry Import

Model Router 可以从公开：

```text
model-router-registry
```

导入：

```text
Provider
Canonical Model
Endpoint
Protocol
Authentication Type
Public Pricing
Capabilities
```

但是 Registry 永远不能向 Router 下发：

```text
Customer API Key
Customer Secret
Customer Password
```

---

# 23. Hub Availability

生产请求不得依赖：

```text
video-token.com
```

实时在线。

正确关系：

```text
Model Router Hub
      ↓
下载 / 更新公开 Registry
      ↓
Private Model Router
      ↓
保存本地配置
```

生产时：

```text
AI Application
      ↓
Private Model Router
      ↓
Provider
```

即使 Model Router Hub 暂时不可访问，已经配置完成的 Router 仍然应该继续运行。

---

# 24. Application Integration

ArcReel、xiaofei、AIYT9、OpenMontage 等应用只需要配置：

```text
MODEL_ROUTER_URL
MODEL_ROUTER_TOKEN
```

例如：

```text
MODEL_ROUTER_URL=http://127.0.0.1:3900
MODEL_ROUTER_TOKEN=mr_xxxxxxxxx
```

应用通过标准 API 调用：

```text
Text
Image
Video
```

不需要维护几十家 Provider Adapter。

---

# 25. V0.1 API List

V0.1 第一批接口：

```text
GET  /v1/health
GET  /v1/models

POST /v1/text/generations

POST /v1/images/generations
POST /v1/images/edits

POST /v1/videos/generations

GET  /v1/tasks/{task_id}
```

后续再增加：

```text
Audio
Embedding
Streaming
Webhook
Batch
Admin API
Benchmark API
```

---

# 26. Contract Rule

Model Router API 必须保持以下边界：

```text
Applications use Canonical Models.

Providers use upstream model IDs.

Model Router performs the mapping.
```

同时：

```text
Applications never need Provider API Keys.

Model Router Hub never receives Provider API Keys.

Private Model Router owns the Credentials.
```

---

# 27. Final Principle

> **One application API. Many Providers. User-owned Credentials.**

中文：

> **应用只接一个接口，Router 连接多个 Provider，Credential 始终属于用户自己。**
