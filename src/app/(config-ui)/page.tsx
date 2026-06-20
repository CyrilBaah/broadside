"use client";

import { AlertCircle, ArrowRight, GitFork } from "lucide-react";
import { useState, type FormEvent } from "react";
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

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className={styles.page} data-stage={config ? "editor" : "landing"}>
      {!config ? <div className={styles.stageGlow} aria-hidden="true" /> : null}

      <header className={styles.header}>
        <div className={styles.wordmark}>
          <span className={styles.logoMark} aria-hidden="true" />
          Broadside
        </div>
        {config ? <ThemeToggle /> : null}
      </header>

      <main className={styles.main}>
        {!config ? (
          <section className={styles.intro}>
            <h1 className={styles.title}>Pin up your repo.</h1>
            <p className={styles.subtitle}>
              Paste a public GitHub repo URL to generate a shareable announcement card.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputRow} data-invalid={parseError ? true : undefined}>
                <GitFork size={16} strokeWidth={2} className={styles.inputIcon} aria-hidden="true" />
                <input
                  type="text"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="github.com/owner/repo"
                  aria-label="GitHub repo URL"
                  aria-invalid={parseError ? true : undefined}
                  aria-describedby={parseError ? "url-error" : undefined}
                  className={styles.input}
                />
              </div>
              <button type="submit" className={styles.submit}>
                Generate
                <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" />
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
            <div className={styles.previewArea}>
              <CardPreview config={config} />
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

            <div className={styles.exportArea}>
              <ExportPanel config={config} baseUrl={baseUrl} />
            </div>
          </section>
        ) : !parseError ? (
          <p className={styles.placeholder}>Your card preview will appear here once you generate one.</p>
        ) : null}
      </main>
    </div>
  );
}
