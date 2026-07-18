import { Toggle } from "./AutoLockSection"


const THRESHOLD_OPTIONS = [3, 5, 10]

interface SecurityAlertsSectionProps {
  enabled: boolean
  threshold: number
  onChange: (next: { alertOnFailedAttempts?: boolean; failedAttemptThreshold?: number }) => void
}

export function SecurityAlertsSection({ enabled, threshold, onChange }: SecurityAlertsSectionProps) {
  return (
    <section className="settings-card">
      <div className="settings-card-header">
        <div>
          <h2 className="settings-card-title">Login attempt alerts</h2>
          <p className="settings-card-subtitle">
            Email your recovery address if someone enters the wrong PIN too many times.
          </p>
        </div>
        <Toggle checked={enabled} onChange={(v) => onChange({ alertOnFailedAttempts: v })} />
      </div>

      <div className="preset-row">
        {THRESHOLD_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => onChange({ failedAttemptThreshold: n })}
            disabled={!enabled}
            className={`preset-chip ${threshold === n ? 'preset-chip-active' : ''}`}
          >
            {n} attempts
          </button>
        ))}
      </div>
    </section>
  )
}