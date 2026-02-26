// Weather App JavaScript

// ===== DOM DECLARATIONS =====
// Search field and button
const searchField = document.getElementById('searchField');
const searchBtn = document.getElementById('searchBtn');

// Location and weather card
const noLocation = document.getElementById('noLocation');
const weatherCard = document.getElementById('WeatherCard');

// Popup container
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popupMessage');

// Weather data elements
const cityName = document.getElementById('CityName');
const date = document.getElementById('Date');
const time = document.getElementById('Time');
const celsius = document.getElementById('Celsius');
const feelsLike = document.getElementById('FeelLike');
const weatherText = document.getElementById('WeatherWord');
const humidity = document.getElementById('Humidity');
const wind = document.getElementById('Wind');
const windChill = document.getElementById('WindChill');
const heatIndex = document.getElementById('HeatIndex');
const country = document.getElementById('Country');

// Suggestions list
const suggestionsEl = document.getElementById("suggestions");

// Timeout variable
let timeout;


// ===== IMAGE CONSTANTS =====
const dayIMG = "./Images/Day.jpg";
const nightIMG = "./Images/Night.jpg";
const noonIMG = "./Images/Noon.jpg";

const TimeIMG = {
    Day:  dayIMG,
    Night: nightIMG,
    Noon: noonIMG
}

// ===== FUNCTIONS =====

// Show transient popup message with fade animation
function showPopup(msg, duration = 3000) {
    if (!popup || !popupMessage) return;
    popupMessage.textContent = msg;
    popup.classList.remove('hidden');
    popup.classList.add('pointer-events-auto', 'visible');
    setTimeout(() => {
        popup.classList.remove('visible');
        setTimeout(() => {
            popup.classList.add('hidden');
            popup.classList.remove('pointer-events-auto');
        }, 400);
    }, duration);
}

// Fetch weather data from API
function fetchWeatherData(city) {
    const apiKey = 'YOUR_API_KEY_HERE';

    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showPopup(data.error.message);
                noLocation.style.display = 'flex';
                weatherCard.style.display = 'none';
                return;
            }
            updateWeatherUI(data);
            timeofday(data);
            console.log("Weather Data:", data);
        })
        .catch(error => {
            console.error(error);
            showPopup('Unable to fetch weather');
            noLocation.style.display = 'flex';
            weatherCard.style.display = 'none';
        });
}

// Update weather card UI with data
function updateWeatherUI(data) {
    cityName.textContent = data.location.name;
    country.textContent = ` / ${data.location.country}`;
    date.textContent = data.location.localtime.split(' ')[0];
    time.textContent = data.location.localtime.split(' ')[1];
    celsius.textContent = `${data.current.temp_c}°C`;
    feelsLike.textContent = `Feels like: ${data.current.feelslike_c}°C`;
    weatherText.textContent = data.current.condition.text;
    humidity.textContent = `${data.current.humidity}%`;
    wind.textContent = `${data.current.wind_kph} kph`;
    windChill.textContent = `${data.current.windchill_c}°C`;
    heatIndex.textContent = `${data.current.heatindex_c}°C`;

    weatherCard.style.display = 'flex';
    noLocation.style.display = 'none';
}

// Determine time of day and update background
function timeofday(data) {
    if (data.current.is_day === 1) {
        updateBackground('day');
    } else if (data.current.is_day === 0) {
        updateBackground('night');
    } else {
        updateBackground('noon');
    }
}

// Update background image based on time of day
function updateBackground(timeOfDay) {
    if (timeOfDay === 'day') {
        document.body.style.backgroundImage = `url(${TimeIMG.Day})`;
    } else if (timeOfDay === 'night') {
        document.body.style.backgroundImage = `url(${TimeIMG.Night})`;
    } else {
        document.body.style.backgroundImage = `url(${TimeIMG.Noon})`;
    }
}

// Handle city suggestions as user types
function handleSuggestions() {
    const value = searchField.value.trim();
    if(value.length < 1){
        suggestionsEl.innerHTML = "";
        return;
    }
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${value}&count=4`)
        .then(res => res.json())
        .then(data => {
            showSuggestions(data.results);
        });
}

// Display city suggestions in list
function showSuggestions(cities) {
    suggestionsEl.innerHTML = "";
    if (!cities || cities.length === 0) {
        suggestionsEl.classList.add("hidden");
        return;
    }
    suggestionsEl.classList.remove("hidden");
    cities.forEach(city => {
        const li = document.createElement("li");
        li.textContent = `${city.name}, ${city.country}`;
        li.classList.add("p-2", "cursor-pointer");

        li.addEventListener("click", () => {
            searchField.value = city.name;
            suggestionsEl.innerHTML = "";
            suggestionsEl.classList.add("hidden");
            fetchWeatherData(city.name);
        });

        suggestionsEl.appendChild(li);
    });
}

// ===== EVENT LISTENERS =====

// Search button click event
searchBtn.addEventListener('click', () => {
    const city = searchField.value.trim();
    if (city) {
        fetchWeatherData(city);
    } else {
        showPopup('Please enter a city');
        noLocation.style.display = 'flex';
        weatherCard.style.display = 'none';
    }
});

// Enter key press event
searchField.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchBtn.click();
    }
});

// Input event for suggestions
searchField.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        handleSuggestions();
    }, 300);
});