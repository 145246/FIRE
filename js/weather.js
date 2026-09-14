// ==========================================
// WEATHER
// Open-Meteo + National Weather Service
// ==========================================

// Default location: Springfield, Illinois
const WEATHER_LAT = 39.7817;
const WEATHER_LON = -89.6501;

const WEATHER_LOCATION =
  "Springfield, Illinois";


// ==========================================
// WEATHER CODES
// ==========================================

function getWeatherInfo(code) {

  const weather = {

    0: {
      text: "Clear Sky",
      icon: "☀️"
    },

    1: {
      text: "Mainly Clear",
      icon: "🌤️"
    },

    2: {
      text: "Partly Cloudy",
      icon: "⛅"
    },

    3: {
      text: "Overcast",
      icon: "☁️"
    },

    45: {
      text: "Fog",
      icon: "🌫️"
    },

    48: {
      text: "Freezing Fog",
      icon: "🌫️"
    },

    51: {
      text: "Light Drizzle",
      icon: "🌦️"
    },

    53: {
      text: "Drizzle",
      icon: "🌦️"
    },

    55: {
      text: "Heavy Drizzle",
      icon: "🌧️"
    },

    61: {
      text: "Light Rain",
      icon: "🌦️"
    },

    63: {
      text: "Rain",
      icon: "🌧️"
    },

    65: {
      text: "Heavy Rain",
      icon: "🌧️"
    },

    71: {
      text: "Light Snow",
      icon: "🌨️"
    },

    73: {
      text: "Snow",
      icon: "❄️"
    },

    75: {
      text: "Heavy Snow",
      icon: "❄️"
    },

    80: {
      text: "Rain Showers",
      icon: "🌦️"
    },

    81: {
      text: "Rain Showers",
      icon: "🌧️"
    },

    82: {
      text: "Heavy Rain Showers",
      icon: "🌧️"
    },

    95: {
      text: "Thunderstorm",
      icon: "⛈️"
    },

    96: {
      text: "Thunderstorm",
      icon: "⛈️"
    },

    99: {
      text: "Severe Thunderstorm",
      icon: "⛈️"
    }

  };


  return weather[code] || {
    text: "Unknown",
    icon: "🌡️"
  };

}


// ==========================================
// LOAD WEATHER
// ==========================================

async function loadWeather() {

  try {

    const url =
      "https://api.open-meteo.com/v1/forecast" +

      `?latitude=${WEATHER_LAT}` +

      `&longitude=${WEATHER_LON}` +

      "&current=" +
      "temperature_2m," +
      "apparent_temperature," +
      "relative_humidity_2m," +
      "precipitation," +
      "weather_code," +
      "wind_speed_10m," +
      "uv_index" +

      "&hourly=" +
      "precipitation_probability" +

      "&daily=" +
      "weather_code," +
      "temperature_2m_max," +
      "temperature_2m_min," +
      "sunrise," +
      "sunset" +

      "&temperature_unit=fahrenheit" +

      "&wind_speed_unit=mph" +

      "&timezone=auto" +

      "&forecast_days=7";


    const response =
      await fetch(url);


    if (!response.ok) {
      throw new Error(
        "Weather request failed"
      );
    }


    const data =
      await response.json();


    const current =
      data.current;


    // Location
    setText(
      "location",
      WEATHER_LOCATION
    );


    // Temperature
    setText(
      "temperature",
      Math.round(
        current.temperature_2m
      ) + "°"
    );


    // Feels like
    setText(
      "feels",
      "Feels like " +
      Math.round(
        current.apparent_temperature
      ) +
      "°"
    );


    // Humidity
    setText(
      "humidity",
      current.relative_humidity_2m
    );


    // Wind
    setText(
      "wind",
      Math.round(
        current.wind_speed_10m
      )
    );


    // UV
    setText(
      "uv",
      Math.round(
        current.uv_index
      )
    );


    // Weather condition
    const weather =
      getWeatherInfo(
        current.weather_code
      );


    setText(
      "condition",
      weather.text
    );


    setText(
      "weatherIcon",
      weather.icon
    );


    // Rain probability
    if (
      data.hourly &&
      data.hourly.precipitation_probability
    ) {

      const hourIndex =
        getCurrentHourIndex(
          data.hourly.time
        );


      setText(
        "rain",
        data.hourly
          .precipitation_probability[
            hourIndex
          ] ?? "--"
      );

    }


    // Sunrise
    if (data.daily.sunrise) {

      setText(
        "sunrise",
        formatWeatherTime(
          data.daily.sunrise[0]
        )
      );

    }


    // Sunset
    if (data.daily.sunset) {

      setText(
        "sunset",
        formatWeatherTime(
          data.daily.sunset[0]
        )
      );

    }


    // Forecast
    buildForecast(
      data.daily
    );


  } catch (error) {

    console.error(
      "Weather error:",
      error
    );


    setText(
      "condition",
      "Weather unavailable"
    );

  }

}


