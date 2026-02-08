/**
 * Brief Protocol — Validators
 *
 * Validates the structure and content of Brief and Response metadata.
 */

import type { BriefMeta, ResponseMeta, ValidationResult } from './types.js';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const SEMVER_REGEX = /^\d+\.\d+\.\d+/;

/**
 * Validate Brief metadata fields.
 */
export function validateBriefMeta(meta: Partial<BriefMeta>): ValidationResult {
  const errors: string[] = [];

  if (!meta.id || typeof meta.id !== 'string') {
    errors.push('Missing or invalid "id": must be a non-empty string.');
  }

  if (!meta.protocolVersion || !SEMVER_REGEX.test(meta.protocolVersion)) {
    errors.push(
      'Missing or invalid "protocolVersion": must be a semver string (e.g. "1.2.0").',
    );
  }

  if (!meta.delegator || typeof meta.delegator !== 'string') {
    errors.push('Missing or invalid "delegator": must be a non-empty string.');
  }

  if (!meta.delegatee || typeof meta.delegatee !== 'string') {
    errors.push('Missing or invalid "delegatee": must be a non-empty string.');
  }

  if (!meta.timestamp || !ISO_DATE_REGEX.test(meta.timestamp)) {
    errors.push(
      'Missing or invalid "timestamp": must be an ISO-8601 date string.',
    );
  }

  if (meta.maxDepth !== undefined && (typeof meta.maxDepth !== 'number' || meta.maxDepth < 1)) {
    errors.push('"maxDepth" must be a positive integer.');
  }

  if (meta.currentDepth !== undefined && typeof meta.currentDepth !== 'number') {
    errors.push('"currentDepth" must be a number.');
  }

  if (
    meta.maxDepth !== undefined &&
    meta.currentDepth !== undefined &&
    meta.currentDepth > meta.maxDepth
  ) {
    errors.push(
      `"currentDepth" (${meta.currentDepth}) exceeds "maxDepth" (${meta.maxDepth}).`,
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate Response metadata fields.
 */
export function validateResponseMeta(meta: Partial<ResponseMeta>): ValidationResult {
  const errors: string[] = [];

  if (!meta.id || typeof meta.id !== 'string') {
    errors.push('Missing or invalid "id": must be a non-empty string.');
  }

  const validStatuses = ['success', 'failure', 'partial', 'rejected'];
  if (!meta.status || !validStatuses.includes(meta.status)) {
    errors.push(
      `Missing or invalid "status": must be one of ${validStatuses.join(', ')}.`,
    );
  }

  if (!meta.timestamp || !ISO_DATE_REGEX.test(meta.timestamp)) {
    errors.push(
      'Missing or invalid "timestamp": must be an ISO-8601 date string.',
    );
  }

  return { valid: errors.length === 0, errors };
}
