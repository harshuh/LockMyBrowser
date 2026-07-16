import { useState } from 'react'
import { AboutStep } from './AboutStep'
import { SetupForm } from './SetupForm'
import { LoginForm } from './LoginForm'
import { apiRegister, apiLogin } from '../../shared/lmbApi'
import { completeOnboarding } from '../../shared/lmbStorage'

type Step = 'about' | 'auth'
type Mode = 'signup' | 'login'

export function App() {
  const [step, setStep] = useState<Step>('about')
  const [mode, setMode] = useState<Mode>('signup')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignup(data: { name: string; email: string; pin: string }) {
    setSubmitting(true)
    setError(null)

    try {
      const registerResult = await apiRegister(data.name, data.email, data.pin)
      if (!registerResult.success) {
        setError(registerResult.message)
        return
      }

      const loginResult = await apiLogin(data.email, data.pin)
      if (!loginResult.success) {
        setError(loginResult.message)
        return
      }

      await completeOnboarding({ email: data.email })
      window.close()
    } catch {
      setError('Could not reach server. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLogin(data: { email: string; pin: string }) {
    setSubmitting(true)
    setError(null)

    try {
      const loginResult = await apiLogin(data.email, data.pin)
      if (!loginResult.success) {
        setError(loginResult.message)
        return
      }

      await completeOnboarding({ email: data.email })
      window.close()
    } catch {
      setError('Could not reach server. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  return (
    <div className="page">
      <div className="card">
        {step === 'about' && <AboutStep onNext={() => setStep('auth')} />}

        {step === 'auth' && mode === 'signup' && (
          <SetupForm
            onComplete={handleSignup}
            submitting={submitting}
            error={error}
            onSwitchToLogin={() => switchMode('login')}
          />
        )}

        {step === 'auth' && mode === 'login' && (
          <LoginForm
            onComplete={handleLogin}
            submitting={submitting}
            error={error}
            onSwitchToSignup={() => switchMode('signup')}
          />
        )}
      </div>
    </div>
  )
}