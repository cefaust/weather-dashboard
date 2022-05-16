const OPEN_WEATHER_API_KEY = "2c3ea6a0e03a3e5e80c16d502c338408";
const weatherUnit = "f";
const speedUnit = "miles";
var searchHistory = [];
const listSearchHistoryEl = document.querySelector(".search-history");
getSearchHistory();
showSearchHistory();
searchAndDisplayWeather("seattle");

$("#search-form").submit(handleFormSubmission);

async function handleFormSubmission(event) {
  event.preventDefault();
  var inputs = $("#search-form :input");
  var values = {};
  inputs.each(function () {
    values[$(this).attr("id")] = $(this).val();
  });
  let cityInput = values["search-input"];

  searchAndDisplayWeather(cityInput);
}

async function searchAndDisplayWeather(city) {
  let cityLatLong = await getLatLongFromCity(city);
  let weatherResponse = await getWeatherForCity(cityLatLong);
  displayCurrentWeather(weatherResponse, cityLatLong.name);
  displayFiveDayForecast(weatherResponse);
  setSearchHistory(city);
  showSearchHistory();
}


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
    long: apiResponse[0].lon,
  };
  return latLongResponse;
}

function getWeatherApiUrl(latLong) {
  const exclude = ["minutely", "hourly"];
  return `https://api.openweathermap.org/data/2.5/onecall?lat=${
    latLong.lat
  }&lon=${latLong.long}&exclude=${exclude.join(
    ","
  )}&appid=${OPEN_WEATHER_API_KEY}`;
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


function showSearchHistory() {
  listSearchHistoryEl.innerHTML = "";
  console.log(searchHistory);
  for (let i = 0; i < searchHistory.length; i++) {
    let searchQuery = searchHistory[i];
    let historyBtnEl = document.createElement("button")
    historyBtnEl.classList.add("btn", "btn-info", "btn-block", "justify-center", "col-12", "col-md", "col-sm-12", "m-1");
    historyBtnEl.textContent = searchQuery;
    listSearchHistoryEl.appendChild(historyBtnEl);
    historyBtnEl.addEventListener("click", function (event) {
      searchAndDisplayWeather(searchQuery);
    });
  }
}


function setSearchHistory(cityInput) {
  if (!searchHistory.includes(cityInput)) {
    searchHistory.unshift(cityInput);
  }
  if (searchHistory.length >= 8) {
    searchHistory.pop();
  }

  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function getSearchHistory() {
  let fromLocalStorage = localStorage.getItem("searchHistory")
  if (fromLocalStorage === null) {
    searchHistory = [];
  } else {
    searchHistory = JSON.parse(fromLocalStorage);
  }
}

function displayCurrentWeather(weather, cityName) {
  var today = moment.unix(weather.current.dt).format("M/D/YYYY");
  var tempRounded =
    Math.round((getTemp(weather.current.temp) + Number.EPSILON) * 100) / 100;
  var windRounded =
    Math.round(
      (getWindSpeed(weather.current.wind_speed) + Number.EPSILON) * 100
    ) / 100;
  document.querySelector(
    ".current-weather h1"
  ).innerHTML = `${cityName} (${today})  <img src="https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png">`;
  document.querySelector(".current-weather span.temp").innerHTML = tempRounded;
  document.querySelector(".current-weather span.wind").textContent =
    windRounded;
  document.querySelector(".current-weather span.humidity").textContent =
    weather.current.humidity;
  document.querySelector(".current-weather span.uv-index").textContent =
    weather.current.uvi;
}


function displayFiveDayForecast(weather) {
  const forecastContainer = document.querySelector(".display-forecast");
  forecastContainer.innerHTML = "";

  for (let i = 1; i < 6; i++) {
    const dailyForecast = weather.daily[i];
    // console.log(dailyForecast);
    var day = moment.unix(dailyForecast.dt).format("M/D/YYYY")
    var tempRounded =
      Math.round((getTemp(dailyForecast.temp.day) + Number.EPSILON) * 100) /
      100;
    var windRounded =
      Math.round(
        (getWindSpeed(dailyForecast.wind_speed) + Number.EPSILON) * 100
      ) / 100;

    let forecastDiv = document.createElement("div");
    forecastDiv.classList.add("col-12", "col-md", "col-sm-12", "forecast-single-day");
    forecastDiv.innerHTML = `
      <h4> ${day}</h4>
      <p> <img src="https://openweathermap.org/img/wn/${dailyForecast.weather[0].icon}@2x.png"></p>
      <p>Temp: ${tempRounded} &deg;F</p>
      <p>Wind: ${windRounded} MPH</p>
      <p>Humidity: ${dailyForecast.humidity} % </p>
    `;
    forecastContainer.appendChild(forecastDiv);
  }
}

function getTemp(kelvin) {
  switch (weatherUnit) {
    case "f":
      return ((kelvin - 273.15) * 9) / 5 + 32;
    case "c":
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
