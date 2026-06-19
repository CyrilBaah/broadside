"use client";

export interface DescriptionOverrideProps {
  value: string;
  onChange: (value: string) => void;
}

/** FR-007: lets the user override the repo's GitHub description on the card. */
export function DescriptionOverride({ value, onChange }: DescriptionOverrideProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", fontSize: 14, color: "#57606a" }}>
      Description override
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Leave blank to use the repo's GitHub description"
        rows={2}
        style={{
          marginTop: 4,
          padding: "8px 12px",
          fontSize: 14,
          border: "1px solid #d0d7de",
          borderRadius: 6,
          resize: "vertical",
        }}
      />
    </label>
  );
}
