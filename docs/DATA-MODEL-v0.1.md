# Model Router Data Model v0.1

Status: Draft  
Version: 0.1

---

## 1. 目标

本文档定义 Model Router v0.1 的核心数据对象以及它们之间的关系。

适用对象包括：

- ArcReel
- xiaofei
- AIYT9
- OpenMontage
- 其他 AI 应用
- AI Agent
- 第三方 SaaS

核心原则：

> Provider 是服务来源。  
> Credential 是用户自己的密钥。  
> Canonical Model 是统一模型名称。  
> Endpoint 是 Provider 的 API 地址。  
> Channel 是一条真正可调用的模型线路。  
> Route Policy 决定使用哪条 Channel。  
> Task 记录一次异步生成任务。

---

# 2. Core Data Model

```text
Provider
   │
   ├── Endpoint
   │
   ├── Credential
   │
   └── Provider Model Mapping
              │
              ▼
        Canonical Model
              │
              ▼
            Channel
              │
              ▼
         Route Policy
              │
              ▼
          AI Request
              │
              ▼
             Task
```

---

# 3. Provider

Provider 表示第三方模型 API 服务商。

例如：

```text
EasyRouter
Provider A
Provider B
Official Model API
```

Provider 回答：

> 谁提供这个模型服务？

示例：

```json
{
  "id": "provider_easyrouter",
  "registry_id": "easyrouter",
  "name": "EasyRouter",
  "status": "active",
  "source": "registry"
}
```

主要字段：

```text
id
registry_id
name
status
source
created_at
updated_at
```

### id

Router 内部唯一 ID。

例如：

```text
provider_easyrouter
```

### registry_id

对应 Model Router Registry 中的 Provider ID。

例如：

```text
easyrouter
```

### source

来源：

```text
registry
manual
```

`registry`：

从公开 Registry 导入。

`manual`：

用户自己手动添加。

---

# 4. Credential

Credential 是用户自己拥有的 Provider 认证信息。

例如：

```text
API Key
Bearer Token
X-API-Key
Access Token
```

示例：

```json
{
  "id": "cred_01",
  "provider_id": "provider_easyrouter",
  "name": "EasyRouter Main Key",
  "auth_type": "bearer",
  "secret_ref": "encrypted://credential/cred_01",
  "status": "active"
}
```

Credential 回答：

> 用户凭什么访问这个 Provider？

主要字段：

```text
id
provider_id
name
auth_type
secret_ref
status
created_at
updated_at
```

---

## Credential 安全原则

数据库或配置文件中不得直接保存：

```text
plaintext_api_key
```

推荐：

```text
secret_ref
```

指向加密后的 Credential。

例如：

```text
encrypted://credential/cred_01
```

日志中只能显示：

```text
EasyRouter Main Key
sk-****cdef
```

不得显示完整 API Key。

---

# 5. Canonical Model

Canonical Model 是 Model Router Hub 定义的统一模型 ID。

例如：

```text
minimax-h3
seedance-2-0
gpt-image-2
```

示例：

```json
{
  "id": "minimax-h3",
  "name": "MiniMax H3",
  "vendor": "MiniMax",
  "capabilities": [
    "video-generation"
  ]
}
```

Canonical Model 回答：

> 上层应用到底想调用什么模型？

ArcReel、xiaofei、AIYT9、OpenMontage 等应用统一使用：

```text
minimax-h3
```

而不需要了解各个 Provider 自己的模型名称。

---

# 6. Provider Model Mapping

不同 Provider 可能使用不同 upstream model ID。

例如：

```text
Canonical Model:
minimax-h3
```

Provider A：

```text
MiniMax-H3
```

Provider B：

```text
hailuo/minimax-h3
```

Provider C：

```text
minimax_h3_video
```

所以需要：

```text
Provider Model Mapping
```

示例：

```json
{
  "id": "mapping_01",
  "provider_id": "provider_easyrouter",
  "canonical_model_id": "minimax-h3",
  "upstream_model_id": "MiniMax-H3",
  "status": "active"
}
```

