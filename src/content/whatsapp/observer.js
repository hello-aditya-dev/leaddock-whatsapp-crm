/**
 * whatsapp/observer.js — narrow, debounced MutationObserver wrapper.
 *
 * Anti-patterns explicitly avoided:
 *  - Whole-page `setInterval` polling at 100ms.
 *  - Observing `document.body` with subtree:true (catastrophic for typing perf).
 *
 * Strategy:
 *  - Observe only the specific pane that can change when a chat switches
 *    (the chat list + the main pane header), with subtree:true scoped to that
 *    node (acceptable — these subtrees are small).
 *  - Debounce callbacks so a burst of mutations yields ONE update.
 *  - Auto-retry attaching when WhatsApp re-renders its root.
 */
import { debounce } from "../utils/debounce.js";
import { findFirst, SELECTORS } from "./selectors.js";

/**
 * Attach a debounced observer that fires `onChatChange` when the active chat
 * (header or list selection) likely changed. Returns a `stop()` function.
 *
 * @param {(reason:string)=>void} onChatChange
 * @returns {()=>void}
 */
export function observeChatSwitches(onChatChange) {
  const fired = debounce((reason) => onChatChange(reason), 250, { leading: true });
  const observers = [];

  function attach(el, label) {
    if (!el) return;
    try {
      const obs = new MutationObserver(() => fired(label));
      obs.observe(el, { childList: true, subtree: true, attributes: false });
      observers.push(obs);
    } catch (err) {
      // observing a detached node or similar — ignore.
    }
  }

  function connect() {
    attach(findFirst(SELECTORS.chatList), "chatList");
    attach(findFirst(SELECTORS.mainPane), "mainPane");
    attach(findFirst(SELECTORS.chatHeader), "header");
  }

  connect();
  // Re-attach every few seconds ONLY if we have no observers yet (no busy poll).
  const reattach = setInterval(() => {
    if (observers.length === 0) connect();
  }, 3000);

  return function stop() {
    clearInterval(reattach);
    fired.cancel();
    for (const o of observers) {
      try {
        o.disconnect();
      } catch (err) {}
    }
    observers.length = 0;
  };
}

export default { observeChatSwitches };
