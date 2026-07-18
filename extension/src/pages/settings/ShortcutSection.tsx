export function ShortcutSection() {
  function openShortcutsPage() {
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })
    } else {
      navigator.clipboard.writeText('chrome://extensions/shortcuts')
    }
  }

  return (
    <section className="settings-card">
      <h2 className="settings-card-title">Keyboard shortcut</h2>
      <p className="settings-card-subtitle">
        Ctrl+Shift+K should lock every tab instantly. If it isn't working, it's almost always one of these:
      </p>
      <ul className="reason-list">
        <li>Another extension already claimed that combination — browsers only let one owner per shortcut.</li>
        <li>Your OS or window manager is intercepting the keys before the browser sees them.</li>
        <li>The shortcut only works while a browser window has focus, not from the desktop.</li>
      </ul>
      <button type="button" className="btn btn-secondary" onClick={openShortcutsPage}>
        Open shortcut settings
      </button>
    </section>
  )
}