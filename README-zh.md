<div align="center">

# Brief

### 首个 Agent 显式委托开放协议

**将混乱的多 Agent 交接变成结构化、可审计的任务简报。**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-3178C6.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-37%20passed-brightgreen.svg)](#测试)
[![Protocol Version](https://img.shields.io/badge/Protocol-v1.2.0-orange.svg)](docs/design.md)

[English](README.md) | [中文](README-zh.md)

</div>

---

## 为什么需要 Brief

AI Agent 生态已经有了**工具调用**（[MCP](https://modelcontextprotocol.io/)）、**Agent 发现与传输**（[A2A](https://github.com/google/A2A)）和 **Agent 能力描述**（[Agent Skills](https://github.com/anthropics/agent-skills)）的标准。但最关键的交互——**一个 Agent 如何正式地将任务委托给另一个 Agent**——至今没有标准。

Cognition 团队（Devin 的创造者）在其影响深远的文章 [*"Don't Build Multi-Agents"*](https://cognition.ai/blog/dont-build-multi-agents) 中精确地识别了这个问题，称之为**"隐式甩锅"（Implicit Handoff）**：Agent 在传递任务时缺乏结构化上下文，导致决策冲突、上下文丢失和脆弱的系统。他们的诊断是正确的，但我们认为答案不是放弃多 Agent 架构，而是**将委托本身形式化**。

**Brief 是首个专门解决这一问题的开放协议。** 它引入了一种标准化、人类可读的 Agent 间任务委托格式——填补了 *Agent 如何通信*（A2A）和 *Agent 能做什么*（MCP/Skills）之间缺失的语义层。

## 工作原理

整个协议就是**两个 Markdown 文件**：

```
Agent A: 发送 brief-001.brief.md
  "这是我需要什么、为什么需要、以及期望你返回什么。"

Agent B: 发送 brief-001.response.md
  "这是我做了什么、以及我交付的成果。"
```

就这么简单。没有新的 DSL，没有二进制格式，没有框架锁定。会写 Markdown 就能用 Brief。

## 生态定位

Brief 不是又一个框架。它是一个**语义层**，与现有标准协同工作，而非替代：

```
┌─────────────────────────────────────────────────┐
│                   你的应用                        │
├─────────────────────────────────────────────────┤
│  Brief 协议       (.brief.md / .response.md)    │  ← 做什么
├─────────────────────────────────────────────────┤
│  A2A 协议         (传输与发现)                    │  ← 怎么找到和通信
├─────────────────────────────────────────────────┤
│  MCP 协议         (工具调用)                      │  ← 怎么使用工具
├─────────────────────────────────────────────────┤
│  Agent Skills     (SKILL.md)                    │  ← Agent 知道什么
└─────────────────────────────────────────────────┘
```

## 为什么选择 Brief？

| 特性 | Brief | 临时多 Agent 方案 | 单体 Agent |
|------|-------|-----------------|-----------|
| 上下文隔离 | **显式契约** | 共享内存（被污染） | 不适用 |
| 可审计性 | **完整追踪日志** | 黑盒 | 单一日志 |
| 级联委托 (A→B→C→D) | **内置深度控制** | 手动编排 | 不可能 |
| 扇出 (A→B∥C) | **原生支持** | 复杂编排 | 不可能 |
| 学习成本 | **会写 Markdown 就行** | 学习框架 API | 不适用 |
| 生态兼容 | **与 MCP + A2A 协作** | 替代一切 | 不适用 |

## 快速开始

### 安装

```bash
npm install brief-sdk
# 或
pnpm add brief-sdk
```

### 创建 Brief（委托方）

```typescript
import { Brief } from 'brief-sdk';

const brief = Brief.create({
  delegator: 'agent-orchestrator',
  delegatee: 'agent-code-reviewer',
  body: `# 简报：审查 PR #42

## 目标
审查 OAuth 2.0 迁移代码的安全问题。

## 关键约束
- 重点关注 token 的处理和存储。
- 检查 N+1 查询问题。

## 期望交付物
1. 审查摘要及发现。
2. 批准或拒绝建议。`,
});

// brief.content 是一个合法的 .brief.md 字符串——用任何方式发送它
console.log(brief.content);
```

### 接收并响应（被委托方）

```typescript
import { Brief } from 'brief-sdk';

const incoming = Brief.parse(receivedMarkdown);

console.log(incoming.delegator);  // "agent-orchestrator"
console.log(incoming.isSubBrief); // false

// 执行你的工作...
const results = await myAgent.review(incoming.body);

// 创建结构化响应
const response = incoming.createResponse({
  status: 'success',
  body: `# 审查完成

## 发现
- 批准，有少量建议。
- 在 auth/handler.ts 中发现未使用的导入。

## 建议
**批准** — 修复小问题后合并。`,
});

// response.content 是一个合法的 .response.md 字符串
```

### 级联委托 (A → B → C)

```typescript
const parentBrief = Brief.parse(receivedMarkdown);

// 创建子简报——parentId 和深度自动设置
const subBrief = parentBrief.createSubBrief({
  delegator: 'agent-fullstack-dev',
  delegatee: 'agent-docs-writer',
  body: '# 为新端点编写 API 文档。',
});

console.log(subBrief.isSubBrief);  // true
console.log(subBrief.parentId);    // parentBrief.id
```

### 追踪整条链路

```typescript
import { Trace } from 'brief-sdk';

const trace = Trace.create();

trace.append({
  agent: 'agent-orchestrator',
  action: '委托了代码审查任务。',
  briefId: 'brief-001',
});

trace.append({
  agent: 'agent-code-reviewer',
  action: '审查完成。状态：成功。',
  briefId: 'brief-001',
});

// 序列化为 trace.md
console.log(trace.toString());
```

## 协议规范

Brief 文档是一个标准的 Markdown 文件，带有 YAML frontmatter：

### `.brief.md`（请求）

```markdown
---
id: "brief-a4b1c8"
protocolVersion: "1.2.0"
delegator: "agent-orchestrator"
delegatee: "agent-code-reviewer"
timestamp: "2026-02-06T03:55:00Z"
---

# 简报：你的任务标题

## 1. 目标
需要做什么。

## 2. 上下文
为什么要做，以及相关背景。

## 3. 约束
规则和限制。

## 4. 期望交付物
需要返回什么。
```

### `.response.md`（响应）

```markdown
---
id: "brief-a4b1c8"
status: "success"
timestamp: "2026-02-06T04:30:00Z"
---

# 响应：任务完成

## 1. 摘要
做了什么。

## 2. 交付产物
输出的链接和引用。
```

### 级联字段

多级委托时，在 frontmatter 中添加以下可选字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `parentId` | `string` | 将此简报链接到父简报 |
| `maxDepth` | `number` | 允许的最大委托深度 |
| `currentDepth` | `number` | 当前在链中的深度 |

## 示例

`examples/` 目录包含三个可运行的演示：

```bash
# 简单的 A → B 委托
pnpm example:simple

# 级联 A → B → C 链
pnpm example:cascade

# 扇出 A → (B ∥ C) 并扇入
pnpm example:fanout
```

## 测试

```bash
cd packages/brief-sdk
pnpm test
```

```
 ✓ __tests__/parser.test.ts    (9 tests)
 ✓ __tests__/brief.test.ts     (10 tests)
 ✓ __tests__/response.test.ts  (7 tests)
 ✓ __tests__/trace.test.ts     (11 tests)

 Test Files  4 passed (4)
      Tests  37 passed (37)
```

## 项目结构

```
brief/
├── packages/brief-sdk/     # 核心 TypeScript SDK
│   ├── src/
│   │   ├── brief.ts         # Brief 类（创建、解析、子委托）
│   │   ├── response.ts      # BriefResponse 类
│   │   ├── trace.ts         # Trace 审计日志
│   │   ├── parser.ts        # Markdown + YAML frontmatter 解析器
│   │   ├── validator.ts     # Schema 校验
│   │   ├── types.ts         # TypeScript 类型定义
│   │   └── index.ts         # 公共 API 导出
│   └── __tests__/           # 37 个单元测试
├── examples/
│   ├── 01-simple-delegation/  # A → B
│   ├── 02-cascade-chain/      # A → B → C
│   └── 03-fan-out/            # A → (B ∥ C)
├── docs/                    # 设计文档与竞品分析
│   ├── design.md              # 协议设计（英文）
│   ├── design-zh.md           # 协议设计（中文）
│   ├── competitive-analysis.md    # 市场分析（英文）
│   └── competitive-analysis-zh.md # 市场分析（中文）
└── README.md
```

## 贡献

欢迎贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

## 许可证

[MIT](LICENSE)

---

<div align="center">

**Brief** — 因为 Agent 值得一份正式的简报，而不是含糊的甩锅。

</div>
