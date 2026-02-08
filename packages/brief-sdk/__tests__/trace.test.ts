import { describe, it, expect } from 'vitest';
import { Trace } from '../src/trace.js';

describe('Trace.create & append', () => {
  it('should create an empty trace', () => {
    const trace = Trace.create();
    expect(trace.length).toBe(0);
    expect(trace.getEntries()).toEqual([]);
  });

  it('should append entries with auto-generated timestamps', () => {
    const trace = Trace.create();
    trace.append({ agent: 'agent-a', action: 'Did something.' });

    expect(trace.length).toBe(1);
    const entries = trace.getEntries();
    expect(entries[0].agent).toBe('agent-a');
    expect(entries[0].action).toBe('Did something.');
    expect(entries[0].timestamp).toBeTruthy();
  });

  it('should append entries with briefId', () => {
    const trace = Trace.create();
    trace.append({
      agent: 'agent-b',
      action: 'Created brief.',
      briefId: 'brief-001',
    });

    expect(trace.getEntries()[0].briefId).toBe('brief-001');
  });

  it('should support chained append calls', () => {
    const trace = Trace.create()
      .append({ agent: 'a', action: 'Step 1.' })
      .append({ agent: 'b', action: 'Step 2.' })
      .append({ agent: 'c', action: 'Step 3.' });

    expect(trace.length).toBe(3);
  });
});

describe('Trace.clone', () => {
  it('should create an independent copy', () => {
    const original = Trace.create();
    original.append({ agent: 'agent-a', action: 'Original action.' });

    const cloned = original.clone();
    cloned.append({ agent: 'agent-b', action: 'Cloned action.' });

    expect(original.length).toBe(1);
    expect(cloned.length).toBe(2);
  });
});

describe('Trace.merge', () => {
  it('should merge entries without duplicates', () => {
    const ts = '2026-02-06T10:00:00Z';

    const traceA = Trace.create();
    traceA.append({ agent: 'shared', action: 'Common action.', timestamp: ts });
    traceA.append({ agent: 'agent-a', action: 'A-only action.', timestamp: '2026-02-06T10:01:00Z' });

    const traceB = Trace.create();
    traceB.append({ agent: 'shared', action: 'Common action.', timestamp: ts });
    traceB.append({ agent: 'agent-b', action: 'B-only action.', timestamp: '2026-02-06T10:02:00Z' });

    traceA.merge(traceB);

    // Should have 3 entries: common + A-only + B-only (no duplicate of common)
    expect(traceA.length).toBe(3);
    const agents = traceA.getEntries().map((e) => e.agent);
    expect(agents).toContain('shared');
    expect(agents).toContain('agent-a');
    expect(agents).toContain('agent-b');
  });

  it('should maintain chronological order after merge', () => {
    const traceA = Trace.create();
    traceA.append({ agent: 'a', action: 'First.', timestamp: '2026-02-06T10:00:00Z' });
    traceA.append({ agent: 'a', action: 'Third.', timestamp: '2026-02-06T10:02:00Z' });

    const traceB = Trace.create();
    traceB.append({ agent: 'b', action: 'Second.', timestamp: '2026-02-06T10:01:00Z' });

    traceA.merge(traceB);

    const actions = traceA.getEntries().map((e) => e.action);
    expect(actions).toEqual(['First.', 'Second.', 'Third.']);
  });
});

describe('Trace serialization (toString / parse)', () => {
  it('should serialize to valid trace.md format', () => {
    const trace = Trace.create();
    trace.append({
      agent: 'agent-orchestrator',
      action: 'Created delegation brief.',
      briefId: 'brief-001',
      timestamp: '2026-02-06T10:00:00Z',
    });

    const output = trace.toString();
    expect(output).toContain('**Agent**: `agent-orchestrator`');
    expect(output).toContain('@ `2026-02-06T10:00:00Z`');
    expect(output).toContain('**Action**: Created delegation brief.');
    expect(output).toContain('**Brief**: `brief-001`');
  });

  it('should round-trip through toString and parse', () => {
    const original = Trace.create();
    original.append({
      agent: 'agent-a',
      action: 'Step one.',
      briefId: 'brief-aaa',
      timestamp: '2026-02-06T10:00:00Z',
    });
    original.append({
      agent: 'agent-b',
      action: 'Step two.',
      timestamp: '2026-02-06T10:05:00Z',
    });

    const serialized = original.toString();
    const parsed = Trace.parse(serialized);

    expect(parsed.length).toBe(2);
    const entries = parsed.getEntries();
    expect(entries[0].agent).toBe('agent-a');
    expect(entries[0].action).toBe('Step one.');
    expect(entries[0].briefId).toBe('brief-aaa');
    expect(entries[1].agent).toBe('agent-b');
    expect(entries[1].action).toBe('Step two.');
    expect(entries[1].briefId).toBeUndefined();
  });

  it('should return empty string for empty trace', () => {
    const trace = Trace.create();
    expect(trace.toString()).toBe('');
  });

  it('should parse empty string into empty trace', () => {
    const trace = Trace.parse('');
    expect(trace.length).toBe(0);
  });
});
