# Model Router Security Specification v0.1

Status: Draft  
Version: 0.1

---

## 1. 目标

本文档定义 Model Router v0.1 的基础安全规则。

Model Router 会保存用户自己的第三方 Provider Credential，因此安全边界必须从第一版就固定。

适用场景包括：

- ArcReel
- xiaofei
- AIYT9
- OpenMontage
- AI Agent
- AI 图片应用
- AI 视频应用
- 第三方 SaaS
- 企业内部 AI 应用

核心原则：

> **Provider Key 属于用户。**

> **Hub 不接触用户 Key。**

> **Application 不直接接触 Provider Key。**

> **Private Model Router 是 Credential 的唯一管理层。**

---

# 2. Security Boundary

整体安全边界：

```text
Model Router Hub
Public
No customer Provider Keys
        │
        │ Public Registry only
        ▼
Private Model Router
        │
        ├── Provider Credentials
        ├── Channels
        ├── Routing
        ├── Logs
        └── Tasks
        │
        ▼
Third-party Providers
```

上层应用：

```text
ArcReel
xiaofei
AIYT9
OpenMontage
Other AI Applications
```

只连接：

```text
Private Model Router
```

不直接管理第三方 Provider Credential。

---

# 3. Credential Ownership

Provider Credential 包括：

```text
API Key
Bearer Token
X-API-Key
Access Token
Secret
Password
Custom Authentication Token
```

这些 Credential 始终属于用户。

Model Router Hub 不拥有、不销售、不代管这些 Credential。

---

# 4. Credential Storage

禁止直接以明文方式保存：

```text
sk-xxxxxxxxxxxxxxxx
```

推荐结构：

```text
Credential Record
      ↓
secret_ref
      ↓
Encrypted Secret Store
```

例如：

```json
{
  "id": "cred_01",
  "provider_id": "provider_easyrouter",
  "name": "EasyRouter Main Key",
  "auth_type": "bearer",
  "secret_ref": "encrypted://credential/cred_01"
}
```

数据库主体保存：

```text
secret_ref
```

而不是直接保存明文 Key。

---

# 5. Encryption at Rest

Provider Credential 应尽量进行静态加密。

推荐：

```text
AES-256-GCM
```

或等效的成熟加密方案。

加密密钥不能与加密后的 Credential 放在同一数据表中。

推荐关系：

```text
Database
    ↓
Encrypted Credential

Environment / Secret Store
    ↓
Master Encryption Key
```

禁止：

```text
database row
=
encrypted key + master encryption key
```

否则加密没有实际意义。

---

# 6. Master Encryption Key

建议通过环境变量或 Secret Manager 提供：

```text
MODEL_ROUTER_MASTER_KEY
```

例如：

```text
MODEL_ROUTER_MASTER_KEY=xxxxxxxxxxxxxxxx
```

生产环境不得将其：

```text
提交到 Git
写入 README
写入 Registry
写入日志
写入前端代码
```

---

# 7. Git Security

严禁提交：

```text
.env
.env.production
*.key
*.pem
credentials.json
secrets.json
provider_keys.json
```

项目必须提供：

```text
.gitignore
```

至少忽略：

```text
.env
.env.*
!.env.example

data/
secrets/
*.key
*.pem
```

`.env.example` 只能包含：

```text
变量名称
示例格式
说明
```

不能包含真实 Secret。

---

# 8. Credential Masking

任何日志、后台页面、错误信息中都不得显示完整 Provider Key。

例如：

原始：

```text
sk-123456789abcdef
```

允许显示：

```text
sk-****cdef
```

或者：

```text
****cdef
```

不得通过：

```text
console.log
debug log
HTTP error
API response
task output
export file
```

泄漏完整 Key。

---

# 9. Sensitive Headers

以下 Header 默认视为敏感：

```text
Authorization
X-API-Key
API-Key
Proxy-Authorization
Cookie
Set-Cookie
```

如果 Provider 使用自定义 Secret Header，也必须加入敏感字段列表。

日志系统必须自动脱敏。

---

# 10. Application Token

ArcReel、xiaofei、AIYT9、OpenMontage 等应用连接 Model Router 时使用：

```text
Application Token
```

例如：

```text
mr_xxxxxxxxx
```

它只用于：

```text
AI Application
        ↓
Model Router
```

不能把 Application Token 当作 Provider Credential。

---

# 11. Application Token Storage

数据库建议保存：

```text
token_hash
```

而不是完整 Token。

例如：

```json
{
  "id": "token_01",
  "application_id": "app_xiaofei",
  "token_hash": "hash://...",
  "status": "active"
}
```

创建 Token 时：

