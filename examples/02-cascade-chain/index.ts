/**
 * Example 02 — Cascading Delegation (A → B → C)
 *
 * This example demonstrates multi-level cascading delegation:
 * Agent A delegates to Agent B, who then sub-delegates part of
 * the work to Agent C. The trace follows the entire chain.
 *
 * Run: pnpm example:cascade
 */

import { Brief, BriefResponse, Trace } from '../../packages/brief-sdk/src/index.js';

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║   Brief Protocol — Example 02: Cascading Delegation    ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// ═══════════════════════════════════════════════════════════════════════
// Level 0: Agent A creates the root brief with a depth limit
// ═══════════════════════════════════════════════════════════════════════

console.log('🔵 [Agent A — Orchestrator] Creating root brief...\n');

const rootBrief = Brief.create({
  delegator: 'agent-orchestrator',
  delegatee: 'agent-fullstack-dev',
  maxDepth: 3,
  body: `# Briefing: Build User Profile Page

## 1. Objective

Build a complete user profile page with avatar upload, bio editing,
and activity history.

## 2. Context

We are building a SaaS dashboard. The profile page is the last
remaining feature before the v1.0 launch.

## 3. Expected Deliverables

1. Frontend React component for the profile page.
2. Backend API endpoints for profile CRUD operations.
3. Updated API documentation.`,
});

console.log(`   Root Brief: ${rootBrief.id}`);
console.log(`   Max Depth: ${rootBrief.meta.maxDepth}`);
console.log(`   Current Depth: ${rootBrief.meta.currentDepth}`);
console.log(`   Can Delegate: ${rootBrief.canDelegate}\n`);

// Initialize the trace
const trace = Trace.create();
trace.append({
  agent: 'agent-orchestrator',
  action: 'Created root brief for building user profile page.',
  briefId: rootBrief.id,
});

// ═══════════════════════════════════════════════════════════════════════
// Level 1: Agent B receives the brief and sub-delegates docs to Agent C
// ═══════════════════════════════════════════════════════════════════════

console.log('🟢 [Agent B — Fullstack Dev] Received brief. Analyzing...\n');

const receivedByB = Brief.parse(rootBrief.content);

trace.append({
  agent: 'agent-fullstack-dev',
  action: `Accepted brief ${receivedByB.id}. Will handle frontend and backend, delegating docs.`,
  briefId: receivedByB.id,
});

// Agent B decides to sub-delegate the documentation task
console.log('   Agent B can delegate further:', receivedByB.canDelegate);
console.log('   Creating sub-brief for documentation...\n');

const docsBrief = receivedByB.createSubBrief({
  delegator: 'agent-fullstack-dev',
  delegatee: 'agent-docs-writer',
  body: `# Briefing: Write API Documentation for Profile Endpoints

## 1. Objective

Write comprehensive API documentation for the new user profile endpoints.

## 2. Endpoints to Document

- \`GET /api/v1/profile/:id\` — Fetch user profile
- \`PUT /api/v1/profile/:id\` — Update user profile
- \`POST /api/v1/profile/:id/avatar\` — Upload avatar

## 3. Expected Deliverables

1. OpenAPI 3.0 specification file.
2. Human-readable Markdown documentation.`,
});

console.log(`   Sub-Brief: ${docsBrief.id}`);
console.log(`   Parent ID: ${docsBrief.parentId}`);
console.log(`   Current Depth: ${docsBrief.meta.currentDepth}`);
console.log(`   Is Sub-Brief: ${docsBrief.isSubBrief}\n`);

trace.append({
  agent: 'agent-fullstack-dev',
  action: `Delegated documentation task. Created sub-brief.`,
  briefId: docsBrief.id,
});

// Pass a copy of the trace to Agent C
const traceForC = trace.clone();

// ═══════════════════════════════════════════════════════════════════════
// Level 2: Agent C receives the sub-brief and completes the docs
// ═══════════════════════════════════════════════════════════════════════

console.log('🟡 [Agent C — Docs Writer] Received sub-brief. Working...\n');

const receivedByC = Brief.parse(docsBrief.content);

traceForC.append({
  agent: 'agent-docs-writer',
  action: `Accepted sub-brief ${receivedByC.id}. Writing API documentation.`,
  briefId: receivedByC.id,
});

// Agent C does the work and responds
const docsResponse = receivedByC.createResponse({
  status: 'success',
  body: `# Response: API Documentation Complete

## 1. Summary

All three profile endpoints have been documented with request/response
schemas, example payloads, and error codes.

## 2. Delivered Artifacts

- OpenAPI spec: \`docs/openapi/profile.yaml\`
- Markdown docs: \`docs/api/profile.md\``,
});

traceForC.append({
  agent: 'agent-docs-writer',
  action: `Completed documentation. Status: ${docsResponse.status}.`,
  briefId: receivedByC.id,
});

console.log(`   Response Status: ${docsResponse.status}`);
console.log(`   Response sent back to Agent B.\n`);

// ═══════════════════════════════════════════════════════════════════════
// Back to Level 1: Agent B merges results and responds to Agent A
// ═══════════════════════════════════════════════════════════════════════

console.log('🟢 [Agent B — Fullstack Dev] Received docs response. Merging...\n');

// Merge the trace from Agent C back into the main trace
trace.merge(traceForC);

const parsedDocsResponse = BriefResponse.parse(docsResponse.content);
console.log(`   Docs sub-task status: ${parsedDocsResponse.status}`);

trace.append({
  agent: 'agent-fullstack-dev',
  action: `Received docs response. All sub-tasks complete. Building final response.`,
  briefId: receivedByB.id,
});

// Agent B creates the final response for Agent A
const finalResponse = receivedByB.createResponse({
  status: 'success',
  body: `# Response: User Profile Page Complete

## 1. Summary

The user profile page has been fully implemented:
- Frontend React component with avatar upload and bio editing.
- Backend API with three new endpoints.
- API documentation (delegated to agent-docs-writer, completed successfully).

## 2. Delivered Artifacts

- Frontend: \`src/pages/Profile.tsx\`
- Backend: \`src/api/routes/profile.ts\`
- API Docs: \`docs/api/profile.md\`
- OpenAPI: \`docs/openapi/profile.yaml\``,
});

trace.append({
  agent: 'agent-fullstack-dev',
  action: `Responded to root brief. Status: ${finalResponse.status}.`,
  briefId: receivedByB.id,
});

// ═══════════════════════════════════════════════════════════════════════
// Back to Level 0: Agent A receives the final response
// ═══════════════════════════════════════════════════════════════════════

console.log('🔵 [Agent A — Orchestrator] Received final response.\n');

const finalParsed = BriefResponse.parse(finalResponse.content);
console.log(`   Final Status: ${finalParsed.status}`);
console.log(`   Success: ${finalParsed.isSuccess}`);

trace.append({
  agent: 'agent-orchestrator',
  action: `Received final response. Task complete.`,
  briefId: rootBrief.id,
});

// ═══════════════════════════════════════════════════════════════════════
// Print the complete trace
// ═══════════════════════════════════════════════════════════════════════

console.log('\n📊 Full Cascade Trace (trace.md):\n');
console.log(trace.toString());
console.log('\n✅ Done! The entire A → B → C cascade completed successfully.');
