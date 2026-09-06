// ==========================================
// TIME-BASED BRIGHTNESS
// ==========================================

const brightnessSettings = {

  dayStart: 7,

  eveningStart: 18,

  nightStart: 22,

  dayBrightness: 1,

  eveningBrightness: 0.65,

  nightBrightness: 0.25

};


// ==========================================
// INITIALIZE
// ==========================================

function initializeBrightness() {

  updateBrightness();

  setInterval(
    updateBrightness,
    60 * 1000
  );

}


// ==========================================
// UPDATE BRIGHTNESS
// ==========================================

function updateBrightness() {

  const hour =
    new Date().getHours();


  let brightness;


  /*
    DAY
    7:00 AM - 5:59 PM
  */

  if (
    hour >= brightnessSettings.dayStart &&
    hour < brightnessSettings.eveningStart
  ) {

    brightness =
      brightnessSettings.dayBrightness;

  }


  /*
    EVENING
    6:00 PM - 9:59 PM
  */

  else if (
    hour >= brightnessSettings.eveningStart &&
    hour < brightnessSettings.nightStart
  ) {

    brightness =
      brightnessSettings.eveningBrightness;

  }


  /*
    NIGHT
    10:00 PM - 6:59 AM
  */

  else {

    brightness =
      brightnessSettings.nightBrightness;

  }


  applyBrightness(
    brightness
  );


  updateBrightnessLabel(
    hour
  );

}


// ==========================================
// APPLY BRIGHTNESS
// ==========================================

function applyBrightness(
  brightness
) {

  /*
    CSS brightness filter.

    This changes the appearance of
    the entire app without changing
    the actual tablet screen brightness.
  */

  document.body.style.filter =
    `brightness(${brightness})`;

}


// ==========================================
// DISPLAY CURRENT MODE
// ==========================================

function updateBrightnessLabel(
  hour
) {

  const label =
    document.getElementById(
      "brightnessStatus"
    );


  if (!label) return;


  if (
    hour >= brightnessSettings.dayStart &&
    hour < brightnessSettings.eveningStart
  ) {

    label.textContent =
      "Day • 100%";

  }

  else if (
    hour >= brightnessSettings.eveningStart &&
    hour < brightnessSettings.nightStart
  ) {

    label.textContent =
      "Evening • 65%";

  }

  else {

    label.textContent =
      "Night • 25%";

  }

}
