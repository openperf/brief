/**
 * Brief Protocol — Type Definitions
 *
 * These types define the core data structures of the Brief protocol.
 * A Brief is a Markdown document with YAML frontmatter that represents
 * an explicit delegation from one agent to another.
 */

// ---------------------------------------------------------------------------
// Brief (Request) Types
// ---------------------------------------------------------------------------

/**
 * Metadata fields stored in the YAML frontmatter of a `.brief.md` file.
 */
export interface BriefMeta {
  /** Unique identifier for this brief. Auto-generated if not provided. */
  id: string;

  /** Protocol version string, e.g. "1.2.0". */
  protocolVersion: string;

  /** Identifier of the agent issuing the delegation. */
  delegator: string;

  /** Identifier (or capability query) of the target agent. */
  delegatee: string;

  /** ISO-8601 timestamp of when the brief was created. */
  timestamp: string;

  /**
   * Optional. Links this brief to a parent brief, forming a cascade chain.
   * A brief without a parentId is a **root brief**.
   */
  parentId?: string;

  /**
   * Optional. Maximum allowed delegation depth from the root brief.
   * Used to prevent infinite recursion in cascading scenarios.
   */
  maxDepth?: number;

  /**
   * Optional. Current depth in the delegation chain.
   * Automatically incremented when creating sub-briefs.
   */
  currentDepth?: number;
}

/**
 * Options for creating a new Brief via BriefFactory.
 * Only `delegator`, `delegatee`, and `body` are required.
 */
export interface CreateBriefOptions {
  /** Identifier of the delegating agent. */
  delegator: string;

  /** Identifier or capability of the target agent. */
  delegatee: string;

  /** Markdown body containing the task instructions. */
  body: string;

  /** Optional. Custom id. Auto-generated if omitted. */
  id?: string;

  /** Optional. Protocol version. Defaults to "1.2.0". */
  protocolVersion?: string;

  /** Optional. Parent brief id for cascading. */
  parentId?: string;

  /** Optional. Maximum delegation depth. */
  maxDepth?: number;

  /** Optional. Current depth. Defaults to 0 for root briefs. */
  currentDepth?: number;
}

// ---------------------------------------------------------------------------
// Response Types
// ---------------------------------------------------------------------------

/** Possible statuses for a brief response. */
export type BriefStatus = 'success' | 'failure' | 'partial' | 'rejected';

/**
 * Metadata fields stored in the YAML frontmatter of a `.response.md` file.
 */
export interface ResponseMeta {
  /** The id of the brief this response corresponds to. */
  id: string;

  /** Outcome status of the delegated task. */
  status: BriefStatus;

  /** ISO-8601 timestamp of when the response was created. */
  timestamp: string;
}

/**
 * Options for creating a response to an existing Brief.
 */
export interface CreateResponseOptions {
  /** Outcome status. */
  status: BriefStatus;

  /** Markdown body containing the response details. */
  body: string;
}

// ---------------------------------------------------------------------------
// Trace Types
// ---------------------------------------------------------------------------

/**
 * A single entry in the trace log.
 */
export interface TraceEntry {
  /** Identifier of the agent performing the action. */
  agent: string;

  /** ISO-8601 timestamp. */
  timestamp: string;

  /** Human-readable description of the action taken. */
  action: string;

  /** Optional. The brief id associated with this action. */
  briefId?: string;
}

// ---------------------------------------------------------------------------
// Validation Types
// ---------------------------------------------------------------------------

/**
 * Result of a validation operation.
 */
export interface ValidationResult {
  /** Whether the document is valid. */
  valid: boolean;

  /** List of validation error messages, if any. */
  errors: string[];
}
