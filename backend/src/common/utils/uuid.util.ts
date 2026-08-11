/**
 * UUID Validation Utility for NestSphere ERP
 * Prevents Prisma P2023 / Inconsistent column data exceptions on @db.Uuid columns.
 */

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isValidUuid(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return UUID_REGEX.test(id.trim());
}

export function safeUuidOrNull(id?: string | null): string | null {
  if (isValidUuid(id)) {
    return id!.trim();
  }
  return null;
}
