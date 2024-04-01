const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const gotError = document.querySelector(".error-container");

let currentTab = userTab;
const API_KEY = "6d2d60be50dd3917f6f0d0dd87a5d0ae";
currentTab.classList.add("current-tab");


//3rd
function switchTab(clickedTab)  //try to understand this function by assuming that the clicked tab is "search-tab"
{
    if(clickedTab != currentTab)
    {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
    }

    // now we dont know on which tab we are currently on so,
    // checking if search form is active or not if not then we make it active
    if(!searchForm.classList.contains("active"))
    {
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        searchForm.classList.add("active");
    }
    // if search form is already active then we make it inactive and switch to userTab 
    else
    {
       searchForm.classList.remove("active");
       userInfoContainer.classList.remove("active");
       gotError.classList.remove("active");

    // now we are in your weather section so we need to display weather , so lets check local storage for coordinates , if we have already save them 
       getFromSessionStorage();
    }
}

//1st
userTab.addEventListener("click" , ()=>{
    switchTab(userTab);
});

//2nd
searchTab.addEventListener("click",()=>{
    switchTab(searchTab);
});

//4th
//check if cordinates are already present in session storage
function getFromSessionStorage()
{
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates)
    {
        // agar local coordinates nahi mile 
        grantAccessContainer.classList.add("active");
    }
    else
    {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

//5th
async function fetchUserWeatherInfo(coordinates)   //note we have make this function "async" , because of await keyword
{
    const {lat,lon} = coordinates;  // it is object without name so we can access its properties without its name

    //make grantcontainer invisible
    grantAccessContainer.classList.remove("active");

    //make loader visible
    loadingScreen.classList.add("active");

    //API call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err)
    {
        loadingScreen.classList.remove("active");
        alert("cant get your location's weather");
    }
}

function renderWeatherInfo(weatherInfo)
{
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherINfo object and put it UI elements

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

//6th
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click" , getLocation);

function getLocation()
{
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else
    {
      alert("Geolocation is not supported by your browser.");
    }
}

function showPosition(position)
{
    const userCoordinates = {
        lat: position.coords.latitude,
        lon:position.coords.longitude,
    };

    sessionStorage.setItem("user-coordinates" , JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

//7th
const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit" , (e)=>{
    e.preventDefault();
    
    let cityName = searchInput.value;

    if(cityName === "")
    return;

    else
      fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city)
{
    gotError.classList.remove("active");
    // loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        console.log(data);

        if(data?.message == "city not found")
        {
            loadingScreen.classList.remove("active");
            gotError.classList.add("active");
            return;
        }

        //gotError.classList.remove("active");

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }

    catch(err)
    {
      alert("try again");
    }
}