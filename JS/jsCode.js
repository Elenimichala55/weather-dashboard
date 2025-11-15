function checkError(){
    document.getElementById("locationError").innerHTML = "";

    let address = document.getElementById("address").value.trim();
    let region = document.getElementById("region").value.trim();
    let city = document.getElementById("city").value.trim();
    let degree = document.querySelector('input[name="degree"]:checked');

    let isValid = true;
    
    if(address === ""){
        let error1 = document.getElementById("error1");
        error1.innerHTML = "Please enter your address!";
        isValid = false;
        console.log("Error: Invalid address." + isValid);
    }
    else {
        let error1 = document.getElementById("error1");
        error1.innerHTML = "";
    }

    if(region === ""){
        let error2 = document.getElementById("error2");
        error2.innerHTML = "Please enter your region!";
        isValid = false;
        console.log("Error: Invalid region." + isValid);
    }
    else {
        let error2 = document.getElementById("error2");
        error2.innerHTML = "";
    }

    if(city === ""){
        let error3 = document.getElementById("error3");
        error3.innerHTML = "Please enter your city!";
        isValid = false;
        console.log("Error: Invalid region." + isValid);
    }
    else {
        let error3 = document.getElementById("error3");
        error3.innerHTML = "";
    }

    if (!degree) {
        let error4 = document.getElementById("error4");
        error4.innerHTML = "Please select a temperature unit!";
        isValid = false;
        console.log("Error: Invalid temperature unit." + isValid);
    }
    else {
        let error4 = document.getElementById("error4");
        error4.innerHTML = "";
    }

    if (isValid) {
        console.log("All inputs are valid.");
        fetchGeoData(address, region, city);
    }
    else {
        console.log("Error: Invalid inputs.");
    }
}

function fetchGeoData(address, region, city) {
    let query = `${address}, ${region}, ${city}`; 
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    console.log("address:", address);
    console.log("region:", region);
    console.log("city:", city);
    console.log("Nominatim API Request:", url);

    fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    })
    .then(response => {
        if (response.status !== 200) {
            console.log('Status Code:', response.status);
            return;
        }
        return response.json();
    })
    .then(async data => {
        if (data && data.length > 0) {
            let lat = data[0].lat;
            let lon = data[0].lon;
            console.log(`Coordinates found: ${lat}, ${lon}`);

            let error = document.getElementById("locationError");
            error.innerHTML = "";
            
            const payload = {
                username: "emicha06",
                address,
                region,
                city,
                country: "Cyprus"
            };

            try {
                const response = await fetch("index.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                if (response.ok) {
                    console.log("Data stored successfully.");
                } else {
                    console.error(result.error);
                }
            } catch (err) {
                console.error("Could not send data to server.", err);
            }

            fetchWeatherData(lat, lon);
        } else {
            console.error("Location not found! Please check your inputs.");
            let error = document.getElementById("locationError");
            error.innerHTML = "Location not found! Please check your inputs.";
        }
    })
    .catch(error => {
        console.log("Error fetching geolocation:", error);
    });
}

function fetchWeatherData(lat, lon) {
    let apiKey = "376f31cae2ce7af6875010dc87aae498"; 
    let currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    let forecastWeatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(currentWeatherURL, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    })
    .then(response => {
        if (response.status !== 200) {
            console.log('Status Code:', response.status);
            return;
        }
        return response.json();
    })
    .then(data => {
        console.log("Current Weather Data:", data); 
        displayCurrentWeather(data, lat, lon);
    })
    .catch(error => {
        console.log("Error fetching current weather:", error);
    });

    fetch(forecastWeatherURL, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    })
    .then(response => {
        if (response.status !== 200) {
            console.log('Status Code:', response.status);
            return;
        }
        return response.json();
    })
    .then(data => {
        console.log("Weather Forecast Data:", data); 
        displayWeatherForecast(data);
        window.forecastRawData = data.list;
        drawPlotlyCharts(data.list);
    })
    .catch(error => {
        console.log("Error fetching forecast data:", error);
    });
}

