# Model Router Architecture v0.1

Status: Draft  
Version: 0.1

---

## 1. Product Definition

Model Router is an open-source, self-hosted AI model routing service.

It allows users to connect their own third-party AI Provider accounts and API Keys, then expose a unified API to AI applications such as:

- ArcReel
- xiaofei
- AIYT9
- OpenMontage
- Other AI applications
- AI Agents
- Third-party SaaS

Model Router is not an AI credit reseller, payment platform, recharge platform or centralized API marketplace.

### 中文说明

Model Router 是一个开源、自部署的 AI 模型路由器。

用户自行注册第三方 Provider，自行充值，自行获得 API Key，并将这些 API Key 保存到自己部署的 Model Router 中。

ArcReel、xiaofei、AIYT9、OpenMontage 或其他 AI 应用只需要连接用户自己的 Model Router，不需要直接管理各个 Provider 的 API Key。

---

## 2. Core Principle

Model Router follows the BYOK principle:

**BYOK = Bring Your Own Key**

```text
Third-party Provider
        ↓
User registers
        ↓
User pays Provider directly
        ↓
User obtains API Key
        ↓
Private Model Router
        ↓
AI Applications
```

The public Model Router Hub does not receive or store customer Provider API Keys.

### 中文

核心原则：

> 用户自己注册 Provider，自己充值，自己获得 Key，自己保存 Key。

Model Router Hub 不保存用户的 Provider API Key。

---

## 3. Ecosystem Architecture

The ecosystem contains three independent layers:

```text
             Model Router Hub
        Discover / Compare / Benchmark
                    │
                    │ Public Registry
                    ▼
               Model Router
           Self-hosted by user
                    │
       Credentials / Routing / Failover
                    │
                    ▼
        Third-party AI Providers


ArcReel / xiaofei / AIYT9 / OpenMontage
                    │
                    ▼
               Model Router
```

The three responsibilities must remain separate.

### Model Router Hub

Responsible for:

```text
Provider discovery
Provider ranking
Pricing comparison
Region filtering
Benchmark results
Provider evidence
Canonical model registry
Provider registry
```

### Model Router

Responsible for:

```text
Provider configuration
Credential management
Model mapping
Channel management
Routing
Retry
Failover
Health checks
Local logs
Unified API
```

### AI Applications

Responsible for business workflows.

Examples:

```text
ArcReel
xiaofei
AIYT9
OpenMontage
AI video applications
AI image applications
AI Agents
Third-party SaaS
```

---

## 4. System Boundary

### Model Router Hub

Model Router Hub is the public discovery and evaluation platform.

It may provide:

- Provider directory
- Model directory
- Pricing information
- Provider regions
- Provider documentation
- Provider evidence
- Benchmark data
- Speed ranking
- Stability ranking
- Price ranking
- Provider availability information

Model Router Hub does NOT:

- Store customer Provider API Keys
- Store customer Provider passwords
- Sell AI credits
- Resell model usage
- Recharge customer Provider accounts
- Hold customer balances
- Process Provider payments
- Proxy customer model requests through video-token.com
- Guarantee third-party Provider service quality

---

### Model Router

Model Router is a private, self-hosted service.

It may:

- Store the user's Provider Credentials
- Connect multiple Providers
- Map Provider-specific model IDs
- Create Channels
- Route requests
- Retry failed requests
- Fail over between Channels
- Run Provider health checks
- Record local usage logs
- Expose a unified API
- Import public Registry metadata

The user's API Keys remain inside the user's own Model Router environment.

---

### AI Applications

AI applications communicate with Model Router through a stable API contract.

Applications should not need to know:

- Which Provider was selected
- Which API Key was used
- Which upstream model ID was used
- Which Provider endpoint was used
- Which fallback Channel handled the request

---

## 5. Core Objects

### Provider

A third-party AI API service.

Examples:

```text
EasyRouter
Provider A
Provider B
Provider C
Official model API
```

Provider answers the question:

> Who provides the model service?

---

### Credential

A user's private authentication credential for a Provider.

Examples:

```text
API Key
Bearer Token
X-API-Key
Access Token
```

Credential answers:

> What private credential allows this user to access the Provider?

Credentials MUST remain private.

---

### Canonical Model

A standard model identifier defined by Model Router Registry.

Examples:

```text
minimax-h3
seedance-2-0
gpt-image-2
```

Canonical Model answers:

> Which model does the application want to use?

Different Providers may use different upstream model names.

Example:

```text
Canonical Model:
minimax-h3

Provider A upstream ID:
MiniMax-H3

Provider B upstream ID:
hailuo/minimax-h3
```

Model Router maps both to:

```text
minimax-h3
```

---

### Endpoint

A public Provider API endpoint.

Example:

```text
https://api.example.com/v1
```

An Endpoint may also include:

```text
Region
Protocol
Status
```

---

### Channel

A Channel is one usable model access path.

