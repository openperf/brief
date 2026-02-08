import { describe, it, expect } from 'vitest';
import { parseDocument, serializeDocument } from '../src/parser.js';

describe('parseDocument', () => {
  it('should parse a valid document with frontmatter and body', () => {
    const content = `---
id: "brief-001"
status: "success"
---

# Hello World

Some body content.`;

    const result = parseDocument<{ id: string; status: string }>(content);
    expect(result.meta.id).toBe('brief-001');
    expect(result.meta.status).toBe('success');
    expect(result.body).toContain('# Hello World');
    expect(result.body).toContain('Some body content.');
  });

  it('should handle frontmatter with various YAML types', () => {
    const content = `---
name: "test"
count: 42
enabled: true
---

Body text.`;

    const result = parseDocument<{ name: string; count: number; enabled: boolean }>(content);
    expect(result.meta.name).toBe('test');
    expect(result.meta.count).toBe(42);
    expect(result.meta.enabled).toBe(true);
  });

  it('should throw on missing frontmatter delimiters', () => {
    expect(() => parseDocument('No frontmatter here')).toThrow(
      'missing YAML frontmatter delimiters',
    );
  });

  it('should throw on invalid YAML', () => {
    const content = `---
: invalid: yaml: [
---

Body.`;

    expect(() => parseDocument(content)).toThrow('Invalid YAML frontmatter');
  });

  it('should throw on scalar YAML frontmatter', () => {
    const content = `---
just a string
---

Body.`;

    expect(() => parseDocument(content)).toThrow('must be a mapping');
  });

  it('should handle empty body', () => {
    const content = `---
id: "test"
---
`;

    const result = parseDocument<{ id: string }>(content);
    expect(result.meta.id).toBe('test');
    expect(result.body).toBe('');
  });
});

describe('serializeDocument', () => {
  it('should produce a valid frontmatter + body document', () => {
    const result = serializeDocument({ id: 'brief-001', status: 'success' }, '# Hello');
    expect(result).toContain('---');
    expect(result).toContain('id: brief-001');
    expect(result).toContain('status: success');
    expect(result).toContain('# Hello');
  });

  it('should strip undefined values from frontmatter', () => {
    const result = serializeDocument({ id: 'test', extra: undefined }, 'Body');
    expect(result).not.toContain('extra');
  });

  it('should produce a round-trippable document', () => {
    const meta = { id: 'brief-rt', version: '1.0.0' };
    const body = '# Round Trip Test\n\nThis should survive.';
    const serialized = serializeDocument(meta, body);
    const parsed = parseDocument<typeof meta>(serialized);
    expect(parsed.meta.id).toBe('brief-rt');
    expect(parsed.meta.version).toBe('1.0.0');
    expect(parsed.body).toContain('# Round Trip Test');
  });
});
