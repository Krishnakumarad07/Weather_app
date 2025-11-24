// Insert your real key here:
const API_KEY = "YOUR_API_KEY_HERE";
const BASE_URL = "https://api.weatherapi.com/v1";

// DOM Elements
const searchForm = document.getElementById("searchForm");
const locationInput = document.getElementById("locationInput");
const unitButtons = document.querySelectorAll(".unit-btn");
const errorMessage = document.getElementById("errorMessage");
const weatherContent = document.getElementById("weatherContent");
const rainContainer = document.getElementById("rainContainer");
const snowContainer = document.getElementById("snowContainer");
const body = document.body;

let currentUnit = "metric";
let effectTimeouts = [];

/* ===========================================================
    WEATHER EFFECT UTILITIES
   =========================================================== */

function clearEffects() {
  rainContainer.classList.remove("rain-active");
  snowContainer.classList.remove("snow-active");

  const fog = document.getElementById("fogLayer");
  const iceLayer = document.getElementById("iceLayer");
  const lightning = document.getElementById("lightningFlash");

  fog?.remove();
  iceLayer?.remove();
  lightning?.remove();

  effectTimeouts.forEach(clearTimeout);
  effectTimeouts = [];
}

/* ========= RAIN ========== */
function rainEffect() {
  clearEffects();
  rainContainer.innerHTML = "";
  rainContainer.classList.add("rain-active");

  for (let i = 0; i < 150; i++) {
    const drop = document.createElement("div");
    drop.classList.add("raindrop");

    const size = Math.random() * 3 + 1;
    drop.style.width = `${size}px`;
    drop.style.height = `${size * 8}px`;
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDuration = `${Math.random() * 1.8 + 1}s`;
    drop.style.animationDelay = `${Math.random() * 2}s`;
    rainContainer.appendChild(drop);
  }

  effectTimeouts.push(
    setTimeout(() => {
      rainContainer.classList.remove("rain-active");
    }, 10000)
  );
}

/* ========= SNOW ========== */
function snowEffect() {
  clearEffects();
  snowContainer.innerHTML = "";
  snowContainer.classList.add("snow-active");

  const snowChars = ["❄", "❅", "❆"];

  for (let i = 0; i < 80; i++) {
    const flake = document.createElement("div");
    flake.classList.add("snowflake");
    flake.textContent = snowChars[Math.floor(Math.random() * 3)];

    flake.style.fontSize = `${Math.random() * 20 + 10}px`;
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.animationDuration = `${Math.random() * 10 + 5}s`;
    flake.style.opacity = Math.random() * 0.7 + 0.3;

    snowContainer.appendChild(flake);
  }

  effectTimeouts.push(
    setTimeout(() => {
      snowContainer.classList.remove("snow-active");
    }, 10000)
  );
}

/* ========= FOG ========== */
function fogEffect() {
  clearEffects();
  const fog = document.createElement("div");
  fog.id = "fogLayer";
  fog.style.cssText = `
    position: fixed;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: radial-gradient(circle, rgba(255,255,255,0.25), rgba(255,255,255,0));
    backdrop-filter: blur(10px);
    animation: fogMove 25s linear infinite;
    pointer-events: none;
    z-index: 8;
  `;
  document.body.appendChild(fog);
}

/* ========= ICE PARTICLES (freezing temps) ========== */
function iceEffect() {
  clearEffects();
  const iceLayer = document.createElement("div");
  iceLayer.id = "iceLayer";
  iceLayer.style.cssText = `
    position: fixed;
    width: 100%;
    height: 100%;
    pointer-events: none;
    top: 0; left: 0;
    z-index: 9;
  `;

  for (let i = 0; i < 40; i++) {
    const ice = document.createElement("div");
    ice.textContent = "✧";
    ice.style.position = "absolute";
    ice.style.left = `${Math.random() * 100}%`;
    ice.style.top = `${Math.random() * 100}%`;
    ice.style.color = "rgba(200,240,255,0.8)";
    ice.style.fontSize = `${Math.random() * 6 + 4}px`;
    ice.style.animation = `floatIce ${
      8 + Math.random() * 10
    }s ease-in-out infinite`;
    iceLayer.appendChild(ice);
  }

  document.body.appendChild(iceLayer);
}

