export type EntitlementKey =
  | 'students.max'
  | 'teachers.max'
  | 'storage.bytes'
  | 'ai.credits'
  | 'api.enabled'
  | 'analytics.advanced'
  | 'branding.white_label'

export interface EntitlementSnapshot {
  organizationId: string
  values: Partial<Record<EntitlementKey, number | boolean>>
  evaluatedAt: Date
}

export function isWithinNumericLimit(snapshot: EntitlementSnapshot, key: EntitlementKey, usage: number) {
  const limit = snapshot.values[key]
  return typeof limit !== 'number' || usage < limit
}

export function isEntitled(snapshot: EntitlementSnapshot, key: EntitlementKey) {
  return snapshot.values[key] === true
}
