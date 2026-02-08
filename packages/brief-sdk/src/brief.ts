/**
 * Brief Protocol — Brief Class
 *
 * Represents a parsed `.brief.md` document. Provides methods to inspect
 * the delegation request and create a corresponding response.
 */

import type {
  BriefMeta,
  CreateBriefOptions,
  CreateResponseOptions,
} from './types.js';
import { parseDocument, serializeDocument } from './parser.js';
import { validateBriefMeta } from './validator.js';
import { BriefResponse } from './response.js';

export class Brief {
  /** The parsed YAML frontmatter metadata. */
  readonly meta: BriefMeta;

  /** The Markdown body containing task instructions. */
  readonly body: string;

  /** The full serialized `.brief.md` content. */
  readonly content: string;

  private constructor(meta: BriefMeta, body: string, content: string) {
    this.meta = meta;
    this.body = body;
    this.content = content;
  }

  // ── Convenience Getters ─────────────────────────────────────────────

  get id(): string {
    return this.meta.id;
  }

  get delegator(): string {
    return this.meta.delegator;
  }

  get delegatee(): string {
    return this.meta.delegatee;
  }

  get parentId(): string | undefined {
    return this.meta.parentId;
  }

  /** Returns `true` if this brief has a parentId (i.e. it is a sub-brief). */
  get isSubBrief(): boolean {
    return this.meta.parentId !== undefined;
  }

  /** Returns `true` if further sub-delegation is allowed based on depth limits. */
  get canDelegate(): boolean {
    if (this.meta.maxDepth === undefined) return true;
    const depth = this.meta.currentDepth ?? 0;
    return depth < this.meta.maxDepth;
  }

  // ── Static Factory: Parse ───────────────────────────────────────────

  /**
   * Parse a raw `.brief.md` string into a `Brief` instance.
   *
   * @param content - The raw Markdown content with YAML frontmatter.
   * @returns A validated `Brief` instance.
   * @throws {Error} If parsing or validation fails.
   *
   * @example
   * ```ts
   * const brief = Brief.parse(fs.readFileSync('task.brief.md', 'utf-8'));
   * console.log(brief.id, brief.delegator);
   * ```
   */
  static parse(content: string): Brief {
    const { meta, body } = parseDocument<BriefMeta>(content);

    const validation = validateBriefMeta(meta);
    if (!validation.valid) {
      throw new Error(
        `Invalid Brief document:\n  - ${validation.errors.join('\n  - ')}`,
      );
    }

    return new Brief(meta, body, content.trim());
  }

  // ── Instance Methods ────────────────────────────────────────────────

  /**
   * Create a `BriefResponse` for this brief.
   *
   * @example
   * ```ts
   * const response = brief.createResponse({
   *   status: 'success',
   *   body: '# Done\n\nTask completed successfully.',
   * });
   * ```
   */
  createResponse(options: CreateResponseOptions): BriefResponse {
    return BriefResponse.create({
      id: this.meta.id,
      status: options.status,
      body: options.body,
    });
  }

  /**
   * Create a sub-brief for cascading delegation.
   *
   * This method automatically sets the `parentId` to this brief's id
   * and increments the `currentDepth`.
   *
   * @throws {Error} If the maximum delegation depth has been reached.
   *
   * @example
   * ```ts
   * const subBrief = parentBrief.createSubBrief({
   *   delegator: 'agent-b',
   *   delegatee: 'agent-c',
   *   body: '# Sub-task\n\nPlease update the docs.',
   * });
   * ```
   */
  createSubBrief(options: Omit<CreateBriefOptions, 'parentId' | 'currentDepth'>): Brief {
    if (!this.canDelegate) {
      throw new Error(
        `Cannot create sub-brief: maximum delegation depth (${this.meta.maxDepth}) reached.`,
      );
    }

    const nextDepth = (this.meta.currentDepth ?? 0) + 1;

    const subOptions: CreateBriefOptions = {
      ...options,
      parentId: this.meta.id,
      maxDepth: this.meta.maxDepth,
      currentDepth: nextDepth,
    };

    return Brief.create(subOptions);
  }

  // ── Static Factory: Create ──────────────────────────────────────────

  /**
   * Create a new `Brief` from options. This is the primary way to
   * construct a brief programmatically.
   *
   * @example
   * ```ts
   * const brief = Brief.create({
   *   delegator: 'agent-a',
   *   delegatee: 'agent-b',
   *   body: '# Task\n\nDo something useful.',
   * });
   *
   * // brief.content is a valid .brief.md string
   * ```
   */
  static create(options: CreateBriefOptions): Brief {
    const id = options.id ?? generateId();
    const meta: BriefMeta = {
      id,
      protocolVersion: options.protocolVersion ?? '1.2.0',
      delegator: options.delegator,
      delegatee: options.delegatee,
      timestamp: new Date().toISOString(),
      parentId: options.parentId,
      maxDepth: options.maxDepth,
      currentDepth: options.currentDepth ?? (options.parentId ? undefined : 0),
    };

    const content = serializeDocument(meta as unknown as Record<string, unknown>, options.body);

    return new Brief(meta, options.body.trim(), content);
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

/** Generate a short random id prefixed with "brief-". */
function generateId(): string {
  const hex = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  return `brief-${hex}`;
}
