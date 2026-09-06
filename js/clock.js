let use24Hour = false;

function updateClock() {

  const now = new Date();

  const options = {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: !use24Hour
  };

  document.getElementById("time").textContent =
    now.toLocaleTimeString(
      undefined,
      options
    );

  document.getElementById("date").textContent =
    now.toLocaleDateString(
      undefined,
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );
}

function set24HourMode(enabled) {

  use24Hour = enabled;

  localStorage.setItem(
    "use24Hour",
    enabled
  );

  updateClock();
}

const savedFormat =
  localStorage.getItem("use24Hour");

if (savedFormat !== null) {
  use24Hour = savedFormat === "true";
}

updateClock();

setInterval(
  updateClock,
  1000
);
