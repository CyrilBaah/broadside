"use client";

import { AlertCircle, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { DriftBackdrop } from "@/components/landing/DriftBackdrop";
import { CardPreview } from "@/components/card-preview/CardPreview";
import { CustomizationPanel } from "@/components/customization-panel/CustomizationPanel";
import { DescriptionOverride } from "@/components/customization-panel/DescriptionOverride";
import { ExportPanel } from "@/components/customization-panel/ExportPanel";
import { FieldVisibility } from "@/components/customization-panel/FieldVisibility";
import { LanguageIconPicker } from "@/components/customization-panel/LanguageIconPicker";
import { LogoUpload } from "@/components/customization-panel/LogoUpload";
import { RepoField } from "@/components/customization-panel/RepoField";
import { ThemeToggle } from "@/components/theme-toggle/ThemeToggle";
import { InvalidRepoUrlError, parseRepoUrl } from "@/lib/config/parse-repo-url";
import { defaultConfigFor, type RepoCardConfig } from "@/lib/config/schema";
import styles from "./page.module.css";

/**
 * The hero input's resting font size (1.75rem, matching the title's display
 * weight) is too large to fit a full pasted GitHub URL without clipping it
 * under the icon/submit button. Shrink it as the value grows so the whole
 * paste stays visible instead of scrolling off-screen.
 */
function inputFontSize(value: string): string {
  const shrinkAfter = 16;
  const remPerChar = 0.035;
  const minRem = 0.85;
  const rem = Math.max(minRem, 1.75 - Math.max(0, value.length - shrinkAfter) * remPerChar);
  return `${rem}rem`;
}

export default function ConfigUiPage() {
  const [url, setUrl] = useState("");
  const [config, setConfig] = useState<RepoCardConfig | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const { owner, repo } = parseRepoUrl(url);
      setConfig(defaultConfigFor(owner, repo));
      setUrl(`${owner}/${repo}`);
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

  function goHome() {
    setConfig(null);
    setUrl("");
    setParseError(null);
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className={styles.page} data-stage={config ? "editor" : "landing"}>
      <DriftBackdrop />

      <header className={styles.header}>
        <button type="button" className={styles.wordmark} onClick={goHome}>
          broadside
        </button>
        <ThemeToggle />
      </header>

      <main className={styles.main}>
        {!config ? (
          <section className={styles.intro}>
            <h1 className={styles.title}>Pin up your repo.</h1>
            <span className={styles.rule} aria-hidden="true" />
            <p className={styles.subtitle}>Paste a repo. Watch it become a card.</p>

            <form
              onSubmit={handleSubmit}
              className={styles.form}
              data-invalid={parseError ? true : undefined}
            >
              <GithubIcon size={22} className={styles.inputIcon} />
              <input
                type="text"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                aria-label="GitHub repo URL"
                aria-invalid={parseError ? true : undefined}
                aria-describedby={parseError ? "url-error" : undefined}
                className={styles.input}
                style={{ fontSize: inputFontSize(url) }}
              />
              <button type="submit" className={styles.submit} aria-label="Generate card">
                <Search size={22} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </form>

            {parseError ? (
              <p id="url-error" role="alert" className={styles.error}>
                <AlertCircle size={15} strokeWidth={2} aria-hidden="true" />
                {parseError}
              </p>
            ) : null}
          </section>
        ) : null}

        {config ? (
          <section className={styles.workspace} aria-label="Card preview and customization">
            <div className={styles.previewColumn}>
              <div className={styles.previewArea}>
                <CardPreview config={config} />
              </div>

              <div className={styles.exportArea}>
                <ExportPanel config={config} baseUrl={baseUrl} />
              </div>
            </div>

            <div className={styles.optionsPanel}>
              <h2 className={styles.optionsHeading}>Customize</h2>

              <RepoField value={url} onChange={setUrl} onSubmit={handleSubmit} error={parseError} />

              <div className={styles.divider} />

              <CustomizationPanel config={config} onChange={setConfig} />

              <div className={styles.divider} />

              <FieldVisibility value={config.fields} onChange={(fields) => setConfig({ ...config, fields })} />

              <div className={styles.divider} />

              <LanguageIconPicker
                value={config.languageIcon}
                onChange={(languageIcon) => setConfig({ ...config, languageIcon, logo: undefined })}
              />

              <LogoUpload
                value={config.logo}
                onChange={(logo) => setConfig({ ...config, logo, languageIcon: undefined })}
              />

              <div className={styles.divider} />

              <DescriptionOverride
                value={config.descriptionOverride ?? ""}
                onChange={(descriptionOverride) =>
                  setConfig({ ...config, descriptionOverride: descriptionOverride || undefined })
                }
              />
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
