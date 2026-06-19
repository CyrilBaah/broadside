"use client";

import { useState, type FormEvent } from "react";
import { CardPreview } from "@/components/card-preview/CardPreview";
import { CustomizationPanel } from "@/components/customization-panel/CustomizationPanel";
import { DescriptionOverride } from "@/components/customization-panel/DescriptionOverride";
import { LogoUpload } from "@/components/customization-panel/LogoUpload";
import { ShareableUrl } from "@/components/customization-panel/ShareableUrl";
import { InvalidRepoUrlError, parseRepoUrl } from "@/lib/config/parse-repo-url";
import { defaultConfigFor, type RepoCardConfig } from "@/lib/config/schema";
import { buildCardPath } from "@/lib/config/url-codec";

/**
 * FR-001/FR-002/FR-014: the core loop entry point — paste a repo URL, get an
 * immediate live preview with sensible defaults, or a clear friendly error if
 * the URL is malformed (private/nonexistent repos surface their own friendly
 * error inside the rendered card itself, per contracts/card-image-endpoint.md).
 * Once a card exists, US2's customization panel (FR-005-FR-008) lets the user
 * adjust it live and grab a shareable URL.
 */
export default function ConfigUiPage() {
  const [url, setUrl] = useState("");
  const [config, setConfig] = useState<RepoCardConfig | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const { owner, repo } = parseRepoUrl(url);
      setConfig(defaultConfigFor(owner, repo));
      setParseError(null);
    } catch (error) {
      setConfig(null);
      setParseError(
        error instanceof InvalidRepoUrlError
          ? "That doesn't look like a GitHub repo URL. Try something like github.com/owner/repo."
          : "Something went wrong reading that URL. Please try again.",
      );
    }
  }

  const shareableUrl =
    config && typeof window !== "undefined"
      ? `${window.location.origin}${buildCardPath(config)}`
      : null;

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Broadside</h1>
      <p style={{ color: "#57606a", marginBottom: 32 }}>
        Paste a public GitHub repo URL to generate a shareable announcement card.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="github.com/owner/repo"
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: 16,
            border: "1px solid #d0d7de",
            borderRadius: 8,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            fontSize: 16,
            backgroundColor: "#0969da",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Generate
        </button>
      </form>

      {parseError ? (
        <p role="alert" style={{ color: "#cf222e", marginBottom: 16 }}>
          {parseError}
        </p>
      ) : null}

      {config ? (
        <>
          <CustomizationPanel config={config} onChange={setConfig} />
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <LogoUpload value={config.logo} onChange={(logo) => setConfig({ ...config, logo })} />
            <DescriptionOverride
              value={config.descriptionOverride ?? ""}
              onChange={(descriptionOverride) =>
                setConfig({ ...config, descriptionOverride: descriptionOverride || undefined })
              }
            />
          </div>

          <CardPreview config={config} />

          {shareableUrl ? <ShareableUrl url={shareableUrl} /> : null}
        </>
      ) : null}
    </main>
  );
}