/* ========= LIGHTNING (thunderstorms) ========== */
function lightningEffect() {
  clearEffects();

  const flash = document.createElement("div");
  flash.id = "lightningFlash";
  flash.style.cssText = `
    position: fixed;
    width: 100%;
    height: 100%;
    background: white;
    opacity: 0;
    top: 0; left: 0;
    pointer-events: none;
    z-index: 20;
  `;
  document.body.appendChild(flash);

  function lightningStrike() {
    flash.style.opacity = "0.8";
    setTimeout(() => (flash.style.opacity = "0"), 80);

    effectTimeouts.push(
      setTimeout(lightningStrike, Math.random() * 4000 + 800)
    );
  }

  lightningStrike();
}

/* ===========================================================
    BACKGROUND LOGIC
   =========================================================== */

function setWeatherBackground(condition, tempC, visibilityKm) {
  const c = condition.toLowerCase();

  clearEffects();
  body.className = body.className.replace(/weather-\w+/g, "").trim();

  if (c.includes("thunder")) {
    body.classList.add("weather-storm");
    lightningEffect();
  } else if (c.includes("rain") || c.includes("drizzle")) {
    body.classList.add("weather-rain");
    rainEffect();
  } else if (c.includes("snow") || c.includes("sleet")) {
    body.classList.add("weather-snow");
    snowEffect();
  } else if (c.includes("fog") || c.includes("mist") || visibilityKm < 3) {
    body.classList.add("weather-cloud");
    fogEffect();
  } else if (tempC <= -5) {
    body.classList.add("weather-snow");
    iceEffect();
  } else if (c.includes("cloud")) {
    body.classList.add("weather-cloud");
  } else {
    body.classList.add("weather-clear");
  }
}

/* ===========================================================
    WEATHER RENDERING
   =========================================================== */

function getTempValue(celsius, unit, fahrenheit = null) {
  return unit === "metric"
    ? Math.round(celsius)
    : Math.round(fahrenheit || celsius * 1.8 + 32);
}

function getUnitSymbol() {
  return currentUnit === "metric" ? "°C" : "°F";
}

function animateCards() {
  const cards = document.querySelectorAll(
    ".detail-card, .forecast-day, .hour-card"
  );
  cards.forEach((c, i) => {
    setTimeout(() => c.classList.add("animate"), i * 80);
  });
}

// RENDER HOURLY FORECAST
function renderHourly(hours) {
  const hourlyScroll = document.getElementById("hourlyScroll");
  if (!hourlyScroll) return;
  hourlyScroll.innerHTML = "";

  hours.forEach((hour) => {
    const time = hour.time.split(" ")[1].slice(0, 5);
    const icon = hour.condition.icon;
    const temp = getTempValue(hour.temp_c, currentUnit) + getUnitSymbol();

    const hourCard = document.createElement("div");
    hourCard.classList.add("hour-card");
    hourCard.innerHTML = `
      <div class="hour-time">${time}</div>
      <img class="hour-icon" src="${icon}" alt="">
      <div class="hour-temp">${temp}</div>
    `;
    hourlyScroll.appendChild(hourCard);
  });
}

