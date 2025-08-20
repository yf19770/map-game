// js/analytics.js (New File)

/**
 * Sends a custom event to Google Analytics.
 * @param {string} eventName - The name of the event (e.g., 'select_country').
 * @param {object} eventParams - An object of key-value pairs for the event.
 */
export function trackEvent(eventName, eventParams) {
  // Check if gtag is available on the window object
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  } else {
    // Log for debugging if gtag isn't found
    console.log(`Analytics Event (gtag not found): ${eventName}`, eventParams);
  }
}