function displayCurrentWeather(data, lat, lon) {

    let degree = document.querySelector('input[name="degree"]:checked').value;
    
    let convert = tempK => {
        return degree === "C"
            ? (tempK - 273.15).toFixed(1)
            : ((tempK - 273.15) * 9/5 + 32).toFixed(1);
    };

    let unit = degree === "C" ? "°C" : "°F";


    document.getElementById("weather-location").textContent = `${data.name}`;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById("temp-min").textContent = convert(data.main.temp_min);
    document.getElementById("temp-max").textContent = convert(data.main.temp_max);
    document.getElementById("weather-description").innerHTML  =  `${data.weather[0].description} <span id="weather-location">in ${data.name}</span>`;
    document.getElementById("temperature").innerHTML = `${convert(data.main.temp)} ${unit}`;
    document.getElementById("humidity").textContent = data.main.humidity;
    document.getElementById("pressure").textContent = data.main.pressure;
    document.getElementById("wind-speed").textContent = data.wind.speed;
    document.getElementById("cloud-cover").textContent = data.clouds.all;
    
    let sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-GB");
    let sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString("en-GB");
    document.getElementById("sunrise").textContent = sunrise;
    document.getElementById("sunset").textContent = sunset;

    loadWeatherMap(lat, lon);
}

function formatDate(timestamp) {
    let date = new Date(timestamp * 1000);
    return date.toISOString().slice(0, 16).replace("T", " ");
}

function displayWeatherForecast(data) {
    let forecastTableBody = document.getElementById("forecast-table-body");
    forecastTableBody.innerHTML = "";

    let forecastList = data.list;
    let location = document.getElementById("weather-location").textContent;

    let degree = document.querySelector('input[name="degree"]:checked').value;
    let convert = tempK => {
        return degree === "C"
            ? (tempK - 273.15).toFixed(1)
            : ((tempK - 273.15) * 9/5 + 32).toFixed(1);
    };
    
    let unit = degree === "C" ? "°C" : "°F";
    

    for (let i = 0; i < 8; i++) {
        let forecast = forecastList[i];
        let temp = convert(forecast.main.temp) + unit;
        let cloudCover = forecast.clouds.all + "%";
        let icon = forecast.weather[0].icon;
        let summary = `<img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather icon2">`;
        let humidity = forecast.main.humidity + "%";
        let pressure = forecast.main.pressure + " hPa";
        let windSpeed = forecast.wind.speed + " meters/sec";
        let description = forecast.weather[0].description;
        let formattedDate = formatDate(forecast.dt);

        let row = document.createElement("tr");

        row.innerHTML = `
                <td>${formatDate(forecast.dt)}</td>
                <td>${summary}</td>
                <td>${temp}</td>
                <td>${cloudCover}</td>
                <td>
                <button class="btn btn-success btn-sm view-btn" 
                    data-bs-toggle="modal" 
                    data-bs-target="#staticBackdrop"
                    data-location="${location}"
                    data-time="${formattedDate}" 
                    data-icon="${icon}" 
                    data-description="${description}" 
                    data-humidity="${humidity}" 
                    data-pressure="${pressure}" 
                    data-wind="${windSpeed}">
                    View
                </button>
            </td>
        `;

        forecastTableBody.appendChild(row);

        let wc = document.getElementById("weather-container");
        if (wc) {
            wc.style.display = "block";
        } else {
            console.log("Error: #weather-container not found!");
        }
        document.getElementById("weather-container").style.display = "block";
        let separators = document.getElementsByClassName("separator-line");
        for (let i = 0; i < separators.length; i++) {
            separators[i].style.display = "block";
        }
        document.getElementById("chart-card").style.display = "block";
    }

    document.querySelectorAll(".view-btn").forEach(button => {
        button.addEventListener("click", function() {
            let location = this.getAttribute("data-location");
            let time = this.getAttribute("data-time");
            let icon = this.getAttribute("data-icon");
            let description = this.getAttribute("data-description");
            let humidity = this.getAttribute("data-humidity");
            let pressure = this.getAttribute("data-pressure");
            let windSpeed = this.getAttribute("data-wind");

            document.getElementById("staticBackdropLabel").textContent = `Weather ${location} on ${time}`;
            document.getElementById("modal-icon").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
            document.getElementById("modal-description").textContent = description;
            document.getElementById("modal-humidity").textContent = humidity;
            document.getElementById("modal-pressure").textContent = pressure;
            document.getElementById("modal-wind").textContent = windSpeed;
        });
    });
}

let weatherMap; 
  
