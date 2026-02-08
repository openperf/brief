# Brief Protocol：竞品分析与市场定位

**作者**：Manus AI
**日期**：2026年2月6日
**版本**：1.0

---

## 摘要

本报告评估了 **Brief Protocol**（一个用于显式 Agent 委托的开源框架）在快速演进的 Agent 通信协议、多 Agent 框架和新兴学术研究生态中的竞争格局。分析涵盖截至 2026 年 2 月的最新发展，并识别了 Brief 在一个既拥挤又在关键领域严重不足的市场中的独特定位：**标准化、可审计的 Agent 间任务委托**。

核心发现是：尽管 Agent 协议生态已显著成熟——MCP 主导工具调用、A2A 整合了 Agent 间传输、众多编排框架争夺开发者心智——但**没有任何现有方案为 Agent 间委托的内容提供轻量级的格式标准**。Brief Protocol 恰好填补了这一空白。

---

## 1. 2026 年协议全景

Agent 协议生态已经结晶为四个明确的层次，The Register 在 2026 年 1 月的综述中进行了全面梳理 [1]。理解这些层次对于准确定位 Brief 至关重要。

### 1.1 Agent-to-Tool 协议

**模型上下文协议（MCP）** 由 Anthropic 于 2024 年底开发，已成为 Agent 工具调用的事实标准。所有主要 AI 提供商——包括 OpenAI 和 Google——均已采用 MCP [1]。**通用工具调用协议（UTCP）** 提供了更简单的替代方案，但仍属小众。

**与 Brief 的关系**：MCP 定义了 *Agent 如何使用工具*。Brief 定义了 *Agent 如何将任务委托给其他 Agent*。两者互补而非竞争。

### 1.2 Agent-to-Agent 协议

**Agent-to-Agent（A2A）** 协议由 Google 开发并贡献给 Linux Foundation，已成为 Agent 发现和通信的事实标准。2025 年夏季发生了一个重大变化：**IBM 的 Agent 通信协议（ACP）**——最初为 BeeAI 平台构建——被合并到 Linux Foundation 旗下的 A2A 中 [1]。这一整合消除了此前被视为竞争标准的 ACP。

**Agent 网络协议（ANP）** 采用点对点方式，旨在构建"Agent 互联网"[2]。Ecma International 于 2026 年 1 月推出的**自然语言交互协议（NLIP）** 尚不成熟 [1]。

**与 Brief 的关系**：A2A 定义了*传输和发现*层——Agent 如何找到彼此并交换消息。Brief 定义了当目的是任务委托时这些消息的*语义内容*。Brief 设计为在 A2A *之上*运行。

### 1.3 协议全景总结

| 层次 | 协议 | 维护者 | 状态 | 与 Brief 的关系 |
|------|------|--------|------|----------------|
| Agent-to-Tool | MCP | Anthropic | 事实标准 | 互补（工具执行） |
| Agent-to-Agent | A2A（+ACP） | Linux Foundation | 事实标准 | Brief 的传输层 |
| Agent-to-Agent | ANP | 社区 | 成长中 | 替代传输层 |
| Agent-to-User | A2UI / AG-UI | Google / CopilotKit | 早期 | 正交 |
| 领域特定 | UCP / AP2 | Google | 早期 | 验证领域特定方法 |
| **委托** | **Brief** | **开源** | **v1.0.0** | **填补空白** |

---

## 2. 编排框架格局

### 2.1 主要框架

**CrewAI** 仍是最流行的 Python 多 Agent 框架之一，使用角色扮演隐喻 [3]。**微软的 Agent Framework（MAF）** 统一了 Semantic Kernel 和 AutoGen，提供企业级编排和正式的"Handoff"编排模式 [4]。**Spring AI** 最近发布了关于子代理编排的重要系列文章，其中 Part 4 专门讨论通过"Task tool"将任务委托给专业子代理 [5]。

### 2.2 IDE 级多 Agent 支持

2026 年 2 月 5 日，**VS Code 1.109** 发布了全面的多 Agent 开发支持 [6]，可以并行运行 Claude、Codex 和 Copilot Agent，支持并行子代理执行。**Claude Code** 也通过 **Agent Teams** 功能正式化了其多 Agent 能力——通过共享任务列表、Agent 间消息传递和集中管理来协调多个 Claude Code 实例 [7]。

### 2.3 框架对比

| 框架 | 委托模型 | 标准化格式 | 跨框架 | 审计追踪 |
|------|---------|-----------|--------|---------|
| CrewAI | 角色任务 | 否（内部） | 否 | 部分 |
| MAF/AutoGen | Handoff 编排 | 否（内部） | 否 | 部分 |
| Spring AI | Task tool 子代理 | 否（内部） | 否 | 部分 |
| Claude Code Teams | tmux 会话 | 否（专有） | 否 | 内部 |
| VS Code Multi-Agent | 会话管理 | Agent Skills (.md) | 部分 | 会话日志 |
| **Brief Protocol** | **显式委托** | **是（.brief.md）** | **是** | **完整（trace.md）** |

关键区别一目了然：每个现有框架都将委托实现为*内部机制*——与其自身的运行时、API 和数据结构紧密耦合。**Brief 是唯一提供标准化、框架无关的委托内容格式的方案。**

---

## 3. 学术研究：Agent Contracts

