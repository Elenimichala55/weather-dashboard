# Weather Dashboard

This project is a **responsive weather dashboard** built with vanilla JavaScript, HTML, and CSS.  
It retrieves 5-day / 3-hour forecast data from the **OpenWeather API** and visualizes temperature, humidity, and pressure trends.

Users can enter an **addres**, **region**, and **city**, get detailed weather information, and view dynamic charts.

---

## Features

- current weather information in the specified locaction
- 5-day / 3-hour forecast view  
- Uses the **OpenWeather Forecast API**    
- Error handling for invalid cities / empty fields  
- Clean, responsive UI built with **Bootstrap**  
- Dynamic charts for:
  - Temperature  
  - Humidity  
  - Pressure  
- Automatic unit formatting (°C, %, hPa)

## Technologies Used

- **JavaScript (Vanilla)**  
- **HTML5 & CSS3**  
- **Bootstrap 5**  
- **OpenWeather API**

## Project Structure

weather-dashboard/
|
|──CSS/
|   ├──image.jpg
|   └──styles.css
|
|──JS/
|    └──jsCode.js
|
|──index.html
|──README.md
└──.gitignore

## How to run locally

### 1. Clone the repository
git clone https://github.com/Elenimichala55/weather-dashboard.git
cd weather-dashboard

### 2. Open the dashboard
Open index.html in any browser:
- Double-click the file, or
- Run:    
xdg-open index.html     # Linux
open index.html         # macOS
start index.html        # Windows

No server required.

### 3. Insert your API key
In script.js, replace:
const API_KEY = "YOUR_API_KEY_HERE";

## API References
- OpenWeather 5-Day Forecast API

## Author
Eleni Michala
MSc Applied Artificial Intelligence — University of Warwick
BSc Computer Science — University of Cyprus





