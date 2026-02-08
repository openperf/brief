<div align="center">

# Brief

### The First Open Protocol for Explicit Agent Delegation

**Turn chaotic multi-agent handoffs into structured, auditable task briefings.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-3178C6.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-37%20passed-brightgreen.svg)](#testing)
[![Protocol Version](https://img.shields.io/badge/Protocol-v1.2.0-orange.svg)](docs/design.md)

[English](README.md) | [中文](README-zh.md)

</div>

---

## Why Brief Exists

The AI agent ecosystem now has established standards for **tool invocation** ([MCP](https://modelcontextprotocol.io/)), **agent discovery and transport** ([A2A](https://github.com/google/A2A)), and **agent capabilities** ([Agent Skills](https://github.com/anthropics/agent-skills)). Yet the most critical interaction — **how one agent formally delegates a task to another** — remains unstandardized.

The Cognition team (creators of Devin) identified this exact gap in their influential post [*"Don't Build Multi-Agents"*](https://cognition.ai/blog/dont-build-multi-agents), calling it the **"Implicit Handoff"** problem: agents pass tasks without structured context, leading to decision conflicts, context loss, and fragile systems. Their diagnosis was precise. But rather than abandoning multi-agent architectures, we believe the answer is to **formalize the delegation itself**.

**Brief is the first open protocol dedicated to solving this problem.** It introduces a standardized, human-readable format for inter-agent task delegation — filling the missing semantic layer between *how agents communicate* (A2A) and *what agents can do* (MCP/Skills).

## How It Works

The entire protocol is **two Markdown files**:

```
Agent A: sends brief-001.brief.md
  "Here's exactly what I need, why, and what I expect back."

Agent B: sends brief-001.response.md
  "Here's exactly what I did and what I'm delivering."
```

That's it. No new DSL, no binary format, no framework lock-in. If you can write Markdown, you can use Brief.

## Ecosystem Position

Brief is not another framework. It is a **semantic layer** designed to complement — never replace — existing standards:

```
┌─────────────────────────────────────────────────┐
│                  Your Application                │
├─────────────────────────────────────────────────┤
│  Brief Protocol    (.brief.md / .response.md)   │  ← What to do
├─────────────────────────────────────────────────┤
│  A2A Protocol      (Transport & Discovery)      │  ← How to find & talk
├─────────────────────────────────────────────────┤
│  MCP Protocol      (Tool Invocation)            │  ← How to use tools
├─────────────────────────────────────────────────┤
│  Agent Skills      (SKILL.md)                   │  ← What agents know
└─────────────────────────────────────────────────┘
```

## Why Brief?

| Feature | Brief | Ad-hoc Multi-Agent | Single Monolithic Agent |
|---------|-------|-------------------|------------------------|
| Context isolation | **Explicit contract** | Shared memory (polluted) | N/A |
| Auditability | **Full trace log** | Black box | Single log |
| Cascading (A→B→C→D) | **Built-in depth control** | Manual wiring | Not possible |
| Fan-out (A→B∥C) | **Native support** | Complex orchestration | Not possible |
| Learning curve | **Write Markdown** | Learn framework API | N/A |
| Ecosystem fit | **Complements MCP + A2A** | Replaces everything | N/A |

## Quick Start

### Install

```bash
npm install brief-sdk
# or
pnpm add brief-sdk
```

### Create a Brief (Delegator Side)

```typescript
import { Brief } from 'brief-sdk';

const brief = Brief.create({
  delegator: 'agent-orchestrator',
  delegatee: 'agent-code-reviewer',
  body: `# Briefing: Review PR #42

## Objective
Review the OAuth 2.0 migration code for security issues.

## Key Constraints
- Focus on token handling and storage.
- Check for N+1 queries.

## Expected Deliverables
1. Review summary with findings.
2. Approve or reject recommendation.`,
});

// brief.content is a valid .brief.md string — send it however you want
console.log(brief.content);
```

### Receive and Respond (Delegatee Side)

```typescript
import { Brief } from 'brief-sdk';

const incoming = Brief.parse(receivedMarkdown);

console.log(incoming.delegator);  // "agent-orchestrator"
console.log(incoming.isSubBrief); // false

// Do your work...
const results = await myAgent.review(incoming.body);

// Create a structured response
const response = incoming.createResponse({
  status: 'success',
  body: `# Review Complete

## Findings
- Approved with minor suggestions.
- Found unused import in auth/handler.ts.

## Recommendation
**Approve** — merge after addressing minor issues.`,
});

// response.content is a valid .response.md string
```

### Cascading Delegation (A → B → C)

```typescript
const parentBrief = Brief.parse(receivedMarkdown);

// Create a sub-brief — parentId and depth are set automatically
const subBrief = parentBrief.createSubBrief({
  delegator: 'agent-fullstack-dev',
  delegatee: 'agent-docs-writer',
  body: '# Write API docs for the new endpoints.',
});

console.log(subBrief.isSubBrief);  // true
console.log(subBrief.parentId);    // parentBrief.id
```

### Trace the Entire Chain

```typescript
import { Trace } from 'brief-sdk';

const trace = Trace.create();

trace.append({
  agent: 'agent-orchestrator',
  action: 'Delegated code review.',
  briefId: 'brief-001',
});

trace.append({
  agent: 'agent-code-reviewer',
  action: 'Completed review. Status: success.',
  briefId: 'brief-001',
});

// Serialize to trace.md
console.log(trace.toString());
```

## Protocol Specification

A Brief document is a standard Markdown file with YAML frontmatter:

### `.brief.md` (The Request)

```markdown
---
id: "brief-a4b1c8"
protocolVersion: "1.2.0"
delegator: "agent-orchestrator"
delegatee: "agent-code-reviewer"
timestamp: "2026-02-06T03:55:00Z"
---

# Briefing: Your Task Title

## 1. Objective
What needs to be done.

## 2. Context
Why it needs to be done and relevant background.

## 3. Constraints
Rules and limitations.

## 4. Expected Deliverables
What to return.
```

### `.response.md` (The Result)

```markdown
---
id: "brief-a4b1c8"
status: "success"
timestamp: "2026-02-06T04:30:00Z"
---

# Response: Task Complete

## 1. Summary
What was done.

## 2. Delivered Artifacts
Links and references to outputs.
```

### Cascading Fields

For multi-level delegation, add these optional fields to the frontmatter:

| Field | Type | Description |
|-------|------|-------------|
| `parentId` | `string` | Links this brief to a parent brief |
| `maxDepth` | `number` | Maximum allowed delegation depth |
| `currentDepth` | `number` | Current depth in the chain |

## Examples

The `examples/` directory contains three runnable demos:

```bash
# Simple A → B delegation
pnpm example:simple

# Cascading A → B → C chain
pnpm example:cascade

# Fan-out A → (B ∥ C) with fan-in
pnpm example:fanout
```

## Testing

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

## Project Structure

```
brief/
├── packages/brief-sdk/     # Core TypeScript SDK
│   ├── src/
│   │   ├── brief.ts         # Brief class (create, parse, sub-delegate)
│   │   ├── response.ts      # BriefResponse class
│   │   ├── trace.ts         # Trace audit log
│   │   ├── parser.ts        # Markdown + YAML frontmatter parser
│   │   ├── validator.ts     # Schema validation
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── index.ts         # Public API exports
│   └── __tests__/           # 37 unit tests
├── examples/
│   ├── 01-simple-delegation/  # A → B
│   ├── 02-cascade-chain/      # A → B → C
│   └── 03-fan-out/            # A → (B ∥ C)
├── docs/                    # Design documents & competitive analysis
│   ├── design.md              # Protocol design (EN)
│   ├── design-zh.md           # Protocol design (ZH)
│   ├── competitive-analysis.md    # Market analysis (EN)
│   └── competitive-analysis-zh.md # Market analysis (ZH)
└── README.md
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)

---

<div align="center">

**Brief** — Because agents deserve proper briefings, not vague handoffs.

</div>
