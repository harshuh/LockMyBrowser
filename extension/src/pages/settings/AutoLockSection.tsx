import type { lmbSettings } from "../../shared/lmbStorage";

interface AutoLockSectionProps {
  settings: lmbSettings;
  onChange: (next: Partial<lmbSettings>) => void;
}

const PRESET_MINUTES = [1, 5, 10, 15, 30];

export function AutoLockSection({ settings, onChange }: AutoLockSectionProps) {
  return (
    <section className="settings-card">
      <div className="settings-card-header">
        <div>
          <h2 className="settings-card-title">Auto-lock</h2>
          <p className="settings-card-subtitle">
            Lock all tabs automatically after a period of inactivity.
          </p>
        </div>
        <Toggle
          checked={settings.autoLockEnabled}
          onChange={(checked) => onChange({ autoLockEnabled: checked })}
        />
      </div>

      <div className="preset-row">
        {PRESET_MINUTES.map((minutes) => (
          <button
            key={minutes}
            onClick={() => onChange({ autoLockMinutes: minutes })}
            disabled={!settings.autoLockEnabled}
            className={`preset-chip ${settings.autoLockMinutes === minutes ? "preset-chip-active" : ""}`}
          >
            {minutes} min
          </button>
        ))}
      </div>
    </section>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`toggle ${checked ? "toggle-on" : ""}`}
    >
      <span className="toggle-knob" />
    </button>
  );
}
