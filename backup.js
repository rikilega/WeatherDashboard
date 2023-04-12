const apiKey = '313359100b5007a4fe2a704d5c954fac';
const baseURL = 'https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid='+ apiKey;
const currURL = 'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid=' + apiKey;
const weatherDataElem = document.getElementById('weatherData');
//load dom first
document.addEventListener("DOMContentLoaded", function() {   
    const date = dayjs().format("dddd, MMMM D, YYYY")
    const savedCityDate = JSON.parse(localStorage.getItem('savedCityDate') || "[]")
    const newSavedCityDate = savedCityDate.filter(entry => entry.date === date);
    localStorage.setItem('newsavedCityDate', JSON.stringify(newSavedCityDate));
    const savedTopCities = JSON.parse(localStorage.getItem('savedTopCities') || "[]")
    
    console.log(savedTopCities)
    const topCitybtns = document.getElementById("topCities");
    for (let i = 0; i < savedTopCities.length; i++) {
        const city = savedTopCities[i];
        const button = document.createElement("button");
        button.textContent = `${city.toUpperCase()}`;
        topCitybtns.appendChild(button);
    }

    // const date = dayjs().format("dddd, MMMM D, YYYY")
    const topCities = document.getElementById("topCities");
    const searchBtns = topCities.querySelectorAll("button");

    searchBtns.forEach(btn => {
        btn.addEventListener('click', event => {
            console.log('click registered')
        event.preventDefault();
        const city = btn.textContent
        console.log(city);
        const newSavedCityDate = JSON.parse(localStorage.getItem('newSavedCityDate') || "[]")
        const loadWeatherIndex = newSavedCityDate.findIndex(entry => entry.city === city);
        console.log(loadWeatherIndex)
        // localStorage.setItem('savedCityDate', JSON.stringify(savedCityDate));
        const savedEntry = newSavedCityDate[loadWeatherIndex];
        console.log(savedEntry)
        if (!savedEntry.weatherData) {
            getWeatherData(city)
            console.log("loaded get Weather")
        } else {
        weatherDataElem.innerHTML = savedEntry.weatherData
        console.log(savedEntry.weatherData)
        savedCityDate.push({city, date, weatherData: savedEntry.weatherData});
        localStorage.setItem('savedCityDate', JSON.stringify(savedCityDate));
        saveTopCities();
    }
});
        
});
});


function saveSearch() {
    const date = dayjs().format("dddd, MMMM D, YYYY");
    const city = cityInput.value
    
    const savedCityDate = JSON.parse(localStorage.getItem('savedCityDate') || "[]")

    
    const duplicateEntryIndex = savedCityDate.findIndex(entry => entry.city === city && entry.date === date);
    // const badWeatherData = (Object.keys(savedCityDate[duplicateEntryIndex].weatherData)).length === 0;
    // savedCityDate.push({city, date})
    // localStorage.setItem('savedCityDate', JSON.stringify(savedCityDate));
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

    function getWeatherData(city) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${city}`;
        const savedCityDate = JSON.parse(localStorage.getItem('savedCityDate') || "[]")
        fetch(url)
        .then(response => response.json())
        .then(data => {
      // Parse the data and extract the relevant information
        const { lat, lon } = data[0];
        console.log(lat, lon)
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
        // const city = data[0].city.name;
        console.log(filteredForecast);
        // Parse the data and extract the relevant information
        const cardInfo = parseWeatherData(filteredForecast);
        console.log(cardInfo);
        const currentWeather = parseCurrentWeatherData(data[1]);
        console.log(currentWeather)
        weatherDataElem.innerHTML = renderWeatherData(cardInfo, currentWeather);
        console.log(weatherDataElem.innerHTML)
        //const weatherData = weatherDataElem.innerHTML
        const weatherData = weatherDataElem.innerHTML
        const saveddate = dayjs().format("dddd, MMMM D, YYYY");

        console.log(savedCityDate);
        savedCityDate.push({city, date: saveddate, weatherData});
        console.log(savedCityDate)
        localStorage.setItem('savedCityDate', JSON.stringify(savedCityDate));

        saveTopCities();
        
    })

}  

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

function parseCurrentWeatherData(data) {
    // Parse the data and extract the relevant information
    const city = data.name;
    const temperature = parseInt((data.main.temp - 273.15) * 9/5 + 32);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const wind = ((data.wind.speed) * 1.15).toFixed(1) + "mph";
    const humidity = data.main.humidity + "%";
    console.log(data);
    return { city, temperature, description, wind, humidity, icon };
}

function parseWeatherData(filteredData) {
    const cardInfo = filteredData.map(item => ({
        date: new Date(item.dt_txt)(undefined, { dateStyle: 'short' }),
        temperature: parseInt((item.main.temp - 273.15) * 9/5 + 32),
        description: item.weather[0].description,
        humidity: item.main.humidity + "%",
        wind: ((item.wind.speed) * 1.15).toFixed(1) + " mph",
        icon: item.weather[0].icon
    }));
    return cardInfo ;
}



function renderWeatherData(cardInfo, currentWeather) {
    // Generate HTML for each filtered forecast item
    const forecastHTML = cardInfo.map(item => `
        <div class="forecast-item">
            <div>${new Date(item.date).toLocaleString()}</div>
            <div>${item.temperature} &deg;F</div>
            <div>${item.description}</div>
            <img src="http://openweathermap.org/img/wn/${item.icon}.png">
            <div>Humidity: ${item.humidity}</div>
            <div>Wind: ${item.wind}</div>
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
            <div>Wind: ${currentWeather.wind}</div>
        </div>
    `;

    return `
        ${currentWeatherHTML}
        <div class="forecast-container">
        <h2 >5-Day Forecast for ${currentWeather.city}</h2>
        <div class="forecast">${forecastHTML}</div>
    `;
}


const form = document.querySelector('form');
const cityInput = document.getElementById('cityInput');
form.addEventListener('submit', event => {
    event.preventDefault();
    const city = cityInput.value;           
    saveSearch(city);
    console.log()
}) 