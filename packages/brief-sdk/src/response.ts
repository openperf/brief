/**
 * Brief Protocol — BriefResponse Class
 *
 * Represents a parsed `.response.md` document. This is the counterpart
 * to a `Brief` — it contains the result of a delegated task.
 */

import type { BriefStatus, ResponseMeta } from './types.js';
import { parseDocument, serializeDocument } from './parser.js';
import { validateResponseMeta } from './validator.js';

/**
 * Options for creating a new BriefResponse directly.
 */
export interface CreateResponseDirectOptions {
  /** The id of the brief this response corresponds to. */
  id: string;

  /** Outcome status. */
  status: BriefStatus;

  /** Markdown body containing the response details. */
  body: string;
}

export class BriefResponse {
  /** The parsed YAML frontmatter metadata. */
  readonly meta: ResponseMeta;

  /** The Markdown body containing the response details. */
  readonly body: string;

  /** The full serialized `.response.md` content. */
  readonly content: string;

  private constructor(meta: ResponseMeta, body: string, content: string) {
    this.meta = meta;
    this.body = body;
    this.content = content;
  }

  // ── Convenience Getters ─────────────────────────────────────────────

  get id(): string {
    return this.meta.id;
  }

  get status(): BriefStatus {
    return this.meta.status;
  }

  get isSuccess(): boolean {
    return this.meta.status === 'success';
  }

  // ── Static Factory: Parse ───────────────────────────────────────────

  /**
   * Parse a raw `.response.md` string into a `BriefResponse` instance.
   *
   * @param content - The raw Markdown content with YAML frontmatter.
   * @returns A validated `BriefResponse` instance.
   * @throws {Error} If parsing or validation fails.
   *
   * @example
   * ```ts
   * const response = BriefResponse.parse(rawContent);
   * if (response.isSuccess) {
   *   console.log('Task completed:', response.body);
   * }
   * ```
   */
  static parse(content: string): BriefResponse {
    const { meta, body } = parseDocument<ResponseMeta>(content);

    const validation = validateResponseMeta(meta);
    if (!validation.valid) {
      throw new Error(
        `Invalid Response document:\n  - ${validation.errors.join('\n  - ')}`,
      );
    }

    return new BriefResponse(meta, body, content.trim());
  }

  // ── Static Factory: Create ──────────────────────────────────────────

  /**
   * Create a new `BriefResponse` from options.
   *
   * @example
   * ```ts
   * const response = BriefResponse.create({
   *   id: 'brief-a4b1c8',
   *   status: 'success',
   *   body: '# Done\n\nAll tasks completed.',
   * });
   * ```
   */
  static create(options: CreateResponseDirectOptions): BriefResponse {
    const meta: ResponseMeta = {
      id: options.id,
      status: options.status,
      timestamp: new Date().toISOString(),
    };

    const content = serializeDocument(
      meta as unknown as Record<string, unknown>,
      options.body,
    );

    return new BriefResponse(meta, options.body.trim(), content);
  }
}
