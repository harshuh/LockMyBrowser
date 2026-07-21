import { useState } from "react";
import { useRequireOnboarding } from "../../shared/useRequireOnboarding";
import { setlmbSettings, type lmbData } from "../../shared/lmbStorage";
import {
  apiResetPin,
  apiSetSecretPin,
  apiSendVerificationCode,
  apiVerifyEmailCode,
} from "../../shared/lmbApi";
import { AutoLockSection, Toggle } from "./AutoLockSection";
import { AccountSection } from "./AccountSection";
import { EmailVerificationSection } from "./EmailVerificationSection";
import { SecurityAlertsSection } from "./SecurityAlertsSection";
import { ShortcutSection } from "./ShortcutSection";

export function App() {
  const guard = useRequireOnboarding();

  if (guard.status === "checking" || guard.status === "redirecting") {
    return (
      <div className="page">
        <p className="loading-text">Loading…</p>
      </div>
    );
  }

  return <SettingsContent initialData={guard.data} />;
}

function SettingsContent({ initialData }: { initialData: lmbData }) {
  const [data, setData] = useState(initialData);

  async function handleSettingsChange(
    partial: Parameters<typeof setlmbSettings>[0],
  ) {
    const nextSettings = await setlmbSettings(partial);
    setData((prev) => ({ ...prev, settings: nextSettings }));
    return { ok: true as const };
  }

  async function handleResetPin(currentPin: string, newPin: string) {
    const result = await apiResetPin(data.email, currentPin, newPin);
    return result;
  }

  async function handleSetSecretPin(pin: string) {
    const result = await apiSetSecretPin(data.email, pin);
    return result;
  }

  async function handleToggleSecretPin(enabled: boolean) {
    const nextSettings = await setlmbSettings({ secretPinEnabled: enabled });
    setData((prev) => ({ ...prev, settings: nextSettings }));
    return { ok: true as const };
  }

  async function handleSendVerificationCode() {
    if (!data.email) return { ok: false, error: "No email on file." };
    return apiSendVerificationCode(data.email);
  }

  async function handleVerifyCode(code: string) {
    const result = await apiVerifyEmailCode(data.email!, code);
    if (result.ok) {
      setData((prev) => ({ ...prev, emailVerified: true }));
    }
    return result;
  }

  function handleSecurityAlertsChange(next: {
    alertOnFailedAttempts?: boolean;
    failedAttemptThreshold?: number;
  }) {
    handleSettingsChange(next);
  }

  return (
    <div className="page page-settings">
      <div className="settings-container">
        <header className="settings-header">
          <div className="settings-header-row">
            <div>
              <p className="settings-eyebrow">LockMyBrowser</p>
              <h1 className="settings-heading">Settings</h1>
            </div>
            <label className="master-toggle">
              <span>{data.settings.enabled ? "Enabled" : "Disabled"}</span>
              <Toggle
                checked={data.settings.enabled}
                onChange={(v) => handleSettingsChange({ enabled: v })}
              />
            </label>
          </div>
          <p className="step-subtitle">
            Press <kbd className="kbd">Ctrl+Shift+K</kbd> anywhere to lock all
            tabs instantly.
          </p>
        </header>

        <AutoLockSection
          settings={data.settings}
          onChange={handleSettingsChange}
        />

        <ShortcutSection />

        <EmailVerificationSection
          email={data.email}
          verified={data.emailVerified}
          onSendCode={handleSendVerificationCode}
          onVerifyCode={handleVerifyCode}
        />

        <SecurityAlertsSection
          enabled={data.settings.alertOnFailedAttempts}
          threshold={data.settings.failedAttemptThreshold}
          onChange={handleSecurityAlertsChange}
        />

        <AccountSection
          email={data.email}
          onResetPin={handleResetPin}
          secretPinEnabled={data.settings.secretPinEnabled}
          onToggleSecretPin={handleToggleSecretPin}
          onSetSecretPin={handleSetSecretPin}
        />
      </div>
    </div>
  );
}