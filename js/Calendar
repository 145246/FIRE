// ==========================================
// FIRE TABLET WEATHER CLOCK
// FOUR iCAL CALENDARS
// ==========================================


const CALENDAR_STORAGE_KEY =
  "fireTabletCalendarURLs";


const CALENDAR_COUNT = 4;


// ==========================================
// CALENDAR INFORMATION
// ==========================================

const calendarInfo = [

  {
    name: "Calendar 1",
    color: "#2563eb"
  },

  {
    name: "Calendar 2",
    color: "#dc2626"
  },

  {
    name: "Calendar 3",
    color: "#16a34a"
  },

  {
    name: "Calendar 4",
    color: "#9333ea"
  }

];


// ==========================================
// INITIALIZE
// ==========================================

function initializeCalendar() {

  loadSavedCalendars();

  setupCalendarControls();

}


// ==========================================
// SET UP BUTTON
// ==========================================

function setupCalendarControls() {

  const button =
    document.getElementById(
      "saveCalendars"
    );


  if (!button) {

    return;

  }


  button.addEventListener(
    "click",
    () => {

      saveCalendars();

    }
  );

}


// ==========================================
// SAVE CALENDARS
// ==========================================

function saveCalendars() {

  const urls = [];


  for (
    let i = 1;
    i <= CALENDAR_COUNT;
    i++
  ) {

    const input =
      document.getElementById(
        `calendarURL${i}`
      );


    const url =
      input
        ? input.value.trim()
        : "";


    urls.push(url);

  }


  localStorage.setItem(
    CALENDAR_STORAGE_KEY,
    JSON.stringify(urls)
  );


  loadAllCalendars();

}


// ==========================================
// LOAD SAVED CALENDARS
// ==========================================

function loadSavedCalendars() {

  let urls = [];


  try {

    const saved =
      localStorage.getItem(
        CALENDAR_STORAGE_KEY
      );


    if (saved) {

      urls =
        JSON.parse(
          saved
        );

    }

  } catch (error) {

    console.error(
      "Calendar storage error:",
      error
    );

  }


  for (
    let i = 1;
    i <= CALENDAR_COUNT;
    i++
  ) {

    const input =
      document.getElementById(
        `calendarURL${i}`
      );


    if (
      input &&
      urls[i - 1]
    ) {

      input.value =
        urls[i - 1];

    }

  }


  loadAllCalendars();

}


// ==========================================
// LOAD ALL FOUR CALENDARS
// ==========================================

async function loadAllCalendars() {

  const saved =
    localStorage.getItem(
      CALENDAR_STORAGE_KEY
    );


  let urls = [];


  if (saved) {

    try {

      urls =
        JSON.parse(
          saved
        );

    } catch {

      urls = [];

    }

  }


  const activeCalendars =
    urls
      .map(
        (url, index) => ({

          url:
            url,

          priority:
            index + 1,

          name:
            calendarInfo[index].name,

          color:
            calendarInfo[index].color

        })
      )
      .filter(
        calendar =>
          calendar.url
      );


  if (
    activeCalendars.length === 0
  ) {

    showCalendarMessage(
      "Add one or more iCal calendar links."
    );

    return;

  }


  showCalendarMessage(
    "Loading calendars..."
  );


  /*
    Load all calendars at the same time.
  */

  const results =
    await Promise.all(
      activeCalendars.map(
        calendar =>
          loadSingleCalendar(
            calendar
          )
      )
    );


  /*
    Combine all successful results.
  */

  const allEvents =
    results.flat();


  /*
    Sort:

    1. Earliest event first
    2. Calendar priority second
    3. Event title third
  */

  allEvents.sort(
    (a, b) => {

      const timeDifference =
        a.start - b.start;


      if (
        timeDifference !== 0
      ) {

        return timeDifference;

      }


      if (
        a.priority !==
        b.priority
      ) {

        return (
          a.priority -
          b.priority
        );

      }


      return (
        a.title || ""
      ).localeCompare(
        b.title || ""
      );

    }
  );


  displayEvents(
    allEvents
  );

}


// ==========================================
// LOAD ONE CALENDAR
// ==========================================

async function loadSingleCalendar(
  calendar
) {

  try {

    const proxyURL =
      "/api/calendar?url=" +
      encodeURIComponent(
        calendar.url
      );


    const response =
      await fetch(
        proxyURL
      );


    if (
      !response.ok
    ) {

      throw new Error(
        `Calendar ${calendar.priority} returned ${response.status}`
      );

    }


    const icsText =
      await response.text();


    if (
      !icsText.includes(
        "BEGIN:VCALENDAR"
      )
    ) {

      throw new Error(
        "Invalid iCalendar feed"
      );

    }


    const events =
      parseICS(
        icsText
      );


    return events.map(
      event => ({

        ...event,

        calendarName:
          calendar.name,

        calendarColor:
          calendar.color,

        priority:
          calendar.priority

      })
    );


  } catch (error) {

    console.error(
      `Calendar ${calendar.priority} error:`,
      error
    );


    return [];

  }

}


// ==========================================
// PARSE ICS
// ==========================================

