/**
 * Achievement computation.
 *
 * Pure function over {@link GitHubStats}: evaluates every registered
 * achievement's `unlock` predicate and returns those that fire, sorted rarest
 * first. No I/O, no randomness — deterministic for a given input.
 */

import { ACHIEVEMENTS } from "@/lib/achievements/definitions";
import { RARITY_ORDER, type Achievement } from "@/lib/achievements/types";
import type { GitHubStats } from "@/lib/types";

/**
 * Compute the achievements a user has unlocked.
 *
 * @param stats - normalized public GitHub stats.
 * @returns unlocked achievements, sorted by rarity descending (legendary
 *          first), then by name for a stable order within a tier.
 */
export function computeAchievements(stats: GitHubStats): Achievement[] {
  return ACHIEVEMENTS.filter((a) => {
    // Defensive: extended-data badges must never unlock until wired up.
    if (a.requiresExtendedData) return false;
    return a.unlock(stats);
  }).sort((a, b) => {
    const byRarity = RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
    return byRarity !== 0 ? byRarity : a.name.localeCompare(b.name);
  });
}
