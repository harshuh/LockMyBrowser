import { useState, type FormEvent } from 'react'
import { PinInput } from './PinInput'

interface LoginFormProps {
  onComplete: (data: { email: string; pin: string }) => void
  onSwitchToSignup: () => void
  submitting: boolean
  error: string | null
}

export function LoginForm({ onComplete, onSwitchToSignup, submitting, error }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setValidationError(null)

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Enter a valid email address.')
      return
    }
    if (!pin) {
      setValidationError('Enter your PIN.')
      return
    }

    onComplete({ email: email.trim(), pin })
  }

  const displayError = validationError ?? error

  return (
    <form className="setup-form" onSubmit={handleSubmit}>
      <div>
        <h1 className="step-title">Log in to LockMyBrowser</h1>
        <p className="step-subtitle">Enter the email and PIN you signed up with.</p>
      </div>

      <section className="form-section">
        <div className="field-stack">
          <div className="field">
            <label htmlFor="login-email" className="field-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="field-input"
              placeholder="who@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <PinInput label="PIN" value={pin} onChange={setPin} placeholder="Enter your PIN" />
        </div>
      </section>

      {displayError && <p className="field-error">{displayError}</p>}

      <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
        {submitting ? 'Logging in…' : 'Log in'}
      </button>

      <button type="button" className="btn-link" onClick={onSwitchToSignup} disabled={submitting}>
        Need an account? Sign up
      </button>
    </form>
  )
}