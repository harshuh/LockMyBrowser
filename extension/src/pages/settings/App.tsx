import { useState } from "react";
import { useRequireOnboarding } from "../../shared/useRequireOnboarding";
import { setlmbSettings, type lmbData } from "../../shared/lmbStorage";
import { AutoLockSection } from "./AutoLockSection";

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
  }

  return (
    <div className="page page-settings">
      <div className="settings-container">
        <header className="settings-header">
          <p className="settings-eyebrow">LockMyBrowser</p>
          <h1 className="settings-heading">Settings</h1>
          <p className="step-subtitle">
            Press <kbd className="kbd">Ctrl+Shift+K</kbd> anywhere to lock all
            tabs instantly.
          </p>
        </header>

        <AutoLockSection
          settings={data.settings}
          onChange={handleSettingsChange}
        />
      </div>
    </div>
  );
}