与 Brief Protocol 在智识上最接近的工作是 2026 年 1 月发表在 arXiv 上的 **"Agent Contracts"** 论文（arXiv:2601.08815）[8]。该论文引入了一个形式化框架，将"合同"隐喻从任务分配扩展到资源约束执行，统一了输入/输出规范、多维资源约束、时间边界和成功标准。实验结果令人印象深刻：90% 的 token 减少、525 倍更低的方差、零守恒违规 [8]。

### Brief vs. Agent Contracts

| 维度 | Brief Protocol | Agent Contracts |
|------|---------------|-----------------|
| **核心关注** | 上下文传递与任务规范 | 资源治理与预算控制 |
| **格式** | Markdown + YAML（人类可读） | 形式化数学框架 |
| **实现** | 开源 SDK + 可执行示例 | 学术论文，无公开 SDK |
| **目标用户** | 实践中的 Agent 开发者 | 学术研究者 |
| **复杂度** | 极简（2 文件 + 1 追踪日志） | 高（形式化证明、守恒定律） |

两种方法是**互补而非竞争**的。Agent Contracts 的资源约束可以作为 Brief frontmatter 中的可选字段被整合。

---

## 4. Cognition 论题：验证 Brief 的存在理由

Brief Protocol 的智识基础建立在 Cognition 的标志性博客文章"Don't Build Multi-Agents"（2025 年 6 月 12 日）之上 [9]，作者 Walden Yan 提出了两个影响深远的原则：

> **原则 1**：共享上下文，共享完整的 Agent 追踪记录，而不仅仅是单条消息。

> **原则 2**：行动携带隐式决策，冲突的决策导致坏结果。

Cognition 的诊断精准：多 Agent 系统失败是因为"决策过于分散，上下文无法在 Agent 之间充分共享"。至关重要的是，Yan 指出：**"目前，我没有看到任何人在专注解决这个困难的跨 Agent 上下文传递问题。"** [9]

Brief Protocol 正是对这个问题的直接、专注的解决方案。`.brief.md` 格式通过要求显式上下文共享来执行原则 1。结构化的 frontmatter 和正文部分通过使隐式决策变为显式来执行原则 2。`trace.md` 机制提供了 Cognition 所倡导的"完整 Agent 追踪记录"。

然而，Brief 在处方上与 Cognition 分道扬镳。Cognition 建议默认使用单线程 Agent，而 Brief 认为问题不在于多 Agent 架构本身，而在于*缺乏标准化的委托格式*。

---

## 5. 独特价值主张

**第一，Brief 填补了真实的协议空白。** 生态系统有工具调用标准（MCP）、Agent 发现和传输标准（A2A）、Agent 能力标准（Agent Skills），甚至有 Agent-to-User 交互标准（A2UI/AG-UI）。但没有标准定义委托消息的*内容*。

**第二，Brief 极致简单。** 在所有协议都要求 JSON-RPC、gRPC 或复杂客户端-服务器架构的环境中，Brief 使用 Markdown——开发者生态中最通用的格式。

**第三，Brief 框架无关。** 一个 `.brief.md` 文件可以被任何框架中的任何 Agent 创建、读取和处理。

**第四，Brief 提供内置可审计性。** `trace.md` 机制在多级委托链中创建完整的时间线审计追踪。

**第五，Brief 直接回应了业界对多 Agent 系统最突出的批评。** 通过将"显式委托"实现为具体协议，Brief 将 Cognition 的理论诊断转化为实际解决方案。

---

## 6. 结论

Brief Protocol 在一个恰当的时机进入市场。Agent 生态正在快速成熟，工具调用和 Agent 通信已有清晰标准，但委托内容标准明显缺失。业界最具影响力的声音已经识别了 Brief 要解决的确切问题，但尚无人交付实际方案。

Brief Protocol 的极致简单、框架无关性和对行业核心批评的直接回应，使其独特地定位为 Agent 间任务委托的标准。

---

## 参考文献

[1] Mann, T. (2026-01-30). "Deciphering the alphabet soup of agentic AI protocols." *The Register*. https://www.theregister.com/2026/01/30/agnetic_ai_protocols_mcp_utcp_a2a_etc/

[2] "MCP, A2A, ACP & ANP: How AI Agents Communicate in Enterprise Workflows." *LinkedIn*. https://www.linkedin.com/pulse/mcp-a2a-acp-anp-how-ai-agents-communicate-enterprise-workflows-b98jc

[3] "How to Build Multi-Agent Systems: Complete 2026 Guide." *Dev.to*. https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6

[4] "Handoff - Microsoft Agent Framework." *Microsoft Learn*. https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/orchestrations/handoff

[5] Tzolov, C. (2026-01-27). "Spring AI Agentic Patterns (Part 4): Subagent Orchestration." *Spring Blog*. https://spring.io/blog/2026/01/27/spring-ai-agentic-patterns-4-task-subagents

[6] VS Code Team. (2026-02-05). "Your Home for Multi-Agent Development." *VS Code Blog*. https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development

[7] "Orchestrate teams of Claude Code sessions." *Claude Code Docs*. https://code.claude.com/docs/en/agent-teams

[8] Ye, Q. et al. (2026). "Agent Contracts: A Formal Framework for Resource-Bounded Autonomous AI Systems." *arXiv:2601.08815*. https://arxiv.org/abs/2601.08815

[9] Yan, W. (2025-06-12). "Don't Build Multi-Agents." *Cognition Blog*. https://cognition.ai/blog/dont-build-multi-agents
