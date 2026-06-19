/**
 * FR-009a: one-click copy snippets for the live-link output, so it can be
 * pasted directly into a README without manual reformatting
 * (contracts/card-image-endpoint.md §Copy-paste embed snippets).
 */
export interface EmbedSnippets {
  url: string;
  markdown: string;
  html: string;
}

export function buildEmbedSnippets(url: string, alt: string): EmbedSnippets {
  return {
    url,
    markdown: `![${alt}](${url})`,
    html: `<img src="${url}" alt="${escapeHtmlAttribute(alt)}">`,
  };
}

function escapeHtmlAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
