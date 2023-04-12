const apiKey = '313359100b5007a4fe2a704d5c954fac';
const baseURL = 'https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid='+ apiKey;
const currURL = 'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid=' + apiKey;
const weatherDataElem = document.getElementById('weatherData');

//add event listener to initiate function for getting weather data
const form = document.querySelector('form')
const cityInput = document.getElementById('cityInput');
form.addEventListener('submit', event => {
    event.preventDefault();
    const city = cityInput.value;           
    saveSearch(city);
    console.log("search clicked")
}) 

function saveSearch() {
    const date = dayjs().format("dddd, MMMM D, YYYY");
    const city = cityInput.value
    
    const savedCityDate = JSON.parse(localStorage.getItem('savedCityDate') || "[]")

    
    const duplicateEntryIndex = savedCityDate.findIndex(entry => entry.city === city && entry.date === date);
    const badWeatherData = (Object.keys(savedCityDate[duplicateEntryIndex].weatherData)).length === 0;
    savedCityDate.push({city, date})
    localStorage.setItem('savedCityDate', JSON.stringify(savedCityDate));
    console.log(savedCityDate)
    if (duplicateEntryIndex < 0) {
            getWeatherData(city) 
  
    } else if (duplicateEntryIndex >= 0) {
        const savedEntry = savedCityDate[duplicateEntryIndex];
        weatherDataElem.innerHTML = savedEntry.weatherData
        savedCityDate.push({city, date, weatherData: savedEntry.weatherData});
        console.log("duplicateentry")
        localStorage.setItem('savedCityDate', JSON.stringify(savedCityDate));
        saveTopCities();
    }
};
    //check for saved city and date in local storage
    //if saved city and date found then load savedWeatherHTML with function
    //else if not found then 
    //save city and date in array in local storage
    //continue with getWeatherData(city)


function getWeatherData(city) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${city}`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        const { lat, lon } = data[0];
        console.log(lat,lon)
        const urlWithCoords = baseURL.replace('{lat}', lat).replace('{lon}', lon);
        const currURLWithCoords = currURL.replace('{lat}', lat).replace('{lon}', lon);
        return Promise.all([
            fetch(urlWithCoords),
            fetch(currURLWithCoords)
        ]);
    })

    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        const filteredForecast = data[0].list.filter(entry => entry.dt_txt.endsWith('06:00:00'));
        console.log(filteredForecast)
        //call functions to parse the filtered forecasts for both current and 5day for information to display in dashboard
        const cardInfo = parseWeatherData(filteredForecast);
        console.log(cardInfo);
        const currentWeather = parseCurrentWeatherData(data[1]);
        console.log(currentWeather)
        //call function to render cardInfo and current weather to HTML
        const weatherData = renderWeatherData(cardInfo, currentWeather);
        weatherDataElem.innerHTML = weatherData
        
        //save search data to storage for search buttons and loading duplicate searches from local storage
        const saveddate = dayjs().format("dddd, MMMM D, YYYY")
        const savedCityDate = JSON.parse(localStorage.getItem('savedCityDate') || "[]")
        savedCityDate.push({city, date: saveddate, weatherData});
        console.log(savedCityDate)
        localStorage.setItem('savedCityDate', JSON.stringify(savedCityDate));
    })

    //call function to save top searches to local storage
    saveTopCities()
}

//parse 5day forecast data for display data for each day
function parseWeatherData(filteredData) {
    const cardInfo = filteredData.map(item => ({
        date: new Date(item.dt_txt),
        temperature: parseInt((item.main.temp - 273.15) * 9/5 + 32),
        description: item.weather[0].description,
        humidity: item.main.humidity + "%",
        wind: ((item.wind.speed) * 1.15).toFixed(1) + " mph",
        icon: item.weather[0].icon
    }));
    
    return cardInfo ;// 5day forecast display data array
}

//parse current forecast data for display only data
function parseCurrentWeatherData(data) {
    const city = data.name;
    const temperature = parseInt((data.main.temp - 273.15) * 9/5 + 32);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const wind = ((data.wind.speed) * 1.15).toFixed(1) + "mph";
    const humidity = data.main.humidity + "%";
    return { city, temperature, description, wind, humidity, icon };
};

//function to render data from cardInfo and currentWeather to HTML
function renderWeatherData(cardInfo, currentWeather) {

    // Generate HTML for each filtered day
    const forecastHTML = cardInfo.map(item => `
        <div class="forecast-item">
            <div>${new Date(item.date).toLocaleString()}</div>
            <div>${item.temperature} &deg;F</div>
            <div>${item.description}</div>
            <img src="http://openweathermap.org/img/wn/${item.icon}.png">
            <div>Humidity: ${item.humidity}</div>
            <div>${item.wind}</div>
        </div>
    `).join('');

    const currentdate = dayjs().format("dddd, MMMM D, YYYY")
    const currentWeatherHTML = `
        <div class="current-weather">
            <h2>${currentWeather.city}</h2>
            <div id="currentdate">${currentdate}</div>
            <div>${currentWeather.temperature} &deg;F</div>
            <div>${currentWeather.description}</div>
            <img src="http://openweathermap.org/img/wn/${currentWeather.icon}.png">
            <div>Humidity: ${currentWeather.humidity}</div>
            <div>${currentWeather.wind}</div>
        </div>
    `;

    return `
        ${currentWeatherHTML}
        <div class="forecast-container">
        <h2 >5-Day Forecast for ${currentWeather.city}</h2>
        <div class="forecast">${forecastHTML}</div>
    `;

}

//function to rank cities by search volume and save array to local storage as savedTopCities
function saveTopCities() {
    localStorage.removeItem('savedTopCities');
    const savedCityDate = JSON.parse(localStorage.getItem('savedCityDate') || "[]")
    const cityCounts = savedCityDate.reduce((counts, entry) => {
    counts[entry.city] = (counts[entry.city] || 0) + 1;
    return counts;
}, {});
console.log(cityCounts)
const topCities = Object.keys(cityCounts)
    .sort((a, b) => cityCounts[b] - cityCounts[a])
    .slice(0, 4);

console.log(topCities)
localStorage.setItem('savedTopCities', JSON.stringify(topCities));
}