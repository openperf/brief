import { describe, it, expect } from 'vitest';
import { Brief } from '../src/brief.js';

const SAMPLE_BRIEF_MD = `---
id: "brief-test01"
protocolVersion: "1.2.0"
delegator: "agent-a"
delegatee: "agent-b"
timestamp: "2026-02-06T10:00:00Z"
currentDepth: 0
---

# Briefing: Test Task

## 1. Objective

Do something useful for testing.

## 2. Expected Deliverables

1. A test result.`;

describe('Brief.parse', () => {
  it('should parse a valid .brief.md string', () => {
    const brief = Brief.parse(SAMPLE_BRIEF_MD);
    expect(brief.id).toBe('brief-test01');
    expect(brief.delegator).toBe('agent-a');
    expect(brief.delegatee).toBe('agent-b');
    expect(brief.meta.protocolVersion).toBe('1.2.0');
    expect(brief.body).toContain('# Briefing: Test Task');
    expect(brief.isSubBrief).toBe(false);
  });

  it('should throw on missing required fields', () => {
    const invalid = `---
id: "test"
---

Body.`;

    expect(() => Brief.parse(invalid)).toThrow('Invalid Brief document');
  });

  it('should parse a sub-brief with parentId', () => {
    const subBriefMd = `---
id: "brief-sub01"
protocolVersion: "1.2.0"
delegator: "agent-b"
delegatee: "agent-c"
timestamp: "2026-02-06T10:05:00Z"
parentId: "brief-test01"
currentDepth: 1
maxDepth: 3
---

# Sub-task briefing`;

    const brief = Brief.parse(subBriefMd);
    expect(brief.isSubBrief).toBe(true);
    expect(brief.parentId).toBe('brief-test01');
    expect(brief.meta.currentDepth).toBe(1);
    expect(brief.canDelegate).toBe(true);
  });
});

describe('Brief.create', () => {
  it('should create a brief with auto-generated id', () => {
    const brief = Brief.create({
      delegator: 'agent-x',
      delegatee: 'agent-y',
      body: '# Task\n\nDo it.',
    });

    expect(brief.id).toMatch(/^brief-[0-9a-f]{6}$/);
    expect(brief.delegator).toBe('agent-x');
    expect(brief.delegatee).toBe('agent-y');
    expect(brief.meta.protocolVersion).toBe('1.2.0');
    expect(brief.meta.currentDepth).toBe(0);
    expect(brief.content).toContain('---');
    expect(brief.content).toContain('# Task');
  });

  it('should create a brief with custom id', () => {
    const brief = Brief.create({
      id: 'my-custom-id',
      delegator: 'a',
      delegatee: 'b',
      body: 'Body.',
    });

    expect(brief.id).toBe('my-custom-id');
  });

  it('should produce content that can be round-tripped via parse', () => {
    const original = Brief.create({
      delegator: 'agent-1',
      delegatee: 'agent-2',
      body: '# Round Trip\n\nTest content.',
      maxDepth: 5,
    });

    const parsed = Brief.parse(original.content);
    expect(parsed.id).toBe(original.id);
    expect(parsed.delegator).toBe('agent-1');
    expect(parsed.delegatee).toBe('agent-2');
    expect(parsed.meta.maxDepth).toBe(5);
    expect(parsed.body).toContain('# Round Trip');
  });
});

describe('Brief.createSubBrief', () => {
  it('should create a sub-brief linked to the parent', () => {
    const parent = Brief.create({
      delegator: 'agent-a',
      delegatee: 'agent-b',
      body: '# Parent Task',
      maxDepth: 3,
    });

    const child = parent.createSubBrief({
      delegator: 'agent-b',
      delegatee: 'agent-c',
      body: '# Child Task',
    });

    expect(child.isSubBrief).toBe(true);
    expect(child.parentId).toBe(parent.id);
    expect(child.meta.currentDepth).toBe(1);
    expect(child.meta.maxDepth).toBe(3);
  });

  it('should throw when max depth is reached', () => {
    const atLimit = Brief.create({
      delegator: 'a',
      delegatee: 'b',
      body: 'Task',
      maxDepth: 1,
      currentDepth: 1,
    });

    expect(atLimit.canDelegate).toBe(false);
    expect(() =>
      atLimit.createSubBrief({
        delegator: 'b',
        delegatee: 'c',
        body: 'Sub-task',
      }),
    ).toThrow('maximum delegation depth');
  });

  it('should allow unlimited depth when maxDepth is not set', () => {
    const noLimit = Brief.create({
      delegator: 'a',
      delegatee: 'b',
      body: 'Task',
    });

    expect(noLimit.canDelegate).toBe(true);

    const child = noLimit.createSubBrief({
      delegator: 'b',
      delegatee: 'c',
      body: 'Sub-task',
    });

    expect(child.isSubBrief).toBe(true);
  });
});

describe('Brief.createResponse', () => {
  it('should create a response linked to the brief id', () => {
    const brief = Brief.parse(SAMPLE_BRIEF_MD);
    const response = brief.createResponse({
      status: 'success',
      body: '# Done\n\nAll good.',
    });

    expect(response.id).toBe('brief-test01');
    expect(response.status).toBe('success');
    expect(response.isSuccess).toBe(true);
    expect(response.body).toContain('# Done');
  });
});
