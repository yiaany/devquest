/**
 * Achievement engine — public barrel.
 *
 * Import from `@/lib/achievements` rather than reaching into submodules.
 */

export { computeAchievements } from "@/lib/achievements/compute";
export { ACHIEVEMENTS } from "@/lib/achievements/definitions";
export {
  RARITY_ORDER,
  type Achievement,
  type Rarity,
} from "@/lib/achievements/types";
