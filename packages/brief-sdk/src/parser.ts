/**
 * Brief Protocol — Markdown + YAML Frontmatter Parser
 *
 * Parses and serializes documents in the `.brief.md` / `.response.md` format:
 *
 * ```
 * ---
 * key: value
 * ---
 *
 * # Markdown body here
 * ```
 */

import YAML from 'yaml';

/**
 * The result of parsing a Brief-protocol Markdown document.
 */
export interface ParsedDocument<T> {
  /** Parsed YAML frontmatter as a typed object. */
  meta: T;

  /** The Markdown body (everything after the closing `---`). */
  body: string;
}

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/**
 * Parse a Markdown string with YAML frontmatter into structured data.
 *
 * @param content - The raw Markdown string.
 * @returns A `ParsedDocument` with typed `meta` and string `body`.
 * @throws {Error} If the frontmatter delimiters are missing or YAML is invalid.
 */
export function parseDocument<T>(
  content: string,
): ParsedDocument<T> {
  const trimmed = content.trim();
  const match = FRONTMATTER_REGEX.exec(trimmed);

  if (!match) {
    throw new Error(
      'Invalid Brief document: missing YAML frontmatter delimiters (---).',
    );
  }

  const [, yamlStr, body] = match;

  let meta: T;
  try {
    meta = YAML.parse(yamlStr) as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid YAML frontmatter: ${message}`);
  }

  if (meta === null || typeof meta !== 'object') {
    throw new Error('YAML frontmatter must be a mapping (object), not a scalar or array.');
  }

  return { meta, body: body.trim() };
}

/**
 * Serialize structured data back into a Markdown string with YAML frontmatter.
 *
 * @param meta - The metadata object to serialize as YAML frontmatter.
 * @param body - The Markdown body string.
 * @returns A complete Markdown document string.
 */
export function serializeDocument<T extends Record<string, unknown> = Record<string, unknown>>(
  meta: T,
  body: string,
): string {
  // Remove undefined values to keep the output clean
  const cleanMeta = Object.fromEntries(
    Object.entries(meta).filter(([, v]) => v !== undefined),
  );

  const yamlStr = YAML.stringify(cleanMeta).trim();
  return `---\n${yamlStr}\n---\n\n${body.trim()}\n`;
}
