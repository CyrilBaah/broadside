export type Theme = "light" | "dark";
export type Pattern = "none" | "dots" | "grid" | "circuit";
export type Template = "default" | "minimal" | "stats-forward";
export type ImageFormat = "png" | "jpeg" | "webp";
export type FieldKey =
  | "name"
  | "owner"
  | "language"
  | "stars"
  | "forks"
  | "issues"
  | "pullRequests"
  | "description";

export const THEMES: readonly Theme[] = ["light", "dark"];
export const PATTERNS: readonly Pattern[] = ["none", "dots", "grid", "circuit"];
export const TEMPLATES: readonly Template[] = ["default", "minimal", "stats-forward"];
export const IMAGE_FORMATS: readonly ImageFormat[] = ["png", "jpeg", "webp"];
/** Display order matches the reference layout: two columns of four. */
export const FIELD_KEYS: readonly FieldKey[] = [
  "name",
  "owner",
  "language",
  "stars",
  "forks",
  "issues",
  "pullRequests",
  "description",
];

export const DEFAULT_THEME: Theme = "light";
export const DEFAULT_PATTERN: Pattern = "none";
export const DEFAULT_TEMPLATE: Template = "default";
export const DEFAULT_FORMAT: ImageFormat = "png";
export const DEFAULT_FONT = "system";
export const DEFAULT_VISIBLE_FIELDS: readonly FieldKey[] = ["name", "owner", "language", "stars"];

/** FR-006: logo upload constraints. */
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
export const ALLOWED_LOGO_MIME_TYPES: readonly string[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

/**
 * The full set of inputs needed to render a card (data-model.md: Repo Card Configuration).
 * Fully represented in a shareable URL (FR-008); never persisted server-side.
 */
export interface RepoCardConfig {
  /** Normalized lowercase owner, per FR-001. */
  owner: string;
  /** Normalized lowercase repo name (no .git suffix), per FR-001. */
  repo: string;
  theme: Theme;
  font: string;
  pattern: Pattern;
  template: Template;
  /** Reference to an uploaded logo asset, if any (FR-006). */
  logo?: string;
  /** simple-icons slug for the language-icon combo mark, if selected. Mutually exclusive with `logo`. */
  languageIcon?: string;
  /** Custom text replacing the GitHub description, if any (FR-007). */
  descriptionOverride?: string;
  /** Only relevant for static download requests (FR-010). */
  format: ImageFormat;
  /** Which card elements to render; defaults to DEFAULT_VISIBLE_FIELDS. */
  fields: FieldKey[];
}

export function defaultConfigFor(owner: string, repo: string): RepoCardConfig {
  return {
    owner,
    repo,
    theme: DEFAULT_THEME,
    font: DEFAULT_FONT,
    pattern: DEFAULT_PATTERN,
    template: DEFAULT_TEMPLATE,
    format: DEFAULT_FORMAT,
    fields: [...DEFAULT_VISIBLE_FIELDS],
  };
}

export function hasField(config: Pick<RepoCardConfig, "fields">, key: FieldKey): boolean {
  return config.fields.includes(key);
}
