// ==========================================
// FIRE TABLET WEATHER CLOCK
// Google Calendar Backend
// ==========================================

const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());


// ==========================================
// SERVE THE FRONTEND
// ==========================================

// Project structure:
//
// fire-tablet-weather-clock/
// ├── index.html
// ├── style.css
// ├── js/
// └── server/
//     └── server.js
//
// Because server.js is inside /server,
// the frontend is one directory above it.

const publicFolder =
  path.join(__dirname, "..");


app.use(
  express.static(publicFolder)
);


// ==========================================
// HEALTH CHECK
// ==========================================

app.get(
  "/api/status",
  (req, res) => {

    res.json({
      online: true,
      message: "Fire Tablet Weather Clock server is running",
      time: new Date().toISOString()
    });

  }
);


// ==========================================
// GOOGLE CALENDAR CONFIGURATION
// ==========================================
//
// We do NOT put Google secrets directly
// into the frontend.
//
// Add these as Replit Secrets / environment
// variables later:
//
// GOOGLE_CLIENT_ID
// GOOGLE_CLIENT_SECRET
// GOOGLE_REDIRECT_URI
//
// Example:
//
// GOOGLE_REDIRECT_URI=https://YOUR-REPLIT-URL/callback
//
// ==========================================


const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || "";

const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || "";

const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || "";


// ==========================================
// GOOGLE OAUTH LOGIN
// ==========================================
//
// This creates the Google authorization URL.
//
// We are intentionally not putting the
// client secret in the browser.
// ==========================================

app.get(
  "/auth/google",
  (req, res) => {

    if (
      !GOOGLE_CLIENT_ID ||
      !GOOGLE_CLIENT_SECRET ||
      !GOOGLE_REDIRECT_URI
    ) {

      return res.status(500).send(`
        <h1>Google Calendar isn't configured yet</h1>

        <p>
          Add GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET and
          GOOGLE_REDIRECT_URI to your
          Replit environment variables.
        </p>
      `);

    }


    const scopes = [
      "https://www.googleapis.com/auth/calendar.readonly"
    ];


    const state =
      crypto.randomBytes(32)
        .toString("hex");


    // NOTE:
    // This basic version stores state in
    // memory. We'll replace this with a
    // proper session system when OAuth is
    // completed.

    app.locals.oauthState =
      state;


    const params =
      new URLSearchParams({

        client_id:
          GOOGLE_CLIENT_ID,

        redirect_uri:
          GOOGLE_REDIRECT_URI,

        response_type:
          "code",

        access_type:
          "offline",

        prompt:
          "consent",

        scope:
          scopes.join(" "),

        state:
          state

      });


    const googleURL =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      params.toString();


    res.redirect(
      googleURL
    );

  }
);


// ==========================================
// GOOGLE CALLBACK
// ==========================================

app.get(
  "/callback",
  async (req, res) => {

    const {
      code,
      state,
      error
    } = req.query;


    if (error) {

      return res.status(400).send(`
        <h1>Google sign-in cancelled</h1>
        <p>${escapeHtml(error)}</p>
        <p>You can close this window.</p>
      `);

    }


    if (!code) {

      return res.status(400).send(
        "Missing Google authorization code."
      );

    }


    if (
      !state ||
      state !== app.locals.oauthState
    ) {

      return res.status(400).send(
        "Invalid OAuth state."
      );

    }


    try {

      const tokenResponse =
        await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded"
            },

            body:
              new URLSearchParams({

                code:

                  code,

                client_id:

                  GOOGLE_CLIENT_ID,

                client_secret:

                  GOOGLE_CLIENT_SECRET,

                redirect_uri:

                  GOOGLE_REDIRECT_URI,

                grant_type:

                  "authorization_code"

              }).toString()
          }
        );


      const tokens =
        await tokenResponse.json();


      if (!tokenResponse.ok) {

        console.error(
          "Google token error:",
          tokens
        );

        return res.status(500).send(`
          <h1>Google Calendar connection failed</h1>
          <p>Google did not provide an access token.</p>
        `);

      }


      /*
        IMPORTANT:

        For this first version, the token is
        stored temporarily in server memory.

        That means restarting the Replit
        server will require signing in again.

        A later version can store encrypted
        refresh tokens in a database.
      */

      app.locals.googleTokens =
        tokens;


      res.send(`
        <!DOCTYPE html>

        <html>

        <head>

          <meta name="viewport"
                content="width=device-width,
                initial-scale=1">

          <title>Calendar Connected</title>

          <style>

            body {
              background: #080b10;
              color: white;
              font-family: Arial;
              text-align: center;
              padding: 40px;
            }

            .box {
              background: #111720;
              padding: 30px;
              border-radius: 20px;
              max-width: 500px;
              margin: auto;
            }

            button {
              padding: 15px 25px;
              border: 0;
              border-radius: 12px;
              background: #2563eb;
              color: white;
              font-size: 18px;
            }

          </style>

        </head>

        <body>

          <div class="box">

            <h1>✓ Calendar Connected</h1>

            <p>
              Your Google Calendar is now
              connected to the tablet.
            </p>

            <button
              onclick="window.close()">
              Close
            </button>

          </div>

        </body>

        </html>
      `);


    } catch (error) {

      console.error(
        "OAuth error:",
        error
      );


      res.status(500).send(
        "Google Calendar connection failed."
      );

    }

  }
);


// ==========================================
// GET CALENDAR EVENTS
// ==========================================

app.get(
  "/api/calendar/events",
  async (req, res) => {

    const tokens =
      app.locals.googleTokens;


    if (
      !tokens ||
      !tokens.access_token
    ) {

      return res.status(401).json({
        connected: false,
        message:
          "Google Calendar is not connected."
      });

    }


    try {

      const now =
        new Date();


      const weekFromNow =
        new Date(
          now.getTime() +
          7 * 24 * 60 * 60 * 1000
        );


      const params =
        new URLSearchParams({

          timeMin:
            now.toISOString(),

          timeMax:
            weekFromNow.toISOString(),

          singleEvents:
            "true",

          orderBy:
            "startTime",

          maxResults:
            "25"

        });


      const response =
        await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events?" +
          params.toString(),
          {
            headers: {
              Authorization:
                "Bearer " +
                tokens.access_token
            }
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        console.error(
          "Calendar API error:",
          data
        );


        return res.status(
          response.status
        ).json({
          connected: false,
          error:
            "Could not retrieve calendar events."
        });

      }


      const events =
        (data.items || [])
          .map(event => {

            return {

              id:
                event.id,

              title:
                event.summary ||
                "Untitled event",

              description:
                event.description ||
                "",

              location:
                event.location ||
                "",

              start:
                event.start?.dateTime ||
                event.start?.date,

              end:
                event.end?.dateTime ||
                event.end?.date,

              allDay:
                !event.start?.dateTime

            };

          });


      res.json({

        connected: true,

        events: events

      });


    } catch (error) {

      console.error(
        "Calendar request failed:",
        error
      );


      res.status(500).json({
        connected: false,
        error:
          "Calendar request failed."
      });

    }

  }
);


// ==========================================
// LOGOUT / DISCONNECT
// ==========================================

app.post(
  "/api/calendar/logout",
  (req, res) => {

    app.locals.googleTokens =
      null;


    res.json({
      connected: false
    });

  }
);


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


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