Conceptually:

```text
Provider
+
Credential
+
Canonical Model
+
Upstream Model ID
+
Endpoint
=
Channel
```

Example:

```text
EasyRouter
+
User API Key A
+
minimax-h3
+
MiniMax-H3
+
Global API
=
Channel A
```

Channel answers:

> Which concrete path can be used to make this model request?

---

### Route

A Route is the routing decision that selects a Channel for a request.

Example:

```text
Request:
minimax-h3

Available Channels:
Channel A
Channel B
Channel C

Selected:
Channel B
```

---

## 6. Routing Strategies

Model Router v0.1 should support the following routing strategies:

```text
fixed
cheapest
fastest
stable
balanced
```

### fixed

Always use a selected Channel.

Example:

```text
minimax-h3
    ↓
Channel A
```

---

### cheapest

Prefer the lowest-priced available Channel.

Possible factors:

```text
Public Provider price
Requested resolution
Requested duration
Model variant
Availability
```

---

### fastest

Prefer the Channel with the best recent response or generation speed.

The metric used depends on model type.

Examples:

For text:

```text
TTFT
Latency
Tokens per second
```

For image:

```text
Request latency
Queue time
Generation time
Total task time
```

For video:

```text
Submission latency
Queue time
Generation time
Total task time
```

---

### stable

Prefer the Channel with the best recent reliability.

Possible metrics:

```text
Success rate
Timeout rate
429 rate
5xx rate
Availability
Recent failures
```

---

### balanced

Use multiple factors.

Possible inputs:

```text
Price
Latency
Success rate
Availability
Recent errors
Provider health
User preference
```

The exact scoring algorithm will be defined in a later Routing Specification.

---

## 7. Failover

Model Router may retry or switch Channels when a request fails.

Typical failover conditions:

```text
Timeout
HTTP 429
HTTP 5xx
Network error
Provider unavailable
Endpoint unavailable
Provider task failure
```

Example:

```text
AI Application
      ↓
minimax-h3
      ↓
Channel A
      ↓ FAIL
Channel B
      ↓ FAIL
Channel C
      ↓ SUCCESS
```

Retry behavior MUST be bounded.

Model Router must not create unlimited retry loops.

Future configuration may include:

```text
Maximum retry count
Maximum failover count
Maximum total request duration
Retryable error codes
Non-retryable error codes
```

---

## 8. Provider Health

Model Router may maintain local Provider and Channel health information.

Example states:

```text
healthy
degraded
unhealthy
unknown
```

Health data may include:

```text
Recent success rate
Recent failures
Recent latency
429 rate
5xx rate
Timeout rate
Last successful request
Last failed request
```

Local health data belongs to the user's private Model Router.

Public Model Router Hub benchmark data is a separate dataset.

---

## 9. Registry Relationship

Model Router may consume public metadata from:

```text
model-router-registry
```

Registry information may include:

```text
Providers
Canonical models
Upstream model mappings
Public API endpoints
Protocols
Authentication methods
Public pricing
Regions
Capabilities
Availability
```

Registry data does NOT contain:

```text
Customer API Keys
Customer passwords
Customer balances
Private Credentials
```

---

## 10. Provider Information vs Benchmark Information

Model Router Hub must keep Provider-declared data and independent Benchmark data separate.

### Provider Registry

Answers:

> What does the Provider publicly claim or document?

Examples:

```text
Supported models
Official pricing
API Base URL
Documentation
Service regions
Authentication method
```

### Benchmark

Answers:

> What did Model Router Hub independently observe?

Examples:

```text
Success rate
Latency
P50
P95
Generation speed
Timeout rate
429 rate
5xx rate
Historical stability
```

Core principle:

> **Provider information is sourced. Performance is measured.**

中文：

> **Provider 信息有来源，性能数据靠实测。**

---

## 11. Security

Provider Credentials must never be:

- committed to Git
- stored in Model Router Registry
- stored in Evidence files
- sent to Model Router Hub
- exposed through public APIs
- printed in plaintext logs

Credentials should be encrypted at rest where practical.

Logs must mask secrets.

Example:

```text
Original:

sk-123456789abcdef
```

Displayed:

```text
sk-****cdef
```

Model Router must also prevent accidental secret exposure through:

```text
Error messages
Debug logs
API responses
Exports
Backup files
Telemetry
```

---

## 12. Network Boundary

Recommended deployment:

```text
Customer Server

┌─────────────────────────────────┐
│                                 │
│ AI Application                  │
│                                 │
│ ArcReel                         │
│ xiaofei                         │
│ AIYT9                           │
│ OpenMontage                     │
│ Other AI Applications           │
│                                 │
│              ↓                  │
│        Private API              │
│              ↓                  │
│                                 │
│        Model Router             │
│                                 │
│ Provider Credentials            │
│ Routing                         │
│ Failover                        │
│ Logs                            │
│                                 │
└───────────────┬─────────────────┘
                │
                ▼
       Third-party Providers
```

