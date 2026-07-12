import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3, //as its new but not supports firefox its 2
  name: 'LockMyBrowser',
  description:
    'Secure your browser with LockMyBrowser — locks all tabs and protects your browsing session.',
  version: pkg.version,

  permissions: ['tabs', 'storage', 'idle'],
  host_permissions: ['<all_urls>', 'http://localhost:1124/*'],

  background: {
    service_worker: 'src/background/service_worker.ts',
    type: 'module',
  },

  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/inject.ts'],
      run_at: 'document_start',
      all_frames: false,
    },
  ],

  action: {
    default_popup: 'popup.html',
  },

  options_page: 'settings.html',

  web_accessible_resources: [
    {
      resources: ['lock.html', 'start.html', 'assets/*'],
      matches: ['<all_urls>'],
    },
  ],

  commands: {
    _execute_action: {
      suggested_key: {
        default: 'Ctrl+Shift+L',
        mac: 'Command+Shift+L',
      },
      description: 'Open LockMyBrowser popup',
    },
    'lock-all-tabs': {
      suggested_key: {
        default: 'Ctrl+Shift+K',
        mac: 'Command+Shift+K',
      },
      description: 'Instantly lock all tabs',
    },
  },

  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'none'; connect-src 'self' http://localhost:1124",
  },
})