关系：

```text
minimax-h3
      ↓
Provider Mapping
      ↓
MiniMax-H3
```

---

# 7. Endpoint

Endpoint 表示 Provider 的一个公开 API 地址。

示例：

```json
{
  "id": "endpoint_01",
  "provider_id": "provider_easyrouter",
  "name": "Global API",
  "base_url": "https://api.example.com/v1",
  "region": "global",
  "protocol": "openai-compatible",
  "status": "active"
}
```

Endpoint 回答：

> 请求具体发到哪里？

主要字段：

```text
id
provider_id
name
base_url
region
protocol
status
created_at
updated_at
```

同一个 Provider 可以有多个 Endpoint。

例如：

```text
Provider A
├── Hong Kong API
├── Singapore API
└── US API
```

---

# 8. Channel

Channel 是 Model Router 最重要的对象之一。

一条 Channel 由：

```text
Provider
+
Credential
+
Endpoint
+
Canonical Model
+
Provider Model Mapping
=
Channel
```

组成。

例如：

```text
Provider:
EasyRouter

Credential:
EasyRouter Main Key

Endpoint:
Global API

Canonical Model:
minimax-h3

Upstream Model:
MiniMax-H3
```

最终得到：

```text
channel_easyrouter_minimax_h3_01
```

示例：

```json
{
  "id": "channel_easyrouter_minimax_h3_01",
  "provider_id": "provider_easyrouter",
  "credential_id": "cred_01",
  "endpoint_id": "endpoint_01",
  "canonical_model_id": "minimax-h3",
  "model_mapping_id": "mapping_01",
  "status": "active",
  "priority": 100
}
```

Channel 回答：

> 这一请求究竟通过哪条真实线路发送？

---

# 9. Channel Status

Channel 状态统一为：

```text
active
disabled
degraded
unhealthy
```

### active

可以正常参与路由。

### disabled

用户主动关闭。

### degraded

仍然可以使用，但近期表现异常。

### unhealthy

暂时不应参与自动路由。

---

# 10. Channel Health

Model Router 可以保存 Channel 的本地健康指标。

例如：

```json
{
  "channel_id": "channel_easyrouter_minimax_h3_01",
  "status": "healthy",
  "success_rate": 0.982,
  "latency_ms": 820,
  "timeout_rate": 0.01,
  "rate_limit_rate": 0.004,
  "last_success_at": "2026-08-29T08:00:00Z"
}
```

这些属于：

```text
用户自己的 Private Model Router 数据
```

不是 Model Router Hub 的公共 Benchmark。

---

# 11. Public Benchmark vs Local Health

必须区分：

### Model Router Hub Benchmark

公共数据：

```text
Provider 速度
Provider 成功率
P50
P95
价格
地区测试
历史稳定性
```

### Private Model Router Health

用户自己的实际调用数据：

```text
我的 Key 是否限流
我的请求成功率
我的 Channel 延迟
我的 429
我的 5xx
我的 Timeout
```

两者不能混在一起。

---

# 12. Route Policy

Route Policy 决定：

> 某个模型请求应该优先使用哪一条 Channel？

示例：

```json
{
  "id": "route_policy_video_default",
  "name": "Default Video Route",
  "canonical_model_id": "minimax-h3",
  "strategy": "balanced",
  "enabled": true
}
```

支持策略：

```text
fixed
cheapest
fastest
stable
balanced
```

---

# 13. Fixed Route

固定路由：

```json
{
  "strategy": "fixed",
  "channel_id": "channel_easyrouter_minimax_h3_01"
}
```

关系：

```text
Request
   ↓
固定 Channel A
```

---

# 14. Cheapest Route

根据满足当前请求条件的价格选择：

```text
Channel A   $0.13/s
Channel B   $0.11/s
Channel C   $0.15/s

        ↓

Channel B
```

价格判断必须考虑：

```text
模型
分辨率
时长
Variant
Availability
```

