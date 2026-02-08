# Brief：一个用于显式 Agent 委托的协议

**作者**：Manus AI
**版本**：1.2
**日期**：2026年02月06日

## 1. 引言：为何需要显式委托

关于多智能体（Multi-Agent）AI 系统的讨论目前正处于一个十字路口。一方面，像 CrewAI 和 AutoGen 这样的框架倡导协作式 Agent 集成的力量。另一方面，一些有影响力的声音，特别是 Devin 的创建者 Cognition 团队，提出了重大关切，认为大多数多智能体架构因其**隐式交接（Implicit Handoffs）**而存在根本性缺陷 [1]。

> **隐式交接**指的是一个 Agent 在没有清晰定义、结构化和完整的上下文的情况下，将任务传递给另一个 Agent。这在程序上等同于一个经理告诉员工“处理一下这个”，却没有提供必要的背景、目标和约束。这种模糊性会导致一系列问题，包括决策冲突、上下文丢失以及系统变得脆弱和不可预测。

**Brief** 是一个基于相反原则构建的全新协议和轻量级 SDK：**显式委托（Explicit Delegation）**。

我们认同对问题的诊断，但提出了一个更精细的解决方案。我们不应放弃多智能体系统的潜力，而应使其委托过程规范化。Brief 引入了一个标准化的、可审计的协议，将混乱的“隐式交接”转变为正式的“显式委托”。它为 Agent 之间下达任务提供了结构，就像一份写得很好的 JIRA 工单、一份正式的需求建议书（RFP）或一次军事任务简报。

这种方法让开发者能够两全其美：既能利用专门 Agent 的专注能力，又能实现多智能体系统的可扩展协调，同时避免了相关的混乱。它专为那些正努力解决“上下文污染”和 Agent 协作失控挑战的高级 Agent 开发者和企业架构师而设计。

## 2. 核心原则与创新

为了真正做到创新并解决实际痛点，Brief 建立在三个核心原则之上：

1.  **简单至上**：协议必须比编写临时脚本更容易使用。如果创建一个 `Brief` 比直接进行 API 调用更难，那么它就失败了。这意味着最少的必填字段和人性化的格式。
2.  **不透明与无状态执行**：接收方 Agent 是一个黑盒。它必须*仅*基于 `Brief` 中提供的上下文进行操作。它不能访问委托方的内部状态、内存或完整的历史记录。这强制执行了清晰的决策边界，并防止了上下文污染。
3.  **拥抱而非取代**：Brief 不是另一个包罗万象的框架。它是一个轻量级的语义层，旨在与现有的标准（如 A2A 和 MCP）*协同工作*，而不是取代它们。

## 3. Brief 协议：一个双文档系统

Brief 由两个简单的 Markdown 文档组成：`.brief.md`（请求）和 `.response.md`（结果）。

### 3.1. 请求：`[id].brief.md`

该文档是正式的“任务订单”。它遵循 `SKILL.md` 的范式，即使用 YAML frontmatter 来存储元数据，使用 Markdown body 来提供人类可读的指令。

**`brief-a4b1c8.brief.md` 示例：**

```markdown
---
id: "brief-a4b1c8"
protocolVersion: "1.2.0"
delegator: "agent-openclaw-prod"
delegatee: "capability:code-refactoring"
timestamp: "2026-02-06T03:55:00Z"
---

# 任务简报：重构认证模块以使用 SSO

## 1. 目标

重构主要的用户认证模块，将认证委托给我们新的内部 SSO 服务。

## 2. 背景与历史

*用户最初报告登录缓慢。内部分析确认，在密码验证期间，遗留的 `users` 表存在数据库瓶颈。架构决策已定，迁移到集中的 SSO 服务以提高性能和安全性。*

## 3. 关键约束

- **向后兼容**：现有的 v1 API 端点（`/auth/login`）必须保持功能。
- **代码标准**：所有新代码必须遵守项目的“strict-ts” linting 规则。

## 4. 所需工件

- **当前模块源代码**: `file:///home/ubuntu/project/src/auth`
- **SSO 服务文档**: `https://internal.docs/sso/v2/api`

## 5. 预期交付物

1.  **重构后的代码**：新的认证模块的完整、经过测试的源代码。
2.  **Pull Request**：一个包含更改的 GitHub Pull Request，准备好供审查。
```

### 3.2. 响应：`[id].response.md`

为了完成闭环，接收方 Agent 会发回一个响应文档。这确保了整个委托过程是一个自包含、可审计的记录。

**`brief-a4b1c8.response.md` 示例：**

```markdown
---
id: "brief-a4b1c8"
status: "success"
timestamp: "2026-02-06T04:30:00Z"
---

# 响应：重构完成

## 1. 摘要

