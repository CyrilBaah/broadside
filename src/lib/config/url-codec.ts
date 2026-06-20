import {
  DEFAULT_FONT,
  DEFAULT_FORMAT,
  DEFAULT_PATTERN,
  DEFAULT_TEMPLATE,
  DEFAULT_THEME,
  DEFAULT_VISIBLE_FIELDS,
  FIELD_KEYS,
  IMAGE_FORMATS,
  PATTERNS,
  TEMPLATES,
  THEMES,
  type FieldKey,
  type ImageFormat,
  type Pattern,
  type RepoCardConfig,
  type Template,
  type Theme,
} from "./schema";

/**
 * FR-008: encode/decode the full Repo Card Configuration to/from URL query
 * parameters, so the entire customization is shareable and scriptable without
 * any backend state (contracts/card-image-endpoint.md).
 */

function isOneOf<T extends string>(value: string | null, allowed: readonly T[]): value is T {
  return value !== null && (allowed as readonly string[]).includes(value);
}

export function decodeConfig(
  owner: string,
  repo: string,
  params: URLSearchParams,
): RepoCardConfig {
  const themeParam = params.get("theme");
  const patternParam = params.get("pattern");
  const templateParam = params.get("template");
  const formatParam = params.get("format");

  const theme: Theme = isOneOf(themeParam, THEMES) ? themeParam : DEFAULT_THEME;
  const pattern: Pattern = isOneOf(patternParam, PATTERNS) ? patternParam : DEFAULT_PATTERN;
  const template: Template = isOneOf(templateParam, TEMPLATES) ? templateParam : DEFAULT_TEMPLATE;
  const format: ImageFormat = isOneOf(formatParam, IMAGE_FORMATS) ? formatParam : DEFAULT_FORMAT;

  const font = params.get("font") ?? DEFAULT_FONT;
  const logo = params.get("logo") ?? undefined;
  const languageIcon = params.get("languageIcon") ?? undefined;
  const descriptionOverride = params.get("description") ?? undefined;

  const fieldsParam = params.get("fields");
  const fields =
    fieldsParam === null
      ? [...DEFAULT_VISIBLE_FIELDS]
      : fieldsParam
          .split(",")
          .filter((key): key is FieldKey => (FIELD_KEYS as readonly string[]).includes(key));

  return {
    owner,
    repo,
    theme,
    font,
    pattern,
    template,
    format,
    fields: fields.length > 0 ? fields : [...DEFAULT_VISIBLE_FIELDS],
    ...(logo ? { logo } : {}),
    ...(languageIcon ? { languageIcon } : {}),
    ...(descriptionOverride ? { descriptionOverride } : {}),
  };
}

export function encodeConfig(config: RepoCardConfig): URLSearchParams {
  const params = new URLSearchParams();

  if (config.theme !== DEFAULT_THEME) params.set("theme", config.theme);
  if (config.font !== DEFAULT_FONT) params.set("font", config.font);
  if (config.pattern !== DEFAULT_PATTERN) params.set("pattern", config.pattern);
  if (config.template !== DEFAULT_TEMPLATE) params.set("template", config.template);
  if (config.format !== DEFAULT_FORMAT) params.set("format", config.format);
  if (config.logo) params.set("logo", config.logo);
  if (config.languageIcon) params.set("languageIcon", config.languageIcon);
  if (config.descriptionOverride) params.set("description", config.descriptionOverride);

  const sortedFields = [...config.fields].sort();
  const sortedDefaults = [...DEFAULT_VISIBLE_FIELDS].sort();
  if (sortedFields.join(",") !== sortedDefaults.join(",")) {
    params.set("fields", config.fields.join(","));
  }

  return params;
}

/** Builds the full card image endpoint path for a config, per contracts/card-image-endpoint.md. */
export function buildCardPath(config: RepoCardConfig, ext: ImageFormat = config.format): string {
  const query = encodeConfig(config).toString();
  const base = `/${config.owner}/${config.repo}.${ext}`;
  return query ? `${base}?${query}` : base;
}
