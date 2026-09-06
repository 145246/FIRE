// ==========================================
// FIRE TABLET WEATHER CLOCK
// Main application controller
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("Fire Tablet Weather Clock started");

  // Start the clock
  if (typeof startClock === "function") {
    startClock();
  }

  // Start alarms
  if (typeof initializeAlarms === "function") {
    initializeAlarms();
  }

  // Start weather
  if (typeof loadWeather === "function") {
    loadWeather();

    // Refresh weather every 10 minutes
    setInterval(loadWeather, 10 * 60 * 1000);
  }

  // Start weather alerts
  if (typeof loadAlerts === "function") {
    loadAlerts();

    // Refresh alerts every 5 minutes
    setInterval(loadAlerts, 5 * 60 * 1000);
  }

  // Start brightness system
  if (typeof initializeBrightness === "function") {
    initializeBrightness();
  }

  // Start Google Calendar
  if (typeof initializeCalendar === "function") {
    initializeCalendar();
  }
});
