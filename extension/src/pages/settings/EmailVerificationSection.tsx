import { useState } from 'react'

interface EmailVerificationSectionProps {
  email: string | null
  verified: boolean
  onSendCode: () => Promise<{ ok: boolean; error?: string }>
  onVerifyCode: (code: string) => Promise<{ ok: boolean; error?: string }>
}

export function EmailVerificationSection({
  email,
  verified,
  onSendCode,
  onVerifyCode,
}: EmailVerificationSectionProps) {
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    setError(null)
    setSubmitting(true)
    const result = await onSendCode()
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'Could not send verification email.')
      return
    }
    setCodeSent(true)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await onVerifyCode(code)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'Invalid code.')
      return
    }
    setCodeSent(false)
    setCode('')
  }

  return (
    <section className="settings-card">
      <h2 className="settings-card-title">Recovery email</h2>
      <p className="settings-card-subtitle">Used to recover your account and to alert you about login attempts.</p>

      <div className="readonly-field">
        {email ?? 'Not set'}
        {verified && <span className="badge badge-verified">Verified</span>}
      </div>

      {!verified && email && !codeSent && (
        <button type="button" className="btn btn-secondary" onClick={handleSend} disabled={submitting}>
          {submitting ? 'Sending…' : 'Send verification code'}
        </button>
      )}

      {!verified && codeSent && (
        <form onSubmit={handleVerify} className="field-stack">
          <div className="field">
            <label htmlFor="verify-code" className="field-label">Enter the code we emailed you</label>
            <input
              id="verify-code"
              className="field-input"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary btn-self-start" disabled={submitting}>
            {submitting ? 'Verifying…' : 'Verify'}
          </button>
        </form>
      )}

      {error && <p className="field-error">{error}</p>}
    </section>
  )
}