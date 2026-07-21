export interface FeatureFlagContext { organizationId: string; planId?: string; userId?: string }
export interface FeatureFlagRepository {
  isEnabled(flagKey: string, context: FeatureFlagContext): Promise<boolean>
}

export function stableRolloutBucket(flagKey: string, organizationId: string) {
  let hash = 2166136261
  for (const character of `${flagKey}:${organizationId}`) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
  return (hash >>> 0) % 100
}