认证模块已成功重构以使用 SSO 服务。所有测试均已通过。

## 2. 交付的工件

- **Pull Request**: https://github.com/example/project/pull/123

## 3. 备注

- 在 `src/auth/compat.ts` 中添加了一个兼容层以支持 v1 API。
- 请确保在生产环境中设置 `SSO_CLIENT_SECRET` 环境变量。
```

## 4. 级联追踪：`trace.md`

为了处理真正的多级、级联委托（A → B → C），`trace` 不再是 `Brief` 本身的一部分。相反，它是一个独立的、仅追加的日志，随任务一起传递，提供了一个完整的、按时间顺序排列的审计追踪。

**`trace.md` 示例：**

```markdown
- **Agent**: `agent-root` @ `2026-02-06T03:50:00Z`
  - **Action**: 收到用户请求：“修复登录缓慢问题。”
- **Agent**: `agent-openclaw-prod` @ `2026-02-06T03:55:00Z`
  - **Action**: 委托重构任务。创建 `brief-a4b1c8.brief.md`。
- **Agent**: `agent-opencode-v4` @ `2026-02-06T04:05:00Z`
  - **Action**: 接受 `brief-a4b1c8`。任务复杂，委托文档更新。创建 `brief-c9d2e7.brief.md`。
- **Agent**: `agent-docs-writer` @ `2026-02-06T04:15:00Z`
  - **Action**: 接受 `brief-c9d2e7`。完成文档更新。以 `brief-c9d2e7.response.md` 响应。
- **Agent**: `agent-opencode-v4` @ `2026-02-06T04:30:00Z`
  - **Action**: 收到 `brief-c9d2e7` 的响应。完成重构。以 `brief-a4b1c8.response.md` 响应。
```

这种分离至关重要：`Brief` 是*做什么*，而 `trace` 是*谁*和*何时*。它使 `Brief` 保持干净，并专注于手头的任务。

## 5. 生态系统集成与流程

Brief 被设计为一个语义层，位于现有的传输和发现协议之上。它不重复造轮子。

![Brief 协议执行流程](images/brief_flow.png)

1.  **发现 (A2A)**: Agent A (委托方) 需要一个 `code-refactoring` 能力。它使用 A2A 协议查询一个 Agent 目录，并发现 Agent B，后者的 `AgentCard` 列出了此能力并支持 `brief-protocol-v1.2`。

2.  **委托 (Brief over A2A)**: Agent A 创建一个 `.brief.md` 文档。然后它使用 A2A 的 `SendMessage` 操作将此文档发送给 Agent B。`Brief` 的内容是 A2A 消息的有效载荷。

3.  **执行 (不透明)**: Agent B 收到 `Brief`。它使用自己的内部逻辑和工具执行任务。如果它需要调用特定的工具（例如，代码检查器），它可能会使用 **MCP (Model-Context-Protocol)** 与该工具进行交互。

4.  **级联委托 (Brief over A2A, 再次)**: 如果 Agent B 决定需要委托一个子任务（例如，更新文档），它自己就变成了委托方。它创建一个*新的* `.brief.md` 并将其发送给 Agent C，同时将其操作附加到 `trace.md` 文件中。

5.  **响应 (Brief over A2A)**: 一旦 Agent B 完成原始任务，它会创建一个 `.response.md` 文档并将其发送回 Agent A，同样使用 A2A 协议。

这种分层方法是 Brief 简单而强大的关键。它提供了缺失的“做什么”（`Brief` 格式），而不会干扰已建立的“怎么做”（A2A 用于传输，MCP 用于工具）。

## 6. SDK 设计 (`brief-sdk` for TypeScript)

SDK 的主要作用是使创建、解析和验证这些 Markdown 文档变得轻而易举。

```typescript
import { Brief, BriefResponse, BriefFactory } from 'brief-sdk';

// --- 委托方 ---

// 1. 创建一个 Brief
const brief = BriefFactory.create({
  delegator: 'agent-openclaw-prod',
  delegatee: 'capability:code-refactoring',
  body: '# 任务简报：重构认证\n\n## 1. 目标...'
});

// brief.content 现在是一个完整格式的 .brief.md 字符串
// 2. 通过 A2A 客户端（或任何传输方式）发送
a2aClient.sendMessage(brief.delegatee, brief.content);

// --- 接收方 ---

// 3. 接收并解析 Brief
const receivedContent = a2aMessage.parts[0].text;
const incomingBrief = Brief.parse(receivedContent);

// 4. 执行任务（你的 Agent 的核心逻辑）
const results = await myAgent.doWork(incomingBrief);

// 5. 创建一个响应
const response = incomingBrief.createResponse({
  status: 'success',
  body: `# 响应：重构完成\n\n- **Pull Request**: ${results.prUrl}`
});