```text
生成一次明文
      ↓
显示给用户
      ↓
保存 Hash
      ↓
以后不再返回完整 Token
```

---

# 12. Admin Token

管理后台必须使用独立的：

```text
Admin Token
```

不能让普通 Application Token 拥有 Provider Credential 管理权限。

---

# 13. Permission Separation

### Application Token 可以：

```text
查看可用模型
生成文本
生成图片
生成视频
查询 Task
查询自己的请求结果
```

### Application Token 不可以：

```text
读取 Provider API Key
新增 Credential
删除 Credential
修改 Provider
修改 Channel
修改 Route Policy
查看完整安全日志
创建 Admin Token
```

---

### Admin Token 可以：

```text
管理 Provider
管理 Credential
管理 Endpoint
管理 Channel
管理 Route Policy
查看管理日志
刷新 Registry
管理 Application Token
```

---

# 14. Credential API

即使 Admin API 获取 Credential 信息，也不得返回完整 Secret。

例如：

```json
{
  "id": "cred_01",
  "name": "EasyRouter Main Key",
  "provider_id": "provider_easyrouter",
  "masked_secret": "****cdef",
  "status": "active"
}
```

不得返回：

```json
{
  "api_key": "sk-123456789abcdef"
}
```

---

# 15. Credential Creation

创建 Credential：

```text
POST /v1/admin/credentials
```

允许请求中短暂传入 Secret：

```json
{
  "provider_id": "provider_easyrouter",
  "name": "Main Key",
  "secret": "sk-xxxxxxxx"
}
```

Router 接收到以后应：

```text
验证
  ↓
加密
  ↓
保存
  ↓
从内存中尽快释放
```

响应不得再次返回完整 Secret。

---

# 16. Credential Update

更新 Credential 时：

```text
新 Secret
   ↓
重新加密
   ↓
替换旧 Secret
```

旧 Secret 不应长期保留。

如需审计，只记录：

```text
Credential updated
Credential ID
Operator
Timestamp
```

不得记录旧值和新值。

---

# 17. Credential Deletion

用户删除 Credential 后：

```text
Credential
    ↓
disabled
    ↓
remove from active routing
    ↓
secure delete when appropriate
```

所有关联 Channel 必须：

```text
disabled
```

或变成：

```text
unavailable
```

避免继续尝试使用已删除 Credential。

---

# 18. Network Binding

当 AI Application 和 Model Router 位于同一台服务器时，推荐监听：

```text
127.0.0.1
```

例如：

```text
127.0.0.1:3900
```

而不是：

```text
0.0.0.0:3900
```

默认不应该把管理接口直接暴露公网。

---

# 19. Public Deployment

如果用户确实需要远程访问 Model Router：

必须建议：

```text
HTTPS
Firewall
Reverse Proxy
Strong Token
IP Allowlist
Rate Limit
```

推荐：

```text
Internet
   ↓
HTTPS Reverse Proxy
   ↓
Model Router
```

禁止直接以：

```text
http://public-ip:3900
```

裸奔到公网。

---

# 20. HTTPS

公网部署必须使用：

```text
HTTPS
```

避免：

```text
Application Token
Admin Token
Prompt
Input URL
Task data
```

在网络中明文传输。

---

# 21. Admin Interface

Admin API 与生成 API 应具有独立安全边界。

建议：

```text
/v1/*
```

用于应用调用。

例如：

```text
/v1/models
/v1/images/generations
/v1/videos/generations
/v1/tasks/*
```

管理接口：

```text
/v1/admin/*
```

例如：

```text
/v1/admin/providers
/v1/admin/credentials
/v1/admin/channels
/v1/admin/routes
```

---

# 22. Rate Limiting

Application Token 应支持请求频率限制。

例如：

```text
requests per minute
concurrent requests
active video tasks
active image tasks
```

防止：

```text
Token 泄漏
无限请求
DoS
错误循环调用
```

---

# 23. Request Size Limits

Router 应限制：

```text
Prompt length
JSON body size
Image count
Input URL count
Batch size
```

避免恶意或错误请求消耗过多内存。

---

# 24. URL Security

对于：

```text
input_images
callback URL
remote media URL
```

Router 必须防止 SSRF。

不能允许应用随意让 Router 请求：

```text
127.0.0.1
localhost
169.254.169.254
内网地址
私有管理服务
```

必须实现 URL 安全校验。

---

# 25. SSRF Protection

至少限制：

```text
127.0.0.0/8
10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
169.254.0.0/16
::1
fc00::/7
```

除非管理员明确配置允许。

---

# 26. Provider Endpoint Security

从 Registry 导入 Provider Endpoint 时：

```text
不能直接盲目信任
```

至少检查：

```text
URL scheme
Host
Protocol
Provider ID
Endpoint status
```