function renderWeather(data) {
  const current = data.current;
  const loc = data.location;
  const forecast = data.forecast.forecastday;
  const unit = getUnitSymbol();

  setWeatherBackground(current.condition.text, current.temp_c, current.vis_km);

  // 5-day forecast HTML
  let forecastHTML = "";
  forecast.slice(0, 5).forEach((day, i) => {
    const d = day.day;
    forecastHTML += `
      <div class="forecast-day">
          <div class="day">${
            i === 0
              ? "Today"
              : new Date(day.date).toLocaleDateString("en", {
                  weekday: "short",
                })
          }</div>
          <img src="${d.condition.icon}" alt="">
          <div class="forecast-temps">
              <span class="forecast-high">${getTempValue(
                d.maxtemp_c,
                currentUnit,
                d.maxtemp_f
              )}${unit}</span>
              <span class="forecast-low">${getTempValue(
                d.mintemp_c,
                currentUnit,
                d.mintemp_f
              )}${unit}</span>
          </div>
      </div>
    `;
  });

  weatherContent.innerHTML = `
    <div class="weather-card current-weather">
        <div class="location"><i class="fas fa-map-marker-alt"></i>${
          loc.name
        }, ${loc.country}</div>
        <div class="description">${current.condition.text}</div>
        <div class="weather-icon-container">
            <img class="weather-icon" src="${current.condition.icon}">
        </div>
        <div class="temperature">
            <span class="temperature-value">${getTempValue(
              current.temp_c,
              currentUnit,
              current.temp_f
            )}</span>
            <span class="temperature-unit">${unit}</span>
        </div>
        <div class="feels-like">Feels like ${getTempValue(
          current.feelslike_c,
          currentUnit,
          current.feelslike_f
        )}${unit}</div>
    </div>

    <div class="weather-card">
      <div class="weather-details">
          <div class="detail-card"><i class="fas fa-wind"></i><span class="detail-label">Wind</span><span class="detail-value">${
            current.wind_kph
          } km/h</span></div>
          <div class="detail-card"><i class="fas fa-tint"></i><span class="detail-label">Humidity</span><span class="detail-value">${
            current.humidity
          }%</span></div>
          <div class="detail-card"><i class="fas fa-eye"></i><span class="detail-label">Visibility</span><span class="detail-value">${
            current.vis_km
          } km</span></div>
          <div class="detail-card"><i class="fas fa-compress-alt"></i><span class="detail-label">Pressure</span><span class="detail-value">${
            current.pressure_mb
          } mb</span></div>
      </div>

      <div class="sunrise-sunset">
          <h2>Sunrise & Sunset</h2>
          <div class="sun-times">
              <div class="sun-time"><i class="fas fa-sun"></i><div>Sunrise</div><div class="time">${
                forecast[0].astro.sunrise
              }</div></div>
              <div class="sun-time"><i class="fas fa-moon"></i><div>Sunset</div><div class="time">${
                forecast[0].astro.sunset
              }</div></div>
          </div>
      </div>
    </div>

    <div class="weather-card forecast">
        <h2>5-Day Forecast</h2>
        <div class="forecast-days">${forecastHTML}</div>
    </div>

   
  `;

  animateCards();

  renderHourly(forecast[0].hour);
}

/* ===========================================================
    FETCH WEATHER
   =========================================================== */

async function fetchWeather(location) {
  try {
    weatherContent.innerHTML = `
      <div class="loading">
          <div class="spinner"></div>
          <p>Loading weather data...</p>
      </div>`;

    const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
      location
    )}&days=5&aqi=no&alerts=yes`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Location not found");

    const data = await res.json();
    renderWeather(data);
    locationInput.value = location;
    errorMessage.textContent = "";
  } catch (err) {
    errorMessage.textContent = "City not found or API error.";
    console.error(err);
  }
}

/* ===========================================================
    GPS AUTO LOCATION
   =========================================================== */

function initGPS() {
  if (!navigator.geolocation) {
    fetchWeather("London");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`);
    },
    () => fetchWeather("London")
  );
}

/* ===========================================================
    EVENTS
   =========================================================== */

unitButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    unitButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    currentUnit = btn.dataset.unit;
    fetchWeather(locationInput.value || "London");
  })
);

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (locationInput.value.trim()) fetchWeather(locationInput.value.trim());
});

/* ===========================================================
    INIT
   =========================================================== */

window.addEventListener("load", initGPS);