不能只比较一个裸价格数字。

---

# 15. Fastest Route

根据最近本地健康数据选择最快 Channel。

例如：

```text
Channel A   42s
Channel B   31s
Channel C   55s
```

选择：

```text
Channel B
```

---

# 16. Stable Route

优先考虑：

```text
成功率
Timeout
429
5xx
近期连续失败
Channel Health
```

---

# 17. Balanced Route

综合考虑：

```text
价格
速度
成功率
可用性
健康状态
近期错误
用户优先级
```

具体评分公式由后续：

```text
ROUTING-SPEC
```

定义。

---

# 18. Application

Application 表示连接 Model Router 的上层应用。

例如：

```text
ArcReel
xiaofei
AIYT9
OpenMontage
Custom AI Application
```

示例：

```json
{
  "id": "app_xiaofei",
  "name": "xiaofei",
  "status": "active"
}
```

Application 不保存 Provider Credential。

---

# 19. Application Token

上层应用使用：

```text
Application Token
```

连接 Model Router。

例如：

```text
mr_xxxxxxxxx
```

示例：

```json
{
  "id": "token_01",
  "application_id": "app_xiaofei",
  "token_hash": "hash://...",
  "status": "active"
}
```

数据库应保存：

```text
token_hash
```

而不是完整明文 Token。

---

# 20. Admin Token

管理后台使用独立的：

```text
Admin Token
```

Application Token 与 Admin Token 权限必须分离。

### Application Token

允许：

```text
生成文本
生成图片
生成视频
查询任务
查询可用模型
```

### Admin Token

允许：

```text
添加 Provider
管理 Credential
创建 Channel
修改 Route
查看完整日志
修改 Router 配置
```

---

# 21. Request

Request 表示上层应用发给 Model Router 的一次请求。

示例：

```json
{
  "id": "req_001",
  "application_id": "app_xiaofei",
  "canonical_model_id": "minimax-h3",
  "operation": "video-generation",
  "routing_strategy": "balanced",
  "status": "accepted"
}
```

Request 回答：

> 应用要求 Router 做什么？

---

# 22. Request Attempt

一次 Request 可能尝试多个 Channel。

例如：

```text
Request req_001

Attempt 1
Channel A
timeout

Attempt 2
Channel B
HTTP 500

Attempt 3
Channel C
success
```

所以必须单独记录：

```text
Request Attempt
```

示例：

```json
{
  "id": "attempt_003",
  "request_id": "req_001",
  "channel_id": "channel_c",
  "attempt_number": 3,
  "status": "succeeded",
  "error_code": null
}
```

这样 Retry / Failover 才有完整证据。

---

# 23. Task

Task 用于异步图片、视频等长任务。

统一状态：

```text
queued
running
succeeded
failed
```

示例：

```json
{
  "id": "task_vid_001",
  "request_id": "req_001",
  "type": "video-generation",
  "status": "running",
  "progress": 52
}
```

---

# 24. Provider Task ID

很多 Provider 自己也会返回 Task ID。

例如：

```text
Provider Task ID:
abc123456
```

Model Router 不应直接把 Provider Task ID 当成自己的 Task ID。

应该保存映射：

```json
{
  "router_task_id": "task_vid_001",
  "provider_task_id": "abc123456"
}
```

上层应用只使用：

```text
task_vid_001
```

这样应用不会绑定某一家 Provider。

---

# 25. Task Result

成功任务结果：

```json
{
  "task_id": "task_vid_001",
  "status": "succeeded",
  "result": {
    "url": "https://storage.example.com/video.mp4"
  }
}
```

Router 不负责规定上层应用如何永久保存最终媒体。

---

# 26. Error

所有 Provider 错误需要被标准化。

示例：

```json
{
  "code": "PROVIDER_RATE_LIMITED",
  "provider_code": "429",
  "retryable": true
}
```

标准错误码包括：

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

# 27. Request Log

Router 本地日志可以记录：

