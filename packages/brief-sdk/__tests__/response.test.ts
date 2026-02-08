import { describe, it, expect } from 'vitest';
import { BriefResponse } from '../src/response.js';

const SAMPLE_RESPONSE_MD = `---
id: "brief-resp01"
status: "success"
timestamp: "2026-02-06T10:30:00Z"
---

# Response: Task Complete

## 1. Summary

Everything went well.

## 2. Delivered Artifacts

- Report: \`output/report.pdf\``;

describe('BriefResponse.parse', () => {
  it('should parse a valid .response.md string', () => {
    const response = BriefResponse.parse(SAMPLE_RESPONSE_MD);
    expect(response.id).toBe('brief-resp01');
    expect(response.status).toBe('success');
    expect(response.isSuccess).toBe(true);
    expect(response.body).toContain('# Response: Task Complete');
  });

  it('should correctly identify non-success statuses', () => {
    const failureMd = `---
id: "brief-fail"
status: "failure"
timestamp: "2026-02-06T11:00:00Z"
---

# Response: Failed

Something went wrong.`;

    const response = BriefResponse.parse(failureMd);
    expect(response.status).toBe('failure');
    expect(response.isSuccess).toBe(false);
  });

  it('should throw on invalid status', () => {
    const invalidMd = `---
id: "test"
status: "unknown"
timestamp: "2026-02-06T11:00:00Z"
---

Body.`;

    expect(() => BriefResponse.parse(invalidMd)).toThrow('Invalid Response document');
  });

  it('should throw on missing fields', () => {
    const missingMd = `---
id: "test"
---

Body.`;

    expect(() => BriefResponse.parse(missingMd)).toThrow('Invalid Response document');
  });
});

describe('BriefResponse.create', () => {
  it('should create a response with auto-generated timestamp', () => {
    const response = BriefResponse.create({
      id: 'brief-abc',
      status: 'success',
      body: '# Done',
    });

    expect(response.id).toBe('brief-abc');
    expect(response.status).toBe('success');
    expect(response.meta.timestamp).toBeTruthy();
    expect(response.content).toContain('---');
    expect(response.content).toContain('# Done');
  });

  it('should produce content that can be round-tripped via parse', () => {
    const original = BriefResponse.create({
      id: 'brief-rt',
      status: 'partial',
      body: '# Partial Result\n\n50% done.',
    });

    const parsed = BriefResponse.parse(original.content);
    expect(parsed.id).toBe('brief-rt');
    expect(parsed.status).toBe('partial');
    expect(parsed.body).toContain('# Partial Result');
  });

  it('should support all valid status types', () => {
    const statuses = ['success', 'failure', 'partial', 'rejected'] as const;

    for (const status of statuses) {
      const response = BriefResponse.create({
        id: `brief-${status}`,
        status,
        body: `Status: ${status}`,
      });
      expect(response.status).toBe(status);
    }
  });
});
