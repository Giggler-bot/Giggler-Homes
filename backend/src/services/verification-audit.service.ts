import {
  VerificationAuditAction,
  VerificationAuditActorType,
  VerificationAuditKind,
  VerificationAuditReason,
} from "../generated/prisma/enums.js";

import { prisma } from "../lib/prisma.js";

interface CreateVerificationAuditLogInput {
  actorId: string;
  actorType: VerificationAuditActorType;
  subjectUserId: string;
  verificationKind: VerificationAuditKind;
  verificationId: string;
  documentId?: string;
  action: VerificationAuditAction;
  reason?: VerificationAuditReason;
  ipAddress?: string | null;
  userAgent?: string | null;
  retentionExpiresAt?: Date | null;
}

type VerificationAuditClient = Pick<typeof prisma, "verificationAuditLog">;

function addUtcMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDay = new Date(
    Date.UTC(
      result.getUTCFullYear(),
      result.getUTCMonth() + 1,
      0,
    ),
  ).getUTCDate();

  result.setUTCDate(Math.min(originalDay, lastDay));

  return result;
}

export const createVerificationAuditLog = async (
  data: CreateVerificationAuditLogInput,
  db: VerificationAuditClient = prisma,
) => {
  const occurredAt = new Date();

  const retentionExpiresAt =
    data.retentionExpiresAt === undefined
      ? addUtcMonths(occurredAt, 12)
      : data.retentionExpiresAt;

  return db.verificationAuditLog.create({
    data: {
      actorId: data.actorId,
      actorType: data.actorType,
      subjectUserId: data.subjectUserId,
      verificationKind: data.verificationKind,
      verificationId: data.verificationId,
      documentId: data.documentId,
      action: data.action,
      reason: data.reason,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      occurredAt,
      retentionExpiresAt,
    },
  });
};
