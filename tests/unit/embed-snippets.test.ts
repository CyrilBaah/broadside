import { describe, expect, it } from "vitest";
import { buildEmbedSnippets } from "@/lib/config/embed-snippets";

describe("buildEmbedSnippets (FR-009a)", () => {
  const url = "https://broadside.dev/vercel/next.js.png";

  it("returns the raw URL unchanged", () => {
    expect(buildEmbedSnippets(url, "vercel/next.js").url).toBe(url);
  });

  it("builds a Markdown image snippet", () => {
    expect(buildEmbedSnippets(url, "vercel/next.js").markdown).toBe(
      "![vercel/next.js](https://broadside.dev/vercel/next.js.png)",
    );
  });

  it("builds an HTML img tag snippet", () => {
    expect(buildEmbedSnippets(url, "vercel/next.js").html).toBe(
      '<img src="https://broadside.dev/vercel/next.js.png" alt="vercel/next.js">',
    );
  });

  it("escapes special characters in the alt text for the HTML snippet", () => {
    const snippets = buildEmbedSnippets(url, 'a "weird" <repo> & co');
    expect(snippets.html).toBe(
      '<img src="https://broadside.dev/vercel/next.js.png" alt="a &quot;weird&quot; &lt;repo> &amp; co">',
    );
  });
});
