// Feature flags for review humanization
export interface FeatureFlags {
  humanize_reviews_enabled: boolean;
  flexible_word_count: boolean;
  story_embedding: boolean;
  micro_events: boolean;
  natural_interjections: boolean;
  weighted_openings: boolean;
  industry_pain_points: boolean;
  multi_perspective: boolean;
}

// Default feature flag configuration
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  humanize_reviews_enabled: true, // Main toggle
  flexible_word_count: true,
  story_embedding: true,
  micro_events: true,
  natural_interjections: true,
  weighted_openings: true,
  industry_pain_points: true,
  multi_perspective: true,
};

// Get feature flags from environment or use defaults
export function getFeatureFlags(): FeatureFlags {
  return {
    humanize_reviews_enabled: Deno.env.get('HUMANIZE_REVIEWS_ENABLED') !== 'false',
    flexible_word_count: Deno.env.get('FLEXIBLE_WORD_COUNT') !== 'false',
    story_embedding: Deno.env.get('STORY_EMBEDDING') !== 'false',
    micro_events: Deno.env.get('MICRO_EVENTS') !== 'false',
    natural_interjections: Deno.env.get('NATURAL_INTERJECTIONS') !== 'false',
    weighted_openings: Deno.env.get('WEIGHTED_OPENINGS') !== 'false',
    industry_pain_points: Deno.env.get('INDUSTRY_PAIN_POINTS') !== 'false',
    multi_perspective: Deno.env.get('MULTI_PERSPECTIVE') !== 'false',
  };
}

// Check if a specific feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags.humanize_reviews_enabled && flags[feature];
}