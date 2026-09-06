// ==========================================
// FIRE TABLET WEATHER CLOCK
// iCal Proxy Server
// ==========================================

const express = require("express");

const app = express();

const PORT =
  process.env.PORT || 3000;


// ==========================================
// SECURITY SETTINGS
// ==========================================

// Only allow HTTP/HTTPS calendar URLs.

function isValidCalendarURL(value) {

  try {

    const url =
      new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );

  } catch {

    return false;

  }

}


// ==========================================
// SERVE WEBSITE
// ==========================================

app.use(
  express.static(__dirname)
);


// ==========================================
// SERVER STATUS
// ==========================================

app.get(
  "/api/status",
  (req, res) => {

    res.json({

      online: true,

      service:
        "Fire Tablet Weather Clock",

      time:
        new Date().toISOString()

    });

  }
);


// ==========================================
// ICAL PROXY
// ==========================================

app.get(
  "/api/calendar",
  async (req, res) => {

    const calendarURL =
      req.query.url;


    if (!calendarURL) {

      return res.status(400).json({

        error:
          "Missing calendar URL."

      });

    }


    if (
      !isValidCalendarURL(
        calendarURL
      )
    ) {

      return res.status(400).json({

        error:
          "Invalid calendar URL."

      });

    }


    try {

      console.log(
        "Loading calendar:",
        calendarURL
      );


      const response =
        await fetch(
          calendarURL,
          {

            headers: {

              "User-Agent":
                "FireTabletWeatherClock/1.0",

              "Accept":
                "text/calendar,text/plain,*/*"

            },

            redirect:
              "follow"

          }
        );


      if (!response.ok) {

        return res.status(
          response.status
        ).json({

          error:
            `Calendar server returned ${response.status}.`

        });

      }


      const calendarText =
        await response.text();


      if (
        !calendarText.includes(
          "BEGIN:VCALENDAR"
        )
      ) {

        return res.status(502).json({

          error:
            "The URL did not return a valid iCalendar feed."

        });

      }


      /*
        Tell the browser that this response
        is safe for the website to read.
      */

      res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
      );


      res.setHeader(
        "Content-Type",
        "text/calendar; charset=utf-8"
      );


      res.send(
        calendarText
      );


    } catch (error) {

      console.error(
        "Calendar proxy error:",
        error
      );


      res.status(500).json({

        error:
          "Unable to download the calendar."

      });

    }

  }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Fire Tablet Weather Clock running on port ${PORT}`
    );

  }
);