Registry 是公开数据源，不应被视为 Secret Source。

---

# 27. Registry Trust Boundary

Model Router Registry 只能提供：

```text
公开 Provider Metadata
```

不能远程下发：

```text
可执行代码
Shell Script
JavaScript Plugin
Python Plugin
Binary
Credential
Secret
```

V0.1 默认只接受声明式配置。

---

# 28. Provider Adapter Security

V0.1 优先使用：

```text
Declarative Adapter
```

例如：

```text
Protocol
Base URL
Authentication Type
Model Mapping
Endpoint Mapping
```

不要默认允许社区 Provider 上传任意：

```text
JavaScript
Python
Shell
```

到用户 Router 中执行。

---

# 29. Plugin Security

如果未来支持代码型 Provider Plugin，必须单独设计：

```text
Sandbox
Permission model
Code review
Signature
Network permissions
Filesystem permissions
Credential isolation
Plugin versioning
Kill switch
```

这不属于 V0.1 范围。

---

# 30. Logging Security

日志允许记录：

```text
request_id
application_id
canonical_model_id
provider_id
channel_id
routing_strategy
latency
status
error_code
retry_count
failover_count
```

禁止记录：

```text
完整 API Key
完整 Admin Token
完整 Application Token
Provider Password
Authorization Header
Cookie
Private Header
```

---

# 31. Prompt Logging

Prompt 是否保存应可配置。

建议配置：

```text
LOG_PROMPTS=false
```

默认生产环境：

```text
false
```

如果开启 Prompt 日志，必须明确提醒用户可能包含敏感业务信息。

---

# 32. Media URL Logging

媒体 URL 有时可能包含：

```text
Signed URL
Temporary Token
Query Secret
```

日志系统应考虑清除 URL Query 中的敏感参数。

例如：

原始：

```text
https://storage.example.com/video.mp4?token=abcdef
```

日志：

```text
https://storage.example.com/video.mp4?[REDACTED]
```

---

# 33. Error Security

返回给应用的错误信息应足够调试，但不得泄漏内部 Secret。

允许：

```json
{
  "error": {
    "code": "PROVIDER_AUTH_FAILED",
    "message": "Provider authentication failed."
  }
}
```

禁止：

```text
EasyRouter returned invalid key sk-123456789abcdef
```

---

# 34. Provider Raw Response

Provider 原始响应可能包含：

```text
internal request id
headers
account data
billing info
debug data
```

如果保存 Raw Response，应：

```text
脱敏
限制访问
设置保留周期
```

---

# 35. Data Retention

建议不同数据设置不同保留时间。

例如：

```text
Request logs        configurable
Provider raw logs   short retention
Task metadata       configurable
Security audit      longer retention
Credentials         until user deletes
```

具体保留周期后续单独定义。

---

# 36. Backup Security

备份可能包含：

```text
Encrypted Credentials
Tokens
Router configuration
Task metadata
Logs
```

备份必须受到与生产数据库相同级别保护。

禁止把数据库备份公开上传到：

```text
GitHub
Public OSS
Public S3
Public URL
```

---

# 37. Export Security

如果未来允许导出 Router 配置：

默认不得导出明文 Credential。

推荐：

```text
Provider metadata
Channels
Routes
Models
```

可以导出。

Credential 默认：

```text
excluded
```

如用户明确要求导出 Credential，应使用加密备份。

---

# 38. Hub Separation

Model Router Hub 与 Private Model Router 必须保持独立。

Model Router Hub 不得要求用户上传：

```text
Provider API Key
Router Admin Token
Router Credential Database
Full request logs
```

---

# 39. Hub Telemetry

如果未来 Model Router 提供可选遥测：

必须：

```text
Opt-in or clearly configurable
No Provider API Keys
No prompts by default
No media content by default
No Credentials
No Admin Token
```

允许的匿名数据可以包括：

```text
Router version
Provider ID
Canonical model ID
Success / failure aggregate
Latency aggregate
```

具体遥测政策后续独立设计。

---

# 40. Benchmark Separation

Model Router Hub 的公共 Benchmark 不应依赖窃取或上传客户自己的 Credential。

官方 Benchmark 应使用：

```text
Model Router Hub 自己控制的测试账号
或 Provider 明确授权的测试 Credential
```

客户 Credential 不参与公共 Benchmark。

---

# 41. Provider Testing

用户点击：

```text
Test Connection
```

时，可以使用用户自己的 Credential 发起最小必要请求。

测试结果只保存在 Private Model Router。

不得自动上传完整测试请求或 Credential 到 Hub。

---

# 42. Credential Validation

测试 Credential 时返回：

```text
valid
invalid
rate_limited
network_error
unknown
```

