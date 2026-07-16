import { useState, type InputHTMLAttributes } from 'react'
import { PinInput } from './PinInput'

interface SetupFormProps {
  onComplete: (data: { name: string; email: string; pin: string }) => void
  submitting: boolean
  error: string | null
  onSwitchToLogin: () => void
}

const MIN_PIN_LENGTH = 4
const MAX_PIN_LENGTH = 12

export function SetupForm({ onComplete, submitting, error, onSwitchToLogin }: SetupFormProps){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError(null)

    if (!name.trim() || name.trim().length < 2) {
      setValidationError('Enter your name (at least 2 characters).')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Enter a valid email address.')
      return
    }
    if (pin.length < MIN_PIN_LENGTH || pin.length > MAX_PIN_LENGTH) {
      setValidationError(`PIN must be ${MIN_PIN_LENGTH}\u2013${MAX_PIN_LENGTH} digits.`)
      return
    }
    if (pin !== confirmPin) {
      setValidationError('PINs don\u2019t match.')
      return
    }

    onComplete({ name: name.trim(), email: email.trim(), pin })
  }

  const displayError = validationError ?? error

  return (
    <form className="setup-form" onSubmit={handleSubmit}>
      <div>
        <h1 className="step-title">Set up LockMyBrowser</h1>
        <p className="step-subtitle">
          Your PIN locks and unlocks your browser day to day.
        </p>
      </div>

      <section className="form-section">
        <p className="form-section-label">Your details</p>
        <div className="field-stack">
          <Field
            label="Name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </section>

      <section className="form-section">
        <p className="form-section-label">Browser lock</p>
        <div className="field-stack">
          <PinInput
            label="PIN"
            value={pin}
            onChange={setPin}
            minLength={MIN_PIN_LENGTH}
            maxLength={MAX_PIN_LENGTH}
            placeholder="Choose a PIN"
          />
          <PinInput
            label="Confirm PIN"
            value={confirmPin}
            onChange={setConfirmPin}
            minLength={MIN_PIN_LENGTH}
            maxLength={MAX_PIN_LENGTH}
            placeholder="Re-enter PIN"
          />
        </div>
      </section>

      {displayError && <p className="field-error">{displayError}</p>}

      <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
        {submitting ? 'Setting up\u2026' : 'Finish setup'}
      </button>

      <button type="button" className="btn-link" onClick={onSwitchToLogin} disabled={submitting}>
        Already have an account? Log in
      </button>
    </form>
  )
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

function Field({ label, ...inputProps }: FieldProps) {
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input id={id} className="field-input" {...inputProps} />
    </div>
  )
}