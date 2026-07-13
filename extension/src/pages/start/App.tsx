import { useState } from 'react'
import { SetupForm } from './SetupForm'
import { apiRegister, apiLogin } from '../../shared/lmbApi'
import { completeOnboarding } from '../../shared/lmbStorage'

export function App() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleComplete(data: { name: string; email: string; pin: string }) {
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

  return (
    <div className="page">
      <div className="card">
        <SetupForm onComplete={handleComplete} submitting={submitting} error={error} />
      </div>
    </div>
  )
}