When the AI application and Model Router run on the same server, Model Router may listen only on:

```text
127.0.0.1
```

Example:

```text
http://127.0.0.1:3900
```

This avoids exposing the Router API directly to the public Internet.

---

## 13. Unified API

Applications should call a unified Model Router API.

The application does not need to call each Provider directly.

Example video request:

```text
POST /v1/video/generations
```

Example request:

```json
{
  "model": "minimax-h3",
  "routing": "balanced"
}
```

Model Router decides:

```text
Provider
Credential
Endpoint
Upstream model
Channel
Retry
Failover
```

The AI application only needs to understand the canonical Model Router API.

---

## 14. API Authentication

AI applications connect to the user's Model Router using a Router Access Token.

Example configuration:

```text
MODEL_ROUTER_URL=http://127.0.0.1:3900
MODEL_ROUTER_TOKEN=mr_xxxxxxxxx
```

Applications such as:

```text
ArcReel
xiaofei
AIYT9
OpenMontage
```

only store:

```text
MODEL_ROUTER_URL
MODEL_ROUTER_TOKEN
```

They do NOT need to store third-party Provider API Keys.

---

## 15. Request Chain

Final request chain:

```text
ArcReel / xiaofei / AIYT9 / OpenMontage
                    ↓
               Model Router
                    ↓
             Routing Decision
                    ↓
             Selected Channel
                    ↓
          Third-party Provider
                    ↓
                 Result
                    ↓
               Model Router
                    ↓
             AI Application
```

---

## 16. Model Types

Model Router should eventually support unified routing for:

```text
Text
Image
Video
Audio
Embedding
```

Initial important capabilities include:

```text
text-generation
image-generation
image-edit
video-generation
```

Additional capabilities may be added through Registry versions.

---

## 17. Logging

Model Router should maintain local logs for debugging and production monitoring.

Logs may include:

```text
Request ID
Canonical model
Selected Provider
Selected Channel
Routing strategy
Start time
End time
Latency
Task status
Retry count
Failover count
Error code
Masked Credential ID
```

Logs must not contain plaintext API Keys.

---

## 18. Initial Scope

Model Router v0.1 includes:

```text
Provider configuration
Credential management
Canonical model mapping
Endpoint management
Channel management
Manual routing
Basic automatic routing
Retry
Failover
Health checks
Text API
Image API
Video API
Local logs
Registry import
Router Access Token
```

Not included in v0.1:

```text
Provider payment
Customer recharge
AI credit sales
Provider commissions
Customer balances
Marketplace transactions
Centralized Provider API Key storage
Centralized request proxying through video-token.com
Provider revenue sharing
```

---

## 19. Public Hub and Private Router

The public and private systems must remain technically independent.

```text
video-token.com
Model Router Hub

Public:
Provider discovery
Pricing
Ranking
Benchmark
Evidence
Registry
        │
        │ Public metadata only
        ▼
Private Model Router

Private:
Credentials
Channels
Routing
Failover
Logs
        │
        ▼
Third-party Providers
```

If `video-token.com` becomes unavailable, an already configured private Model Router should continue operating.

The production request path should not depend on Model Router Hub being online.

---

## 20. Open Source Boundary

The Model Router Core is intended to be open-source and self-hostable.

The open Router may provide:

```text
Provider connection
Credential management
Canonical model mapping
Routing
Failover
Health checks
Unified API
Registry import
```

The official Model Router Hub may separately maintain:

```text
Official website
Provider ranking
Benchmark infrastructure
Historical performance data
Verified Provider system
Evidence review
Search
SEO
Abuse detection
Official branding
```

The open Router and official Hub are related but independent products.

---

## 21. Compatibility

Model Router is not exclusive to any single AI application.

It may be integrated by:

```text
ArcReel
xiaofei
AIYT9
OpenMontage
AI image tools
AI video tools
AI Agents
Automation platforms
Third-party SaaS
Custom applications
```

Compatibility with Model Router does not imply endorsement by Model Router Hub.

---

## 22. Architecture Rules

The following separation is mandatory:

```text
Model Router Hub
=
Discover and evaluate Providers

Model Router
=
Manage Credentials and route model requests

AI Applications
=
Perform business workflows using models
```

These responsibilities must not be merged.

Another mandatory rule:

```text
Money does not pass through Model Router Hub.

Customer Provider Keys do not pass through Model Router Hub.

Customer production model requests do not pass through Model Router Hub.
```

---

## 23. Architecture Principle

The core architecture principle is:

> **Hub discovers. Router connects. Applications create.**

中文：

> **Hub 发现与评价通道，Router 管理与选择通道，应用负责实际业务生产。**

Examples of applications include:

```text
ArcReel
xiaofei
AIYT9
OpenMontage
```

Model Router remains an independent infrastructure layer.