// 6. 发回响应
a2aClient.sendMessage(response.delegator, response.content);
```

请注意，`ContextCompiler` 已经消失了。它是一个有用的实用工具，但不是协议的核心部分。它可以在以后作为 SDK 中的一个可选辅助函数提供。

## 7. 结论：简单、真实、创新

这个修订后的 Brief 设计是：

-   **简单**：它只是两个 Markdown 文件和一个可选的追踪日志。任何会写 Markdown 的人都可以使用它。
-   **创新**：它引入了 `.brief.md` / `.response.md` 模式和解耦的 `trace.md`，以实现真正的、可审计的级联委托。
-   **真实**：它通过强制执行一个干净、明确的契约，解决了 Agent 混乱交接的真正痛点，并且它与现有标准集成而不是与之竞争。

这是一个能够“一鸣惊人”的设计，不是因为它更复杂，而是因为它从根本上更简单，更专注于实际的开发者体验。

---

## 参考文献

[1] Cognition. (2025, June 12). *Don’t Build Multi-Agents*. [https://cognition.ai/blog/dont-build-multi-agents](https://cognition.ai/blog/dont-build-multi-agents)

## 8. 高级主题：级联委托与扇出

虽然简单的 A→B 委托是最常见的用例，但 Brief 被设计用于处理复杂的多级委托链（A→B→C）和扇出/扇入模式（A 委托给 B 和 C，然后等待两者都响应）。

### 8.1. 启用级联：`parentId` 字段

为了在父 `Brief` 和子 `Brief` 之间建立链接，我们在 frontmatter 中引入了一个可选的 `parentId` 字段。

- 没有 `parentId` 的 `Brief` 是**根简报**。
- *带有* `parentId` 的 `Brief` 是**子简报**。

当 Agent B 在执行 `brief-a4b1c8` 时决定将一个子任务委托给 Agent C，它会创建一个新的简报（`brief-c9d2e7`）并设置 `parentId`：

```yaml
# 在 brief-c9d2e7.brief.md 中
---
id: "brief-c9d2e7"
parentId: "brief-a4b1c8" # <-- 这将其链接到父任务
protocolVersion: "1.2.0"
delegator: "agent-opencode-v4"
delegatee: "agent-docs-writer"
timestamp: "2026-02-06T04:05:00Z"
---
# 任务简报：为 SSO 重构更新开发者文档
...
```

这个简单的机制允许构建一个完整的任务树，这对于追踪和调试至关重要。

### 8.2. 级联世界中的 `trace.md`

`trace.md` 文件是在多个层级之间保持连贯审计追踪的关键。规则很简单：

1.  **向下传递**：当一个 Agent 创建一个子简报时，它必须将当前 `trace.md` 的副本连同新的 `.brief.md` 一起传递给子 Agent。
2.  **追加，不要替换**：子 Agent 将其自己的操作追加到它收到的 `trace.md` 中。
3.  **向上传回**：当子 Agent 发送其 `.response.md` 时，它也必须返回更新后的 `trace.md`。
4.  **合并**：父 Agent 负责将来自子任务的追踪合并回其主追踪中。对于简单的 A→B→C 链，这是一个简单的追加。对于扇出场景，父 Agent 必须处理并行的追踪分支。

### 8.3. 扇出和扇入模式

Brief 支持一个 Agent 并行地将任务委托给多个其他 Agent，并等待它们全部完成的场景。

想象一下，Agent A 需要获取股票价格（`brief-002` 给 Agent B）和新闻情感分析（`brief-003` 给 Agent C）来做出决策。

1.  Agent A 创建两个独立的简报，两者都具有相同的 `parentId`（例如，根用户请求的 ID）。
2.  Agent A 将 `brief-002` 发送给 B，将 `brief-003` 发送给 C。
3.  Agent A 现在等待，直到它收到了 `brief-002` 和 `brief-003` 的 `.response.md` 文件。
4.  一旦两个响应都收到，Agent A 就可以综合结果并完成其原始任务。

SDK 可以提供辅助工具来管理这种扇出/扇入逻辑，例如 `waitForAll(briefIds)` 函数。

### 8.4. 深度限制：防止无限递归

为了防止失控的成本或无限的委托循环，可以在根简报的 frontmatter 中设置一个 `maxDepth`。每个委托级别都会增加一个 `currentDepth` 计数器。如果 `currentDepth` 超过 `maxDepth`，则禁止该 Agent 创建更多的子简报。

这些高级功能被设计为**渐进式披露**。对于简单的任务，你只需要考虑两个 Markdown 文件。对于复杂的编排，`parentId` 和 `trace.md` 提供了必要的能力和控制。
