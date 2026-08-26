export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type Frontmatter = Record<string, JsonValue>;

export type ErrorCode =
  | "INVALID_INPUT" | "PATH_NOT_ALLOWED" | "PATH_TRAVERSAL" | "REPARSE_POINT_ESCAPE"
  | "NOT_FOUND" | "AMBIGUOUS_CARD" | "ALREADY_EXISTS" | "DUPLICATE_ID" | "IDEMPOTENCY_CONFLICT"
  | "INVALID_METADATA" | "PARENT_NOT_FOUND" | "INVALID_PARENT_TYPE"
  | "PROVENANCE_REQUIRED" | "MISSING_REQUIREMENTS" | "HUMAN_CONFIRMATION_REQUIRED"
  | "TARGET_DIRTY" | "HASH_MISMATCH" | "WRITE_CONFLICT" | "LOCK_CONFLICT"
  | "VALIDATION_FAILED" | "RELATION_INVALID" | "PREPARE_NOT_FOUND"
  | "PREPARE_EXPIRED" | "ATOMIC_WRITE_FAILED" | "ROLLBACK_FAILED" | "RUNTIME_CLEANUP_FAILED"
  | "RUNTIME_STORAGE_DENIED" | "INTERNAL_ERROR";

export class KdfError extends Error {
  constructor(public readonly code: ErrorCode, message: string, public readonly details: JsonValue = null) {
    super(message);
    this.name = "KdfError";
  }
}

export interface ValidationReport {
  passed: boolean;
  errors: string[];
  warnings: string[];
  counts?: Record<string, number>;
}

export interface ServiceResult<T extends JsonValue = JsonValue> {
  ok: boolean; tool: string; mode: string; operation_id: string | null; data: T;
  planned_changes: JsonValue[]; files_affected: string[];
  validation: { pre_write: ValidationReport; post_write: ValidationReport };
  missing_requirements: string[]; warnings: string[];
}

export const PASS: ValidationReport = { passed: true, errors: [], warnings: [] };

export function result<T extends JsonValue>(tool: string, mode: string, data: T, extra: Partial<ServiceResult<T>> = {}): ServiceResult<T> {
  return { ok: true, tool, mode, operation_id: null, data, planned_changes: [], files_affected: [],
    validation: { pre_write: PASS, post_write: PASS }, missing_requirements: [], warnings: [], ...extra };
}

export interface CardRecord {
  path: string; absolutePath: string; frontmatter: Frontmatter; body: string; text: string;
  hash: string; links: string[]; backlinks: string[];
}

export interface KdfContract {
  contractVersion: string; commonRequired: string[]; types: string[]; statuses: string[];
  evidenceLevels: string[]; gapStatuses: string[]; humanReviews: string[];
  discoveryRelations: string[]; platforms: string[]; idPatterns: Record<string, string>;
  persistedPlatforms?: string[];
  typeRequired: Record<string, string[]>; parentTypes: Record<string, string | null>;
}
