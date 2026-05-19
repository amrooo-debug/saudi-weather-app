const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const unitToggle = document.getElementById('unit-toggle');
const weatherCard = document.getElementById('weather-card');
const cityNameElement = document.getElementById('city-name');
const cityTimeElement = document.getElementById('city-time');
const weatherTextElement = document.getElementById('weather-text');
const temperatureValueElement = document.getElementById('temperature-value');
const temperatureUnitElement = document.getElementById('temperature-unit');
const messageBox = document.getElementById('message-box');

let currentTemperatureC = null;
let useFahrenheit = false;

async function searchWeather() {
  const city = cityInput.value.trim();
  messageBox.textContent = '';
  weatherCard.classList.add('hidden');

  if (!city) {
    messageBox.textContent = 'Please enter a Saudi city name.';
    return;
  }

  try {
    const location = await lookupSaudiCity(city);
    if (!location) {
      messageBox.textContent = 'City not found in Saudi Arabia. Try Riyadh, Jeddah, Dammam, or Mecca.';
      return;
    }

    const weather = await fetchWeather(location.latitude, location.longitude);
    currentTemperatureC = weather.temperature;
    displayWeather(location, weather);
  } catch (error) {
    messageBox.textContent = 'Unable to load weather. Check your network and try again.';
    console.error(error);
  }
}

async function lookupSaudiCity(cityName) {
  const query = encodeURIComponent(cityName);
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&language=en&country=SA`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.results || data.results.length === 0) return null;
  return data.results[0];
}

async function fetchWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.current_weather) {
    throw new Error('No current weather returned');
  }
  return {
    ...data.current_weather,
    timezone: data.timezone
  };
}

function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Moderate showers',
    82: 'Violent showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail'
  };
  return descriptions[code] || 'Unknown weather';
}

function formatTemperature() {
  if (currentTemperatureC === null) return '--';
  if (useFahrenheit) {
    return Math.round((currentTemperatureC * 9) / 5 + 32);
  }
  return Math.round(currentTemperatureC);
}

function getCurrentLocalTime(timezone) {
  if (!timezone) return '--';
  return new Date().toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function displayWeather(location, weather) {
  const region = location.admin1 ? `, ${location.admin1}` : '';
  cityNameElement.textContent = `${location.name}${region}, ${location.country}`;
  const localTimeText = weather.timezone ? getCurrentLocalTime(weather.timezone) : '--';
  cityTimeElement.textContent = `Local time: ${localTimeText}`;
  weatherTextElement.textContent = `${getWeatherDescription(weather.weathercode)} • Wind ${weather.windspeed} km/h`;
  temperatureValueElement.textContent = formatTemperature();
  temperatureUnitElement.textContent = useFahrenheit ? '°F' : '°C';
  unitToggle.textContent = useFahrenheit ? 'Show Celsius' : 'Show Fahrenheit';
  unitToggle.setAttribute('aria-pressed', String(useFahrenheit));
  weatherCard.classList.remove('hidden');
}

searchButton.addEventListener('click', searchWeather);
cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    searchWeather();
  }
});

unitToggle.addEventListener('click', () => {
  useFahrenheit = !useFahrenheit;
  if (currentTemperatureC !== null) {
    temperatureValueElement.textContent = formatTemperature();
    temperatureUnitElement.textContent = useFahrenheit ? '°F' : '°C';
    unitToggle.textContent = useFahrenheit ? 'Show Celsius' : 'Show Fahrenheit';
  } else {
    unitToggle.textContent = useFahrenheit ? 'Show Celsius' : 'Show Fahrenheit';
  }
});