```text
request_id
application_id
canonical_model_id
operation
routing_strategy
selected_channel
provider_id
start_time
end_time
duration
retry_count
failover_count
status
error_code
```

不得记录：

```text
完整 API Key
完整 Application Token
完整 Admin Token
Provider Secret
敏感 Header
```

---

# 28. Registry Snapshot

Model Router 可以保存一份本地 Registry Snapshot。

例如：

```json
{
  "registry_version": "2026-08-29",
  "updated_at": "2026-08-29T08:00:00Z"
}
```

它包含公开数据：

```text
Provider
Canonical Model
Endpoint
Protocol
Pricing
Capabilities
```

不包含：

```text
Credential
用户 Key
用户余额
用户请求
```

---

# 29. Hub Offline Principle

生产环境不能依赖：

```text
video-token.com
```

实时在线。

正确关系：

```text
Model Router Hub
      ↓
Registry 更新
      ↓
本地 Registry Snapshot
      ↓
Private Model Router
```

之后生产请求：

```text
AI Application
      ↓
Private Model Router
      ↓
Provider
```

即使 Hub 暂时不可访问，Router 仍然可以继续工作。

---

# 30. Entity Relationships

完整关系：

```text
Application
    │
    └── Application Token
              │
              ▼
            Request
              │
              ▼
         Route Policy
              │
              ▼
            Channel
       ┌──────┼──────────┐
       │      │          │
       ▼      ▼          ▼
   Provider Credential Endpoint
       │
       ▼
Provider Model Mapping
       │
       ▼
 Canonical Model

Request
   │
   ├── Request Attempt 1
   ├── Request Attempt 2
   └── Request Attempt 3
              │
              ▼
             Task
              │
              ▼
            Result
```

---

# 31. ID Naming

建议统一使用带前缀的 ID：

```text
provider_
cred_
endpoint_
channel_
route_
app_
token_
req_
attempt_
task_
```

例如：

```text
provider_easyrouter
cred_a91f2
endpoint_b18c3
channel_84da2
route_927ab
app_xiaofei
req_283ad
attempt_993ac
task_vid_782bc
```

Canonical Model ID 例外。

Canonical Model 使用 Registry 标准名称：

```text
minimax-h3
seedance-2-0
gpt-image-2
```

---

# 32. Data Ownership

必须明确数据属于谁。

### Model Router Hub

拥有/维护：

```text
公开 Provider Registry
Canonical Model Registry
Evidence
公共 Benchmark
排行榜
```

### Private Model Router

拥有：

```text
Provider 配置
Credential
Channel
Route
本地 Health
Application Token
Task
Request Log
```

### Third-party Provider

拥有：

```text
用户 Provider 账号
用户充值余额
Provider API Key
Provider 账单
Provider 自身 Task
```

Model Router 只保存用户主动配置给 Router 的 Credential。

---

# 33. Mandatory Separation

以下对象绝不能混淆：

```text
Provider
≠
Credential
```

```text
Provider
≠
Channel
```

```text
Canonical Model
≠
Upstream Model ID
```

```text
Public Benchmark
≠
Private Channel Health
```

```text
Router Task ID
≠
Provider Task ID
```

```text
Application Token
≠
Provider API Key
```

这是 Model Router 数据模型最重要的约束之一。

---

# 34. v0.1 Required Entities

Model Router v0.1 至少实现：

```text
Provider
Credential
Canonical Model
Provider Model Mapping
Endpoint
Channel
Route Policy
Application
Application Token
Request
Request Attempt
Task
Request Log
Registry Snapshot
```

后续版本可以增加：

```text
Quota
Cost Ledger
Webhook
Batch
Benchmark
Organization
User
Audit Log
```

但 V0.1 不提前引入不必要的复杂度。

---

# 35. Final Rule

Model Router 的核心数据关系可以记成一句话：

> **Provider 提供服务，Credential 提供权限，Channel 形成线路，Router 负责选择，Application 负责使用。**

以及：

> **Canonical Model 对上统一，Upstream Model 对下适配。**
