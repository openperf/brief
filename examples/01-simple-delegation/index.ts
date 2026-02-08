/**
 * Example 01 — Simple Delegation (A → B)
 *
 * This example demonstrates the most basic Brief workflow:
 * Agent A creates a brief, Agent B receives it, executes the task,
 * and sends back a response.
 *
 * Run: pnpm example:simple
 */

import { Brief, BriefResponse, Trace } from '../../packages/brief-sdk/src/index.js';

// ═══════════════════════════════════════════════════════════════════════
// Simulate: Agent A (Orchestrator) creates a delegation brief
// ═══════════════════════════════════════════════════════════════════════

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║   Brief Protocol — Example 01: Simple Delegation       ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Step 1: Agent A creates a brief
console.log('📋 [Agent A] Creating a delegation brief...\n');

const brief = Brief.create({
  delegator: 'agent-orchestrator',
  delegatee: 'agent-code-reviewer',
  body: `# Briefing: Review Pull Request #42

## 1. Objective

Review the code changes in Pull Request #42 for the authentication module.

## 2. Context

The team has refactored the login flow to use OAuth 2.0 instead of
session-based authentication. This PR contains approximately 500 lines
of changes across 12 files.

## 3. Key Constraints

- **Security Focus**: Pay special attention to token handling and storage.
- **Performance**: Ensure no N+1 queries are introduced.

## 4. Expected Deliverables

1. A review summary with findings.
2. Approval or rejection recommendation.`,
});

console.log('   Generated .brief.md:\n');
console.log('   ' + brief.content.split('\n').join('\n   '));
console.log(`\n   Brief ID: ${brief.id}`);
console.log(`   Delegator: ${brief.delegator}`);
console.log(`   Delegatee: ${brief.delegatee}`);

// Start a trace
const trace = Trace.create();
trace.append({
  agent: 'agent-orchestrator',
  action: `Created delegation brief for code review.`,
  briefId: brief.id,
});

// ═══════════════════════════════════════════════════════════════════════
// Simulate: Sending the brief over the wire (e.g., via A2A protocol)
// ═══════════════════════════════════════════════════════════════════════

console.log('\n📡 [Transport] Sending brief to agent-code-reviewer via A2A...\n');

const wireContent = brief.content; // This is what gets sent

// ═══════════════════════════════════════════════════════════════════════
// Simulate: Agent B (Code Reviewer) receives and processes the brief
// ═══════════════════════════════════════════════════════════════════════

console.log('📥 [Agent B] Received brief. Parsing...\n');

const receivedBrief = Brief.parse(wireContent);

console.log(`   Parsed Brief ID: ${receivedBrief.id}`);
console.log(`   From: ${receivedBrief.delegator}`);
console.log(`   Is sub-brief: ${receivedBrief.isSubBrief}`);

trace.append({
  agent: 'agent-code-reviewer',
  action: `Accepted brief ${receivedBrief.id}. Starting code review.`,
  briefId: receivedBrief.id,
});

// Simulate doing the actual work...
console.log('\n⚙️  [Agent B] Performing code review...\n');

// Step 2: Agent B creates a response
console.log('📝 [Agent B] Creating response...\n');

const response = receivedBrief.createResponse({
  status: 'success',
  body: `# Review Complete: PR #42

## 1. Summary

The OAuth 2.0 migration looks solid overall. Code quality is high,
and the token handling follows best practices.

## 2. Findings

- **Approved** with minor suggestions.
- Found 2 minor issues: unused import in \`auth/handler.ts\` and
  a missing error boundary in \`auth/callback.tsx\`.

## 3. Recommendation

**Approve** — merge after addressing the minor issues above.`,
});

trace.append({
  agent: 'agent-code-reviewer',
  action: `Completed review. Responded with status: ${response.status}.`,
  briefId: receivedBrief.id,
});

console.log('   Generated .response.md:\n');
console.log('   ' + response.content.split('\n').join('\n   '));

// ═══════════════════════════════════════════════════════════════════════
// Simulate: Agent A receives the response
// ═══════════════════════════════════════════════════════════════════════

console.log('\n📥 [Agent A] Received response.\n');

const receivedResponse = BriefResponse.parse(response.content);

console.log(`   Status: ${receivedResponse.status}`);
console.log(`   Success: ${receivedResponse.isSuccess}`);

trace.append({
  agent: 'agent-orchestrator',
  action: `Received response for ${receivedResponse.id}. Status: ${receivedResponse.status}.`,
  briefId: receivedResponse.id,
});

// ═══════════════════════════════════════════════════════════════════════
// Print the full trace
// ═══════════════════════════════════════════════════════════════════════

console.log('\n📊 Full Trace (trace.md):\n');
console.log(trace.toString());
console.log('\n✅ Done!');