function parseICS(
  text
) {

  /*
    Unfold continuation lines.
  */

  const unfolded =
    text.replace(
      /\r?\n[ \t]/g,
      ""
    );


  const lines =
    unfolded.split(
      /\r?\n/
    );


  const events = [];

  let currentEvent =
    null;


  for (
    const line of lines
  ) {

    if (
      line === "BEGIN:VEVENT"
    ) {

      currentEvent = {};

      continue;

    }


    if (
      line === "END:VEVENT"
    ) {

      if (
        currentEvent &&
        currentEvent.start
      ) {

        events.push(
          currentEvent
        );

      }


      currentEvent =
        null;

      continue;

    }


    if (
      !currentEvent
    ) {

      continue;

    }


    const separator =
      line.indexOf(":");


    if (
      separator === -1
    ) {

      continue;

    }


    const property =
      line
        .substring(
          0,
          separator
        )
        .split(";")[0]
        .toUpperCase();


    const value =
      line.substring(
        separator + 1
      );


    switch (
      property
    ) {

      case "SUMMARY":

        currentEvent.title =
          decodeICS(
            value
          );

        break;


      case "DESCRIPTION":

        currentEvent.description =
          decodeICS(
            value
          );

        break;


      case "LOCATION":

        currentEvent.location =
          decodeICS(
            value
          );

        break;


      case "DTSTART":

        currentEvent.start =
          parseICSDate(
            value,
            line
          );

        break;


      case "DTEND":

        currentEvent.end =
          parseICSDate(
            value,
            line
          );

        break;

    }

  }


  const now =
    new Date();


  const thirtyDays =
    new Date(
      now.getTime() +
      30 *
      24 *
      60 *
      60 *
      1000
    );


  return events.filter(
    event => {

      return (
        event.start &&
        !isNaN(
          event.start.getTime()
        ) &&
        event.start >= now &&
        event.start <= thirtyDays
      );

    }
  );

}


// ==========================================
// PARSE DATE
// ==========================================

function parseICSDate(
  value,
  line
) {

  /*
    All-day event.
  */

  if (
    value.length === 8
  ) {

    return new Date(

      Number(
        value.substring(
          0,
          4
        )
      ),

      Number(
        value.substring(
          4,
          6
        )
      ) - 1,

      Number(
        value.substring(
          6,
          8
        )
      )

    );

  }


  /*
    UTC date/time.
  */

  if (
    value.endsWith("Z")
  ) {

    const match =
      value.match(
        /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/
      );


    if (!match) {

      return new Date(
        NaN
      );

    }


    return new Date(
      Date.UTC(

        Number(match[1]),

        Number(match[2]) - 1,

        Number(match[3]),

        Number(match[4]),

        Number(match[5]),

        Number(match[6])

      )
    );

  }


  /*
    Local/floating date/time.
  */

  const match =
    value.match(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/
    );


  if (!match) {

    return new Date(
      NaN
    );

  }


  return new Date(

    Number(match[1]),

    Number(match[2]) - 1,

    Number(match[3]),

    Number(match[4]),

    Number(match[5]),

    Number(match[6])

  );

}


// ==========================================
// DECODE ICS
// ==========================================

function decodeICS(
  value
) {

  return value

    .replace(
      /\\n/gi,
      "\n"
    )

    .replace(
      /\\,/g,
      ","
    )

    .replace(
      /\\;/g,
      ";"
    )

    .replace(
      /\\\\/g,
      "\\"
    );

}


// ==========================================
// DISPLAY EVENTS
// ==========================================

function displayEvents(
  events
) {

  const container =
    document.getElementById(
      "calendarEvents"
    );


  if (!container) {

    return;

  }


  container.innerHTML =
    "";


  if (
    events.length === 0
  ) {

    showCalendarMessage(
      "No upcoming events."
    );

    return;

  }


  events
    .slice(
      0,
      20
    )
    .forEach(
      event => {

        const element =
          document.createElement(
            "div"
          );


        element.className =
          "calendar-event";


        element.style.borderLeft =
          `4px solid ${event.calendarColor}`;


        const date =
          formatEventDate(
            event.start
          );


        element.innerHTML = `

          <div
            class="calendar-event-calendar"
            style="
              color:
                ${event.calendarColor};
            "
          >
            ${escapeCalendarHTML(
              event.calendarName
            )}
          </div>

          <div class="calendar-event-date">
            ${date}
          </div>

          <div class="calendar-event-title">
            ${escapeCalendarHTML(
              event.title ||
              "Untitled event"
            )}
          </div>

          <div class="calendar-priority">
            Priority ${event.priority}
          </div>

          ${
            event.location
              ? `
                <div class="calendar-location">
                  📍 ${escapeCalendarHTML(
                    event.location
                  )}
                </div>
              `
              : ""
          }

        `;


        container.appendChild(
          element
        );

      }
    );

}


// ==========================================
// FORMAT EVENT DATE
// ==========================================

function formatEventDate(
  date
) {

  const today =
    new Date();


  if (
    date.toDateString() ===
    today.toDateString()
  ) {

    return (
      "Today · " +
      date.toLocaleTimeString(
        undefined,
        {
          hour: "numeric",
          minute: "2-digit"
        }
      )
    );

  }


  return (

    date.toLocaleDateString(
      undefined,
      {
        weekday: "short",
        month: "short",
        day: "numeric"
      }
    )

    +

    " · "

    +

    date.toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit"
      }
    )

  );

}


// ==========================================
// MESSAGE
// ==========================================

function showCalendarMessage(
  message
) {

  const container =
    document.getElementById(
      "calendarEvents"
    );


  if (!container) {

    return;

  }


  container.innerHTML = `

    <div class="calendar-message">
      ${escapeCalendarHTML(
        message
      )}
    </div>

  `;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeCalendarHTML(
  value
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    value;


  return div.innerHTML;

}


// ==========================================
// AUTOMATIC REFRESH
// ==========================================

setInterval(
  () => {

    loadAllCalendars();

  },
  15 * 60 * 1000
);