function loadWeatherMap(lat, lon) {
    let mapContainer = document.getElementById("weather-map");

    if (!mapContainer) {
        console.error("Error: Map container not found.");
        return;
    }

    mapContainer.innerHTML = ""; 

    weatherMap = new ol.Map({  
        target: 'weather-map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=376f31cae2ce7af6875010dc87aae498`,
                }),
                opacity: 0.6
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)]),
            zoom: 10
        })
    });

    console.log("Map initialized successfully!", weatherMap);
}

function drawPlotlyCharts(dataList) {
    const degree = document.querySelector('input[name="degree"]:checked').value;

    const convertTemp = tempK => degree === "C"
        ? (tempK - 273.15).toFixed(1)
        : ((tempK - 273.15) * 9/5 + 32).toFixed(1);

    const unit = degree === "C" ? "°C" : "°F";

    if (dataList.length === 0) {
        console.error("Error: dataList is empty. Cannot render charts.");
        return;
    }

    console.log("DataList for Plotly Charts:", dataList);

    let resultTimestamps = [];
    let lastAddedDate = null;

    dataList.forEach(item => {
        let currentDate = new Date(item.dt * 1000);
        currentDate.setHours(0, 0, 0, 0);

        if (!lastAddedDate) {
            resultTimestamps.push(currentDate.toLocaleDateString());
            lastAddedDate = currentDate;
        } else {
            let diffInDays = (currentDate - lastAddedDate) / (1000 * 60 * 60 * 24);
            if (diffInDays >= 3) {
                resultTimestamps.push(currentDate.toLocaleDateString());
                lastAddedDate = currentDate;
            }
        }
    });

    console.log("Timestamps: " + resultTimestamps);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const filteredData = dataList.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate >= now;
    }).slice(0, 40);

    const timestamps = filteredData.map(item => new Date(item.dt * 1000));
    const temps = filteredData.map(item => convertTemp(item.main.temp));
    const humidities = filteredData.map(item => item.main.humidity);
    const pressures = filteredData.map(item => item.main.pressure);

    const trace1 = {
        x: timestamps,
        y: temps,
        mode: 'lines+markers'
    };

    const layout1 = {
        title: {text: 'Temperature (' + unit + ')'},
        margin: { l: 40, r: 20, t: 40, b: 40 }
    };

    const trace2 = {
        x: timestamps,
        y: humidities,
        mode: 'lines+markers',
        line: { color: '#28a745' },
        marker: { color: '#28a745' }
    };

    const layout2 = {
        title: {text: 'Humiditiy (%)'},
        margin: { l: 40, r: 20, t: 40, b: 40 }
    };

    const trace3 = {
        x: timestamps,
        y: pressures,
        mode: 'lines+markers',
        line: { color: '#6c757d' },
        marker: { color: '#6c757d' }
    };

    const layout3 = {
        title: {text: 'Pressure (hPa)'},
        margin: { l: 40, r: 20, t: 40, b: 40 }
    };

    Plotly.newPlot("temperatureChart", [trace1], layout1, {responsive: true, displayModeBar: false});
    Plotly.newPlot("humidityChart", [trace2], layout2, {responsive: true, displayModeBar: false});
    Plotly.newPlot("pressureChart", [trace3], layout3, {responsive: true, displayModeBar: false});

    let citySelect = document.getElementById("city");
    let city = citySelect.options[citySelect.selectedIndex].text;

    const locName = document.getElementById("weather-location").textContent;
    const locWithoutFirstWord = locName.split(" ").slice(1).join(" ");

    const chartLoc = document.getElementById("chart-location");
    chartLoc.textContent = locWithoutFirstWord + ", " + city;
}

function resetPage () {
    document.getElementById("address").value = "";
    document.getElementById("region").value = "";
    document.getElementById("city").value = "Select city";
    document.getElementById("degreeC").checked = true;
    document.getElementById("weather-container").style.display = "none";
    document.getElementById("chart-card").style.display = "none";
    document.getElementById("weather-map").innerHTML = "";
    document.getElementById("forecast-table-body").innerHTML = "";
    document.getElementById("locationError").innerHTML = "";
    document.getElementById("error1").innerHTML = "";
    document.getElementById("error2").innerHTML = "";
    document.getElementById("error3").innerHTML = "";
    document.getElementById("error4").innerHTML = "";
    let separators = document.getElementsByClassName("separator-line");
    for (let i = 0; i < separators.length; i++) {
        separators[i].style.display = "none";
    }
}