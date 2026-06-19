import type { RepoCardConfig } from "../config/schema";
import type { RepoStatsSnapshot } from "../cache/repo-stats-cache";

export type { RepoMeta } from "../github/stats";

/** Everything a template needs to render a card. */
export interface TemplateProps {
  config: RepoCardConfig;
  snapshot: RepoStatsSnapshot;
}

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;
