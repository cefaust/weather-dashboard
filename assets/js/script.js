const OPEN_WEATHER_API_KEY = "2c3ea6a0e03a3e5e80c16d502c338408";
const weatherUnit = "f";
const speedUnit = "miles";

$("#search-form").submit(handleFormSubmission);

async function handleFormSubmission(event) {
  event.preventDefault();
  var inputs = $("#search-form :input");
  var values = {};
  inputs.each(function () {
    values[$(this).attr("id")] = $(this).val();
  });
  let cityInput = values["search-input"];
  let cityLatLong = await getLatLongFromCity(cityInput);
  let weatherResponse = await getWeatherForCity(cityLatLong);
  displayCurrentWeather(weatherResponse, cityLatLong.name)
  console.log("weatherResponse", weatherResponse);
}

//TODO: take input and place in open weather geocoding api
function getGeocodeApiUrl(city) {
  return `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPEN_WEATHER_API_KEY}`;
}

async function getLatLongFromCity(cityInput) {
  const API_URL = getGeocodeApiUrl(cityInput);
  let apiResponse = await fetch(API_URL)
    .then(function (response) {
      if (!response.ok) {
        throw ["Some problem occurred", response.json()];
      }

      return response.json();
    })
    .then(function (data) {
      return data;
    });

  let latLongResponse = {
    name: apiResponse[0].name,
    lat: apiResponse[0].lat, 
    long: apiResponse[0].lon
  }; 
  return latLongResponse;
}
//TODO: take  lat lon results and fetch from open weather one call api
function getWeatherApiUrl(latLong) {
  const exclude = ["minutely", "hourly"];
  return `https://api.openweathermap.org/data/2.5/onecall?lat=${latLong.lat}&lon=${latLong.long}&exclude=${exclude.join(",")}&appid=${OPEN_WEATHER_API_KEY}`;
}

async function getWeatherForCity(latLong) {
  const API_URL = getWeatherApiUrl(latLong);
  let apiResponse = await fetch(API_URL)
    .then(function (response) {
      if (!response.ok) {
        throw ["Some problem occurred", response.json()];
      }
      return response.json();
    })
    .then(function (data) {
      return data;
    });
  return apiResponse;
}

//TODO: The city will then be added to a search history.

//TODo: add the search to local storage.

//TODO: click on search history to display that city's weather.

//TODO: display current weather to page

//TODO:  The current conditions for that city will include city name, the date, an icon that represents the weather conditions, the temperature, humidity, wind speed, and the UV index.

function displayCurrentWeather(weather, cityName){
  // putting cityName on the page
  var tempRounded = Math.round((getTemp(weather.current.temp) + Number.EPSILON) * 100) / 100;
  var windRounded = Math.round((getWindSpeed(weather.current.wind_speed) + Number.EPSILON) * 100) / 100;
  document.querySelector(".current-weather h1").innerHTML = `${cityName} (${ "date" }) <img src="foo">`;
  document.querySelector(".current-weather span.temp").innerHTML = tempRounded;
  document.querySelector(".current-weather span.wind").textContent = windRounded;
  document.querySelector(".current-weather span humidity").textContent = weather.current.humidity;
}

//TODO: The future conditions will display the date, an icon that represents the weather conditions, the temperature, the wind speed, and the humidity.

// function DisplayFiveDayForcast


function getTemp(kelvin) {
  switch (weatherUnit) {
    case 'f':
      return (kelvin - 273.15) * 9 / 5 + 32;
    case 'c':
      return kelvin - 273.15;
  }
  return kelvin;
}

function getWindSpeed(metersPerSec) {
  if (speedUnit === "miles") {
    return metersPerSec * 2.236936;
  }
  return metersPerSec;
}