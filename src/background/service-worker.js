/**
 * background/service-worker.js — MV3 service worker.
 *
 * Responsibilities:
 *  - Open the WhatsApp Web tab when the toolbar icon is clicked (if no WA tab
 *    is open yet). Otherwise focus the existing WA tab.
 *  - Bridge messages between popup/options and the content script (relay).
 *
 * The service worker is intentionally tiny — the CRM logic lives in the
 * content script and the shared storage modules (which are also imported by
 * popup/options directly via ES modules).
 */

const WHATSAPP_URL = "https://web.whatsapp.com/";

async function getOrCreateWhatsAppTab() {
  const tabs = await chrome.tabs.query({ url: WHATSAPP_URL + "*" });
  if (tabs.length > 0) {
    const tab = tabs[0];
    await chrome.tabs.update(tab.id, { active: true });
    if (tab.windowId) await chrome.windows.update(tab.windowId, { focused: true });
    return tab;
  }
  return chrome.tabs.create({ url: WHATSAPP_URL, active: true });
}

// Clicking the toolbar icon: open/focus WhatsApp Web, then the popup shows.
// (Popup is declared in manifest, so this fires only if popup is suppressed.)
chrome.action.onClicked.addListener(async () => {
  await getOrCreateWhatsAppTab();
});

// Relay messages between extension pages and the active WhatsApp Web tab.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return;
  if (msg.type === "leaddock:open-whatsapp") {
    getOrCreateWhatsAppTab().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === "leaddock:relay-to-content") {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ url: WHATSAPP_URL + "*", active: true });
        if (!tab) {
          const t = await getOrCreateWhatsAppTab();
          // Wait briefly for content script to attach.
          setTimeout(async () => {
            const res = await chrome.tabs.sendMessage(t.id, msg.payload || {}).catch(() => ({ ok: false, error: "no content script" }));
            sendResponse(res);
          }, 1500);
          return;
        }
        const res = await chrome.tabs.sendMessage(tab.id, msg.payload || {}).catch(() => ({ ok: false, error: "no content script" }));
        sendResponse(res);
      } catch (err) {
        sendResponse({ ok: false, error: String(err && err.message || err) });
      }
    })();
    return true;
  }
});

// On install: no special action — content script auto-seeds demo data on first run.
chrome.runtime.onInstalled.addListener((details) => {
  console.info(`[LeadDock] ${details.reason} (v${chrome.runtime.getManifest().version})`);
});
