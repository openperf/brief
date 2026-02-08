/**
 * Brief Protocol — Trace Module
 *
 * The Trace is a separate, append-only log that travels with a delegation
 * chain. It provides a complete, chronological audit trail of every action
 * taken by every agent in the cascade.
 *
 * Format (Markdown):
 * ```
 * - **Agent**: `agent-id` @ `2026-02-06T03:50:00Z`
 *   - **Action**: Description of what happened.
 *   - **Brief**: `brief-abc123`
 * ```
 */

import type { TraceEntry } from './types.js';

export class Trace {
  private entries: TraceEntry[] = [];

  private constructor(entries: TraceEntry[] = []) {
    this.entries = [...entries];
  }

  // ── Static Factories ────────────────────────────────────────────────

  /** Create a new, empty trace. */
  static create(): Trace {
    return new Trace();
  }

  /**
   * Parse a `trace.md` string back into a Trace instance.
   *
   * @example
   * ```ts
   * const trace = Trace.parse(fs.readFileSync('trace.md', 'utf-8'));
   * console.log(trace.getEntries());
   * ```
   */
  static parse(content: string): Trace {
    const entries: TraceEntry[] = [];
    const lines = content.split('\n');

    let current: Partial<TraceEntry> | null = null;

    for (const line of lines) {
      // Match: - **Agent**: `agent-id` @ `timestamp`
      const agentMatch = line.match(
        /^- \*\*Agent\*\*:\s*`([^`]+)`\s*@\s*`([^`]+)`/,
      );
      if (agentMatch) {
        if (current && current.agent && current.timestamp && current.action) {
          entries.push(current as TraceEntry);
        }
        current = {
          agent: agentMatch[1],
          timestamp: agentMatch[2],
        };
        continue;
      }

      if (!current) continue;

      // Match:   - **Action**: description
      const actionMatch = line.match(/^\s+- \*\*Action\*\*:\s*(.+)/);
      if (actionMatch) {
        current.action = actionMatch[1].trim();
        continue;
      }

      // Match:   - **Brief**: `brief-id`
      const briefMatch = line.match(/^\s+- \*\*Brief\*\*:\s*`([^`]+)`/);
      if (briefMatch) {
        current.briefId = briefMatch[1];
        continue;
      }
    }

    // Push the last entry
    if (current && current.agent && current.timestamp && current.action) {
      entries.push(current as TraceEntry);
    }

    return new Trace(entries);
  }

  // ── Instance Methods ────────────────────────────────────────────────

  /**
   * Append a new entry to the trace.
   *
   * @example
   * ```ts
   * trace.append({
   *   agent: 'agent-orchestrator',
   *   action: 'Delegating code review task.',
   *   briefId: 'brief-abc123',
   * });
   * ```
   */
  append(entry: Omit<TraceEntry, 'timestamp'> & { timestamp?: string }): this {
    this.entries.push({
      ...entry,
      timestamp: entry.timestamp ?? new Date().toISOString(),
    });
    return this;
  }

  /** Get all trace entries as a readonly array. */
  getEntries(): readonly TraceEntry[] {
    return [...this.entries];
  }

  /** Get the number of entries in the trace. */
  get length(): number {
    return this.entries.length;
  }

  /**
   * Create a deep copy of this trace. Used when passing the trace
   * down to a sub-agent in a cascading delegation.
   */
  clone(): Trace {
    return new Trace(this.entries.map((e) => ({ ...e })));
  }

  /**
   * Merge another trace into this one. Only entries that are not already
   * present (by agent+timestamp+action identity) are added.
   * Used for fan-in scenarios where cloned traces share a common prefix.
   */
  merge(other: Trace): this {
    const existingKeys = new Set(
      this.entries.map((e) => `${e.agent}|${e.timestamp}|${e.action}`),
    );
    for (const entry of other.getEntries()) {
      const key = `${entry.agent}|${entry.timestamp}|${entry.action}`;
      if (!existingKeys.has(key)) {
        this.entries.push(entry);
        existingKeys.add(key);
      }
    }
    // Sort by timestamp to maintain chronological order
    this.entries.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    return this;
  }

  // ── Serialization ───────────────────────────────────────────────────

  /**
   * Serialize the trace to a `trace.md` formatted string.
   *
   * @example
   * ```ts
   * fs.writeFileSync('trace.md', trace.toString());
   * ```
   */
  toString(): string {
    if (this.entries.length === 0) return '';

    return this.entries
      .map((entry) => {
        let line = `- **Agent**: \`${entry.agent}\` @ \`${entry.timestamp}\`\n`;
        line += `  - **Action**: ${entry.action}`;
        if (entry.briefId) {
          line += `\n  - **Brief**: \`${entry.briefId}\``;
        }
        return line;
      })
      .join('\n');
  }
}
