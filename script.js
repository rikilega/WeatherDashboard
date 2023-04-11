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
}) 