import { db } from "./db";

type AuditInput = {
  actorId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
};

/** Writes an audit event. Never pass passwords, tokens or full personal data. */
export async function audit(input: AuditInput) {
  try {
    await db.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        summary: input.summary,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        ip: input.ip ?? null,
      },
    });
  } catch (err) {
    // Auditing must not break the user's request, but should be visible to operators.
    console.error("audit write failed", err instanceof Error ? err.message : "unknown error");
  }
}
