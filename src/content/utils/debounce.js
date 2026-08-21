/**
 * debounce.js — debounce + throttle helpers.
 */

/**
 * Debounce a function by `wait` ms. Leading-edge option for immediate first call.
 * @param {Function} fn
 * @param {number} wait
 * @param {{leading?:boolean}} [opts]
 * @returns {Function & {cancel:()=>void, flush:()=>void}}
 */
export function debounce(fn, wait = 200, opts = {}) {
  let timer = null;
  let lastArgs = null;
  let leading = opts.leading === true;
  let invokedLeading = false;

  function invoke(...args) {
    try {
      fn(...args);
    } catch (err) {
      // Never let a debounced handler crash the observer pipeline.
      console.warn("[leaddock:debounce] handler threw", err);
    }
  }

  const wrapped = function (...args) {
    lastArgs = args;
    if (leading && !invokedLeading) {
      invoke(...args);
      invokedLeading = true;
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!leading || lastArgs) {
        invoke(...lastArgs);
      }
      invokedLeading = false;
      lastArgs = null;
    }, wait);
  };

  wrapped.cancel = function () {
    if (timer) clearTimeout(timer);
    timer = null;
    invokedLeading = false;
    lastArgs = null;
  };

  wrapped.flush = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      if (lastArgs) invoke(...lastArgs);
      invokedLeading = false;
      lastArgs = null;
    }
  };

  return wrapped;
}

/**
 * Throttle a function to run at most once per `wait` ms.
 */
export function throttle(fn, wait = 200) {
  let last = 0;
  let timer = null;
  let pendingArgs = null;
  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      last = now;
      try {
        fn(...args);
      } catch (err) {
        console.warn("[leaddock:throttle] handler threw", err);
      }
    } else {
      pendingArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          last = Date.now();
          timer = null;
          if (pendingArgs) {
            try {
              fn(...pendingArgs);
            } catch (err) {
              console.warn("[leaddock:throttle] handler threw", err);
            }
            pendingArgs = null;
          }
        }, remaining);
      }
    }
  };
}

export default { debounce, throttle };