不要返回：

```text
账户完整信息
账户余额
Secret
```

除非 Provider 功能明确需要，并且用户主动请求。

---

# 43. Local Database

V0.1 可以使用本地数据库。

例如：

```text
SQLite
PostgreSQL
```

但无论数据库类型如何，Credential Secret 都不应直接以明文列保存。

---

# 44. Container Security

Docker 部署建议：

```text
非 root 用户运行
最少端口暴露
只挂载必要目录
只读取必要环境变量
```

避免：

```text
--privileged
```

除非明确需要。

---

# 45. Default Ports

示例：

```text
3900
```

用于 Model Router。

默认推荐：

```text
127.0.0.1:3900
```

管理 UI 如需要公开访问，应通过反向代理单独保护。

---

# 46. Secret Rotation

用户应该可以：

```text
新增 Credential
测试新 Credential
切换 Channel
禁用旧 Credential
删除旧 Credential
```

无需停止整个 Router。

这支持 API Key Rotation。

---

# 47. Token Revocation

Application Token 和 Admin Token 必须支持：

```text
revoke
disable
rotate
```

一旦 Token 泄漏，可以立即失效。

---

# 48. Audit Log

管理操作建议记录 Audit Log。

例如：

```text
Credential created
Credential disabled
Provider added
Channel deleted
Route modified
Admin Token created
Application Token revoked
```

Audit Log 不记录 Secret 内容。

---

# 49. Default Secure Configuration

Model Router V0.1 默认应该：

```text
Bind to localhost
Require Application Token
Require Admin Token
Mask Credentials
Disable prompt logging
Disable secret export
Disable remote code plugins
Disable public admin access
```

安全默认值必须优先。

---

# 50. Fail Closed

出现安全配置错误时，应优先：

```text
Fail Closed
```

例如：

Master Encryption Key 缺失：

```text
不要降级成明文保存
```

而应该：

```text
拒绝启动 Credential 功能
并明确报错
```

---

# 51. Secret Missing Example

错误：

```text
MODEL_ROUTER_MASTER_KEY is missing.
Credential storage cannot start securely.
```

而不是：

```text
Warning: encryption disabled, continuing...
```

---

# 52. Application Isolation

未来一个 Router 支持多个 Application 时：

```text
ArcReel
xiaofei
AIYT9
OpenMontage
```

不同 Application Token 应可以拥有独立：

```text
权限
Rate Limit
日志
调用记录
```

V0.1 至少预留 `application_id`。

---

# 53. Provider Credential Isolation

如果同一 Provider 有多个 Credential：

```text
EasyRouter Key A
EasyRouter Key B
EasyRouter Key C
```

Channel 必须明确绑定具体 Credential ID。

不能在没有记录的情况下随机读取所有 Key。

---

# 54. No Hub Dependency

生产请求链：

```text
AI Application
      ↓
Private Model Router
      ↓
Provider
```

不能变成：

```text
AI Application
      ↓
Private Model Router
      ↓
video-token.com
      ↓
Provider
```

Hub 不应成为生产请求代理层。

---

# 55. Security Responsibility Separation

### Model Router Hub

负责：

```text
公共 Registry 安全
网站安全
Benchmark 数据安全
Provider Evidence
```

### Private Model Router

负责：

```text
Credential 安全
Token 安全
Channel 安全
本地日志安全
Router API 安全
```

### Third-party Provider

负责：

```text
Provider 账号
Provider 余额
Provider API
Provider 自身安全
```

---

# 56. V0.1 Mandatory Security Requirements

V0.1 上线前至少实现：

```text
Credential encryption
Credential masking
Application Token
Admin Token
Token hashing
Localhost default binding
Secret-safe logs
Sensitive Header redaction
Git secret protection
Bounded retry
SSRF protection
No remote executable Provider plugins
Credential deletion
Token revocation
```

---

# 57. Out of Scope for V0.1

V0.1 暂不实现：

```text
Enterprise SSO
RBAC multi-tenant organizations
Hardware Security Module
Remote secrets vault integration
Signed third-party plugins
Enterprise audit export
Compliance certification
Cloud-hosted credential service
```

后续版本再扩展。

---

# 58. Security Architecture Principle

最核心的安全原则：

> **Public Hub knows Providers. Private Router knows Credentials. Applications know only the Router.**

中文：

> **公共 Hub 只知道 Provider，私有 Router 才知道 Credential，业务应用只需要知道 Router。**

以及：

> **Money stays with Providers. Keys stay with users. Production requests stay between the user's Router and Providers.**

中文：

> **钱留在 Provider，Key 留在用户自己的 Router，生产请求只在用户 Router 与 Provider 之间流转。**
