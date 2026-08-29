# Model Router

[English](#english) | [中文](#中文)

**Open-source, self-hosted AI model router for BYOK, multi-provider routing, retry and failover.**

Model Router is part of the **Model Router Hub** ecosystem.

Official website:

https://www.video-token.com

---

# English

## What is Model Router?

Model Router is an open-source, self-hosted AI model routing service.

Users connect their own third-party AI Provider accounts and API Keys to their own Model Router.

Applications such as:

- ArcReel
- xiaofei
- AIYT9
- OpenMontage
- AI Agents
- AI image tools
- AI video tools
- Third-party SaaS

connect only to Model Router through one unified API.

They do not need to integrate every Provider separately.

---

## Core idea

```text
Third-party Provider
        ↓
User registers and pays directly
        ↓
User obtains API Key
        ↓
Private Model Router
        ↓
ArcReel / xiaofei / AIYT9 / OpenMontage
```

Model Router follows:

> **BYOK — Bring Your Own Key**

The user owns the Provider account, balance and API Key.

---

## Model Router Hub vs Model Router

### Model Router Hub

Public platform:

```text
Discover Providers
Compare pricing
Compare speed
Compare stability
Search by region
Provider Registry
Canonical Model Registry
Evidence
Benchmark
Ranking
```

### Model Router

Private self-hosted service:

```text
Provider configuration
Credential management
Canonical model mapping
Channels
Routing
Retry
Failover
Health checks
Tasks
Logs
Unified API
```

Core separation:

> **Hub discovers. Router connects. Applications create.**

---

## Architecture

```text
                 Model Router Hub
             video-token.com
                     │
              Public Registry
                     │
                     ▼
                Model Router
              User self-hosted
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
     Provider A  Provider B  Provider C
          ▲          ▲          ▲
          │       User Keys     │
          └──────────┬──────────┘
                     │
                     ▼
    ArcReel / xiaofei / AIYT9 / OpenMontage
```

The production request path does not need to pass through `video-token.com`.

---

## Core objects

Model Router uses the following core concepts:

```text
Provider
Credential
Canonical Model
Endpoint
Channel
Route Policy
Application
Request
Request Attempt
Task
```

### Provider

Who provides the AI model service.

### Credential

The user's private Provider API Key or Token.

### Canonical Model

The standard model ID used by Model Router.

Examples:

```text
minimax-h3
seedance-2-0
gpt-image-2
```

### Channel

A usable model access path:

```text
Provider
+
Credential
+
Endpoint
+
Canonical Model
+
Upstream Model ID
=
Channel
```

### Route Policy

Decides which Channel handles a request.

---

## Routing strategies

Model Router v0.1 is designed to support:

```text
fixed
cheapest
fastest
stable
balanced
```

### fixed

Always use one selected Channel.

### cheapest

Prefer the lowest-priced available Channel.

### fastest

Prefer the fastest recently observed Channel.

### stable

Prefer the most reliable Channel.

### balanced

Combine:

```text
Price
Latency
Success rate
Availability
Health
Recent failures
```

---

## Failover

Example:

```text
Application
    ↓
minimax-h3
    ↓
Channel A
    ↓ timeout
Channel B
    ↓ 500
Channel C
    ↓ success
```

Applications do not need to implement Provider-specific retry logic.

---

## Unified API

Applications configure only:

```text
MODEL_ROUTER_URL
MODEL_ROUTER_TOKEN
```

Example:

```text
MODEL_ROUTER_URL=http://127.0.0.1:3900
MODEL_ROUTER_TOKEN=mr_xxxxxxxxx
```

Example APIs:

```text
GET  /v1/health
GET  /v1/models

POST /v1/text/generations

POST /v1/images/generations
POST /v1/images/edits

POST /v1/videos/generations

GET  /v1/tasks/{task_id}
```

---

## Example request

```json
{
  "model": "minimax-h3",
  "prompt": "A cinematic rainy street at night.",
  "duration_seconds": 10,
  "routing": {
    "strategy": "balanced"
  }
}
```

Model Router decides:

```text
Provider
Credential
Endpoint
Upstream model ID
Channel
Retry
Failover
```

---

## Security

Provider Credentials stay inside the user's own Model Router.

Model Router Hub does not receive customer Provider API Keys.

Applications such as ArcReel, xiaofei, AIYT9 and OpenMontage only use a Model Router Application Token.

Security principles include:

```text
Credential encryption
Credential masking
Application Token
Admin Token
Secret-safe logs
Localhost default binding
SSRF protection
Bounded retry
No remote executable Provider plugins in v0.1
```

Recommended local deployment:

```text
127.0.0.1:3900
```

---

## Registry

Model Router may import public metadata from:

**Model Router Registry**

The Registry contains:

```text
Providers
Canonical models
Public endpoints
Protocols
Public pricing
Regions
Capabilities
```

It does not contain customer API Keys.

Registry repository:

`model-router-registry`

---

## Documentation

Architecture:

`docs/ARCHITECTURE-v0.1.md`

API Contract:

`docs/API-CONTRACT-v0.1.md`

Data Model:

`docs/DATA-MODEL-v0.1.md`

Security:

`docs/SECURITY-v0.1.md`

---

## v0.1 Scope

Planned v0.1 capabilities:

```text
Provider configuration
Credential management
Canonical model mapping
Endpoint management
Channel management
Manual routing
Automatic routing
Retry
Failover
Health checks
Text API
Image API
Video API
Async Tasks
Local logs
Registry import
Application Token
Admin Token
```

Not included:

```text
Provider payment
Recharge
AI credit sales
Provider commissions
Customer balances
Marketplace transactions
Centralized Provider Key storage
Centralized request proxying through video-token.com
```

---

## License

Model Router is released under:

**GNU Affero General Public License v3.0 — AGPL-3.0**

See:

`LICENSE`

---

# 中文

## Model Router 是什么？

Model Router 是一个：

> **开源、自部署、用户自己管理 Key 的 AI 模型路由器。**

用户自己去第三方 Provider：

```text
注册
 ↓
充值
 ↓
获得 API Key
 ↓
填写到自己的 Model Router
```

然后：

- ArcReel
- xiaofei
- AIYT9
- OpenMontage
- 其他 AI 应用

统一连接 Model Router。

应用不需要分别适配几十家 Provider。

---

## 最简单的理解

### Model Router Hub

负责：

> **找通道。**

包括：

```text
Provider 搜索
价格比较
速度排行
稳定性排行
地区筛选
Benchmark
Evidence
Provider Registry
模型 Registry
```

### Model Router

负责：

> **管 Key、管通道、选通道。**

包括：

```text
Credential
Provider
Endpoint
Channel
Routing
Retry
Failover
Health
Task
Logs
```

### AI 应用

负责：

> **使用模型完成自己的业务。**

例如：

```text
ArcReel
xiaofei
AIYT9
OpenMontage
```

核心原则：

> **Hub 发现与评价通道，Router 管理与选择通道，应用负责实际业务生产。**

---

## 完整流程

```text
Model Router Hub
      ↓
找到合适 Provider
      ↓
跳转 Provider 官网
      ↓
用户自己注册 / 充值
      ↓
用户获得 API Key
      ↓
填写到自己的 Model Router
      ↓
创建 Channel
      ↓
ArcReel / xiaofei / AIYT9 / OpenMontage
      ↓
统一调用 Model Router
```

---

## 为什么要使用 Model Router？

没有 Router 时：

```text
AI Application
├── Provider A Adapter
├── Provider B Adapter
├── Provider C Adapter
├── Provider D Adapter
└── Provider E Adapter
```

每增加一家 Provider，都可能要改应用代码。

使用 Model Router 后：

```text
AI Application
      ↓
Model Router API
      ↓
A / B / C / D / E Providers
```

应用只维护一套接口。

---

## 核心对象

### Provider

谁提供模型服务。

### Credential

用户自己的 API Key。

### Canonical Model

Model Router 统一定义的标准模型名称。

例如：

```text
minimax-h3
seedance-2-0
gpt-image-2
```

### Channel

一条真正可以调用的线路：

```text
Provider
+
Credential
+
Endpoint
+
Canonical Model
+
Provider 实际 Model ID
=
Channel
```

### Route Policy

决定一次请求走哪条 Channel。

---

## 路由策略

V0.1 计划支持：

```text
fixed
cheapest
fastest
stable
balanced
```

即：

```text
固定通道
最低价格
最快通道
最稳定通道
综合推荐
```

---

## 自动失败切换

例如：

```text
请求 MiniMax H3
      ↓
Channel A
      ↓ 超时
Channel B
      ↓ 500
Channel C
      ↓ 成功
```

最终应用只需要得到结果。

失败切换由 Model Router 自己处理。

---

## 应用怎么连接？

ArcReel、xiaofei、AIYT9、OpenMontage 等应用只保存：

```text
MODEL_ROUTER_URL
MODEL_ROUTER_TOKEN
```

例如：

```text
MODEL_ROUTER_URL=http://127.0.0.1:3900
MODEL_ROUTER_TOKEN=mr_xxxxxxxxx
```

不需要保存：

```text
EasyRouter Key
Provider A Key
Provider B Key
Provider C Key
```

这些 Key 全部留在用户自己的 Model Router。

---

## 安全边界

必须保持：

```text
公共 Model Router Hub
      ↓
只提供公开信息

Private Model Router
      ↓
保存用户自己的 Credential

AI Application
      ↓
只持有 Router Token
```

最重要的安全原则：

> **公共 Hub 只知道 Provider，私有 Router 才知道 Credential，业务应用只需要知道 Router。**

以及：

> **钱留在 Provider，Key 留在用户自己的 Router，生产请求只在用户 Router 与 Provider 之间流转。**

---

## 与 video-token.com 的关系

`video-token.com` 是公共 Model Router Hub。

它可以提供：

```text
Provider 排行
价格
速度
地区
Evidence
Benchmark
Registry
```

但是生产请求不应该经过：

```text
video-token.com
```

正确生产链：

```text
ArcReel / xiaofei / AIYT9 / OpenMontage
      ↓
Private Model Router
      ↓
Third-party Provider
```

即使公共 Hub 暂时不可访问，已经配置好的 Model Router 仍然应该继续工作。

---

## 当前文档

```text
docs/ARCHITECTURE-v0.1.md
docs/API-CONTRACT-v0.1.md
docs/DATA-MODEL-v0.1.md
docs/SECURITY-v0.1.md
```

这四份文档共同构成 Model Router v0.1 的基础设计。

---

## License

Model Router 使用：

**AGPL-3.0**

允许开源、自部署、修改和使用，具体权利与义务以仓库 `LICENSE` 为准。

---

## 一句话

> **One application API. Many Providers. User-owned Credentials.**

中文：

> **应用只接一个接口，Router 连接多个 Provider，Credential 始终属于用户自己。**
