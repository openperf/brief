/**
 * # brief-sdk
 *
 * TypeScript SDK for the **Brief** protocol — explicit agent delegation
 * made simple.
 *
 * Brief turns chaotic multi-agent handoffs into structured, auditable
 * task briefings using plain Markdown files.
 *
 * ## Quick Start
 *
 * ```ts
 * import { Brief, BriefResponse, Trace } from 'brief-sdk';
 *
 * // Create a delegation brief
 * const brief = Brief.create({
 *   delegator: 'agent-a',
 *   delegatee: 'agent-b',
 *   body: '# Task\\n\\nDo something useful.',
 * });
 *
 * // Parse a received brief
 * const incoming = Brief.parse(rawMarkdown);
 *
 * // Create a response
 * const response = incoming.createResponse({
 *   status: 'success',
 *   body: '# Done\\n\\nTask completed.',
 * });
 *
 * // Track the delegation chain
 * const trace = Trace.create();
 * trace.append({ agent: 'agent-a', action: 'Delegated task.' });
 * ```
 *
 * @packageDocumentation
 */

export { Brief } from './brief.js';
export { BriefResponse } from './response.js';
export { Trace } from './trace.js';
export { parseDocument, serializeDocument } from './parser.js';
export { validateBriefMeta, validateResponseMeta } from './validator.js';

export type {
  BriefMeta,
  BriefStatus,
  ResponseMeta,
  CreateBriefOptions,
  CreateResponseOptions,
  TraceEntry,
  ValidationResult,
} from './types.js';
