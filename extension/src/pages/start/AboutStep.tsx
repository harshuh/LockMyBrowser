interface AboutStepProps {
  onNext: () => void
}

export function AboutStep({ onNext }: AboutStepProps) {
  return (
    <div className="step">
      <div className="about-icon">
        {/* <ShieldIcon /> */}
      </div>

      <div>
        <h1 className="step-title">Welcome to LockMyBrowser</h1>
        <p className="step-subtitle">
          LockMyBrowser locks every tab in your browser behind a PIN, So anyone who walks up
          to your machine can't see what you were working on.
        </p>
      </div>

      <ul className="feature-list">
        <FeatureRow text="Lock all open tabs instantly with Ctrl+Shift+K" />
        <FeatureRow text="Every page checks in before it loads" />
      </ul>

      <button className="btn btn-primary btn-full" onClick={onNext}>
        Next
      </button>
    </div>
  )
}

function FeatureRow({ text }: { text: string }) {
  return (
    <li className="feature-row">
      <span className="feature-check">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {text}
    </li>
  )
}