// ==========================================
// FIND CURRENT HOUR
// ==========================================

function getCurrentHourIndex(
  times
) {

  const current =
    new Date();


  const currentString =
    current.toISOString()
      .slice(0, 13);


  let closest = 0;


  for (
    let i = 0;
    i < times.length;
    i++
  ) {

    if (
      times[i].slice(0, 13)
      === currentString
    ) {

      return i;

    }

  }


  return closest;

}


// ==========================================
// FORMAT TIME
// ==========================================

function formatWeatherTime(
  value
) {

  const date =
    new Date(value);


  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit"
    }
  );

}


// ==========================================
// 7-DAY FORECAST
// ==========================================

function buildForecast(
  daily
) {

  const container =
    document.getElementById(
      "forecast"
    );


  if (!container) return;


  container.innerHTML =
    "";


  for (
    let i = 0;
    i < daily.time.length;
    i++
  ) {

    const date =
      new Date(
        daily.time[i] +
        "T12:00:00"
      );


    const dayName =
      i === 0
        ? "Today"
        : date.toLocaleDateString(
            undefined,
            {
              weekday: "short"
            }
          );


    const weather =
      getWeatherInfo(
        daily.weather_code[i]
      );


    const day =
      document.createElement(
        "div"
      );


    day.className =
      "forecast-day";


    day.innerHTML = `

      <div class="forecast-name">
        ${dayName}
      </div>

      <div class="forecast-icon">
        ${weather.icon}
      </div>

      <div class="forecast-temp">
        ${Math.round(
          daily.temperature_2m_max[i]
        )}°
      </div>

      <div class="forecast-low">
        ${Math.round(
          daily.temperature_2m_min[i]
        )}°
      </div>

    `;


    container.appendChild(
      day
    );

  }

}


// ==========================================
// NATIONAL WEATHER SERVICE ALERTS
// ==========================================

async function loadAlerts() {

  const alertCard =
    document.getElementById(
      "alertCard"
    );


  const alertContainer =
    document.getElementById(
      "alerts"
    );


  if (
    !alertCard ||
    !alertContainer
  ) {
    return;
  }


  try {

    const url =
      `https://api.weather.gov/alerts/active` +
      `?point=${WEATHER_LAT},${WEATHER_LON}`;


    const response =
      await fetch(
        url,
        {
          headers: {
            "Accept":
              "application/geo+json"
          }
        }
      );


    if (!response.ok) {
      throw new Error(
        "Alert request failed"
      );
    }


    const data =
      await response.json();


    const alerts =
      data.features || [];


    // No alerts
    if (
      alerts.length === 0
    ) {

      alertCard.classList.remove(
        "visible"
      );

      alertContainer.innerHTML =
        "";

      return;

    }


    // Show alert card
    alertCard.classList.add(
      "visible"
    );


    alertContainer.innerHTML =
      "";


    alerts.forEach(
      feature => {

        const alert =
          feature.properties;


        const item =
          document.createElement(
            "div"
          );


        item.className =
          "alert-item";


        item.innerHTML = `

          <div class="alert-event">
            ${escapeHtml(
              alert.event ||
              "Weather Alert"
            )}
          </div>

          <div class="alert-area">
            ${escapeHtml(
              alert.areaDesc ||
              ""
            )}
          </div>

          <div class="alert-description">
            ${escapeHtml(
              shortenText(
                alert.description ||
                "See official alert details."
              )
            )}
          </div>

        `;


        alertContainer.appendChild(
          item
        );

      }
    );


  } catch (error) {

    console.error(
      "Alert error:",
      error
    );

  }

}


// ==========================================
// SHORTEN TEXT
// ==========================================

function shortenText(
  text
) {

  if (text.length <= 500) {
    return text;
  }


  return (
    text.substring(0, 500)
    + "..."
  );

}


// ==========================================
// SAFE TEXT
// ==========================================

function escapeHtml(
  text
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text;


  return div.innerHTML;

}


// ==========================================
// HELPER
// ==========================================

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (element) {
    element.textContent =
      value;
  }

}
