import { useState } from 'react'
import { Toggle } from './AutoLockSection'

interface AccountSectionProps {
  email: string | null
  onResetPin: (currentPin: string, newPin: string) => Promise<{ ok: boolean; error?: string }>
  secretPinEnabled: boolean
  onToggleSecretPin: (enabled: boolean) => Promise<{ ok: boolean; error?: string }>
  onSetSecretPin: (pin: string) => Promise<{ ok: boolean; error?: string }>
}

export function AccountSection({
  email,
  onResetPin,
  secretPinEnabled,
  onToggleSecretPin,
  onSetSecretPin,
}: AccountSectionProps) {
  return (
    <div className="settings-stack">
      <ResetPinCard onResetPin={onResetPin} />
      <SecretPinCard
        enabled={secretPinEnabled}
        onToggle={onToggleSecretPin}
        onSetSecretPin={onSetSecretPin}
      />
    </div>
  )
}

function ResetPinCard({ onResetPin }: Pick<AccountSectionProps, 'onResetPin'>) {
  const MIN_PIN_LENGTH = 4
  const MAX_PIN_LENGTH = 12

  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function digitsOnly(raw: string) {
    return raw.replace(/\D/g, '').slice(0, MAX_PIN_LENGTH)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPin.length < MIN_PIN_LENGTH) {
      setError(`PIN must be at least ${MIN_PIN_LENGTH} digits.`)
      return
    }
    if (newPin !== confirmPin) {
      setError('PINs don\u2019t match.')
      return
    }

    setSubmitting(true)
    const result = await onResetPin(currentPin, newPin)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error ?? 'Could not reset your PIN.')
      return
    }

    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
    setSuccess(true)
  }

  return (
    <section className="settings-card">
      <h2 className="settings-card-title">Reset PIN</h2>
      <p className="settings-card-subtitle">Change the PIN you use to unlock your browser.</p>

      <form onSubmit={handleSubmit} className="field-stack reset-pin-form">
        <div className="field">
          <label htmlFor="current-pin" className="field-label">Current PIN</label>
          <input
            id="current-pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={currentPin}
            onChange={(e) => setCurrentPin(digitsOnly(e.target.value))}
            className="field-input"
          />
        </div>
        <div className="field">
          <label htmlFor="new-pin" className="field-label">New PIN</label>
          <input
            id="new-pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={newPin}
            onChange={(e) => setNewPin(digitsOnly(e.target.value))}
            className="field-input"
          />
        </div>
        <div className="field">
          <label htmlFor="confirm-new-pin" className="field-label">Confirm new PIN</label>
          <input
            id="confirm-new-pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={confirmPin}
            onChange={(e) => setConfirmPin(digitsOnly(e.target.value))}
            className="field-input"
          />
        </div>

        {error && <p className="field-error">{error}</p>}
        {success && <p className="field-success">PIN updated.</p>}

        <button type="submit" disabled={submitting} className="btn btn-primary btn-self-start">
          {submitting ? 'Updating\u2026' : 'Update PIN'}
        </button>
      </form>
    </section>
  )
}

function SecretPinCard({
  enabled,
  onToggle,
  onSetSecretPin,
}: {
  enabled: boolean
  onToggle: (enabled: boolean) => Promise<{ ok: boolean; error?: string }>
  onSetSecretPin: (pin: string) => Promise<{ ok: boolean; error?: string }>
}) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function digitsOnly(raw: string) {
    return raw.replace(/\D/g, '').slice(0, 12)
  }

  async function handleToggle(next: boolean) {
    setError(null)
    const result = await onToggle(next)
    if (!result.ok) setError(result.error ?? 'Could not update this setting.')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (pin.length < 4) {
      setError('Secret PIN must be at least 4 digits.')
      return
    }
    if (pin !== confirmPin) {
      setError('PINs don\u2019t match.')
      return
    }

    setSubmitting(true)
    const result = await onSetSecretPin(pin)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error ?? 'Could not set secret PIN.')
      return
    }
    setPin('')
    setConfirmPin('')
    setSuccess(true)
  }

  return (
    <section className="settings-card">
      <div className="settings-card-header">
        <div>
          <h2 className="settings-card-title">Secret PIN</h2>
          <p className="settings-card-subtitle">
            A second PIN you can give out under pressure instead of your real one.
          </p>
        </div>
        <Toggle checked={enabled} onChange={handleToggle} />
      </div>

      <div className="callout callout-warning">
        <strong>Know exactly what this does before enabling it:</strong>
        <p>
          If someone — a parent, partner, or anyone else — pressures you to unlock your browser, you can give
          them this PIN instead of your real one. It unlocks normally so nothing looks wrong, but it
          permanently deletes your browsing history in the background. There is no undo once history is
          cleared, so only enable this if you understand and want that trade-off.
        </p>
      </div>

      {enabled && (
        <form onSubmit={handleSubmit} className="field-stack">
          <div className="field">
            <label htmlFor="secret-pin" className="field-label">Secret PIN</label>
            <input
              id="secret-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              className="field-input"
              value={pin}
              onChange={(e) => setPin(digitsOnly(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="confirm-secret-pin" className="field-label">Confirm secret PIN</label>
            <input
              id="confirm-secret-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              className="field-input"
              value={confirmPin}
              onChange={(e) => setConfirmPin(digitsOnly(e.target.value))}
            />
          </div>

          {error && <p className="field-error">{error}</p>}
          {success && <p className="field-success">Secret PIN saved.</p>}

          <button type="submit" className="btn btn-primary btn-self-start" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save secret PIN'}
          </button>
        </form>
      )}

      {!enabled && error && <p className="field-error">{error}</p>}
    </section>
  )
}