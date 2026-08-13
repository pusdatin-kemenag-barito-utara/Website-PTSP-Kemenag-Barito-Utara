export async function createAuditLog({
  adminId: _adminId,
  action: _action,
  entityType: _entityType,
  entityId: _entityId,
  details: _details,
}: {
  adminId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: any;
}) {
  // Audit logging kini otomatis ditangani oleh Golang Backend
  return;
}
