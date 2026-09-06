const alarms = {
  1: {
    enabled: true,
    triggered: false
  },

  2: {
    enabled: false,
    triggered: false
  }
};


function toggleAlarm(number) {

  alarms[number].enabled =
    !alarms[number].enabled;

  alarms[number].triggered = false;

  const button =
    document.getElementById(
      `alarm${number}Toggle`
    );

  button.textContent =
    alarms[number].enabled
      ? "ON"
      : "OFF";

  button.classList.toggle(
    "active",
    alarms[number].enabled
  );

  saveAlarms();
}


function checkAlarms() {

  const now = new Date();

  const hours =
    String(now.getHours())
      .padStart(2, "0");

  const minutes =
    String(now.getMinutes())
      .padStart(2, "0");

  const currentTime =
    `${hours}:${minutes}`;


  [1, 2].forEach(number => {

    const input =
      document.getElementById(
        `alarm${number}Time`
      );

    if (!input) return;

    if (
      alarms[number].enabled &&
      input.value === currentTime &&
      !alarms[number].triggered
    ) {

      alarms[number].triggered = true;

      ringAlarm();

    }

    if (input.value !== currentTime) {

      alarms[number].triggered = false;

    }

  });

}


function ringAlarm() {

  const sound =
    document.getElementById(
      "alarmSound"
    );

  if (sound) {

    sound.currentTime = 0;

    sound.play().catch(() => {
      console.log(
        "Tap the page once to enable alarm audio."
      );
    });

  }

  alert("⏰ Alarm!");

}


function saveAlarms() {

  localStorage.setItem(
    "alarm1Time",
    document.getElementById(
      "alarm1Time"
    ).value
  );

  localStorage.setItem(
    "alarm2Time",
    document.getElementById(
      "alarm2Time"
    ).value
  );

  localStorage.setItem(
    "alarm1Enabled",
    alarms[1].enabled
  );

  localStorage.setItem(
    "alarm2Enabled",
    alarms[2].enabled
  );
}


function loadAlarms() {

  const time1 =
    localStorage.getItem(
      "alarm1Time"
    );

  const time2 =
    localStorage.getItem(
      "alarm2Time"
    );

  if (time1) {

    document.getElementById(
      "alarm1Time"
    ).value = time1;

  }

  if (time2) {

    document.getElementById(
      "alarm2Time"
    ).value = time2;

  }

}


loadAlarms();

setInterval(
  checkAlarms,
  1000
);
